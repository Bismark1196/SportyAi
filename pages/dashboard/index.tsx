import { useState, useEffect, useCallback } from "react";

const LEAGUE_FLAGS = {
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Champions League": "⭐",
  "La Liga": "🇪🇸",
  "Bundesliga": "🇩🇪",
  "Serie A": "🇮🇹",
  "Ligue 1": "🇫🇷",
};

const PRED_LABELS = {
  home_win:  { short: "1",    long: "Home Win",        color: "#60a5fa" },
  draw:      { short: "X",    long: "Draw",             color: "#fbbf24" },
  away_win:  { short: "2",    long: "Away Win",         color: "#f87171" },
  over_2_5:  { short: "O2.5", long: "Over 2.5 Goals",  color: "#34d399" },
  btts:      { short: "GG",   long: "Both Teams Score", color: "#a78bfa" },
};

const REAL_GAMES = [
  // UCL Tonight (Apr 7)
  { id: "ucl1", league: "Champions League", homeTeam: "Real Madrid", awayTeam: "Bayern Munich", matchDate: "2026-04-07T19:00:00Z", localTime: "Tue Apr 7, 10:00 PM", status: "scheduled", prediction: "away_win", confidence: 72, odds: { home: 2.40, draw: 3.30, away: 2.80 }, winProb: { home: 34, draw: 24, away: 42 }, aiAnalysis: "Bayern have been in exceptional form and Real Madrid's defence has looked shaky. Expect a high-intensity battle with Bayern pressing high.", tips: ["Bayern scored 4 goals in last UCL match", "Real Madrid lost at home last time in UCL", "Expect over 2.5 goals"] },
  { id: "ucl2", league: "Champions League", homeTeam: "Sporting CP", awayTeam: "Arsenal", matchDate: "2026-04-07T19:00:00Z", localTime: "Tue Apr 7, 10:00 PM", status: "scheduled", prediction: "away_win", confidence: 78, odds: { home: 3.80, draw: 3.50, away: 1.85 }, winProb: { home: 21, draw: 25, away: 54 }, aiAnalysis: "Arsenal's UCL run has been dominant. Sporting at home is tricky but Arsenal's attacking depth should prevail. Saka and Martinelli in great form.", tips: ["Arsenal won 2-0 last leg", "Arsenal kept clean sheet last UCL outing", "Sporting's home form in UCL has been weak"] },
  // UCL Apr 8
  { id: "ucl3", league: "Champions League", homeTeam: "PSG", awayTeam: "Liverpool", matchDate: "2026-04-08T19:00:00Z", localTime: "Wed Apr 8, 10:00 PM", status: "scheduled", prediction: "home_win", confidence: 65, odds: { home: 1.95, draw: 3.40, away: 3.80 }, winProb: { home: 56, draw: 23, away: 22 }, aiAnalysis: "PSG at Parc des Princes will be electric. Liverpool are strong but PSG's home record in Europe is formidable this season.", tips: ["PSG won 5-2 in the first leg aggregate", "Liverpool must score to progress", "Expect an open and high-scoring affair"] },
  { id: "ucl4", league: "Champions League", homeTeam: "Barcelona", awayTeam: "Atletico Madrid", matchDate: "2026-04-08T19:00:00Z", localTime: "Wed Apr 8, 10:00 PM", status: "scheduled", prediction: "home_win", confidence: 82, odds: { home: 1.65, draw: 3.70, away: 5.00 }, winProb: { home: 63, draw: 19, away: 18 }, aiAnalysis: "Barcelona demolished Newcastle 7-2. Atletico will look to frustrate but Barça's form is too strong at Camp Nou right now.", tips: ["Barcelona on a 6-match winning streak", "Atletico rarely concede but struggle to score away in UCL", "Lewandowski in red-hot form"] },
  // EPL Apr 10-13
  { id: "epl1", league: "Premier League", homeTeam: "West Ham", awayTeam: "Wolves", matchDate: "2026-04-10T19:00:00Z", localTime: "Fri Apr 10, 10:00 PM", status: "scheduled", prediction: "home_win", confidence: 68, odds: { home: 1.85, draw: 3.40, away: 4.20 }, winProb: { home: 53, draw: 25, away: 22 }, aiAnalysis: "West Ham have home advantage and Wolves have struggled away all season. Expect West Ham to dominate possession.", tips: ["Wolves winless in last 7 away games", "West Ham strong at London Stadium", "Expect under 3 goals"] },
  { id: "epl2", league: "Premier League", homeTeam: "Arsenal", awayTeam: "Bournemouth", matchDate: "2026-04-11T11:30:00Z", localTime: "Sat Apr 11, 2:30 PM", status: "scheduled", prediction: "home_win", confidence: 85, odds: { home: 1.45, draw: 4.20, away: 6.50 }, winProb: { home: 66, draw: 20, away: 14 }, aiAnalysis: "Arsenal at home against Bournemouth is a banker. Gunners in title race and need every point. Bournemouth's away record is dire.", tips: ["Arsenal unbeaten at home this season", "Bournemouth scored only once in last 4 away games", "Saka back from injury"] },
  { id: "epl3", league: "Premier League", homeTeam: "Liverpool", awayTeam: "Fulham", matchDate: "2026-04-11T16:30:00Z", localTime: "Sat Apr 11, 7:30 PM", status: "scheduled", prediction: "home_win", confidence: 77, odds: { home: 1.60, draw: 3.80, away: 5.50 }, winProb: { home: 61, draw: 21, away: 18 }, aiAnalysis: "Liverpool need points in the title race. Fulham can be tricky but Anfield's atmosphere should carry the Reds.", tips: ["Liverpool on a 5-game home winning streak", "Fulham lost 3-1 to Fulham in December", "Salah fit and firing"] },
  { id: "epl4", league: "Premier League", homeTeam: "Chelsea", awayTeam: "Man City", matchDate: "2026-04-12T15:30:00Z", localTime: "Sun Apr 12, 6:30 PM", status: "scheduled", prediction: "away_win", confidence: 60, odds: { home: 2.60, draw: 3.20, away: 2.60 }, winProb: { home: 31, draw: 25, away: 44 }, aiAnalysis: "A fascinating clash at Stamford Bridge. City have the quality edge but Chelsea at home are dangerous. Could go either way.", tips: ["Both teams scored in last 3 meetings", "Haaland needs one goal to reach 30 this season", "Expect high tempo and chances both ways"] },
  { id: "epl5", league: "Premier League", homeTeam: "Crystal Palace", awayTeam: "Newcastle", matchDate: "2026-04-12T13:00:00Z", localTime: "Sun Apr 12, 4:00 PM", status: "scheduled", prediction: "away_win", confidence: 55, odds: { home: 2.80, draw: 3.10, away: 2.50 }, winProb: { home: 34, draw: 27, away: 40 }, aiAnalysis: "Newcastle are in strong form and need European qualification. Palace will make it tough but Newcastle should edge it.", tips: ["Newcastle unbeaten in last 5", "Palace strong defensively at home", "Isak a key threat for Newcastle"] },
  { id: "epl6", league: "Premier League", homeTeam: "Man United", awayTeam: "Leeds United", matchDate: "2026-04-13T19:00:00Z", localTime: "Mon Apr 13, 10:00 PM", status: "scheduled", prediction: "home_win", confidence: 74, odds: { home: 1.70, draw: 3.60, away: 5.00 }, winProb: { home: 60, draw: 22, away: 18 }, aiAnalysis: "Old Trafford derby. Leeds are newly promoted and United should have too much quality. But derbies are always unpredictable.", tips: ["United won 4 of last 5 home games", "Leeds scored in last 6 matches", "Rashford in form with 3 goals in 3"] },
  // Recent results for context
  { id: "res1", league: "Champions League", homeTeam: "Arsenal", awayTeam: "Bayer Leverkusen", matchDate: "2026-03-17T20:00:00Z", localTime: "Tue Mar 17", status: "final", score: { home: 2, away: 0 }, prediction: "home_win", confidence: 81, odds: { home: 1.75, draw: 3.60, away: 4.20 } },
  { id: "res2", league: "Champions League", homeTeam: "Barcelona", awayTeam: "Newcastle", matchDate: "2026-03-18T17:45:00Z", localTime: "Wed Mar 18", status: "final", score: { home: 7, away: 2 }, prediction: "home_win", confidence: 88, odds: { home: 1.50, draw: 4.00, away: 6.00 } },
  { id: "res3", league: "Champions League", homeTeam: "Liverpool", awayTeam: "Galatasaray", matchDate: "2026-03-18T20:00:00Z", localTime: "Wed Mar 18", status: "final", score: { home: 4, away: 0 }, prediction: "home_win", confidence: 90, odds: { home: 1.35, draw: 4.80, away: 8.50 } },
  { id: "res4", league: "Premier League", homeTeam: "Everton", awayTeam: "Chelsea", matchDate: "2026-03-21T17:30:00Z", localTime: "Sat Mar 21", status: "final", score: { home: 3, away: 0 }, prediction: "away_win", confidence: 55, odds: { home: 3.40, draw: 3.20, away: 2.10 } },
  { id: "res5", league: "Premier League", homeTeam: "Aston Villa", awayTeam: "West Ham", matchDate: "2026-03-22T14:15:00Z", localTime: "Sun Mar 22", status: "final", score: { home: 2, away: 0 }, prediction: "home_win", confidence: 70, odds: { home: 1.80, draw: 3.50, away: 4.20 } },
];

