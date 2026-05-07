//import React, { useState, useEffect } from 'react';

// --- הגדרות לכדורגל בלבד ---
const sportsConfig = {
  football: {
    label: 'כדורגל ⚽',
    statsList: [
      { key: 'G', label: 'שערים (G)' },
      { key: 'A', label: 'בישולים (A)' },
      { key: 'AP', label: 'מסירות (AP)' },
      { key: 'D', label: 'דריבלים (D)' },
      { key: 'T', label: 'איבודים (T) -' }
    ],
    weights: { G: 10, A: 7, AP: 0.08, D: 0.7, T: -0.5 },
    initialStats: { G: 0, A: 0, AP: 0, D: 0, T: 0 },
    tournaments: ['ilpremier2425', 'laliga2425', 'premierleague2425', 'bundesliga2425', 'worldcup2022'],
    // נוסחה מפורקת לרכיבים עבור תצוגה צבעונית
    formulaComponents: [
      { text: "(10×G) + (7×A) + (0.08×AP) + (0.7×D)", color: "text-emerald-400" },
      { text: " - ", color: "text-white/50" },
      { text: "(0.5×T)", color: "text-red-500" }
    ]
  }
};

// --- מאגרי נתונים מורחבים (כדורגל) ---
const worldCup2022Players = [
  { id: 'messi', name: "ליונל מסי (ארגנטינה)", games: 7, stats: { G: 7, A: 3, AP: 347, D: 15, T: 25 } },
  { id: 'mbappe', name: "קיליאן אמבפה (צרפת)", games: 7, stats: { G: 8, A: 2, AP: 156, D: 25, T: 18 } },
  { id: 'modric', name: "לוקה מודריץ' (קרואטיה)", games: 7, stats: { G: 0, A: 0, AP: 450, D: 5, T: 12 } }
];

const laLiga2425Players = [
  { id: 'll_raphinha', name: "ראפיניה (ברצלונה)", games: 35, stats: { G: 20, A: 15, AP: 1200, D: 80, T: 40 } },
  { id: 'll_vini', name: "ויניסיוס ג'וניור (ריאל מדריד)", games: 33, stats: { G: 22, A: 10, AP: 900, D: 120, T: 55 } },
  { id: 'll_lewa', name: "רוברט לבנדובסקי (ברצלונה)", games: 34, stats: { G: 25, A: 5, AP: 400, D: 15, T: 30 } },
  { id: 'll_bellingham', name: "ג'וד בלינגהאם (ריאל מדריד)", games: 30, stats: { G: 15, A: 10, AP: 1100, D: 45, T: 35 } }
];

const premierLeague2425Players = [
  { id: 'pl_haaland', name: "ארלינג הולאנד (מנצ'סטר סיטי)", games: 34, stats: { G: 35, A: 5, AP: 300, D: 10, T: 25 } },
  { id: 'pl_salah', name: "מוחמד סלאח (ליברפול)", games: 35, stats: { G: 22, A: 12, AP: 850, D: 60, T: 45 } },
  { id: 'pl_palmer', name: "קול פאלמר (צ'לסי)", games: 33, stats: { G: 20, A: 13, AP: 1050, D: 55, T: 40 } },
  { id: 'pl_saka', name: "בוקאיו סאקה (ארסנל)", games: 35, stats: { G: 16, A: 14, AP: 950, D: 70, T: 38 } }
];

const bundesliga2425Players = [
  { id: 'bl_kane', name: "הארי קיין (באיירן מינכן)", games: 34, stats: { G: 32, A: 10, AP: 650, D: 15, T: 28 } },
  { id: 'bl_wirtz', name: "פלוריאן וירץ (לברקוזן)", games: 32, stats: { G: 14, A: 16, AP: 1400, D: 90, T: 45 } },
  { id: 'bl_marmoush', name: "עומאר מרמוש (פרנקפורט)", games: 33, stats: { G: 18, A: 11, AP: 700, D: 85, T: 50 } }
];

