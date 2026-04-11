// lib/useLiveScores.ts
// React hook that connects to /api/live-scores (SSE) and returns
// real-time score data merged into a map keyed by fixture ID.

import { useEffect, useRef, useState, useCallback } from 'react';

export interface LiveScore {
  fixtureId:   number;
  homeTeam:    string;
  awayTeam:    string;
  league:      string;
  flag:        string;
  kickoff:     string;
  statusShort: string;   // NS | 1H | HT | 2H | ET | P | FT | AET | PEN
  statusLong:  string;
  elapsed:     number | null;
  homeScore:   number | null;
  awayScore:   number | null;
  homeEvents:  { minute: number; type: string; player: string }[];
  awayEvents:  { minute: number; type: string; player: string }[];
}

// Statuses that count as "live"
const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT']);
// Statuses that count as "finished"
const DONE_STATUSES = new Set(['FT', 'AET', 'PEN']);

export function getScoreStatus(score: LiveScore): 'upcoming' | 'live' | 'halftime' | 'finished' {
  if (DONE_STATUSES.has(score.statusShort)) return 'finished';
  if (score.statusShort === 'HT') return 'halftime';
  if (LIVE_STATUSES.has(score.statusShort)) return 'live';
  return 'upcoming';
}

export function formatMinute(score: LiveScore): string {
  if (score.statusShort === 'HT') return 'HT';
  if (score.elapsed !== null) return `${score.elapsed}'`;
  return '';
}

interface UseLiveScoresReturn {
  scores:      LiveScore[];          // all today's fixtures
  scoreMap:    Map<string, LiveScore>; // keyed by "HomeTeam|AwayTeam" (lowercased)
  connected:   boolean;
  lastUpdated: Date | null;
  liveCount:   number;               // how many games currently live
}

export function useLiveScores(): UseLiveScoresReturn {
  const [scores, setScores]         = useState<LiveScore[]>([]);
  const [connected, setConnected]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource('/api/live-scores');
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retryCount.current = 0;
    };

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { type: string; payload: unknown };
        if (msg.type === 'scores') {
          setScores(msg.payload as LiveScore[]);
          setLastUpdated(new Date());
        }
      } catch { /* malformed message */ }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      esRef.current = null;

      // Exponential backoff: 2s, 4s, 8s … max 60s
      const delay = Math.min(2000 * Math.pow(2, retryCount.current), 60_000);
      retryCount.current++;
      retryRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);

  // Build a lookup map: "hometeam|awayteam" → LiveScore
  const scoreMap = new Map<string, LiveScore>();
  for (const s of scores) {
    const key = `${s.homeTeam.toLowerCase()}|${s.awayTeam.toLowerCase()}`;
    scoreMap.set(key, s);
    // Also index by reversed names in case home/away flipped
    const altKey = `${s.awayTeam.toLowerCase()}|${s.homeTeam.toLowerCase()}`;
    if (!scoreMap.has(altKey)) scoreMap.set(altKey, s);
  }

  const liveCount = scores.filter(s => LIVE_STATUSES.has(s.statusShort)).length;

  return { scores, scoreMap, connected, lastUpdated, liveCount };
}
