import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";

/* ══════════════════════════════════════════════════════════════
   BETAI PRO — FULLY RESPONSIVE (Mobile · Tablet · Desktop)
   ══════════════════════════════════════════════════════════════ */

const COLORS = {
  bg0:"#070810", bg1:"#0c0d1a", bg2:"#111226", bg3:"#181932",
  border:"rgba(255,255,255,0.07)", borderHi:"rgba(255,255,255,0.14)",
  green:"#00e676", greenD:"#00c853",
  greenFaint:"rgba(0,230,118,0.08)", greenBorder:"rgba(0,230,118,0.22)",
  gold:"#ffd740", goldFaint:"rgba(255,215,64,0.1)", goldBorder:"rgba(255,215,64,0.3)",
  blue:"#448aff", blueFaint:"rgba(68,138,255,0.1)",
  purple:"#e040fb", purpleFaint:"rgba(224,64,251,0.1)",
  red:"#ff5252", redFaint:"rgba(255,82,82,0.09)",
  orange:"#ff6d00", orangeFaint:"rgba(255,109,0,0.08)", orangeBorder:"rgba(255,109,0,0.25)",
  text0:"#eceef8", text1:"#8e90a8", text2:"#4a4c68",
};

/* ── DATA ─────────────────────────────────────────────────── */
const MEGA = [
  { id:"mg1", league:"Champions League", flag:"⭐",
    home:"Sporting CP", away:"Arsenal",
    kick:"2026-04-07T19:00:00Z", display:"Tue 7 Apr · 22:00 EAT",
    pick:"away_win", pickLabel:"Arsenal Win", odds:1.85, conf:92,
    analysis:"Arsenal are dominant away in Europe — zero defeats in 8 UCL away matches this season. Sporting conceded 5 at the Emirates and their home record in Europe is poor. The Gunners are the standout banker.",
    tips:["Arsenal: 8 UCL away games unbeaten","Sporting conceded 5 in the reverse fixture","Arsenal away xGA = 0.6/game (UCL best)"] },
  { id:"mg2", league:"La Liga", flag:"🇪🇸",
    home:"FC Barcelona", away:"Espanyol",
    kick:"2026-04-11T16:30:00Z", display:"Sat 11 Apr · 19:30 EAT",
    pick:"home_win", pickLabel:"Barcelona Win", odds:1.28, conf:95,
    analysis:"Camp Nou derby is a mismatch. Barcelona on a 7-match winning streak, Espanyol fighting relegation with just 1 win in 9. The Blaugrana have won the last 5 home derbies by 3+ goals.",
    tips:["Barcelona: 7 consecutive wins","Espanyol: 1 win in last 9 games","Barça won last 5 derbies by 3+ goals"] },
  { id:"mg3", league:"Bundesliga", flag:"🇩🇪",
    home:"FC St. Pauli", away:"Bayern Munich",
    kick:"2026-04-11T16:30:00Z", display:"Sat 11 Apr · 19:30 EAT",
    pick:"away_win", pickLabel:"Bayern Win", odds:1.30, conf:94,
    analysis:"St. Pauli have the worst home record in the Bundesliga. Bayern have won 11 consecutive away games and are in a title race. This is as close to a certainty as football allows.",
    tips:["Bayern: 11 consecutive away wins","St.Pauli: worst home record in Bundesliga","Bayern scored 3+ in 9 of last 10 away games"] },
];