const israeliLeague2425Players = [
  { id: 'il_dean', name: "דין דוד (מכבי חיפה)", games: 32, stats: { G: 22, A: 3, AP: 350, D: 20, T: 25 } },
  { id: 'il_zahavi', name: "ערן זהבי (מכבי תל אביב)", games: 28, stats: { G: 11, A: 4, AP: 400, D: 15, T: 20 } },
  { id: 'il_saba', name: "דיא סבע (מכבי חיפה)", games: 30, stats: { G: 14, A: 10, AP: 800, D: 60, T: 35 } },
  { id: 'il_peretz', name: "דור פרץ (מכבי תל אביב)", games: 31, stats: { G: 10, A: 8, AP: 1300, D: 25, T: 30 } }
];

const databases = {
  'ilpremier2425': { sport: 'football', name: "ליגת העל ישראל 24/25", players: israeliLeague2425Players, maxStats: { G: 35, A: 20, AP: 2500, D: 100, T: 80 } },
  'laliga2425': { sport: 'football', name: "ליגה ספרדית 24/25", players: laLiga2425Players, maxStats: { G: 45, A: 25, AP: 3000, D: 150, T: 100 } },
  'premierleague2425': { sport: 'football', name: "פרמייר ליג 24/25", players: premierLeague2425Players, maxStats: { G: 45, A: 25, AP: 3000, D: 150, T: 100 } },
  'bundesliga2425': { sport: 'football', name: "בונדסליגה 24/25", players: bundesliga2425Players, maxStats: { G: 45, A: 25, AP: 3000, D: 150, T: 100 } },
  'worldcup2022': { sport: 'football', name: "מונדיאל 2022", players: worldCup2022Players, maxStats: { G: 15, A: 15, AP: 600, D: 60, T: 60 } }
};

const generateGoalLocations = (numGoals) => {
  const locations = [];
  const maxVisualGoals = Math.min(numGoals, 60);
  for(let i = 0; i < maxVisualGoals; i++) {
    const x = 25 + Math.random() * 50;
    const y = 5 + Math.random() * 45;  
    locations.push({ x, y });
  }
  return locations;
};