const STORAGE_KEY = "betai_state_v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function calcOddsColor(pred) {
  if (pred === "home_win") return "#60a5fa";
  if (pred === "draw") return "#fbbf24";
  if (pred === "away_win") return "#f87171";
  return "#34d399";
}

function confBadge(conf) {
  if (conf >= 80) return { label: "HIGH", color: "#34d399" };
  if (conf >= 65) return { label: "MED", color: "#fbbf24" };
  return { label: "LOW", color: "#f87171" };
}

function didWin(game, pick) {
  if (!game.score) return null;
  const { home, away } = game.score;
  if (pick === "home_win" && home > away) return true;
  if (pick === "draw" && home === away) return true;
  if (pick === "away_win" && away > home) return true;
  return false;
}

export default function App() {
  const saved = loadState();
  const [balance, setBalance] = useState(saved?.balance ?? 500);
  const [betSlip, setBetSlip] = useState(saved?.betSlip ?? []);
  const [betHistory, setBetHistory] = useState(saved?.betHistory ?? []);
  const [tab, setTab] = useState("upcoming"); // upcoming | results | history
  const [slipOpen, setSlipOpen] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [placingBet, setPlacingBet] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("100");
  const [editBalance, setEditBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(balance));

  // Persist state
  useEffect(() => {
    saveState({ balance, betSlip, betHistory });
  }, [balance, betSlip, betHistory]);

  const upcoming = REAL_GAMES.filter(g => g.status === "scheduled");
  const results = REAL_GAMES.filter(g => g.status === "final");

  const filteredUpcoming = leagueFilter === "All" ? upcoming : upcoming.filter(g => g.league === leagueFilter);
  const filteredResults = leagueFilter === "All" ? results : results.filter(g => g.league === leagueFilter);

  const totalStake = betSlip.reduce((a, b) => a + (parseFloat(b.stake) || 0), 0);
  const totalOdds = betSlip.reduce((acc, b) => acc * b.odds, 1);
  const potentialWin = totalStake * totalOdds;

  const isInSlip = (id) => betSlip.some(b => b.id === id);

  const addToSlip = (game, pick) => {
    const odds = pick === "home_win" ? game.odds.home : pick === "draw" ? game.odds.draw : game.odds.away;
    if (isInSlip(game.id)) {
      setBetSlip(prev => prev.filter(b => b.id !== game.id));
    } else {
      setBetSlip(prev => [...prev, {
        id: game.id, homeTeam: game.homeTeam, awayTeam: game.awayTeam,
        league: game.league, prediction: pick, odds,
        stake: "10", matchDate: game.matchDate,
      }]);
      setSlipOpen(true);
    }
  };

  const updateStake = (id, val) => setBetSlip(prev => prev.map(b => b.id === id ? { ...b, stake: val } : b));
  const removeFromSlip = (id) => setBetSlip(prev => prev.filter(b => b.id !== id));

  const handlePlaceBets = async () => {
    if (totalStake > balance) { alert("Insufficient balance!"); return; }
    if (betSlip.length === 0) return;
    setPlacingBet(true);
    await new Promise(r => setTimeout(r, 1200));
    const newEntry = {
      id: Date.now(),
      placedAt: new Date().toISOString(),
      bets: betSlip.map(b => ({ ...b })),
      totalStake,
      totalOdds: parseFloat(totalOdds.toFixed(2)),
      potentialWin: parseFloat(potentialWin.toFixed(2)),
      status: "pending",
    };
    setBetHistory(prev => [newEntry, ...prev]);
    setBalance(prev => parseFloat((prev - totalStake).toFixed(2)));
    setBetSlip([]);
    setPlacingBet(false);
    setBetPlaced(true);
    setSlipOpen(false);
    setTimeout(() => setBetPlaced(false), 3500);
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (amt > 0) {
      setBalance(prev => parseFloat((prev + amt).toFixed(2)));
      setShowDeposit(false);
      setDepositAmount("100");
    }
  };

  const handleBalanceSave = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val >= 0) setBalance(parseFloat(val.toFixed(2)));
    setEditBalance(false);
  };

  const settledHistory = betHistory.map(entry => {
    const bets = entry.bets.map(b => {
      const game = REAL_GAMES.find(g => g.id === b.id);
      if (!game || game.status !== "final") return { ...b, result: "pending" };
      const won = didWin(game, b.prediction);
      return { ...b, result: won ? "won" : "lost", score: game.score };
    });
    const allSettled = bets.every(b => b.result !== "pending");
    const allWon = bets.every(b => b.result === "won");
    const status = !allSettled ? "pending" : allWon ? "won" : "lost";
    return { ...entry, bets, status };
  });

  // Settle winnings
  useEffect(() => {
    setBetHistory(prev => prev.map(entry => {
      if (entry.status !== "pending" && entry.settled) return entry;
      const bets = entry.bets.map(b => {
        const game = REAL_GAMES.find(g => g.id === b.id);
        if (!game || game.status !== "final") return b;
        const won = didWin(game, b.prediction);
        return { ...b, result: won ? "won" : "lost", score: game.score };
      });
      const allSettled = bets.every(b => b.result === "won" || b.result === "lost");
      if (!allSettled) return { ...entry, bets };
      const allWon = bets.every(b => b.result === "won");
      if (allWon && !entry.settled) {
        setBalance(bal => parseFloat((bal + entry.potentialWin).toFixed(2)));
        return { ...entry, bets, status: "won", settled: true };
      }
      return { ...entry, bets, status: allWon ? "won" : "lost", settled: true };
    }));
  }, []);

  const leagues = ["All", ...Array.from(new Set(REAL_GAMES.map(g => g.league)))];

  const winRate = (() => {
    const settled = settledHistory.filter(e => e.status !== "pending");
    if (!settled.length) return null;
    return Math.round(settled.filter(e => e.status === "won").length / settled.length * 100);
  })();

  return (
    <div style={{ display: "flex", height: "100vh", background: "#09090b", color: "#f4f4f5", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: 200, background: "#111113", borderRight: "1px solid #27272a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #27272a" }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.05em" }}>BET<span style={{ color: "#34d399" }}>AI</span></div>
          <div style={{ fontSize: 10, color: "#52525b", marginTop: 2, letterSpacing: "0.08em" }}>LIVE PREDICTIONS</div>
        </div>

        {/* Balance Card */}
        <div style={{ margin: "12px 10px", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#71717a", letterSpacing: "0.08em", marginBottom: 4 }}>EUR BALANCE</div>
          {editBalance ? (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input value={balanceInput} onChange={e => setBalanceInput(e.target.value)}
                style={{ flex: 1, background: "#09090b", border: "1px solid #34d399", borderRadius: 6, padding: "4px 8px", color: "#f4f4f5", fontSize: 14, fontFamily: "monospace", outline: "none", width: "100%" }}
                onKeyDown={e => e.key === "Enter" && handleBalanceSave()} autoFocus />
              <button onClick={handleBalanceSave} style={{ background: "#34d399", border: "none", borderRadius: 4, padding: "4px 8px", color: "#09090b", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✓</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: "#34d399" }}>€{balance.toFixed(2)}</span>
              <button onClick={() => { setEditBalance(true); setBalanceInput(String(balance)); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#71717a", padding: "2px 4px" }} title="Edit balance">✏️</button>
            </div>
          )}
          <button onClick={() => setShowDeposit(v => !v)}
            style={{ marginTop: 8, width: "100%", padding: "6px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 6, color: "#34d399", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}>
            + DEPOSIT
          </button>
          {showDeposit && (
            <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                style={{ flex: 1, background: "#09090b", border: "1px solid #3f3f46", borderRadius: 6, padding: "5px 8px", color: "#f4f4f5", fontSize: 12, fontFamily: "monospace", outline: "none" }} />
              <button onClick={handleDeposit}
                style={{ background: "#34d399", border: "none", borderRadius: 6, padding: "5px 10px", color: "#09090b", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Go</button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: "4px 8px", flex: 1 }}>
          {[{ id: "upcoming", label: "Upcoming", icon: "▦" }, { id: "results", label: "Results", icon: "◎" }, { id: "history", label: "My Bets", icon: "◐" }].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === n.id ? 600 : 400,
              background: tab === n.id ? "rgba(52,211,153,0.08)" : "none",
              color: tab === n.id ? "#34d399" : "#71717a", transition: "all 0.15s",
              textAlign: "left", marginBottom: 2,
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
              {n.id === "history" && betHistory.length > 0 && (
                <span style={{ marginLeft: "auto", background: "#34d399", color: "#09090b", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{betHistory.length}</span>
              )}
            </button>
          ))}

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #27272a" }}>
            <div style={{ fontSize: 9, color: "#52525b", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 6 }}>LEAGUES</div>
            {leagues.map(l => (
              <button key={l} onClick={() => setLeagueFilter(l)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                background: leagueFilter === l ? "rgba(52,211,153,0.06)" : "none",
                color: leagueFilter === l ? "#34d399" : "#71717a", textAlign: "left",
              }}>
                {LEAGUE_FLAGS[l] && <span style={{ fontSize: 11 }}>{LEAGUE_FLAGS[l]}</span>}
                {l}
              </button>
            ))}
          </div>
        </nav>

        {/* Stats */}
        <div style={{ padding: "10px", borderTop: "1px solid #27272a" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Win Rate", val: winRate !== null ? `${winRate}%` : "—", color: "#34d399" },
              { label: "Bets", val: betHistory.length, color: "#60a5fa" },
            ].map(s => (
              <div key={s.label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 7, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "#52525b", letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ height: 52, background: "rgba(9,9,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #27272a", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", color: "#f4f4f5" }}>
              {tab === "upcoming" ? "UPCOMING MATCHES" : tab === "results" ? "RECENT RESULTS" : "MY BET HISTORY"}
            </span>
            <span style={{ fontSize: 11, color: "#52525b" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {betPlaced && (
              <span style={{ fontSize: 11, color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 20, padding: "4px 12px" }}>
                ✓ Bets placed!
              </span>
            )}
            <button onClick={() => setSlipOpen(v => !v)} style={{
              padding: "6px 14px", borderRadius: 7, border: `1px solid ${betSlip.length > 0 ? "#34d399" : "#3f3f46"}`,
              background: betSlip.length > 0 ? "rgba(52,211,153,0.12)" : "transparent",
              color: betSlip.length > 0 ? "#34d399" : "#71717a", fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              ◫ Bet Slip {betSlip.length > 0 && <span style={{ background: "#34d399", color: "#09090b", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{betSlip.length}</span>}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {tab === "upcoming" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
              {filteredUpcoming.map(game => (
                <GameCard key={game.id} game={game} inSlip={isInSlip(game.id)}
                  expanded={expanded === game.id}
                  onToggle={() => setExpanded(expanded === game.id ? null : game.id)}
                  onAddToSlip={(pick) => addToSlip(game, pick)} />
              ))}
              {filteredUpcoming.length === 0 && <EmptyState msg="No upcoming matches for this league." />}
            </div>
          )}
          {tab === "results" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
              {filteredResults.map(game => <ResultCard key={game.id} game={game} />)}
              {filteredResults.length === 0 && <EmptyState msg="No results for this league." />}
            </div>
          )}
          {tab === "history" && (
            <div style={{ maxWidth: 700 }}>
              {settledHistory.length === 0 ? (
                <EmptyState msg="No bets placed yet. Add matches to your slip and place your first bet!" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Summary row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 8 }}>
                    {[
                      { label: "Total Wagered", val: `€${settledHistory.reduce((a, e) => a + e.totalStake, 0).toFixed(2)}`, c: "#f4f4f5" },
                      { label: "Won", val: settledHistory.filter(e => e.status === "won").length, c: "#34d399" },
                      { label: "Lost", val: settledHistory.filter(e => e.status === "lost").length, c: "#f87171" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ fontSize: 10, color: "#52525b", letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontWeight: 700, fontSize: 20, color: s.c, fontFamily: "monospace" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {settledHistory.map(entry => (
                    <div key={entry.id} style={{ background: "#111113", border: `1px solid ${entry.status === "won" ? "rgba(52,211,153,0.3)" : entry.status === "lost" ? "rgba(248,113,113,0.2)" : "#27272a"}`, borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #27272a" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#52525b", marginBottom: 2 }}>{new Date(entry.placedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{entry.bets.length} selection{entry.bets.length > 1 ? "s" : ""} · Acca {entry.totalOdds.toFixed(2)}x</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#52525b" }}>Stake / Return</div>
                          <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>
                            €{entry.totalStake.toFixed(2)} → <span style={{ color: entry.status === "won" ? "#34d399" : entry.status === "lost" ? "#f87171" : "#fbbf24" }}>€{entry.potentialWin.toFixed(2)}</span>
                          </div>
                        </div>
                        <div style={{ padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                          background: entry.status === "won" ? "rgba(52,211,153,0.15)" : entry.status === "lost" ? "rgba(248,113,113,0.12)" : "rgba(251,191,36,0.1)",
                          color: entry.status === "won" ? "#34d399" : entry.status === "lost" ? "#f87171" : "#fbbf24",
                          border: `1px solid ${entry.status === "won" ? "rgba(52,211,153,0.3)" : entry.status === "lost" ? "rgba(248,113,113,0.2)" : "rgba(251,191,36,0.2)"}` }}>
                          {entry.status.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {entry.bets.map((b, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: "#a1a1aa" }}>{LEAGUE_FLAGS[b.league]} </span>
                              <span style={{ color: "#d4d4d8" }}>{b.homeTeam} vs {b.awayTeam}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: calcOddsColor(b.prediction), fontWeight: 600, fontSize: 11 }}>
                                {PRED_LABELS[b.prediction]?.long || b.prediction}
                              </span>
                              <span style={{ fontFamily: "monospace", color: "#fbbf24", fontSize: 11 }}>{b.odds.toFixed(2)}</span>
                              {b.result === "pending" && b.score == null && <span style={{ fontSize: 10, color: "#fbbf24" }}>⏳</span>}
                              {b.result === "won" && <span style={{ fontSize: 12, color: "#34d399" }}>✓</span>}
                              {b.result === "lost" && (
                                <span style={{ fontSize: 10, color: "#f87171" }}>
                                  ✗ {b.score ? `${b.score.home}-${b.score.away}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bet Slip Panel */}
      <aside style={{
        width: 280, background: "#111113", borderLeft: "1px solid #27272a",
        display: "flex", flexDirection: "column",
        transform: slipOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 50,
      }}>
        <div style={{ height: 52, padding: "0 14px", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>BET SLIP</span>
            {betSlip.length > 0 && <span style={{ background: "#34d399", color: "#09090b", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{betSlip.length}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {betSlip.length > 0 && <button onClick={() => setBetSlip([])} style={{ fontSize: 10, color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>CLEAR</button>}
            <button onClick={() => setSlipOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#71717a", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}>×</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {betSlip.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "#52525b", fontSize: 12, lineHeight: 1.8 }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>◫</div>
              Click any odds button on a match to add to your slip
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {betSlip.map(bet => {
                const pred = PRED_LABELS[bet.prediction];
                return (
                  <div key={bet.id} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#52525b", marginBottom: 2 }}>{LEAGUE_FLAGS[bet.league]} {bet.league}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#d4d4d8" }}>{bet.homeTeam} vs {bet.awayTeam}</div>
                        <div style={{ fontSize: 11, color: pred?.color || "#34d399", fontWeight: 600, marginTop: 2 }}>{pred?.long || bet.prediction} @ {bet.odds.toFixed(2)}</div>
                      </div>
                      <button onClick={() => removeFromSlip(bet.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#52525b", marginBottom: 4 }}>STAKE (€)</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input type="number" min="0.5" step="0.5" value={bet.stake} onChange={e => updateStake(bet.id, e.target.value)}
                          style={{ flex: 1, background: "#09090b", border: "1px solid #3f3f46", borderRadius: 6, padding: "5px 8px", color: "#f4f4f5", fontSize: 13, fontFamily: "monospace", outline: "none" }} />
                        <div style={{ fontSize: 11, color: "#34d399", fontFamily: "monospace", background: "rgba(52,211,153,0.08)", padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.15)" }}>
                          =€{((parseFloat(bet.stake) || 0) * bet.odds).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
                        {[5, 10, 25, 50].map(a => (
                          <button key={a} onClick={() => updateStake(bet.id, String(a))} style={{
                            flex: 1, padding: "3px 0", border: "1px solid #27272a", borderRadius: 4,
                            background: "none", color: "#71717a", fontSize: 10, cursor: "pointer",
                          }}>€{a}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {betSlip.length > 0 && (
          <div style={{ borderTop: "1px solid #27272a", padding: "12px 14px", flexShrink: 0 }}>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
              {betSlip.length > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#71717a" }}>Acca odds</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#fbbf24", fontSize: 12 }}>{totalOdds.toFixed(2)}x</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>Total stake</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#d4d4d8" }}>€{totalStake.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>Balance after</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: totalStake > balance ? "#f87171" : "#a1a1aa" }}>€{(balance - totalStake).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "1px solid #27272a", paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>Potential win</span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#34d399", fontSize: 14 }}>€{potentialWin.toFixed(2)}</span>
              </div>
            </div>
            {totalStake > balance && (
              <div style={{ fontSize: 11, color: "#f87171", textAlign: "center", marginBottom: 8 }}>⚠ Insufficient balance</div>
            )}
            <button onClick={handlePlaceBets} disabled={placingBet || totalStake > balance || totalStake <= 0} style={{
              width: "100%", padding: "12px", background: placingBet || totalStake > balance ? "rgba(52,211,153,0.35)" : "#34d399",
              border: "none", borderRadius: 8, color: "#09090b", fontWeight: 800, fontSize: 13,
              letterSpacing: "0.05em", cursor: placingBet || totalStake > balance ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}>
              {placingBet ? "⏳ PLACING..." : `PLACE BET${betSlip.length > 1 ? "S" : ""} (${betSlip.length})`}
            </button>
            <p style={{ fontSize: 10, color: "#52525b", textAlign: "center", marginTop: 6, lineHeight: 1.6 }}>AI predictions · Bet responsibly · 18+</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function GameCard({ game, inSlip, expanded, onToggle, onAddToSlip }) {
  const badge = confBadge(game.confidence);
  const pred = PRED_LABELS[game.prediction];

  return (
    <div style={{
      background: "#111113", border: `1px solid ${inSlip ? "rgba(52,211,153,0.35)" : "#27272a"}`,
      borderRadius: 12, overflow: "hidden", transition: "all 0.2s",
      boxShadow: inSlip ? "0 0 0 1px rgba(52,211,153,0.12)" : "none",
    }}>
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11 }}>{LEAGUE_FLAGS[game.league]}</span>
            <span style={{ fontSize: 10, color: "#71717a", letterSpacing: "0.07em" }}>{game.league}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, color: badge.color, background: `${badge.color}18`, border: `1px solid ${badge.color}30`, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>{badge.label}</span>
            <span style={{ fontSize: 10, color: "#52525b", fontFamily: "monospace" }}>{game.localTime}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "center", marginBottom: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#f4f4f5" }}>{game.homeTeam}</div>
            <div style={{ fontSize: 9, color: "#52525b", marginTop: 2 }}>HOME</div>
          </div>
          <div style={{ textAlign: "center", padding: "4px 8px", background: "#18181b", borderRadius: 5, fontSize: 10, color: "#52525b", letterSpacing: "0.06em" }}>VS</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#a1a1aa" }}>{game.awayTeam}</div>
            <div style={{ fontSize: 9, color: "#52525b", marginTop: 2 }}>AWAY</div>
          </div>
        </div>

        {/* Win prob bar */}
        {game.winProb && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 5 }}>
              <div style={{ width: `${game.winProb.home}%`, background: "#60a5fa" }} />
              <div style={{ width: `${game.winProb.draw}%`, background: "#fbbf24" }} />
              <div style={{ width: `${game.winProb.away}%`, background: "#f87171" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9, color: "#52525b" }}>
              <span style={{ color: "#60a5fa" }}>{game.winProb.home}%</span>
              <span style={{ color: "#fbbf24" }}>Draw {game.winProb.draw}%</span>
              <span style={{ color: "#f87171" }}>{game.winProb.away}%</span>
            </div>
          </div>
        )}

        {/* Odds buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 10 }}>
          {[
            { label: "1", sublabel: "Home", val: game.odds.home, pick: "home_win", color: "#60a5fa" },
            { label: "X", sublabel: "Draw", val: game.odds.draw, pick: "draw", color: "#fbbf24" },
            { label: "2", sublabel: "Away", val: game.odds.away, pick: "away_win", color: "#f87171" },
          ].map(o => {
            const isAI = game.prediction === o.pick;
            return (
              <button key={o.label} onClick={() => onAddToSlip(o.pick)} style={{
                padding: "7px 5px", borderRadius: 7,
                border: `1px solid ${isAI ? `${o.color}60` : "#27272a"}`,
                background: isAI ? `${o.color}12` : "#18181b",
                cursor: "pointer", textAlign: "center", transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 9, color: isAI ? o.color : "#52525b", letterSpacing: "0.05em", marginBottom: 2 }}>{o.label}</div>
                <div style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: isAI ? o.color : "#d4d4d8" }}>{o.val.toFixed(2)}</div>
                {isAI && <div style={{ fontSize: 8, color: o.color, marginTop: 2 }}>AI ✓</div>}
              </button>
            );
          })}
        </div>

        {/* Confidence bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "#52525b", letterSpacing: "0.06em" }}>AI CONFIDENCE</span>
            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: badge.color }}>{game.confidence}%</span>
          </div>
          <div style={{ height: 3, background: "#27272a", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${game.confidence}%`, height: "100%", background: badge.color, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #27272a" }}>
        <button onClick={() => onAddToSlip(game.prediction)} style={{
          flex: 1, padding: "8px 12px", background: inSlip ? "rgba(52,211,153,0.07)" : "transparent",
          border: "none", borderRight: "1px solid #27272a", cursor: "pointer", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.06em", color: inSlip ? "#34d399" : "#71717a", transition: "all 0.15s",
        }}>
          {inSlip ? "✓ IN SLIP" : "+ ADD TO SLIP"}
        </button>
        <button onClick={onToggle} style={{
          padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer",
          fontSize: 10, color: "#52525b", transition: "all 0.15s",
        }}>
          {expanded ? "▲" : "▼"} INFO
        </button>
      </div>

      {expanded && game.aiAnalysis && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid #27272a", background: "rgba(0,0,0,0.2)" }}>
          <p style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.7, marginBottom: 8 }}>{game.aiAnalysis}</p>
          {game.tips && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {game.tips.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: "#71717a" }}>
                  <span style={{ color: "#34d399", flexShrink: 0 }}>›</span><span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ game }) {
  const { home, away } = game.score || { home: 0, away: 0 };
  const homeWon = home > away;
  const awayWon = away > home;
  const isDraw = home === away;

  return (
    <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span>{LEAGUE_FLAGS[game.league]}</span>
          <span style={{ fontSize: 10, color: "#71717a" }}>{game.league}</span>
        </div>
        <span style={{ fontSize: 9, color: "#52525b", fontFamily: "monospace" }}>{game.localTime}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: homeWon ? 800 : 500, fontSize: 13, color: homeWon ? "#f4f4f5" : "#71717a" }}>{game.homeTeam}</div>
        </div>
        <div style={{ textAlign: "center", padding: "6px 10px", background: "#18181b", borderRadius: 6 }}>
          <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: isDraw ? "#fbbf24" : "#f4f4f5" }}>{home} – {away}</div>
          <div style={{ fontSize: 8, color: "#52525b", letterSpacing: "0.06em", marginTop: 2 }}>FT</div>
        </div>
        <div>
          <div style={{ fontWeight: awayWon ? 800 : 500, fontSize: 13, color: awayWon ? "#f4f4f5" : "#71717a" }}>{game.awayTeam}</div>
        </div>
      </div>
      {game.prediction && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: "#18181b", borderRadius: 6 }}>
          <span style={{ fontSize: 10, color: "#52525b" }}>AI predicted: <span style={{ color: calcOddsColor(game.prediction) }}>{PRED_LABELS[game.prediction]?.long}</span></span>
          {(() => {
            const won = didWin(game, game.prediction);
            return <span style={{ fontSize: 11, fontWeight: 700, color: won ? "#34d399" : "#f87171" }}>{won ? "✓ Correct" : "✗ Wrong"}</span>;
          })()}
        </div>
      )}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#52525b", gridColumn: "1/-1" }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
      <p style={{ fontSize: 13, lineHeight: 1.7 }}>{msg}</p>
    </div>
  );
}