const GAMES = [
  // UCL
  { id:"u1", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 1",
    home:"Real Madrid", away:"Bayern Munich",
    kick:"2026-04-07T19:00:00Z", display:"Tue 7 Apr · 22:00", st:"upcoming",
    pick:"away_win", conf:72, odds:{h:2.40,d:3.30,a:2.80}, prob:{h:36,d:23,a:41},
    form:{h:"WDLWW",a:"WWWLW"}, h2h:"Madrid lead H2H 4-3 all time",
    tips:["Bayern scored 4+ in last UCL game","Real conceded 2 set-piece goals this month","O2.5 in 8 of last 10 UCL QF first legs"] },
  { id:"u2", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 1",
    home:"Sporting CP", away:"Arsenal",
    kick:"2026-04-07T19:00:00Z", display:"Tue 7 Apr · 22:00", st:"upcoming",
    pick:"away_win", conf:78, odds:{h:3.80,d:3.50,a:1.85}, prob:{h:22,d:26,a:52},
    form:{h:"WLWDL",a:"WWWWL"}, h2h:"Arsenal won 2-0 in R16 first leg",
    tips:["Arsenal 4 clean sheets in 5 UCL away","Sporting scored once in last 4 UCL home games","Arsenal away xG: 2.3/game"] },
  { id:"u3", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 1",
    home:"PSG", away:"Liverpool",
    kick:"2026-04-08T19:00:00Z", display:"Wed 8 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:65, odds:{h:1.95,d:3.40,a:3.80}, prob:{h:56,d:22,a:22},
    form:{h:"WWWDW",a:"WLWWW"}, h2h:"PSG won 8-2 aggregate vs Chelsea in R16",
    tips:["PSG unbeaten at home in Europe all season","Liverpool conceded in 4 straight UCL aways","Parc des Princes: 6W 0D 0L UCL home record"] },
  { id:"u4", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 1",
    home:"FC Barcelona", away:"Atlético Madrid",
    kick:"2026-04-08T19:00:00Z", display:"Wed 8 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:83, odds:{h:1.62,d:3.75,a:5.20}, prob:{h:62,d:20,a:18},
    form:{h:"WWWWW",a:"WDLWL"}, h2h:"Barça demolished Newcastle 7-2 in R16",
    tips:["Barça on 7-match winning run","Lewandowski scored in every UCL home game","Atlético: 1 clean sheet in last 6 away"] },
  { id:"u5", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 2",
    home:"Arsenal", away:"Sporting CP",
    kick:"2026-04-15T19:00:00Z", display:"Wed 15 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:88, odds:{h:1.40,d:5.00,a:8.50}, prob:{h:75,d:16,a:9},
    form:{h:"WWWWW",a:"WLWDL"}, h2h:"Arsenal won leg 1 2-0 away",
    tips:["Arsenal 2-0 up from first leg","Emirates will be electric","Sporting have no UCL away wins this season"] },
  { id:"u6", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 2",
    home:"Bayern Munich", away:"Real Madrid",
    kick:"2026-04-15T19:00:00Z", display:"Wed 15 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:68, odds:{h:2.10,d:3.30,a:3.40}, prob:{h:45,d:26,a:29},
    form:{h:"WWWLW",a:"WDLWW"}, h2h:"Allianz Arena fortress for Bayern in UCL",
    tips:["Bayern excellent at Allianz in UCL","Real Madrid away form in Bundesliga stadiums poor","Expect high-intensity set-piece battle"] },
  { id:"u7", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 2",
    home:"Liverpool", away:"PSG",
    kick:"2026-04-14T19:00:00Z", display:"Tue 14 Apr · 22:00", st:"upcoming",
    pick:"away_win", conf:60, odds:{h:3.20,d:3.40,a:2.10}, prob:{h:24,d:23,a:53},
    form:{h:"WLWWW",a:"WWWDW"}, h2h:"PSG won leg 1 at Parc des Princes",
    tips:["PSG lead after first leg","Liverpool must score to progress","Anfield pressure is a factor but PSG ahead"] },
  { id:"u8", cat:"UCL", league:"Champions League", flag:"⭐", round:"QF Leg 2",
    home:"Atlético Madrid", away:"FC Barcelona",
    kick:"2026-04-14T19:00:00Z", display:"Tue 14 Apr · 22:00", st:"upcoming",
    pick:"away_win", conf:76, odds:{h:4.20,d:3.60,a:1.75}, prob:{h:19,d:20,a:61},
    form:{h:"WDLWL",a:"WWWWW"}, h2h:"Barcelona lead after Camp Nou leg",
    tips:["Barça confidence sky-high after 7-match run","Atlético rarely overcome 2+ goal deficits","Barcelona scored in 9 straight UCL games"] },
  // EPL
  { id:"e1", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"West Ham", away:"Wolves",
    kick:"2026-04-10T19:00:00Z", display:"Fri 10 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:68, odds:{h:1.87,d:3.45,a:4.10}, prob:{h:52,d:25,a:23},
    form:{h:"WWDLW",a:"LLLDL"}, h2h:"West Ham 2-0 Wolves (Sep 2025)",
    tips:["Wolves winless away in 8 games","West Ham scored in last 6 home games","Under 3.5 goals in 70% of West Ham home games"] },
  { id:"e2", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Arsenal", away:"Bournemouth",
    kick:"2026-04-11T11:30:00Z", display:"Sat 11 Apr · 14:30", st:"upcoming",
    pick:"home_win", conf:87, odds:{h:1.44,d:4.50,a:7.00}, prob:{h:67,d:19,a:14},
    form:{h:"WWWWW",a:"LDDLL"}, h2h:"Arsenal 3-0 Bournemouth (Dec 2025)",
    tips:["Arsenal unbeaten at home all season","Bournemouth scored in 2 of last 6 away","Arsenal: only 8 home goals conceded all season"] },
  { id:"e3", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Burnley", away:"Brighton",
    kick:"2026-04-11T14:00:00Z", display:"Sat 11 Apr · 17:00", st:"upcoming",
    pick:"away_win", conf:71, odds:{h:3.60,d:3.40,a:2.00}, prob:{h:21,d:24,a:55},
    form:{h:"LLLWL",a:"WWDWL"}, h2h:"Burnley 1-2 Brighton (Oct 2025)",
    tips:["Brighton won 4 of last 5 away games","Burnley: 3rd worst home record in EPL","BTTS in 7 of Brighton's last 10 away games"] },
  { id:"e4", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Liverpool", away:"Fulham",
    kick:"2026-04-11T16:30:00Z", display:"Sat 11 Apr · 19:30", st:"upcoming",
    pick:"home_win", conf:77, odds:{h:1.57,d:3.90,a:5.75}, prob:{h:61,d:21,a:18},
    form:{h:"WWWLW",a:"LDWDL"}, h2h:"Liverpool 3-1 Fulham (Jan 2026)",
    tips:["Liverpool 5-match Anfield winning streak","Salah: 5 goals in last 4 Anfield games","Fulham lost 3 of 4 away vs top-half sides"] },
  { id:"e5", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Crystal Palace", away:"Newcastle",
    kick:"2026-04-12T13:00:00Z", display:"Sun 12 Apr · 16:00", st:"upcoming",
    pick:"away_win", conf:58, odds:{h:2.80,d:3.15,a:2.52}, prob:{h:33,d:27,a:40},
    form:{h:"DLWDL",a:"WWWDL"}, h2h:"Palace 1-1 Newcastle (Nov 2025)",
    tips:["Newcastle unbeaten in last 5","Isak scored in last 3 away games","Palace scored in 1 of last 5 home games"] },
  { id:"e6", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Chelsea", away:"Man City",
    kick:"2026-04-12T15:30:00Z", display:"Sun 12 Apr · 18:30", st:"upcoming",
    pick:"away_win", conf:61, odds:{h:2.65,d:3.20,a:2.58}, prob:{h:31,d:25,a:44},
    form:{h:"WDWLD",a:"WWDWL"}, h2h:"City beat Chelsea 3-0 (Aug 2025)",
    tips:["BTTS in last 4 Chelsea home games","Haaland needs 1 goal for 30 this season","O2.5 in 80% of their last 10 H2H meetings"] },
  { id:"e7", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Nott'm Forest", away:"Aston Villa",
    kick:"2026-04-12T13:00:00Z", display:"Sun 12 Apr · 16:00", st:"upcoming",
    pick:"draw", conf:52, odds:{h:2.90,d:3.10,a:2.50}, prob:{h:36,d:28,a:36},
    form:{h:"WDLDL",a:"WDWDW"}, h2h:"Forest 0-0 Villa (Jan 2026)",
    tips:["Both sides drew last 2 meetings","Villa away form inconsistent","Forest tight at home — O2.5 in only 3 of 8 home games"] },
  { id:"e8", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW35",
    home:"Man United", away:"Leeds",
    kick:"2026-04-13T19:00:00Z", display:"Mon 13 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:74, odds:{h:1.70,d:3.65,a:5.00}, prob:{h:60,d:22,a:18},
    form:{h:"WWDWW",a:"LWDLL"}, h2h:"United 2-1 Leeds (Dec 2025)",
    tips:["United won last 4 at Old Trafford","Leeds scored in all 6 away games","Rashford: 3 goals in last 3"] },
  // LA LIGA
  { id:"l1", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"Real Madrid", away:"Girona",
    kick:"2026-04-10T19:00:00Z", display:"Fri 10 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:89, odds:{h:1.25,d:5.50,a:11.0}, prob:{h:77,d:14,a:9},
    form:{h:"WLWWW",a:"LWLLW"}, h2h:"Madrid 3-0 Girona (MD1 this season)",
    tips:["Madrid 77% win probability at Bernabéu","Girona only 1 win in last 8 games","Madrid avg 3.2 home goals last 5 games"] },
  { id:"l2", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"FC Barcelona", away:"Espanyol",
    kick:"2026-04-11T16:30:00Z", display:"Sat 11 Apr · 19:30", st:"upcoming",
    pick:"home_win", conf:95, odds:{h:1.28,d:6.00,a:12.0}, prob:{h:78,d:13,a:9},
    form:{h:"WWWWW",a:"LLLWL"}, h2h:"Barça 4-0 Espanyol (MD3 this season)",
    tips:["Barça on 7-match winning run","Espanyol bottom 3, fighting relegation","Won last 5 home derbies by 3+ goals"] },
  { id:"l3", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"Sevilla", away:"Atlético Madrid",
    kick:"2026-04-11T19:00:00Z", display:"Sat 11 Apr · 22:00", st:"upcoming",
    pick:"away_win", conf:62, odds:{h:3.20,d:3.10,a:2.20}, prob:{h:28,d:30,a:42},
    form:{h:"DLWLD",a:"WWLWW"}, h2h:"Atlético 2-0 Sevilla (MD8)",
    tips:["Atlético strong away in La Liga","Sevilla inconsistent at home","Griezmann in form: 4 goals last 4 games"] },
  { id:"l4", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"Athletic Bilbao", away:"Villarreal",
    kick:"2026-04-12T19:00:00Z", display:"Sun 12 Apr · 22:00", st:"upcoming",
    pick:"home_win", conf:60, odds:{h:2.10,d:3.25,a:3.50}, prob:{h:42,d:27,a:31},
    form:{h:"WWLWD",a:"LWWDL"}, h2h:"Athletic 2-1 Villarreal (MD11)",
    tips:["San Mamés always tough for visitors","Villarreal inconsistent on the road","O2.5 in 6 of last 8 Athletic home games"] },
  { id:"l5", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"Real Sociedad", away:"Alavés",
    kick:"2026-04-11T12:00:00Z", display:"Sat 11 Apr · 15:00", st:"upcoming",
    pick:"home_win", conf:66, odds:{h:1.85,d:3.40,a:4.50}, prob:{h:54,d:26,a:20},
    form:{h:"WWLWW",a:"LDLLD"}, h2h:"Sociedad 2-1 Alavés (MD10)",
    tips:["Sociedad strong at Reale Arena","Alavés winless in 5 away games","Alavés scored in only 2 of last 6 aways"] },
  { id:"l6", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD33",
    home:"RC Celta", away:"Real Oviedo",
    kick:"2026-04-12T16:30:00Z", display:"Sun 12 Apr · 19:30", st:"upcoming",
    pick:"home_win", conf:70, odds:{h:1.75,d:3.50,a:4.80}, prob:{h:58,d:24,a:18},
    form:{h:"WDWWL",a:"LLDWL"}, h2h:"Celta 3-2 Oviedo (MD12)",
    tips:["Celta 58% win probability at home","Oviedo struggling against mid-table sides","O2.5 in 5 of last 6 Celta home games"] },
  // BUNDESLIGA
  { id:"b1", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"Borussia Dortmund", away:"Bayer Leverkusen",
    kick:"2026-04-11T13:30:00Z", display:"Sat 11 Apr · 16:30", st:"upcoming",
    pick:"home_win", conf:65, odds:{h:2.05,d:3.40,a:3.60}, prob:{h:48,d:24,a:27},
    form:{h:"WWWDW",a:"WWLDW"}, h2h:"Dortmund 2-1 Leverkusen (MD12)",
    tips:["Signal Iduna Park: incredible atmosphere","Dortmund unbeaten in last 5 home games","Leverkusen lost 2 of last 4 away games"] },
  { id:"b2", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"RB Leipzig", away:"B.M'gladbach",
    kick:"2026-04-11T13:30:00Z", display:"Sat 11 Apr · 16:30", st:"upcoming",
    pick:"home_win", conf:79, odds:{h:1.62,d:3.80,a:5.50}, prob:{h:64,d:19,a:17},
    form:{h:"WWWLW",a:"LLLWD"}, h2h:"Leipzig 4-1 Gladbach (MD14)",
    tips:["Leipzig 64% win probability at home","Gladbach winless in 6 away games","Leipzig avg 2.8 home goals per game"] },
  { id:"b3", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"FC St. Pauli", away:"Bayern Munich",
    kick:"2026-04-11T16:30:00Z", display:"Sat 11 Apr · 19:30", st:"upcoming",
    pick:"away_win", conf:94, odds:{h:8.50,d:5.00,a:1.30}, prob:{h:12,d:17,a:71},
    form:{h:"LLDLL",a:"WWWWW"}, h2h:"Bayern 4-0 St.Pauli (MD13)",
    tips:["Bayern 71% win probability","St.Pauli: worst home record in Bundesliga","Bayern scored 3+ in 9 of last 10 away games"] },
  { id:"b4", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"VfB Stuttgart", away:"Hamburger SV",
    kick:"2026-04-12T15:30:00Z", display:"Sun 12 Apr · 18:30", st:"upcoming",
    pick:"home_win", conf:76, odds:{h:1.68,d:3.70,a:5.20}, prob:{h:66,d:19,a:15},
    form:{h:"WWWLW",a:"LDLWL"}, h2h:"Stuttgart 5-0 Augsburg (last home game)",
    tips:["Stuttgart 66% win probability","HSV struggling away from Hamburg","Stuttgart: 4W 1L in last 5 home games"] },
  { id:"b5", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"FSV Mainz", away:"SC Freiburg",
    kick:"2026-04-12T17:30:00Z", display:"Sun 12 Apr · 20:30", st:"upcoming",
    pick:"home_win", conf:57, odds:{h:2.20,d:3.15,a:3.40}, prob:{h:43,d:30,a:27},
    form:{h:"WDWLW",a:"LLWDL"}, h2h:"Mainz 2-0 Freiburg (MD9)",
    tips:["Mainz solid at Mewa Arena","Freiburg winless in 4 away games","Under 2.5 in 5 of last 8 Mainz home games"] },
  { id:"b6", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD30",
    home:"Augsburg", away:"Hoffenheim",
    kick:"2026-04-10T18:30:00Z", display:"Fri 10 Apr · 21:30", st:"upcoming",
    pick:"away_win", conf:60, odds:{h:2.80,d:3.20,a:2.50}, prob:{h:29,d:25,a:46},
    form:{h:"LLDLW",a:"WWWLW"}, h2h:"Hoffenheim 2-0 Augsburg (MD14)",
    tips:["Hoffenheim 46% win probability","Augsburg weak at home (W3 D4 L7)","Hoffenheim won 3 of last 4 away games"] },
  // RESULTS
  { id:"r1", cat:"UCL", league:"Champions League", flag:"⭐", round:"R16 Leg 2",
    home:"Arsenal", away:"Bayer Leverkusen",
    kick:"2026-03-17T20:00:00Z", display:"17 Mar", st:"result",
    score:{h:2,a:0}, pick:"home_win", conf:81, odds:{h:1.75,d:3.60,a:4.20} },
  { id:"r2", cat:"UCL", league:"Champions League", flag:"⭐", round:"R16 Leg 2",
    home:"FC Barcelona", away:"Newcastle",
    kick:"2026-03-18T17:45:00Z", display:"18 Mar", st:"result",
    score:{h:7,a:2}, pick:"home_win", conf:88, odds:{h:1.50,d:4.00,a:6.50} },
  { id:"r3", cat:"UCL", league:"Champions League", flag:"⭐", round:"R16 Leg 2",
    home:"Liverpool", away:"Galatasaray",
    kick:"2026-03-18T20:00:00Z", display:"18 Mar", st:"result",
    score:{h:4,a:0}, pick:"home_win", conf:90, odds:{h:1.35,d:5.00,a:9.00} },
  { id:"r4", cat:"UCL", league:"Champions League", flag:"⭐", round:"R16 Leg 2",
    home:"Bayern Munich", away:"Atalanta",
    kick:"2026-03-18T20:00:00Z", display:"18 Mar", st:"result",
    score:{h:4,a:1}, pick:"home_win", conf:85, odds:{h:1.55,d:4.20,a:5.50} },
  { id:"r5", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW34",
    home:"Everton", away:"Chelsea",
    kick:"2026-03-21T17:30:00Z", display:"21 Mar", st:"result",
    score:{h:3,a:0}, pick:"away_win", conf:55, odds:{h:3.40,d:3.20,a:2.10} },
  { id:"r6", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW34",
    home:"Aston Villa", away:"West Ham",
    kick:"2026-03-22T14:15:00Z", display:"22 Mar", st:"result",
    score:{h:2,a:0}, pick:"home_win", conf:70, odds:{h:1.80,d:3.50,a:4.20} },
  { id:"r7", cat:"EPL", league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", round:"GW34",
    home:"Tottenham", away:"Nott'm Forest",
    kick:"2026-03-22T14:15:00Z", display:"22 Mar", st:"result",
    score:{h:0,a:3}, pick:"home_win", conf:62, odds:{h:2.00,d:3.40,a:3.80} },
  { id:"r8", cat:"La Liga", league:"La Liga", flag:"🇪🇸", round:"MD32",
    home:"Atlético Madrid", away:"FC Barcelona",
    kick:"2026-04-04T19:00:00Z", display:"4 Apr", st:"result",
    score:{h:1,a:2}, pick:"away_win", conf:74, odds:{h:2.80,d:3.20,a:2.40} },
  { id:"r9", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD29",
    home:"Bayer Leverkusen", away:"Wolfsburg",
    kick:"2026-04-04T13:30:00Z", display:"4 Apr", st:"result",
    score:{h:6,a:3}, pick:"home_win", conf:82, odds:{h:1.55,d:3.80,a:5.00} },
  { id:"r10", cat:"Bundesliga", league:"Bundesliga", flag:"🇩🇪", round:"MD29",
    home:"SC Freiburg", away:"Bayern Munich",
    kick:"2026-04-04T13:30:00Z", display:"4 Apr", st:"result",
    score:{h:2,a:3}, pick:"away_win", conf:86, odds:{h:4.20,d:3.60,a:1.70} },
];

/* ── HELPERS ──────────────────────────────────────────────── */
const LS = "betai_v5";
const persist = {
  load: () => { try { const r=localStorage.getItem(LS); return r?JSON.parse(r):null; } catch{return null;} },
  save: d => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch{} }
};

const oddsFor = (g, p) => p==="home_win"?g.odds.h : p==="draw"?g.odds.d : g.odds.a;
const pickName = p => ({home_win:"Home Win",draw:"Draw",away_win:"Away Win"}[p]||p);
const pickColor = p => ({home_win:COLORS.blue, draw:COLORS.gold, away_win:COLORS.purple}[p]||COLORS.green);

const confMeta = c => c>=88
  ? {label:"ELITE",c:COLORS.gold,bg:"rgba(255,215,64,0.12)",bc:"rgba(255,215,64,0.3)"}
  : c>=75
    ? {label:"HIGH",c:COLORS.green,bg:COLORS.greenFaint,bc:COLORS.greenBorder}
    : c>=60
      ? {label:"MED",c:COLORS.blue,bg:COLORS.blueFaint,bc:"rgba(68,138,255,0.3)"}
      : {label:"LOW",c:COLORS.red,bg:COLORS.redFaint,bc:"rgba(255,82,82,0.25)"};

const didWin = (g, p) => {
  if (!g?.score) return null;
  if (p==="home_win") return g.score.h > g.score.a;
  if (p==="draw")     return g.score.h === g.score.a;
  if (p==="away_win") return g.score.a > g.score.h;
  return null;
};

/* ── GAME STATUS ─────────────────────────────────────────────
   Derives real-time status from kick-off timestamp.
   - "upcoming"  : kick-off is in the future
   - "live"      : kick-off was 0–105 min ago (90 min match + 15 min buffer)
   - "finished"  : kick-off was more than 105 min ago
   Games with st==="result" (have a score) are always "finished".
   ──────────────────────────────────────────────────────────── */
const getGameStatus = (g) => {
  if (g.st === "result") return { status:"finished", minutesElapsed:null };
  const now   = Date.now();
  const kick  = new Date(g.kick).getTime();
  const diff  = now - kick; // ms since kick-off (negative = future)
  if (diff < 0)        return { status:"upcoming",  minutesElapsed:null };
  const mins  = Math.floor(diff / 60000);
  if (mins <= 105)     return { status:"live",       minutesElapsed:Math.min(mins, 90) };
  return               { status:"finished",          minutesElapsed:null };
};

/* ── DATE HELPERS ─────────────────────────────────────────── */
const toDateKey = isoStr => isoStr.slice(0, 10); // "YYYY-MM-DD"

