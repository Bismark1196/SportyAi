// lib/useLiveScores.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom React hook that connects to /api/live-scores (SSE) and exposes:
//   scores      — array of LiveFixture objects, keyed by fixture id
//   connected   — whether the EventSource is open
//   hasLive     — whether any game is currently in-progress
//   lastUpdated — timestamp of last successful update
//   source      — 'api-football' | 'football-data.org' | 'mock'
//
// The hook auto-reconnects on network errors (browser EventSource handles this).
// It also deduplicates updates: the state only changes when data actually differs.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react';

export interface LiveFixture {
  id: string;
  league: string;
  flag: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  statusCode: string;       // 'NS', '1H', 'HT', '2H', 'ET', 'FT', 'AET', 'PEN'
  statusLabel: string;      // "67'", "HT", "FT", "19:30"
  kickoffISO: string;
  isLive: boolean;
  isFinished: boolean;
}

export interface LiveScoresState {
  /** Map from fixture id → LiveFixture for O(1) lookup in the dashboard */
  scoresById: Record<string, LiveFixture>;
  /** Ordered array (live first, then scheduled, then finished) */
  scores: LiveFixture[];
  connected: boolean;
  hasLive: boolean;
  lastUpdated: number | null;
  source: string | null;
}

function sortFixtures(fixtures: LiveFixture[]): LiveFixture[] {
  const order = (f: LiveFixture) =>
    f.isLive ? 0 : !f.isFinished ? 1 : 2;
  return [...fixtures].sort((a, b) => order(a) - order(b));
}

export function useLiveScores(): LiveScoresState {
  const [state, setState] = useState<LiveScoresState>({
    scoresById: {},
    scores: [],
    connected: false,
    hasLive: false,
    lastUpdated: null,
    source: null,
  });

  const esRef  = useRef<EventSource | null>(null);
  const prevRef = useRef<string>(''); // JSON snapshot for dedup

  const connect = useCallback(() => {
    // Close existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource('/api/live-scores');
    esRef.current = es;

    es.onopen = () => {
      setState(s => ({ ...s, connected: true }));
    };

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === 'live') {
          const fixtures: LiveFixture[] = msg.payload || [];
          const snapshot = JSON.stringify(fixtures);

          // Skip re-render if nothing changed
          if (snapshot === prevRef.current) return;
          prevRef.current = snapshot;

          const sorted = sortFixtures(fixtures);
          const byId: Record<string, LiveFixture> = {};
          for (const f of fixtures) byId[f.id] = f;

          setState({
            scoresById:  byId,
            scores:      sorted,
            connected:   true,
            hasLive:     msg.hasLive ?? false,
            lastUpdated: Date.now(),
            source:      msg.source ?? null,
          });
        }
      } catch {
        // malformed message — ignore
      }
    };

    es.onerror = () => {
      setState(s => ({ ...s, connected: false }));
      // EventSource auto-reconnects after ~3s — no manual retry needed
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  return state;
}

// ── Utility: merge live score into a dashboard game object ──────────────────
// Pass a GAMES[] entry and the scoresById map to get enriched data back.
export function mergeLiveScore<T extends {
  id: string;
  home?: string;
  away?: string;
  homeTeam?: string;
  awayTeam?: string;
}>(
  game: T,
  scoresById: Record<string, LiveFixture>
): T & {
  liveScore:      { h: number; a: number } | null;
  liveMinute:     number | null;
  liveStatusCode: string | null;
  liveStatusLabel: string | null;
  isLive:         boolean;
  isFinished:     boolean;
} {
  // Try to match by id first, then by team names
  let live: LiveFixture | undefined = scoresById[game.id];

  if (!live) {
    const home = (game.home || game.homeTeam || '').toLowerCase();
    const away = (game.away || game.awayTeam || '').toLowerCase();
    live = Object.values(scoresById).find(
      f => f.home.toLowerCase() === home && f.away.toLowerCase() === away
    );
  }

  if (!live) {
    return {
      ...game,
      liveScore:       null,
      liveMinute:      null,
      liveStatusCode:  null,
      liveStatusLabel: null,
      isLive:          false,
      isFinished:      false,
    };
  }

  return {
    ...game,
    liveScore:       live.homeScore !== null && live.awayScore !== null
                       ? { h: live.homeScore, a: live.awayScore }
                       : null,
    liveMinute:      live.minute,
    liveStatusCode:  live.statusCode,
    liveStatusLabel: live.statusLabel,
    isLive:          live.isLive,
    isFinished:      live.isFinished,
  };
}