function App() {
  const activeSport = 'football';
  const sportData = sportsConfig[activeSport];

  const [activeTournamentKey, setActiveTournamentKey] = useState('laliga2425');
  const [customPlayersDB, setCustomPlayersDB] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', team: '', games: 0, stats: {} });

  useEffect(() => {
    const saved = localStorage.getItem('myCustomPlayers');
    if (saved) {
      try {
        setCustomPlayersDB(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom players", e);
      }
    }
  }, []);

  const saveCustomPlayer = () => {
    if (!newPlayer.name.trim()) return;
    const id = `user_${Date.now()}`;
    const playerToSave = {
      id: id,
      name: `${newPlayer.name} (${newPlayer.team || 'ללא קבוצה'})`,
      games: parseInt(newPlayer.games) || 0,
      stats: { ...sportData.initialStats, ...newPlayer.stats },
      isCustom: true
    };
    const updatedDB = { ...customPlayersDB };
    if (!updatedDB[activeTournamentKey]) updatedDB[activeTournamentKey] = [];
    updatedDB[activeTournamentKey].push(playerToSave);
    setCustomPlayersDB(updatedDB);
    localStorage.setItem('myCustomPlayers', JSON.stringify(updatedDB));
    setShowAddModal(false);
    setNewPlayer({ name: '', team: '', games: 0, stats: {} });
  };

  const deleteCustomPlayer = (playerId, tournamentKey) => {
    const updatedDB = { ...customPlayersDB };
    if (updatedDB[tournamentKey]) {
      updatedDB[tournamentKey] = updatedDB[tournamentKey].filter(p => p.id !== playerId);
      setCustomPlayersDB(updatedDB);
      localStorage.setItem('myCustomPlayers', JSON.stringify(updatedDB));
      if (playerA.id === playerId) resetPlayer('A');
      if (playerB.id === playerId) resetPlayer('B');
    }
  };

  const currentDbPlayers = [...databases[activeTournamentKey].players, ...(customPlayersDB[activeTournamentKey] || [])];

  const [playerA, setPlayerA] = useState({ id: 'customA', name: "שחקן א'", games: 0, stats: { ...sportData.initialStats } });
  const [playerB, setPlayerB] = useState({ id: 'customB', name: "שחקן ב'", games: 0, stats: { ...sportData.initialStats } });
 
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [visualsA, setVisualsA] = useState([]);
  const [visualsB, setVisualsB] = useState([]);

  const calculateScore = (stats) => {
    let score = 0;
    const w = sportData.weights;
    for (const key in w) {
      score += (w[key] * (stats[key] || 0));
    }
    return Math.max(0, parseFloat(score.toFixed(2)));
  };

  useEffect(() => {
    setScoreA(calculateScore(playerA.stats));
    setScoreB(calculateScore(playerB.stats));
  }, [playerA.stats, playerB.stats]);

  useEffect(() => {
    setVisualsA(generateGoalLocations(playerA.stats.G || 0));
  }, [playerA.id, playerA.stats.G]);

  useEffect(() => {
    setVisualsB(generateGoalLocations(playerB.stats.G || 0));
  }, [playerB.id, playerB.stats.G]);

  const handleTournamentChange = (e) => {
    setActiveTournamentKey(e.target.value);
    resetPlayer('A');
    resetPlayer('B');
  };

  const handleStatChange = (player, statKey, value) => {
    if (player === 'A') {
      setPlayerA(prev => ({ ...prev, stats: { ...prev.stats, [statKey]: parseFloat(value) } }));
    } else {
      setPlayerB(prev => ({ ...prev, stats: { ...prev.stats, [statKey]: parseFloat(value) } }));
    }
  };

  const handlePlayerSelect = (playerLetter, playerId) => {
    if (playerId.startsWith('custom')) {
      resetPlayer(playerLetter);
      return;
    }
    const selectedPlayer = currentDbPlayers.find(p => p.id === playerId);
    if (selectedPlayer) {
      if (playerLetter === 'A') setPlayerA({ ...selectedPlayer });
      else setPlayerB({ ...selectedPlayer });
    }
  };

  const resetPlayer = (playerLetter) => {
    const defaultName = playerLetter === 'A' ? "שחקן א'" : "שחקן ב'";
    const defaultId = playerLetter === 'A' ? 'customA' : 'customB';
    const initialObj = { id: defaultId, name: defaultName, games: 0, stats: { ...sportData.initialStats } };
    if (playerLetter === 'A') setPlayerA(initialObj);
    else setPlayerB(initialObj);
  };

  const StatSlider = ({ label, statKey, value, max, playerColor, player }) => {
    const isTurnover = statKey === 'T';
    const activeColor = isTurnover ? 'red' : playerColor;

    return (
      <div className="mb-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-300 group">
        <div className="flex justify-between mb-2">
          <span className={`text-sm font-medium ${isTurnover ? 'text-red-300' : 'text-gray-300'} group-hover:text-white transition-colors`}>{label}</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-md bg-${activeColor}-500/20 text-${activeColor}-300`}>
            {value || 0}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={max || 100}
          value={value || 0}
          onChange={(e) => handleStatChange(player, statKey, e.target.value)}
          className={`w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-${activeColor}-500 focus:outline-none focus:ring-2 focus:ring-${activeColor}-500/50 transition-all`}
        />
      </div>
    );
  };

  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Tie';
  const perGameA = playerA.games > 0 ? (scoreA / playerA.games).toFixed(2) : 0;
  const perGameB = playerB.games > 0 ? (scoreB / playerB.games).toFixed(2) : 0;
 
  let perGameWinner = null;
  if (parseFloat(perGameA) > parseFloat(perGameB)) perGameWinner = playerA;
  else if (parseFloat(perGameB) > parseFloat(perGameA)) perGameWinner = playerB;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans dir-rtl relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .glass-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-4 lg:p-8 relative z-10">
       
        {/* Header */}
        <div className="text-center mb-10 animate-float pt-8">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-md">
             נתוני אמת ושחקנים מותאמים אישית ⚽
          </div>
          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 drop-shadow-lg">
            מדד יעילות כדורגל
          </h1>
          <div className="glass-panel inline-block p-5 rounded-2xl transition-transform hover:scale-105 duration-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-white/10">
            <code className="text-xl md:text-2xl font-black tracking-wider" dir="ltr">
              <span className="text-white/50 font-bold">Efficiency = </span>
              {sportData.formulaComponents.map((comp, idx) => (
                <span key={idx} className={comp.color}>{comp.text}</span>
              ))}
            </code>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
          <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-4">
            <span className="text-gray-300 font-medium text-sm">מאגר נתונים:</span>
            <select
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none appearance-none border-b border-dashed border-white/30 pb-1"
              value={activeTournamentKey}
              onChange={handleTournamentChange}
            >
              {Object.keys(databases).map(key => (
                  <option key={key} value={key} className="bg-slate-900 text-white">
                    {databases[key].name}
                  </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-cyan-600 hover:from-emerald-600 hover:to-cyan-500 rounded-full font-bold shadow-lg border border-white/10 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>➕</span> הוסף שחקן
          </button>

          <button
            onClick={() => { resetPlayer('A'); resetPlayer('B'); }}
            className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full font-bold shadow-lg border border-white/10 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>🔄</span> איפוס
          </button>
        </div>

        {/* Modal for adding player */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-md border-emerald-500/50">
              <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">הוסף שחקן חדש</h2>
              <div className="space-y-4 mb-6">
                <input type="text" className="w-full p-3 glass-input rounded-xl text-white outline-none focus:border-emerald-400" placeholder="שם השחקן" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} />
                <input type="text" className="w-full p-3 glass-input rounded-xl text-white outline-none focus:border-emerald-400" placeholder="קבוצה" value={newPlayer.team} onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})} />
                <input type="number" className="w-full p-3 glass-input rounded-xl text-white outline-none focus:border-emerald-400" placeholder="משחקים" value={newPlayer.games || ''} onChange={(e) => setNewPlayer({...newPlayer, games: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  {sportData.statsList.map(stat => (
                    <input key={stat.key} type="number" className="w-full p-2 glass-input rounded-lg text-white text-sm" placeholder={stat.label} onChange={(e) => setNewPlayer({...newPlayer, stats: {...newPlayer.stats, [stat.key]: parseFloat(e.target.value) || 0}})} />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={saveCustomPlayer} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors">שמור</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors">ביטול</button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         
          {/* Player A Card */}
          <div className={`glass-panel p-8 rounded-3xl transition-all duration-500 relative overflow-hidden ${winner === 'A' ? 'border-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.02]' : 'border-white/5'}`}>
            <div className="mb-8 relative z-10">
              <select
                className="w-full p-4 glass-input rounded-xl text-white cursor-pointer focus:border-blue-400 transition-all outline-none appearance-none font-medium"
                value={playerA.id || 'customA'}
                onChange={(e) => handlePlayerSelect('A', e.target.value)}
              >
                <option value="customA" className="bg-slate-900">-- בחר שחקן א' --</option>
                {currentDbPlayers.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.isCustom ? '👤 ' : ''}{p.name}</option>
                ))}
              </select>
              {playerA.id?.startsWith('user_') && (
                <button onClick={() => deleteCustomPlayer(playerA.id, activeTournamentKey)} className="absolute left-4 top-4 text-red-400 bg-red-400/10 p-2 rounded-lg text-xs font-bold">🗑️</button>
              )}
            </div>
            <div className="text-center mb-8 relative z-10">
              {winner === 'A' && <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">👑</div>}
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-blue-300 to-cyan-300 mb-3">{playerA.name}</h2>
              <div className="text-7xl font-black text-white tracking-tighter">{scoreA}</div>
              <div className="text-sm text-blue-200/60 mt-2 font-medium uppercase tracking-widest text-xs">נקודות יעילות</div>
            </div>
            <div className="space-y-1 relative z-10">
              {sportData.statsList.map((stat) => (
                <StatSlider key={`A-${stat.key}`} player="A" playerColor="blue" label={stat.label} statKey={stat.key} value={playerA.stats[stat.key]} max={databases[activeTournamentKey].maxStats[stat.key]} />
              ))}
            </div>
          </div>

          {/* Player B Card */}
          <div className={`glass-panel p-8 rounded-3xl transition-all duration-500 relative overflow-hidden ${winner === 'B' ? 'border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] scale-[1.02]' : 'border-white/5'}`}>
             <div className="mb-8 relative z-10">
              <select
                className="w-full p-4 glass-input rounded-xl text-white cursor-pointer focus:border-emerald-400 transition-all outline-none appearance-none font-medium"
                value={playerB.id || 'customB'}
                onChange={(e) => handlePlayerSelect('B', e.target.value)}
              >
                <option value="customB" className="bg-slate-900">-- בחר שחקן ב' --</option>
                {currentDbPlayers.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.isCustom ? '👤 ' : ''}{p.name}</option>
                ))}
              </select>
              {playerB.id?.startsWith('user_') && (
                <button onClick={() => deleteCustomPlayer(playerB.id, activeTournamentKey)} className="absolute left-4 top-4 text-red-400 bg-red-400/10 p-2 rounded-lg text-xs font-bold">🗑️</button>
              )}
            </div>
            <div className="text-center mb-8 relative z-10">
              {winner === 'B' && <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">👑</div>}
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-cyan-300 mb-3">{playerB.name}</h2>
              <div className="text-7xl font-black text-white tracking-tighter">{scoreB}</div>
              <div className="text-sm text-emerald-200/60 mt-2 font-medium uppercase tracking-widest text-xs">נקודות יעילות</div>
            </div>
            <div className="space-y-1 relative z-10">
               {sportData.statsList.map((stat) => (
                <StatSlider key={`B-${stat.key}`} player="B" playerColor="emerald" label={stat.label} statKey={stat.key} value={playerB.stats[stat.key]} max={databases[activeTournamentKey].maxStats[stat.key]} />
              ))}
            </div>
          </div>
        </div>

        {/* Visual Map (Goal Density) */}
        <div className="glass-panel p-8 rounded-3xl mb-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white/90">פיזור שערים משוער ⚽</h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> {playerA.name}</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> {playerB.name}</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] bg-gradient-to-t from-emerald-900 to-emerald-800 rounded-t-3xl border-2 border-white/20 overflow-hidden">
               {/* Field Markings */}
              <div className="absolute top-0 left-1/2 w-[60%] h-[55%] border-x-2 border-b-2 border-white/30 transform -translate-x-1/2"></div>
              <div className="absolute top-0 left-1/2 w-[30%] h-[20%] border-x-2 border-b-2 border-white/30 transform -translate-x-1/2"></div>
              {visualsA.map((g, i) => (
                <div key={`a-${i}`} className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${g.x}%`, top: `${g.y}%` }}></div>
              ))}
              {visualsB.map((g, i) => (
                <div key={`b-${i}`} className="absolute w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,1)] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${g.x}%`, top: `${g.y}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Head to Head Comparison */}
        <div className="glass-panel p-8 rounded-3xl mb-8 border-t border-emerald-500/30">
          <h3 className="text-2xl font-black mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">📊 יעילות ממוצעת למשחק</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-input p-5 rounded-2xl text-center border border-blue-500/20">
              <div className="text-sm text-gray-400 mb-1">ממוצע שחקן א'</div>
              <div className="font-bold text-xl text-blue-300">{perGameA} <span className="text-xs">יחידות</span></div>
            </div>
            <div className="glass-input p-5 rounded-2xl text-center border border-yellow-500/30 bg-yellow-500/5">
              <div className="text-sm text-gray-400 mb-1 font-bold">השחקן היעיל יותר</div>
              <div className="font-black text-xl text-yellow-400">{perGameWinner ? perGameWinner.name : "תיקו"}</div>
            </div>
            <div className="glass-input p-5 rounded-2xl text-center border border-emerald-500/20">
              <div className="text-sm text-gray-400 mb-1">ממוצע שחקן ב'</div>
              <div className="font-bold text-xl text-emerald-300">{perGameB} <span className="text-xs">יחידות</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )}; 