const formatDateLabel = isoDateKey => {
  const d = new Date(isoDateKey + "T12:00:00Z");
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().slice(0, 10);
  if (isoDateKey === todayKey) return "TODAY";
  if (isoDateKey === tomorrowKey) return "TOMORROW";
  return d.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" }).toUpperCase();
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

/* Groups games by date, returns sorted array of { dateKey, label, games } */
const groupByDate = (games) => {
  const map = {};
  games.forEach(g => {
    const key = toDateKey(g.kick);
    if (!map[key]) map[key] = [];
    map[key].push(g);
  });
  return Object.keys(map).sort().map(dateKey => ({
    dateKey,
    label: formatDateLabel(dateKey),
    games: map[dateKey],
  }));
};

const CATS = ["All","UCL","EPL","La Liga","Bundesliga"];
const LEAGUES_LABEL = { UCL:"Champions League", EPL:"Premier League", "La Liga":"La Liga", "Bundesliga":"Bundesliga" };

/* ── APP ──────────────────────────────────────────────────── */
export default function App() {
  const router = useRouter();
  const s0 = persist.load();
  const [balance, setBalance]     = useState(s0?.balance ?? 500);
  const [slip, setSlip]           = useState(s0?.slip ?? []);
  const [history, setHistory]     = useState(s0?.history ?? []);
  const [page, setPage]           = useState("home");
  const [cat, setCat]             = useState("All");
  const [slipOpen, setSlipOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [placing, setPlacing]     = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [depOpen, setDepOpen]     = useState(false);
  const [depVal, setDepVal]       = useState("50");
  const [histExp, setHistExp]     = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { persist.save({balance, slip, history}); }, [balance, slip, history]);

  const toast$ = (msg, type="ok") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2800);
  };

  /* ── LOGOUT ──────────────────────────────────────────────── */
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    try { localStorage.removeItem(LS); } catch (_) {}
    router.push("/");
  }

  // slip math
  const totalStake = slip.reduce((a, b) => a + (parseFloat(b.stake) || 0), 0);
  const accumOdds  = slip.reduce((a, b) => a * b.odds, 1);
  const potReturn  = totalStake * accumOdds;
  const inSlip     = id => slip.some(b => b.id === id);

  function addToSlip(game, pick) {
    const { status } = getGameStatus(game);
    if (status !== "upcoming") return; // block live & finished games
    if (inSlip(game.id)) { setSlip(p => p.filter(b => b.id !== game.id)); return; }
    const odds = oddsFor(game, pick);
    setSlip(p => [...p, {id:game.id, home:game.home, away:game.away, league:game.league, flag:game.flag, pick, odds, stake:"10"}]);
    setSlipOpen(true);
    toast$(`${game.home} vs ${game.away} added`);
  }

  function addMega(m) {
    const { status } = getGameStatus(m);
    if (status !== "upcoming") return; // block live & finished mega picks
    if (inSlip(m.id)) { setSlip(p => p.filter(b => b.id !== m.id)); return; }
    setSlip(p => [...p, {id:m.id, home:m.home, away:m.away, league:m.league, flag:m.flag, pick:m.pick, odds:m.odds, stake:"10"}]);
    setSlipOpen(true);
    toast$("🔥 Mega Pick added!", "mega");
  }

  const updateStake = (id, v) => setSlip(p => p.map(b => b.id===id ? {...b, stake:v} : b));
  const removeSlip  = id => setSlip(p => p.filter(b => b.id !== id));

  async function placeBets() {
    if (totalStake > balance || totalStake <= 0) { toast$("Insufficient balance", "err"); return; }
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1300));
    const entry = {
      id: Date.now(), placedAt: new Date().toISOString(),
      bets: [...slip], totalStake, accumOdds: +accumOdds.toFixed(2), potReturn: +potReturn.toFixed(2), status: "pending"
    };
    setHistory(p => [entry, ...p]);
    setBalance(p => +(p - totalStake).toFixed(2));
    setSlip([]); setSlipOpen(false); setPlacing(false);
    toast$("✅ Bets placed! Good luck!", "ok");
  }

  function deposit() {
    const n = parseFloat(depVal);
    if (n > 0 && !isNaN(n)) {
      setBalance(p => +(p + n).toFixed(2));
      setDepOpen(false);
      setDepVal("50");
      toast$(`€${n.toFixed(2)} deposited`);
    }
  }

  // settled history
  const settled = history.map(e => {
    const bets = e.bets.map(b => {
      const g = GAMES.find(x => x.id === b.id);
      if (!g?.score) return {...b, result:"pending"};
      return {...b, result: didWin(g, b.pick) ? "won" : "lost", score: g.score};
    });
    const done = bets.every(b => b.result !== "pending");
    const allW = bets.every(b => b.result === "won");
    return {...e, bets, status: done ? (allW ? "won" : "lost") : "pending"};
  });

  const wonCount     = settled.filter(e => e.status === "won").length;
  const settledCount = settled.filter(e => e.status !== "pending").length;
  const winRate      = settledCount ? Math.round(wonCount / settledCount * 100) : null;
  const totalWagered = history.reduce((a, e) => a + e.totalStake, 0);
  const totalReturns = settled.filter(e => e.status === "won").reduce((a, e) => a + e.potReturn, 0);

  const upGames  = GAMES.filter(g => g.st === "upcoming" && (cat === "All" || g.cat === cat));
  const resGames = GAMES.filter(g => g.st === "result"   && (cat === "All" || g.cat === cat));
  const upcoming = GAMES.filter(g => g.st === "upcoming");

  const avgConf = upcoming.length ? Math.round(upcoming.reduce((a, g) => a + g.conf, 0) / upcoming.length) : 0;

  // Date-grouped data
  const upGrouped  = groupByDate(upGames);
  const resGrouped = groupByDate(resGames);

  // Today's mega picks only
  const todayKey = getTodayKey();
  const todayMega = MEGA.filter(m => toDateKey(m.kick) === todayKey);
  // If no mega picks today, show the next upcoming date's mega picks
  const nextMegaDateKey = todayMega.length === 0
    ? (MEGA.map(m => toDateKey(m.kick)).filter(k => k >= todayKey).sort()[0] || null)
    : null;
  const displayedMega = todayMega.length > 0 ? todayMega : (nextMegaDateKey ? MEGA.filter(m => toDateKey(m.kick) === nextMegaDateKey) : []);
  const megaDateLabel = todayMega.length > 0 ? "TODAY" : (nextMegaDateKey ? formatDateLabel(nextMegaDateKey) : "");
  const megaCount = displayedMega.length;

  const logoutBtnStyle = {
    display:"flex", alignItems:"center", gap:6,
    fontSize:11, fontWeight:700, letterSpacing:"0.06em",
    color:COLORS.text2, background:"transparent",
    border:`1px solid ${COLORS.border}`,
    borderRadius:7, padding:"6px 12px",
    cursor:"pointer", transition:"all .15s",
    fontFamily:"inherit",
    opacity: loggingOut ? 0.5 : 1,
  };

  return (
    <div style={{background:COLORS.bg0, color:COLORS.text0, minHeight:"100vh", fontFamily:"'Barlow', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
        body { overflow-x:hidden; }
        button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
        input  { font-family:inherit; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideR   { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes slideU   { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes toastIn  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(255,109,0,0.4)} 50%{box-shadow:0 0 16px 4px rgba(255,109,0,0.15)} }

        .fadeUp   { animation:fadeUp .28s ease both; }
        .spin     { animation:spin .75s linear infinite; display:inline-block; }
        .pulse    { animation:pulse 1.8s ease infinite; }
        .glowpulse{ animation:glowPulse 2.4s ease infinite; }

        .btn:active { transform:scale(0.95); transition:transform .1s; }
        .card-hover:hover { border-color:rgba(255,255,255,0.14) !important; }
        .odds-hover:hover { background:rgba(255,255,255,0.06) !important; border-color:rgba(255,255,255,0.2) !important; }
        .nav-item:hover { background:rgba(255,255,255,0.04) !important; }
        .logout-btn:hover { border-color:rgba(255,82,82,0.35) !important; color:#ff5252 !important; }

        .layout { display:flex; flex-direction:column; min-height:100vh; }
        .sidebar { display:none !important; }
        .topbar-desktop { display:none !important; }
        .topbar-mobile  { display:flex !important; }
        .bottom-nav     { display:flex !important; }
        .main-area { margin-left:0 !important; padding-bottom:70px; }
        .slip-panel { width:100% !important; border-radius:20px 20px 0 0 !important; top:auto !important; bottom:0 !important; max-height:92vh !important; animation:slideU .3s cubic-bezier(0.4,0,0.2,1) !important; }
        .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        .cards-grid { grid-template-columns: 1fr !important; }
        .filter-bar { padding:0 12px 10px !important; }
        .page-pad   { padding:12px !important; }
        .mega-grid  { grid-template-columns:1fr !important; }

        @media (min-width:640px) {
          .slip-panel { width:380px !important; border-radius:0 !important; top:0 !important; bottom:0 !important; max-height:100vh !important; animation:slideR .3s cubic-bezier(0.4,0,0.2,1) !important; }
          .topbar-mobile  { display:none !important; }
          .topbar-desktop { display:flex !important; }
          .bottom-nav     { display:flex !important; }
          .main-area      { padding-bottom:70px; }
          .cards-grid     { grid-template-columns:repeat(2,1fr) !important; }
          .stats-grid     { grid-template-columns:repeat(4,1fr) !important; }
          .filter-bar     { padding:0 20px 12px !important; }
          .page-pad       { padding:16px 20px !important; }
          .mega-grid      { grid-template-columns:repeat(3,1fr) !important; }
        }

        @media (min-width:1024px) {
          .sidebar        { display:flex !important; }
          .topbar-desktop { display:flex !important; }
          .topbar-mobile  { display:none !important; }
          .bottom-nav     { display:none !important; }
          .main-area      { margin-left:230px !important; padding-bottom:0 !important; }
          .cards-grid     { grid-template-columns:repeat(auto-fill, minmax(300px,1fr)) !important; }
          .filter-bar     { padding:0 24px 12px !important; }
          .page-pad       { padding:20px 24px !important; }
        }

        @media (min-width:1400px) {
          .sidebar    { width:260px !important; }
          .main-area  { margin-left:260px !important; }
        }
      `}</style>

      {/* ═══════════════════ SIDEBAR (Desktop) ═══════════════════ */}
      <aside className="sidebar" style={{
        position:"fixed", top:0, left:0, bottom:0, width:230, zIndex:60,
        background:COLORS.bg1, borderRight:`1px solid ${COLORS.border}`,
        flexDirection:"column", overflowY:"auto", display:"none"
      }}>
        <div style={{padding:"18px 20px 14px", borderBottom:`1px solid ${COLORS.border}`}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${COLORS.green},#00897b)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>⚡</div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, letterSpacing:"0.02em", lineHeight:1}}>BET<span style={{color:COLORS.green}}>AI</span></div>
              <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.12em"}}>PREDICTION ENGINE</div>
            </div>
          </div>
        </div>

        <div style={{margin:"14px 14px 0", background:`linear-gradient(135deg,rgba(0,230,118,0.08),rgba(0,137,123,0.05))`, border:`1px solid ${COLORS.greenBorder}`, borderRadius:12, padding:"14px 16px"}}>
          <div style={{fontSize:9, color:COLORS.green, letterSpacing:"0.12em", fontWeight:700, marginBottom:4}}>EUR BALANCE</div>
          <div style={{fontFamily:"'Barlow Condensed',monospace", fontWeight:900, fontSize:28, color:COLORS.green, letterSpacing:"-0.01em", lineHeight:1}}>€{balance.toFixed(2)}</div>
          <div style={{fontSize:10, color:COLORS.text2, marginTop:3}}>Available to bet</div>
          <button className="btn" onClick={() => setDepOpen(p => !p)} style={{marginTop:10, width:"100%", padding:"8px", borderRadius:8, background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`, color:COLORS.green, fontSize:12, fontWeight:700, letterSpacing:"0.06em"}}>+ DEPOSIT FUNDS</button>
          {depOpen && (
            <div style={{marginTop:8, display:"flex", gap:6}}>
              <input type="number" value={depVal} onChange={e => setDepVal(e.target.value)}
                style={{flex:1, background:COLORS.bg0, border:`1px solid ${COLORS.border}`, borderRadius:7, padding:"7px 10px", color:COLORS.text0, fontSize:13, outline:"none"}} placeholder="€ Amount" />
              <button className="btn" onClick={deposit} style={{padding:"7px 14px", background:COLORS.green, borderRadius:7, color:COLORS.bg0, fontWeight:800, fontSize:13}}>OK</button>
            </div>
          )}
        </div>

        <nav style={{padding:"10px 10px 0", flex:1}}>
          <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.14em", padding:"10px 8px 5px", fontWeight:700}}>MENU</div>
          {[
            {id:"home",    icon:"🏠", label:"Home"},
            {id:"matches", icon:"⚽", label:"Matches", badge:upGames.length},
            {id:"results", icon:"📊", label:"Results"},
            {id:"mybets",  icon:"🎫", label:"My Bets", badge:history.length||null},
          ].map(n => (
            <button key={n.id} className="nav-item btn" onClick={() => setPage(n.id)}
              style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:9, fontSize:13,
                fontWeight:page===n.id?700:500, marginBottom:2, textAlign:"left",
                background:page===n.id?"rgba(0,230,118,0.09)":"transparent",
                color:page===n.id?COLORS.green:COLORS.text1}}>
              <span style={{fontSize:16}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.badge ? <span style={{background:page===n.id?COLORS.green:COLORS.bg3, color:page===n.id?COLORS.bg0:COLORS.text1, borderRadius:999, padding:"0 7px", fontSize:10, fontWeight:800, lineHeight:"18px"}}>{n.badge}</span> : null}
            </button>
          ))}

          <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.14em", padding:"14px 8px 5px", fontWeight:700}}>LEAGUES</div>
          {CATS.map(c => (
            <button key={c} className="nav-item btn" onClick={() => setCat(c)}
              style={{width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, fontSize:12,
                fontWeight:cat===c?700:400, marginBottom:1, textAlign:"left",
                background:cat===c?"rgba(0,230,118,0.06)":"transparent",
                color:cat===c?COLORS.green:COLORS.text2}}>
              <span>{GAMES.find(g => g.cat===c)?.flag || "🌍"}</span>
              {c==="All" ? "All Leagues" : LEAGUES_LABEL[c] || c}
              {cat===c && <span style={{marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:COLORS.green}}/>}
            </button>
          ))}
        </nav>

        <div style={{padding:"12px 14px 16px", borderTop:`1px solid ${COLORS.border}`}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:10}}>
            {[
              {label:"Win Rate", val:winRate!==null?`${winRate}%`:"74%", col:COLORS.green},
              {label:"Bets",     val:history.length,                      col:COLORS.blue},
              {label:"Wagered",  val:`€${totalWagered.toFixed(0)}`,       col:COLORS.text0},
              {label:"Returns",  val:`€${totalReturns.toFixed(0)}`,       col:totalReturns>=totalWagered?COLORS.green:COLORS.red},
            ].map(s => (
              <div key={s.label} style={{background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:9, padding:"9px 10px"}}>
                <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.08em", marginBottom:4, fontWeight:600}}>{s.label.toUpperCase()}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:s.col}}>{s.val}</div>
              </div>
            ))}
          </div>
          <button
            className="btn logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{...logoutBtnStyle, width:"100%", justifyContent:"center"}}
          >
            {loggingOut ? <><span className="spin" style={{fontSize:10}}>◌</span> Signing out...</> : <>↪ SIGN OUT</>}
          </button>
        </div>
      </aside>

      {/* ═══════════════════ MOBILE TOPBAR ═══════════════════════ */}
      <header className="topbar-mobile" style={{
        position:"sticky", top:0, zIndex:80, height:54,
        background:"rgba(7,8,16,0.97)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${COLORS.border}`,
        padding:"0 14px", alignItems:"center", justifyContent:"space-between", display:"none"
      }}>
        <button className="btn" onClick={() => setSidebarOpen(true)} style={{fontSize:22, color:COLORS.text1, padding:"4px", display:"flex", alignItems:"center"}}>☰</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, letterSpacing:"0.04em"}}>
          BET<span style={{color:COLORS.green}}>AI</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <button className="btn" onClick={() => setDepOpen(p => !p)}
            style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:17, color:COLORS.green, letterSpacing:"-0.01em"}}>
            €{balance.toFixed(2)}
          </button>
          <button className="btn" onClick={() => setSlipOpen(p => !p)}
            style={{position:"relative", width:38, height:38, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
              background:slip.length>0?COLORS.greenFaint:COLORS.bg2,
              border:`1px solid ${slip.length>0?COLORS.greenBorder:COLORS.border}`}}>
            🎫
            {slip.length>0 && <span style={{position:"absolute", top:-4, right:-4, background:COLORS.orange, color:"#fff", borderRadius:999, fontSize:9, fontWeight:800, minWidth:16, height:16, lineHeight:"16px", textAlign:"center", padding:"0 3px"}}>{slip.length}</span>}
          </button>
        </div>
      </header>

      {/* ═══════════════════ DESKTOP TOPBAR ══════════════════════ */}
      <header className="topbar-desktop" style={{
        position:"sticky", top:0, zIndex:50, height:56, marginLeft:230,
        background:"rgba(7,8,16,0.97)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${COLORS.border}`,
        padding:"0 24px", alignItems:"center", justifyContent:"space-between", display:"none", gap:12
      }}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:14, letterSpacing:"0.1em", color:COLORS.text0}}>
            {page==="home"?"TODAY'S OVERVIEW":page==="matches"?"UPCOMING MATCHES":page==="results"?"RECENT RESULTS":"MY BET HISTORY"}
          </div>
          <div style={{fontSize:11, color:COLORS.text2, marginTop:1}}>
            {new Date().toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long", year:"numeric"})}
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          {toast && toast.type==="ok" && <div style={{fontSize:11, color:COLORS.green, background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`, borderRadius:20, padding:"5px 14px", fontWeight:600, animation:"fadeIn .2s ease"}}>{toast.msg}</div>}
          <button className="btn" onClick={() => setSlipOpen(p => !p)}
            style={{display:"flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:9,
              border:`1px solid ${slip.length>0?COLORS.greenBorder:COLORS.border}`,
              background:slip.length>0?COLORS.greenFaint:"transparent",
              color:slip.length>0?COLORS.green:COLORS.text1, fontSize:12, fontWeight:700}}>
            🎫 Bet Slip
            {slip.length>0 && <span style={{background:COLORS.green, color:COLORS.bg0, borderRadius:999, padding:"0 8px", fontSize:10, fontWeight:800, lineHeight:"18px"}}>{slip.length}</span>}
          </button>
          <button
            className="btn logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            style={logoutBtnStyle}
          >
            {loggingOut ? <><span className="spin" style={{fontSize:10}}>◌</span> Signing out...</> : <>↪ SIGN OUT</>}
          </button>
        </div>
      </header>

      {/* ═══════════════════ MOBILE SIDEBAR DRAWER ═══════════════ */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{position:"fixed", inset:0, zIndex:89, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)"}}/>
          <div style={{position:"fixed", top:0, left:0, bottom:0, width:260, zIndex:90, background:COLORS.bg1,
            borderRight:`1px solid ${COLORS.border}`, display:"flex", flexDirection:"column",
            animation:"fadeUp .25s ease", overflowY:"auto"}}>
            <div style={{padding:"16px 18px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22}}>BET<span style={{color:COLORS.green}}>AI</span></div>
              <button onClick={() => setSidebarOpen(false)} style={{fontSize:22, color:COLORS.text2, lineHeight:1}}>×</button>
            </div>
            <div style={{margin:"12px 12px 0", background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`, borderRadius:10, padding:"12px 14px"}}>
              <div style={{fontSize:9, color:COLORS.green, letterSpacing:"0.1em", fontWeight:700, marginBottom:3}}>BALANCE</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, color:COLORS.green}}>€{balance.toFixed(2)}</div>
              <div style={{display:"flex", gap:5, marginTop:8}}>
                {[20, 50, 100].map(a => (
                  <button key={a} className="btn" onClick={() => { setBalance(p => +(p+a).toFixed(2)); toast$(`€${a} added`); setSidebarOpen(false); }}
                    style={{flex:1, padding:"5px", borderRadius:6, background:COLORS.bg2, border:`1px solid ${COLORS.border}`, fontSize:11, fontWeight:700, color:COLORS.green}}>+€{a}</button>
                ))}
              </div>
            </div>
            <nav style={{padding:"8px 10px", flex:1}}>
              {[{id:"home",icon:"🏠",label:"Home"},{id:"matches",icon:"⚽",label:"Matches"},{id:"results",icon:"📊",label:"Results"},{id:"mybets",icon:"🎫",label:"My Bets"}].map(n => (
                <button key={n.id} className="btn" onClick={() => { setPage(n.id); setSidebarOpen(false); }}
                  style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:9, fontSize:14, fontWeight:page===n.id?700:500, marginBottom:3, textAlign:"left",
                    background:page===n.id?"rgba(0,230,118,0.09)":"transparent", color:page===n.id?COLORS.green:COLORS.text1}}>
                  <span>{n.icon}</span>{n.label}
                </button>
              ))}
              <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.12em", padding:"12px 8px 5px", fontWeight:700}}>LEAGUES</div>
              {CATS.map(c => (
                <button key={c} className="btn" onClick={() => { setCat(c); setSidebarOpen(false); }}
                  style={{width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, fontSize:13, fontWeight:cat===c?700:400, marginBottom:1, textAlign:"left",
                    background:cat===c?"rgba(0,230,118,0.06)":"transparent", color:cat===c?COLORS.green:COLORS.text2}}>
                  <span>{GAMES.find(g => g.cat===c)?.flag || "🌍"}</span>
                  {c==="All" ? "All Leagues" : LEAGUES_LABEL[c] || c}
                </button>
              ))}
            </nav>
            <div style={{padding:"12px 12px 16px", borderTop:`1px solid ${COLORS.border}`}}>
              <button
                className="btn logout-btn"
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                disabled={loggingOut}
                style={{...logoutBtnStyle, width:"100%", justifyContent:"center"}}
              >
                {loggingOut ? <><span className="spin" style={{fontSize:10}}>◌</span> Signing out...</> : <>↪ SIGN OUT</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile deposit bar */}
      {depOpen && (
        <div style={{position:"fixed", top:54, left:0, right:0, zIndex:79, background:COLORS.bg1, borderBottom:`1px solid ${COLORS.border}`, padding:"12px 14px", display:"flex", gap:8, alignItems:"center", animation:"fadeUp .2s ease"}}>
          {[20, 50, 100, 200].map(a => (
            <button key={a} className="btn" onClick={() => setDepVal(String(a))}
              style={{flex:1, padding:"8px 0", borderRadius:8, fontSize:12, fontWeight:700,
                background:depVal===String(a)?COLORS.greenFaint:COLORS.bg2,
                border:`1px solid ${depVal===String(a)?COLORS.greenBorder:COLORS.border}`,
                color:depVal===String(a)?COLORS.green:COLORS.text1}}>€{a}</button>
          ))}
          <button className="btn" onClick={deposit} style={{padding:"8px 16px", borderRadius:8, background:COLORS.green, color:COLORS.bg0, fontWeight:800, fontSize:13}}>ADD</button>
          <button onClick={() => setDepOpen(false)} style={{color:COLORS.text2, fontSize:22, lineHeight:1}}>×</button>
        </div>
      )}

      {/* ═══════════════════ TOAST ════════════════════════════════ */}
      {toast && (
        <div style={{
          position:"fixed", top:64, right:14, zIndex:200,
          background:toast.type==="err"?"#2a0808":toast.type==="mega"?"#1f1200":COLORS.bg2,
          border:`1px solid ${toast.type==="err"?COLORS.red:toast.type==="mega"?COLORS.orange:COLORS.greenBorder}`,
          color:toast.type==="err"?COLORS.red:toast.type==="mega"?COLORS.orange:COLORS.green,
          borderRadius:10, padding:"9px 14px", fontSize:12, fontWeight:700,
          animation:"toastIn .25s ease", maxWidth:260
        }}>
          {toast.msg}
        </div>
      )}

      {/* ═══════════════════ MAIN CONTENT ════════════════════════ */}
      <div className="main-area" style={{position:"relative"}}>

        {/* Filter bar */}
        {page !== "mybets" && (
          <div className="filter-bar" style={{borderBottom:`1px solid ${COLORS.border}`, background:COLORS.bg1}}>
            <div style={{display:"flex", gap:6, overflowX:"auto", paddingTop:10, scrollbarWidth:"none", msOverflowStyle:"none"}}>
              {CATS.map(c => (
                <button key={c} className="btn" onClick={() => setCat(c)} style={{
                  flexShrink:0, padding:"5px 14px", borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:"0.04em",
                  background:cat===c?COLORS.greenFaint:"transparent",
                  border:`1px solid ${cat===c?COLORS.greenBorder:COLORS.border}`,
                  color:cat===c?COLORS.green:COLORS.text2}}>
                  {c==="All" ? "All" : c}
                </button>
              ))}
              <span style={{marginLeft:"auto", flexShrink:0, fontSize:11, color:COLORS.text2, display:"flex", alignItems:"center", gap:4, paddingRight:2}}>
                {page==="results" ? resGames.length : upGames.length} matches
              </span>
            </div>
          </div>
        )}

        <div className="page-pad">

          {/* ─── HOME PAGE ─────────────────────────────── */}
          {page === "home" && (
            <>
              <div className="stats-grid" style={{display:"grid", gap:10, marginBottom:18}}>
                {[
                  {icon:"🎯", label:"AI Win Rate",     val:winRate!==null?`${winRate}%`:"74%",            sub:"Last 30 days",                                  col:COLORS.green},
                  {icon:"⚽", label:"Today's Tips",    val:upcoming.length,                               sub:`${upcoming.filter(g=>g.conf>=80).length} high-confidence`, col:COLORS.blue},
                  {icon:"📈", label:"Avg Confidence",  val:`${avgConf}%`,                                 sub:"All upcoming games",                             col:COLORS.gold},
                  {icon:"💰", label:"Potential Return", val:slip.length>0?`€${potReturn.toFixed(2)}`:"—", sub:slip.length>0?`${slip.length} selections`:"Add selections", col:slip.length>0?COLORS.green:COLORS.text2},
                ].map((s, i) => (
                  <div key={i} className="card-hover" onClick={i===3&&slip.length>0?()=>setSlipOpen(true):undefined}
                    style={{background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:13, padding:"14px 16px", cursor:i===3&&slip.length>0?"pointer":"default"}}>
                    <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:8}}>
                      <span style={{fontSize:14}}>{s.icon}</span>
                      <span style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.1em", fontWeight:700}}>{s.label.toUpperCase()}</span>
                    </div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, color:s.col, letterSpacing:"-0.01em", lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:10, color:COLORS.text2, marginTop:5}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Mega Picks — filtered to today's date (or next upcoming date) */}
              {displayedMega.length > 0 && (
                <div style={{marginBottom:18}}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <div style={{width:4, height:22, borderRadius:2, background:COLORS.orange}}/>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, letterSpacing:"0.03em"}}>🔥 MEGA SURE PICKS</span>
                      <span style={{fontSize:9, color:COLORS.orange, background:COLORS.orangeFaint, border:`1px solid ${COLORS.orangeBorder}`, borderRadius:5, padding:"2px 8px", fontWeight:800}}>{megaDateLabel} · {megaCount} PICK{megaCount!==1?"S":""}</span>
                    </div>
                  </div>

                  <div className="mega-grid" style={{display:"grid", gap:10}}>
                    {displayedMega.map((m, i) => {
                      const inS = inSlip(m.id);
                      return (
                        <div key={m.id} className="card-hover glowpulse fadeUp"
                          style={{background:`linear-gradient(135deg,rgba(255,109,0,0.08) 0%,rgba(30,20,5,0.95) 60%)`,
                            border:`1px solid ${COLORS.orangeBorder}`, borderRadius:14, overflow:"hidden",
                            animationDelay:`${i*0.07}s`, animationFillMode:"both"}}>
                          <div style={{padding:"14px 16px"}}>
                            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
                              <div style={{display:"flex", alignItems:"center", gap:6}}>
                                <span>{m.flag}</span>
                                <span style={{fontSize:10, color:COLORS.text1, fontWeight:600}}>{m.league}</span>
                                <span style={{fontSize:9, background:COLORS.orangeFaint, color:COLORS.orange, borderRadius:4, padding:"1px 6px", fontWeight:800}}>MEGA SURE</span>
                              </div>
                              <div style={{display:"flex", alignItems:"center", gap:5}}>
                                <span style={{fontSize:11, fontFamily:"'Barlow Condensed',sans-serif", color:COLORS.gold, fontWeight:800, background:COLORS.goldFaint, border:`1px solid ${COLORS.goldBorder}`, borderRadius:5, padding:"2px 8px"}}>{m.odds.toFixed(2)}</span>
                                <span style={{fontSize:9, color:COLORS.gold, fontWeight:800, background:"rgba(255,215,64,0.08)", border:`1px solid ${COLORS.goldBorder}`, borderRadius:4, padding:"1px 6px"}}>{m.conf}%</span>
                              </div>
                            </div>
                            <div style={{fontWeight:800, fontSize:15, marginBottom:3, lineHeight:1.3}}>{m.home} <span style={{color:COLORS.text2, fontWeight:400, fontSize:12}}>vs</span> {m.away}</div>
                            <div style={{fontSize:10, color:COLORS.text2, marginBottom:10}}>{m.display}</div>
                            <p style={{fontSize:12, color:COLORS.text1, lineHeight:1.75, marginBottom:10}}>{m.analysis}</p>
                            <div style={{display:"flex", flexDirection:"column", gap:4, marginBottom:12}}>
                              {m.tips.map((t, j) => (
                                <div key={j} style={{display:"flex", gap:6, fontSize:11, color:COLORS.text2}}>
                                  <span style={{color:COLORS.orange, flexShrink:0}}>›</span><span>{t}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <div style={{flex:1, background:`rgba(255,109,0,0.12)`, border:`1px solid ${COLORS.orangeBorder}`, borderRadius:8, padding:"7px 12px", textAlign:"center"}}>
                                <div style={{fontSize:11, color:COLORS.orange, fontWeight:800}}>{m.pickLabel}</div>
                              </div>
                              <button className="btn" onClick={() => addMega(m)}
                                style={{width:40, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                                  background:inS?COLORS.greenFaint:COLORS.bg2, border:`1px solid ${inS?COLORS.greenBorder:COLORS.border}`,
                                  color:inS?COLORS.green:COLORS.text1}}>
                                {inS ? "✓" : "+"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="btn" onClick={() => { displayedMega.forEach(m => { if (!inSlip(m.id)) addMega(m); }); }}
                    style={{width:"100%", marginTop:10, padding:"13px", borderRadius:12,
                      background:`linear-gradient(90deg,${COLORS.orange},#ff8f00)`,
                      color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, letterSpacing:"0.06em"}}>
                    🔥 ADD ALL {megaCount} MEGA PICK{megaCount!==1?"S":""} TO SLIP
                  </button>
                </div>
              )}

              {/* UCL preview */}
              <div style={{marginBottom:18}}>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <div style={{width:4, height:22, borderRadius:2, background:COLORS.blue}}/>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16}}>⭐ TONIGHT'S UCL ACTION</span>
                  </div>
                  <button className="btn" onClick={() => { setCat("UCL"); setPage("matches"); }} style={{fontSize:11, color:COLORS.blue, fontWeight:700}}>View all →</button>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  {GAMES.filter(g => g.st==="upcoming" && g.cat==="UCL" && g.kick.startsWith("2026-04-07")).map(g => (
                    <CompactRow key={g.id} game={g} inSlip={inSlip(g.id)} onAdd={pick => addToSlip(g, pick)} />
                  ))}
                </div>
              </div>

              {/* Recent Results on Home */}
              <div>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <div style={{width:4, height:22, borderRadius:2, background:COLORS.green}}/>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16}}>📊 RECENT RESULTS</span>
                    <span style={{fontSize:9, color:COLORS.green, background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`, borderRadius:5, padding:"2px 8px", fontWeight:800}}>
                      {GAMES.filter(g=>g.st==="result" && didWin(g,g.pick)).length}/{GAMES.filter(g=>g.st==="result").length} CORRECT
                    </span>
                  </div>
                  <button className="btn" onClick={() => setPage("results")} style={{fontSize:11, color:COLORS.green, fontWeight:700}}>View all →</button>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  {GAMES.filter(g => g.st==="result").slice(-5).reverse().map((g, i) => {
                    const hW = g.score.h > g.score.a;
                    const aW = g.score.a > g.score.h;
                    const dr = g.score.h === g.score.a;
                    const correct = didWin(g, g.pick);
                    return (
                      <div key={g.id} className="card-hover fadeUp" style={{
                        background:COLORS.bg2,
                        border:`1px solid ${correct ? COLORS.greenBorder : "rgba(255,82,82,0.18)"}`,
                        borderRadius:12, padding:"12px 14px",
                        animationDelay:`${i*0.05}s`, animationFillMode:"both"
                      }}>
                        {/* Top row: league + date + result badge */}
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                          <div style={{display:"flex", alignItems:"center", gap:5}}>
                            <span style={{fontSize:12}}>{g.flag}</span>
                            <span style={{fontSize:10, color:COLORS.text2, fontWeight:600}}>{g.league}</span>
                            <span style={{fontSize:9, color:COLORS.text2}}>· {g.round}</span>
                          </div>
                          <div style={{display:"flex", alignItems:"center", gap:6}}>
                            <span style={{fontSize:10, color:COLORS.text2, fontFamily:"monospace"}}>{g.display}</span>
                            <span style={{
                              fontSize:10, fontWeight:800, letterSpacing:"0.04em",
                              color: correct ? COLORS.green : COLORS.red,
                              background: correct ? COLORS.greenFaint : COLORS.redFaint,
                              border:`1px solid ${correct ? COLORS.greenBorder : "rgba(255,82,82,0.25)"}`,
                              borderRadius:5, padding:"2px 8px"
                            }}>{correct ? "✓ WIN" : "✗ LOSS"}</span>
                          </div>
                        </div>
                        {/* Score row */}
                        <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center"}}>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontWeight:hW?800:500, fontSize:14, color:hW?COLORS.text0:COLORS.text2, lineHeight:1.2}}>{g.home}</div>
                          </div>
                          <div style={{
                            textAlign:"center", minWidth:60,
                            background: dr ? COLORS.goldFaint : correct ? COLORS.greenFaint : COLORS.redFaint,
                            border:`1px solid ${dr ? COLORS.goldBorder : correct ? COLORS.greenBorder : "rgba(255,82,82,0.25)"}`,
                            borderRadius:9, padding:"6px 12px"
                          }}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:dr?COLORS.gold:COLORS.text0, letterSpacing:"0.02em", lineHeight:1}}>{g.score.h}–{g.score.a}</div>
                            <div style={{fontSize:8, color:COLORS.text2, fontWeight:700, letterSpacing:"0.1em", marginTop:2}}>FT</div>
                          </div>
                          <div>
                            <div style={{fontWeight:aW?800:500, fontSize:14, color:aW?COLORS.text0:COLORS.text2, lineHeight:1.2}}>{g.away}</div>
                          </div>
                        </div>
                        {/* AI pick row */}
                        <div style={{marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                          <span style={{fontSize:10, color:COLORS.text2}}>
                            AI picked: <span style={{color:pickColor(g.pick), fontWeight:700}}>{pickName(g.pick)}</span>
                            <span style={{color:COLORS.text2}}> @ {oddsFor(g, g.pick).toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ─── MATCHES PAGE — grouped by date ───────── */}
          {page === "matches" && (
            <>
              <div style={{fontSize:11, color:COLORS.text2, marginBottom:12, fontWeight:500}}>
                Showing {upGames.length} upcoming {cat!=="All"?(LEAGUES_LABEL[cat]||cat):"all-league"} matches
              </div>
              {upGrouped.length === 0 && <EmptyState msg="No upcoming matches for this filter."/>}
              {upGrouped.map(({ dateKey, label, games }) => (
                <div key={dateKey} style={{marginBottom:24}}>
                  {/* Date header */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:10, marginBottom:12
                  }}>
                    <div style={{
                      fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13,
                      letterSpacing:"0.1em", color: dateKey === todayKey ? COLORS.green : COLORS.text1,
                      background: dateKey === todayKey ? COLORS.greenFaint : COLORS.bg2,
                      border:`1px solid ${dateKey === todayKey ? COLORS.greenBorder : COLORS.border}`,
                      borderRadius:6, padding:"4px 12px",
                    }}>
                      {label}
                    </div>
                    <div style={{flex:1, height:1, background:COLORS.border}}/>
                    <div style={{fontSize:10, color:COLORS.text2, fontWeight:600}}>{games.length} match{games.length!==1?"es":""}</div>
                  </div>
                  <div className="cards-grid" style={{display:"grid", gap:12}}>
                    {games.map((g, i) => (
                      <MatchCard key={g.id} game={g} inSlip={inSlip(g.id)}
                        expanded={expanded===g.id}
                        onExpand={() => setExpanded(expanded===g.id ? null : g.id)}
                        onAdd={pick => addToSlip(g, pick)}
                        delay={i*0.04} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ─── RESULTS PAGE — grouped by date ──────── */}
          {page === "results" && (
            <>
              {(() => {
                const all = GAMES.filter(g => g.st==="result" && (cat==="All" || g.cat===cat));
                const wins = all.filter(g => didWin(g, g.pick)).length;
                const losses = all.length - wins;
                const rate = all.length ? Math.round(wins/all.length*100) : 0;
                return (
                  <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14}}>
                    {[
                      {label:"CORRECT", val:wins, col:COLORS.green, bg:COLORS.greenFaint, bc:COLORS.greenBorder},
                      {label:"WRONG",   val:losses, col:COLORS.red, bg:COLORS.redFaint, bc:"rgba(255,82,82,0.22)"},
                      {label:"WIN RATE", val:`${rate}%`, col:COLORS.gold, bg:COLORS.goldFaint, bc:COLORS.goldBorder},
                    ].map(s => (
                      <div key={s.label} style={{background:s.bg, border:`1px solid ${s.bc}`, borderRadius:11, padding:"11px 14px", textAlign:"center"}}>
                        <div style={{fontSize:9, color:s.col, letterSpacing:"0.1em", fontWeight:700, marginBottom:4}}>{s.label}</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, color:s.col}}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div style={{fontSize:11, color:COLORS.text2, marginBottom:12}}>{resGames.length} result{resGames.length!==1?"s":""}</div>
              {resGrouped.length === 0 && <EmptyState msg="No results for this filter."/>}
              {resGrouped.slice().reverse().map(({ dateKey, label, games }) => (
                <div key={dateKey} style={{marginBottom:20}}>
                  <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                    <div style={{
                      fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13,
                      letterSpacing:"0.1em", color:COLORS.text1,
                      background:COLORS.bg2, border:`1px solid ${COLORS.border}`,
                      borderRadius:6, padding:"4px 12px",
                    }}>
                      {label}
                    </div>
                    <div style={{flex:1, height:1, background:COLORS.border}}/>
                    <div style={{fontSize:10, color:COLORS.text2, fontWeight:600}}>{games.length} result{games.length!==1?"s":""}</div>
                  </div>
                  <div className="cards-grid" style={{display:"grid", gap:10}}>
                    {games.map((g, i) => <ResultCard key={g.id} game={g} delay={i*0.04}/>)}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ─── MY BETS PAGE ──────────────────────────── */}
          {page === "mybets" && (
            <>
              {/* P&L Banner */}
              {(() => {
                const pnl = +(totalReturns - totalWagered).toFixed(2);
                const isPos = pnl >= 0;
                const roi = totalWagered > 0 ? ((pnl / totalWagered) * 100).toFixed(1) : "0.0";
                return (
                  <div style={{
                    background: isPos
                      ? "linear-gradient(135deg,rgba(0,230,118,0.10),rgba(0,200,83,0.04))"
                      : "linear-gradient(135deg,rgba(255,82,82,0.10),rgba(200,0,0,0.04))",
                    border:`1px solid ${isPos ? COLORS.greenBorder : "rgba(255,82,82,0.28)"}`,
                    borderRadius:16, padding:"18px 20px", marginBottom:14
                  }}>
                    <div style={{fontSize:9, color:isPos?COLORS.green:COLORS.red, letterSpacing:"0.14em", fontWeight:800, marginBottom:6}}>NET PROFIT / LOSS</div>
                    <div style={{display:"flex", alignItems:"flex-end", gap:10, marginBottom:14}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:38, color:isPos?COLORS.green:COLORS.red, lineHeight:1, letterSpacing:"-0.01em"}}>
                        {isPos ? "+" : ""}€{Math.abs(pnl).toFixed(2)}
                      </div>
                      <div style={{fontSize:12, color:isPos?COLORS.green:COLORS.red, fontWeight:700, paddingBottom:4, opacity:0.75}}>
                        ROI {isPos?"+":""}{roi}%
                      </div>
                    </div>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8}}>
                      {[
                        {label:"BETS",    val:history.length,             col:COLORS.text1},
                        {label:"WON",     val:wonCount,                   col:COLORS.green},
                        {label:"LOST",    val:settledCount-wonCount,      col:COLORS.red},
                        {label:"WIN RATE",val:winRate!==null?`${winRate}%`:"—", col:COLORS.gold},
                      ].map(s => (
                        <div key={s.label} style={{background:"rgba(0,0,0,0.25)", borderRadius:9, padding:"8px 10px", textAlign:"center"}}>
                          <div style={{fontSize:8, color:COLORS.text2, letterSpacing:"0.1em", fontWeight:700, marginBottom:3}}>{s.label}</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, color:s.col}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18}}>
                {[
                  {label:"TOTAL WAGERED", val:`€${totalWagered.toFixed(2)}`, col:COLORS.text0, sub:"All-time staked"},
                  {label:"TOTAL RETURNS", val:`€${totalReturns.toFixed(2)}`,  col:totalReturns>=totalWagered?COLORS.green:COLORS.red, sub:"Winnings received"},
                ].map(s => (
                  <div key={s.label} style={{background:COLORS.bg1, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"13px 15px"}}>
                    <div style={{fontSize:8, color:COLORS.text2, letterSpacing:"0.12em", fontWeight:700, marginBottom:5}}>{s.label}</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:s.col, lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:10, color:COLORS.text2, marginTop:4}}>{s.sub}</div>
                  </div>
                ))}
              </div>
              {settled.length > 0 && (
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
                  <div style={{fontSize:9, color:COLORS.text2, letterSpacing:"0.14em", fontWeight:700}}>BET HISTORY</div>
                  <div style={{flex:1, height:1, background:COLORS.border}}/>
                  <div style={{fontSize:9, color:COLORS.text2}}>{settled.length} ticket{settled.length!==1?"s":""}</div>
                </div>
              )}
              {settled.length === 0
                ? <EmptyState msg="No bets yet. Browse matches and build your slip!"/>
                : settled.map(e => <HistoryCard key={e.id} entry={e} open={histExp===e.id} onToggle={() => setHistExp(histExp===e.id ? null : e.id)}/>)
              }
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════ BOTTOM NAV ══════════════════════════ */}
      <nav className="bottom-nav" style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:70,
        background:"rgba(7,8,16,0.98)", backdropFilter:"blur(20px)",
        borderTop:`1px solid ${COLORS.border}`, height:60, display:"none"
      }}>
        {[{id:"home",icon:"🏠",label:"Home"},{id:"matches",icon:"⚽",label:"Matches"},{id:"results",icon:"📊",label:"Results"},{id:"mybets",icon:"🎫",label:"My Bets",badge:history.length}].map(n => (
          <button key={n.id} className="btn" onClick={() => setPage(n.id)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:2, position:"relative", color:page===n.id?COLORS.green:COLORS.text2}}>
            <span style={{fontSize:19, lineHeight:1}}>{n.icon}</span>
            <span style={{fontSize:9, fontWeight:page===n.id?800:500, letterSpacing:"0.05em"}}>{n.label.toUpperCase()}</span>
            {n.badge>0 && <span style={{position:"absolute", top:4, right:"calc(50% - 16px)", background:COLORS.red, color:"#fff", borderRadius:999, fontSize:9, fontWeight:800, minWidth:15, height:15, lineHeight:"15px", textAlign:"center", padding:"0 3px"}}>{n.badge}</span>}
            {page===n.id && <span style={{position:"absolute", bottom:0, left:"20%", right:"20%", height:2.5, background:COLORS.green, borderRadius:2}}/>}
          </button>
        ))}
      </nav>

      {/* ═══════════════════ SLIP PANEL ══════════════════════════ */}
      {slipOpen && <div onClick={() => setSlipOpen(false)} style={{position:"fixed", inset:0, zIndex:148, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(5px)"}}/>}
      <div className="slip-panel" style={{
        position:"fixed", right:0, top:0, bottom:0, zIndex:149,
        width:340, background:COLORS.bg1, borderLeft:`1px solid ${COLORS.border}`,
        display:"flex", flexDirection:"column",
        transform:slipOpen?"translateX(0)":"translateX(100%)",
        transition:"transform .3s cubic-bezier(0.4,0,0.2,1)"
      }}>
        <div style={{padding:"0 16px", height:56, borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, letterSpacing:"0.04em"}}>BET SLIP</span>
            {slip.length>0 && <span style={{background:COLORS.green, color:COLORS.bg0, borderRadius:999, padding:"0 9px", fontSize:10, fontWeight:800, lineHeight:"18px"}}>{slip.length}</span>}
          </div>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            {slip.length>0 && <button onClick={() => setSlip([])} style={{fontSize:11, color:COLORS.red, fontWeight:800, letterSpacing:"0.06em"}}>CLEAR</button>}
            <button onClick={() => setSlipOpen(false)} style={{fontSize:24, color:COLORS.text2, lineHeight:1}}>×</button>
          </div>
        </div>

        <div style={{flex:1, overflowY:"auto", padding:"10px 14px"}}>
          {slip.length === 0 ? (
            <div style={{textAlign:"center", padding:"50px 20px", color:COLORS.text2}}>
              <div style={{fontSize:44, marginBottom:14, opacity:.15}}>🎫</div>
              <p style={{fontSize:13, lineHeight:1.8}}>Tap any odds button on a match to add selections</p>
            </div>
          ) : slip.map(b => {
            const ret = ((parseFloat(b.stake)||0) * b.odds).toFixed(2);
            return (
              <div key={b.id} className="fadeUp" style={{background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8}}>
                  <div style={{flex:1, paddingRight:8}}>
                    <div style={{fontSize:10, color:COLORS.text2, marginBottom:2}}>{b.flag} {b.league}</div>
                    <div style={{fontWeight:700, fontSize:13, lineHeight:1.3}}>{b.home} vs {b.away}</div>
                    <div style={{display:"flex", alignItems:"center", gap:6, marginTop:5}}>
                      <span style={{fontSize:11, color:pickColor(b.pick), fontWeight:700}}>{pickName(b.pick)}</span>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:COLORS.gold, fontWeight:800, background:COLORS.goldFaint, border:`1px solid ${COLORS.goldBorder}`, borderRadius:4, padding:"1px 7px"}}>{b.odds.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSlip(b.id)} style={{color:COLORS.text2, fontSize:20, lineHeight:1, flexShrink:0}}>×</button>
                </div>
                <div style={{fontSize:9, color:COLORS.text2, marginBottom:5, fontWeight:700, letterSpacing:"0.08em"}}>STAKE (€)</div>
                <div style={{display:"flex", gap:6, marginBottom:6}}>
                  <input type="number" min=".5" step=".5" value={b.stake} onChange={e => updateStake(b.id, e.target.value)}
                    style={{flex:1, background:COLORS.bg0, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:"8px 10px", color:COLORS.text0, fontSize:14, outline:"none"}}/>
                  <div style={{background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:COLORS.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, flexShrink:0}}>€{ret}</div>
                </div>
                <div style={{display:"flex", gap:4}}>
                  {[5, 10, 25, 50].map(a => (
                    <button key={a} className="btn" onClick={() => updateStake(b.id, String(a))} style={{flex:1, padding:"5px 0", borderRadius:7, fontSize:11, fontWeight:700,
                      background:b.stake===String(a)?COLORS.greenFaint:COLORS.bg3, border:`1px solid ${b.stake===String(a)?COLORS.greenBorder:COLORS.border}`,
                      color:b.stake===String(a)?COLORS.green:COLORS.text2}}>€{a}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {slip.length > 0 && (
          <div style={{borderTop:`1px solid ${COLORS.border}`, padding:"14px 16px", flexShrink:0}}>
            <div style={{background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:11, padding:"12px 14px", marginBottom:12}}>
              {slip.length > 1 && (
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{fontSize:12, color:COLORS.text1}}>Accumulator odds</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, color:COLORS.gold, fontWeight:800}}>{accumOdds.toFixed(2)}×</span>
                </div>
              )}
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                <span style={{fontSize:12, color:COLORS.text1}}>Total stake</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13}}>€{totalStake.toFixed(2)}</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                <span style={{fontSize:12, color:COLORS.text1}}>Balance after</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:totalStake>balance?COLORS.red:COLORS.text1}}>€{(balance-totalStake).toFixed(2)}</span>
              </div>
              <div style={{borderTop:`1px solid ${COLORS.border}`, paddingTop:8, display:"flex", justifyContent:"space-between"}}>
                <span style={{fontSize:14, fontWeight:700}}>Potential return</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:900, color:COLORS.green}}>€{potReturn.toFixed(2)}</span>
              </div>
            </div>
            {totalStake > balance && <div style={{textAlign:"center", color:COLORS.red, fontSize:11, fontWeight:700, marginBottom:8}}>⚠ Stake exceeds available balance</div>}
            <button className="btn" onClick={placeBets} disabled={placing || totalStake>balance || totalStake<=0}
              style={{width:"100%", padding:"14px", borderRadius:11,
                background:placing||totalStake>balance?"#1a2a18":`linear-gradient(90deg,${COLORS.green},${COLORS.greenD})`,
                color:placing||totalStake>balance?COLORS.text2:COLORS.bg0,
                fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, letterSpacing:"0.06em",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
              {placing ? <><span className="spin">◌</span> Placing bets...</> : `PLACE ${slip.length} BET${slip.length>1?"S":""}`}
            </button>
            <p style={{fontSize:10, color:COLORS.text2, textAlign:"center", marginTop:8, lineHeight:1.6}}>18+ · Bet Responsibly · AI predictions only</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── COMPACT ROW ─────────────────────────────────────────────── */
function CompactRow({game, inSlip, onAdd}) {
  const cm = confMeta(game.conf);
  const ai = oddsFor(game, game.pick);
  const { status, minutesElapsed } = getGameStatus(game);
  const isLive     = status === "live";
  const isFinished = status === "finished";
  const canAdd     = status === "upcoming";

  const score = game.score; // may be undefined for upcoming/live

  return (
    <div className="card-hover fadeUp" style={{
      background: isLive ? "rgba(0,230,118,0.04)" : COLORS.bg2,
      border:`1px solid ${isLive ? COLORS.greenBorder : inSlip ? COLORS.greenBorder : COLORS.border}`,
      borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10,
    }}>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:10, color:COLORS.text2, marginBottom:4, display:"flex", alignItems:"center", gap:5, flexWrap:"wrap"}}>
          <span>{game.flag}</span>
          <span>{game.league}</span>
          <span>·</span>
          {isLive ? (
            <span className="pulse" style={{color:COLORS.green, fontWeight:800, letterSpacing:"0.08em"}}>
              🟢 LIVE {minutesElapsed !== null ? `${minutesElapsed}'` : ""}
            </span>
          ) : isFinished ? (
            <span style={{color:COLORS.text2}}>FT</span>
          ) : (
            <span>{game.display}</span>
          )}
        </div>
        <div style={{fontWeight:700, fontSize:13}}>
          {game.home} <span style={{color:COLORS.text2, fontWeight:400, fontSize:11}}>vs</span> {game.away}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6, marginTop:4, flexWrap:"wrap"}}>
          {(isLive || isFinished) && score ? (
            <span style={{
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16,
              color: isLive ? COLORS.green : COLORS.text0,
              background: isLive ? COLORS.greenFaint : COLORS.bg3,
              border:`1px solid ${isLive ? COLORS.greenBorder : COLORS.border}`,
              borderRadius:6, padding:"1px 9px", letterSpacing:"0.04em",
            }}>{score.h} – {score.a}</span>
          ) : (
            <>
              <span style={{fontSize:10, color:pickColor(game.pick), fontWeight:700}}>{pickName(game.pick)}</span>
              <span style={{fontSize:9, color:cm.c, background:cm.bg, border:`1px solid ${cm.bc}`, borderRadius:4, padding:"1px 6px", fontWeight:700}}>
                {cm.label} {game.conf}%
              </span>
            </>
          )}
        </div>
      </div>

      {canAdd ? (
        <button className="btn" onClick={() => onAdd(game.pick)}
          style={{display:"flex", alignItems:"center", gap:5, padding:"8px 12px", borderRadius:9, flexShrink:0,
            background:inSlip?COLORS.greenFaint:COLORS.bg3, border:`1px solid ${inSlip?COLORS.greenBorder:COLORS.border}`,
            color:inSlip?COLORS.green:COLORS.text1, fontSize:11, fontWeight:700}}>
          {inSlip ? "✓ ADDED" : `+ ${ai.toFixed(2)}`}
        </button>
      ) : (
        <div style={{
          padding:"6px 12px", borderRadius:9, flexShrink:0,
          background: isLive ? COLORS.greenFaint : COLORS.bg3,
          border:`1px solid ${isLive ? COLORS.greenBorder : COLORS.border}`,
          fontSize:9, fontWeight:800, letterSpacing:"0.07em",
          color: isLive ? COLORS.green : COLORS.text2,
        }}>
          {isLive ? "🟢 IN PLAY" : "FT"}
        </div>
      )}
    </div>
  );
}

/* ── FULL MATCH CARD ─────────────────────────────────────────── */
function MatchCard({game, inSlip, expanded, onExpand, onAdd, delay=0}) {
  const cm = confMeta(game.conf);
  const { status, minutesElapsed } = getGameStatus(game);
  const isLive     = status === "live";
  const isFinished = status === "finished";
  const canAdd     = status === "upcoming";

  const score      = game.score; // defined for result games; undefined for upcoming/live
  const cardBorder = isLive ? COLORS.greenBorder
    : inSlip ? COLORS.greenBorder
    : COLORS.border;
  const cardBg     = isLive ? "rgba(0,230,118,0.03)" : COLORS.bg1;

  return (
    <div className="card-hover fadeUp" style={{
      background:cardBg,
      border:`1px solid ${cardBorder}`,
      borderRadius:15, overflow:"hidden",
      animationDelay:`${delay}s`, animationFillMode:"both",
      boxShadow: isLive
        ? "0 0 0 1px rgba(0,230,118,0.12), 0 0 20px rgba(0,230,118,0.04)"
        : inSlip ? "0 0 0 1px rgba(0,230,118,0.1)" : "none",
    }}>
      <div style={{padding:"14px 16px 0"}}>
        {/* ── Header row ── */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
          <div style={{display:"flex", alignItems:"center", gap:6}}>
            <span style={{fontSize:14}}>{game.flag}</span>
            <div>
              <div style={{fontSize:10, color:COLORS.text1, fontWeight:600}}>{game.league}</div>
              <div style={{fontSize:9, color:COLORS.text2}}>{game.round}</div>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:5}}>
            {isLive && (
              <span className="pulse" style={{
                fontSize:9, color:COLORS.green,
                background:COLORS.greenFaint, border:`1px solid ${COLORS.greenBorder}`,
                borderRadius:4, padding:"2px 8px", fontWeight:800, letterSpacing:"0.07em",
              }}>🟢 LIVE {minutesElapsed !== null ? `${minutesElapsed}'` : ""}</span>
            )}
            {isFinished && (
              <span style={{
                fontSize:9, color:COLORS.text1,
                background:COLORS.bg2, border:`1px solid ${COLORS.border}`,
                borderRadius:4, padding:"2px 8px", fontWeight:800, letterSpacing:"0.07em",
              }}>FT</span>
            )}
            {!isLive && !isFinished && (
              <span style={{
                fontSize:9, color:COLORS.text2, fontFamily:"monospace",
                background:COLORS.bg2, border:`1px solid ${COLORS.border}`,
                borderRadius:4, padding:"2px 8px",
              }}>{game.display}</span>
            )}
            <span style={{fontSize:9, color:cm.c, background:cm.bg, border:`1px solid ${cm.bc}`, borderRadius:5, padding:"2px 7px", fontWeight:800}}>
              {cm.label} {game.conf}%
            </span>
          </div>
        </div>

        {/* ── Score / VS display ── */}
        <div style={{marginBottom:10}}>
          {(isLive || isFinished) && score ? (
            /* Live or finished: show actual score */
            <div style={{
              display:"grid", gridTemplateColumns:"1fr auto 1fr",
              gap:6, alignItems:"center",
            }}>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:800, fontSize:14, lineHeight:1.2}}>{game.home}</div>
                <div style={{fontSize:9, color:COLORS.text2, marginTop:2, letterSpacing:"0.06em"}}>HOME</div>
              </div>
              <div style={{
                textAlign:"center", minWidth:70,
                background: isLive ? COLORS.greenFaint : COLORS.bg2,
                border:`1px solid ${isLive ? COLORS.greenBorder : COLORS.border}`,
                borderRadius:10, padding:"8px 10px",
              }}>
                <div style={{
                  fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24,
                  color: isLive ? COLORS.green : COLORS.text0,
                  letterSpacing:"0.04em", lineHeight:1,
                }}>{score.h} – {score.a}</div>
                <div style={{fontSize:8, color:isLive ? COLORS.green : COLORS.text2, fontWeight:700, letterSpacing:"0.1em", marginTop:3}}>
                  {isLive ? `${minutesElapsed}'` : "FT"}
                </div>
              </div>
              <div>
                <div style={{fontWeight:600, fontSize:14, lineHeight:1.2, color:COLORS.text1}}>{game.away}</div>
                <div style={{fontSize:9, color:COLORS.text2, marginTop:2, letterSpacing:"0.06em"}}>AWAY</div>
              </div>
            </div>
          ) : (
            /* Upcoming: show VS */
            <div style={{display:"grid", gridTemplateColumns:"1fr 44px 1fr", gap:6, alignItems:"center"}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:800, fontSize:14, lineHeight:1.2}}>{game.home}</div>
                <div style={{fontSize:9, color:COLORS.text2, marginTop:2, letterSpacing:"0.06em"}}>HOME</div>
              </div>
              <div style={{textAlign:"center", background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:9, padding:"7px 0"}}>
                <div style={{fontSize:10, color:COLORS.text2, fontWeight:700}}>VS</div>
              </div>
              <div>
                <div style={{fontWeight:600, fontSize:14, lineHeight:1.2, color:COLORS.text1}}>{game.away}</div>
                <div style={{fontSize:9, color:COLORS.text2, marginTop:2, letterSpacing:"0.06em"}}>AWAY</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Win probability bar (upcoming only) ── */}
        {canAdd && game.prob && (
          <div style={{marginBottom:10}}>
            <div style={{height:5, borderRadius:99, display:"flex", overflow:"hidden", gap:1.5}}>
              <div style={{flex:game.prob.h, background:COLORS.blue, borderRadius:"99px 0 0 99px"}}/>
              <div style={{flex:game.prob.d, background:COLORS.gold}}/>
              <div style={{flex:game.prob.a, background:COLORS.purple, borderRadius:"0 99px 99px 0"}}/>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:3, fontSize:9, fontWeight:700}}>
              <span style={{color:COLORS.blue}}>{game.prob.h}%</span>
              <span style={{color:COLORS.gold}}>Draw {game.prob.d}%</span>
              <span style={{color:COLORS.purple}}>{game.prob.a}%</span>
            </div>
          </div>
        )}

        {/* ── Odds buttons (upcoming only; disabled for live/finished) ── */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10}}>
          {[
            {label:"1", pick:"home_win", val:game.odds.h, col:COLORS.blue},
            {label:"X", pick:"draw",     val:game.odds.d, col:COLORS.gold},
            {label:"2", pick:"away_win", val:game.odds.a, col:COLORS.purple},
          ].map(o => {
            const isAI = game.pick === o.pick;
            if (!canAdd) {
              /* Greyed-out odds display for live/finished */
              return (
                <div key={o.label} style={{
                  padding:"9px 5px", borderRadius:10, textAlign:"center",
                  border:`1px solid ${COLORS.border}`,
                  background:COLORS.bg2, opacity:0.45,
                }}>
                  <div style={{fontSize:9, color:COLORS.text2, fontWeight:800, letterSpacing:"0.06em", marginBottom:2}}>{o.label}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:17, color:COLORS.text2}}>{o.val.toFixed(2)}</div>
                </div>
              );
            }
            return (
              <button key={o.label} className="btn odds-hover" onClick={() => onAdd(o.pick)}
                style={{padding:"9px 5px", borderRadius:10, textAlign:"center",
                  border:`1px solid ${isAI?`${o.col}55`:COLORS.border}`,
                  background:isAI?`${o.col}0f`:COLORS.bg2, transition:"all .15s"}}>
                <div style={{fontSize:9, color:isAI?o.col:COLORS.text2, fontWeight:800, letterSpacing:"0.06em", marginBottom:2}}>{o.label}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:17, color:isAI?o.col:COLORS.text0}}>{o.val.toFixed(2)}</div>
                {isAI && <div style={{fontSize:8, color:o.col, fontWeight:800, marginTop:2}}>AI PICK ✓</div>}
              </button>
            );
          })}
        </div>

        {/* ── AI pick strip ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: canAdd ? COLORS.greenFaint : COLORS.bg2,
          border:`1px solid ${canAdd ? COLORS.greenBorder : COLORS.border}`,
          borderRadius:9, padding:"8px 12px", marginBottom:10,
          opacity: canAdd ? 1 : 0.65,
        }}>
          <div style={{display:"flex", alignItems:"center", gap:7}}>
            <span style={{width:7, height:7, borderRadius:"50%", background:pickColor(game.pick), flexShrink:0}}/>
            <span style={{fontSize:12, fontWeight:700, color:canAdd ? COLORS.green : COLORS.text1}}>AI: {pickName(game.pick)}</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:6}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, color:COLORS.gold, fontWeight:800, background:COLORS.goldFaint, border:`1px solid ${COLORS.goldBorder}`, borderRadius:5, padding:"1px 8px"}}>
              {oddsFor(game, game.pick).toFixed(2)}
            </span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:cm.c, fontWeight:800}}>{game.conf}%</span>
          </div>
        </div>

        {/* ── Confidence bar ── */}
        <div style={{marginBottom:10}}>
          <div style={{height:3, background:COLORS.bg3, borderRadius:99, overflow:"hidden"}}>
            <div style={{width:`${game.conf}%`, height:"100%", background:cm.c, borderRadius:99, transition:"width .5s ease"}}/>
          </div>
        </div>
      </div>

      {/* ── Footer action row ── */}
      <div style={{display:"flex", borderTop:`1px solid ${COLORS.border}`}}>
        {canAdd ? (
          <button className="btn" onClick={() => onAdd(game.pick)}
            style={{flex:1, padding:"11px 14px", background:inSlip?COLORS.greenFaint:"transparent",
              borderRight:`1px solid ${COLORS.border}`, fontSize:11, fontWeight:800,
              letterSpacing:"0.07em", color:inSlip?COLORS.green:COLORS.text2}}>
            {inSlip ? "✓ IN SLIP" : "+ ADD TO SLIP"}
          </button>
        ) : (
          <div style={{flex:1, padding:"11px 14px", borderRight:`1px solid ${COLORS.border}`,
            fontSize:11, fontWeight:800, letterSpacing:"0.07em", textAlign:"center",
            color: isLive ? COLORS.green : COLORS.text2,
            background: isLive ? COLORS.greenFaint : "transparent",
          }}>
            {isLive ? "🟢 IN PLAY — BETTING CLOSED" : "⏹ FULL TIME — BETTING CLOSED"}
          </div>
        )}
        <button className="btn" onClick={onExpand}
          style={{padding:"11px 14px", fontSize:10, color:COLORS.text2, fontWeight:700, letterSpacing:"0.06em", display:"flex", alignItems:"center", gap:4}}>
          {expanded ? "▲" : "▼"} ANALYSIS
        </button>
      </div>

      {expanded && (
        <div style={{padding:"12px 16px", borderTop:`1px solid ${COLORS.border}`, background:COLORS.bg0}}>
          {game.tips?.map((t, i) => (
            <div key={i} style={{display:"flex", gap:7, fontSize:11, color:COLORS.text1, marginBottom:7, lineHeight:1.65}}>
              <span style={{color:COLORS.green, flexShrink:0, marginTop:1}}>›</span><span>{t}</span>
            </div>
          ))}
          {game.h2h && (
            <div style={{marginTop:8, padding:"8px 10px", background:COLORS.bg2, borderRadius:8, fontSize:11, color:COLORS.text2}}>
              <span style={{color:COLORS.gold, fontWeight:700}}>H2H: </span>{game.h2h}
            </div>
          )}
          {game.form && (
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10}}>
              {[{label:`${game.home} Form`, v:game.form.h}, {label:`${game.away} Form`, v:game.form.a}].map(f => (
                <div key={f.label} style={{background:COLORS.bg2, borderRadius:9, padding:"9px 10px"}}>
                  <div style={{fontSize:9, color:COLORS.text2, marginBottom:5, fontWeight:700, letterSpacing:"0.06em"}}>{f.label.toUpperCase()}</div>
                  <div style={{display:"flex", gap:3}}>
                    {f.v.split("").map((c, i) => {
                      const col = c==="W"?COLORS.green : c==="D"?COLORS.gold : COLORS.red;
                      return <span key={i} style={{width:19, height:19, borderRadius:5, background:`${col}18`, color:col, fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center"}}>{c}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── RESULT CARD ─────────────────────────────────────────────── */
function ResultCard({game, delay=0}) {
  const hW = game.score.h > game.score.a;
  const aW = game.score.a > game.score.h;
  const dr = game.score.h === game.score.a;
  const correct = didWin(game, game.pick);
  return (
    <div className="card-hover fadeUp" style={{background:COLORS.bg1, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"14px 16px", animationDelay:`${delay}s`, animationFillMode:"both"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <span style={{fontSize:10, color:COLORS.text2, display:"flex", alignItems:"center", gap:5}}>
          <span>{game.flag}</span><span>{game.league}</span><span>·</span><span>{game.round}</span>
        </span>
        <span style={{fontSize:10, color:COLORS.text2, fontFamily:"monospace"}}>{game.display}</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:10, alignItems:"center", marginBottom:10}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:hW?800:500, fontSize:14, color:hW?COLORS.text0:COLORS.text2}}>{game.home}</div>
        </div>
        <div style={{textAlign:"center", background:dr?COLORS.goldFaint:COLORS.bg2, border:`1px solid ${dr?COLORS.goldBorder:COLORS.border}`, borderRadius:10, padding:"7px 14px", minWidth:68}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:dr?COLORS.gold:COLORS.text0}}>{game.score.h}–{game.score.a}</div>
          <div style={{fontSize:8, color:COLORS.text2, letterSpacing:"0.1em", fontWeight:700}}>FT</div>
        </div>
        <div>
          <div style={{fontWeight:aW?800:500, fontSize:14, color:aW?COLORS.text0:COLORS.text2}}>{game.away}</div>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:8,
        background:correct?COLORS.greenFaint:COLORS.redFaint, border:`1px solid ${correct?COLORS.greenBorder:"rgba(255,82,82,0.15)"}`}}>
        <span style={{fontSize:10, color:COLORS.text2}}>
          AI: <span style={{color:pickColor(game.pick), fontWeight:700}}>{pickName(game.pick)}</span>
          <span style={{color:COLORS.text2}}> @ {oddsFor(game, game.pick).toFixed(2)}</span>
        </span>
        <span style={{fontSize:11, fontWeight:800, color:correct?COLORS.green:COLORS.red}}>{correct ? "✓ Correct" : "✗ Wrong"}</span>
      </div>
    </div>
  );
}

/* ── HISTORY CARD ────────────────────────────────────────────── */
function HistoryCard({entry, open, onToggle}) {
  const sc = entry.status==="won" ? COLORS.green : entry.status==="lost" ? COLORS.red : COLORS.gold;
  const bcol = entry.status==="won" ? COLORS.greenBorder : entry.status==="lost" ? "rgba(255,82,82,0.22)" : COLORS.border;
  const pnl = entry.status==="won" ? +(entry.potReturn - entry.totalStake).toFixed(2) : entry.status==="lost" ? -entry.totalStake : null;
  const ref = `#${String(entry.id).slice(-6).toUpperCase()}`;
  const placedAt = new Date(entry.placedAt);
  const dateStr = placedAt.toLocaleDateString("en-GB", {day:"numeric", month:"short", year:"numeric"});
  const timeStr = placedAt.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"});
  const isAcca = entry.bets.length > 1;

  return (
    <div className="fadeUp" style={{
      background:COLORS.bg1, border:`1px solid ${bcol}`,
      borderRadius:15, overflow:"hidden", marginBottom:10,
      boxShadow: entry.status==="won" ? "0 0 0 1px rgba(0,230,118,0.06)" : "none"
    }}>
      {/* ── Header bar ── */}
      <div onClick={onToggle} style={{padding:"14px 16px", cursor:"pointer"}}>
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10}}>
          {/* Left: ref + meta */}
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:5}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, color:COLORS.text2, letterSpacing:"0.08em"}}>{ref}</span>
              {isAcca && (
                <span style={{fontSize:9, fontWeight:800, letterSpacing:"0.07em",
                  color:COLORS.blue, background:COLORS.blueFaint,
                  border:"1px solid rgba(68,138,255,0.28)", borderRadius:4, padding:"1px 7px"}}>ACCA</span>
              )}
              <span style={{fontSize:9, color:COLORS.text2}}>{dateStr} · {timeStr}</span>
            </div>
            <div style={{fontWeight:800, fontSize:14, color:COLORS.text0, lineHeight:1.3}}>
              {entry.bets.length === 1
                ? <>{entry.bets[0].home} <span style={{color:COLORS.text2, fontWeight:400, fontSize:12}}>vs</span> {entry.bets[0].away}</>
                : <>{entry.bets.length}-Fold Accumulator</>
              }
            </div>
            {entry.bets.length === 1 && (
              <div style={{fontSize:11, color:pickColor(entry.bets[0].pick), fontWeight:700, marginTop:3}}>
                {pickName(entry.bets[0].pick)}
              </div>
            )}
          </div>
          {/* Right: status pill */}
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0}}>
            <div style={{
              padding:"4px 12px", borderRadius:20, fontSize:10, fontWeight:900,
              letterSpacing:"0.08em", background:`${sc}18`, color:sc, border:`1px solid ${sc}40`
            }}>
              {entry.status === "pending" ? "⏳ PENDING" : entry.status === "won" ? "✓ WON" : "✗ LOST"}
            </div>
          </div>
        </div>

        {/* ── Financial summary row ── */}
        <div style={{
          display:"grid", gridTemplateColumns: isAcca ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr",
          gap:0, marginTop:12, background:COLORS.bg0, borderRadius:10,
          border:`1px solid ${COLORS.border}`, overflow:"hidden"
        }}>
          {[
            {label:"STAKE", val:`€${entry.totalStake.toFixed(2)}`, col:COLORS.text1},
            ...(isAcca ? [{label:"ODDS", val:`${entry.accumOdds}×`, col:COLORS.gold}] : []),
            {label:"POTENTIAL", val:`€${entry.potReturn.toFixed(2)}`, col:COLORS.text0},
            {label:"P&L", val: pnl !== null ? `${pnl >= 0 ? "+" : ""}€${Math.abs(pnl).toFixed(2)}` : "—",
             col: pnl === null ? COLORS.gold : pnl >= 0 ? COLORS.green : COLORS.red},
          ].map((f, fi, arr) => (
            <div key={f.label} style={{
              padding:"10px 12px", textAlign:"center",
              borderRight: fi < arr.length-1 ? `1px solid ${COLORS.border}` : "none"
            }}>
              <div style={{fontSize:8, color:COLORS.text2, letterSpacing:"0.1em", fontWeight:700, marginBottom:4}}>{f.label}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, color:f.col}}>{f.val}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex", justifyContent:"flex-end", marginTop:8}}>
          <span style={{fontSize:10, color:COLORS.text2, fontWeight:600}}>
            {open ? "▲ Hide selections" : `▼ ${entry.bets.length} selection${entry.bets.length!==1?"s":""}`}
          </span>
        </div>
      </div>

      {/* ── Expanded selections ── */}
      {open && (
        <div style={{borderTop:`1px solid ${COLORS.border}`, background:COLORS.bg0}}>
          {entry.bets.map((b, i) => {
            const rc = b.result==="won" ? COLORS.green : b.result==="lost" ? COLORS.red : COLORS.gold;
            const isLast = i === entry.bets.length - 1;
            return (
              <div key={i} style={{
                display:"grid", gridTemplateColumns:"24px 1fr auto",
                gap:12, padding:"12px 16px",
                borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
                alignItems:"center"
              }}>
                {/* Status dot / icon */}
                <div style={{
                  width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background: b.result==="pending" ? "rgba(255,215,64,0.12)" : b.result==="won" ? COLORS.greenFaint : COLORS.redFaint,
                  border:`1px solid ${b.result==="pending" ? COLORS.goldBorder : b.result==="won" ? COLORS.greenBorder : "rgba(255,82,82,0.3)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, color:rc, fontWeight:900
                }}>
                  {b.result==="pending" ? <span style={{fontSize:10, animation:"pulse 1.8s ease infinite", display:"inline-block"}}>·</span>
                   : b.result==="won" ? "✓" : "✗"}
                </div>

                {/* Match info */}
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10, color:COLORS.text2, marginBottom:2, display:"flex", alignItems:"center", gap:5}}>
                    <span>{b.flag}</span><span>{b.league}</span>
                  </div>
                  <div style={{fontSize:13, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3}}>
                    {b.home} <span style={{color:COLORS.text2, fontWeight:400, fontSize:11}}>vs</span> {b.away}
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:6, marginTop:3}}>
                    <span style={{fontSize:11, color:pickColor(b.pick), fontWeight:700}}>{pickName(b.pick)}</span>
                    {b.score && (
                      <span style={{fontSize:10, color:COLORS.text2, fontFamily:"monospace", background:COLORS.bg2,
                        border:`1px solid ${COLORS.border}`, borderRadius:4, padding:"1px 7px"}}>
                        {b.score.h}–{b.score.a} FT
                      </span>
                    )}
                  </div>
                </div>

                {/* Odds */}
                <div style={{
                  fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:900,
                  color:COLORS.gold, background:COLORS.goldFaint,
                  border:`1px solid ${COLORS.goldBorder}`, borderRadius:7,
                  padding:"4px 10px", flexShrink:0, textAlign:"center"
                }}>
                  {b.odds.toFixed(2)}×
                </div>
              </div>
            );
          })}

          {/* Accumulator chain summary */}
          {isAcca && (
            <div style={{
              margin:"0 16px 14px", padding:"10px 14px",
              background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:10,
              display:"flex", justifyContent:"space-between", alignItems:"center"
            }}>
              <span style={{fontSize:11, color:COLORS.text2}}>
                Combined odds: <span style={{color:COLORS.gold, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", fontSize:14}}>{entry.accumOdds}×</span>
              </span>
              <span style={{fontSize:11, color:COLORS.text2}}>
                Stake: <span style={{color:COLORS.text0, fontWeight:700}}>€{entry.totalStake.toFixed(2)}</span>
              </span>
              <span style={{fontSize:11}}>
                Return: <span style={{color:sc, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", fontSize:14}}>€{entry.potReturn.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({msg}) {
  return (
    <div style={{textAlign:"center", padding:"70px 20px", gridColumn:"1/-1"}}>
      <div style={{fontSize:44, opacity:.08, marginBottom:14}}>⚽</div>
      <p style={{fontSize:13, color:COLORS.text2, lineHeight:1.8, maxWidth:300, margin:"0 auto"}}>{msg}</p>
    </div>
  );
}