//import React, { useState, useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef(null);
  
  // UI State linked to game engine
  const [passes, setPasses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [xG, setXG] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, goal, miss, timeout
  const [showResult, setShowResult] = useState(false);
  const [appState, setAppState] = useState('start'); // 'start', 'game'
  const [level, setLevel] = useState(1);

  // Game Engine State (Mutable to avoid React render cycle overhead on 60FPS)
  const engine = useRef({
    status: 'idle', // idle, aiming, moving, passing
    ball: { x: 200, y: 260, vx: 0, vy: 0, radius: 12 }, // מתחיל אצל שחקן 5
    targetPlayer: null,
    // מיקומים מדויקים לפי השרטוט שהעליתם
    players: [
      { id: 4, x: 80, y: 150, radius: 20 },   // שחקן 4 (שמאל למעלה)
      { id: 3, x: 180, y: 150, radius: 20 },  // שחקן 3
      { id: 2, x: 320, y: 150, radius: 20 },  // שחקן 2
      { id: 1, x: 420, y: 150, radius: 20 },  // שחקן 1 (ימין למעלה)
      { id: 5, x: 200, y: 260, radius: 20 },  // שחקן 5 (שמאל למטה - עם הכדור)
      { id: 6, x: 300, y: 260, radius: 20 },  // שחקן 6 (ימין למטה)
    ],
    defenders: [
      { anchorX: 130, anchorY: 150, x: 130, y: 150, radius: 18 }, // מגן 1: בין 4 ל-3
      { anchorX: 250, anchorY: 150, x: 250, y: 150, radius: 18 }, // מגן 2: בין 3 ל-2
      { anchorX: 370, anchorY: 150, x: 370, y: 150, radius: 18 }, // מגן 3: בין 2 ל-1
      { anchorX: 200, anchorY: 210, x: 200, y: 210, radius: 18 }, // מגן 4: מול שחקן 5
      { anchorX: 300, anchorY: 210, x: 300, y: 210, radius: 18 }, // מגן 5: מול שחקן 6
    ],
    goalie: { x: 250, y: 60, width: 70, height: 15, speed: 5, dir: 1 },
    goal: { x1: 180, x2: 320, y: 40, height: 20 },
    mouse: { x: 0, y: 0, isDragging: false },
    passes: 0,
    time: 25,
    lastTick: 0
  });

  // Calculate Expected Goals (xG) based on passes (Parabola opening downwards)
  const calculateXG = (passCount) => {
    let calculated = 85 - 1.5 * Math.pow(passCount - 7, 2);
    return Math.max(5, Math.min(95, calculated)); 
  };

  // Level configuration scaling
  const getLevelConfig = (lvl) => {
    return {
        time: Math.max(10, 30 - (lvl - 1) * 4), 
        goalieBaseSpeed: 3 + lvl,               
        defBaseSpeed: 0.8 + (lvl * 0.35)        
    };
  };

  const getDefendersForLevel = (lvl) => {
    if (lvl === 5) {
        // שלב 5: המגן המרכזי יורד אחורה לשמור בין 5 ל-6
        return [
          { anchorX: 130, anchorY: 150, x: 130, y: 150, radius: 18 }, 
          { anchorX: 250, anchorY: 220, x: 250, y: 220, radius: 18 }, // SHIFTED: Between 5 and 6
          { anchorX: 370, anchorY: 150, x: 370, y: 150, radius: 18 }, 
          { anchorX: 200, anchorY: 210, x: 200, y: 210, radius: 18 }, 
          { anchorX: 300, anchorY: 210, x: 300, y: 210, radius: 18 }, 
        ];
    }
    // שלבים 1 עד 4: הגנה אזורית רגילה לפי הציור
    return [
      { anchorX: 130, anchorY: 150, x: 130, y: 150, radius: 18 }, 
      { anchorX: 250, anchorY: 150, x: 250, y: 150, radius: 18 }, 
      { anchorX: 370, anchorY: 150, x: 370, y: 150, radius: 18 }, 
      { anchorX: 200, anchorY: 210, x: 200, y: 210, radius: 18 }, 
      { anchorX: 300, anchorY: 210, x: 300, y: 210, radius: 18 }, 
    ];
  };

  const resetGame = (advanceLevel = false, resetToStart = false) => {
    let newLevel = level;
    if (advanceLevel) newLevel = Math.min(5, level + 1);
    if (resetToStart) newLevel = 1;
    
    setLevel(newLevel);
    const config = getLevelConfig(newLevel);

    engine.current.ball = { x: 200, y: 260, vx: 0, vy: 0, radius: 12 }; // שחקן 5
    engine.current.targetPlayer = null;
    engine.current.passes = 0;
    engine.current.time = config.time;
    engine.current.status = 'idle';
    engine.current.goalie.speed = config.goalieBaseSpeed;
    
    engine.current.defenders = getDefendersForLevel(newLevel);

    setPasses(0);
    setTimeLeft(config.time);
    setXG(calculateXG(0));
    setGameStatus('playing');
    setShowResult(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const handleDown = (e) => {
      if (appState !== 'game') return; 
      e.preventDefault();
      if (engine.current.status !== 'idle' || engine.current.time <= 0) return;
      const pos = getMousePos(e);
      
      let clickedPlayer = null;
      for (let i = 0; i < engine.current.players.length; i++) {
          const p = engine.current.players[i];
          if (Math.hypot(p.x - pos.x, p.y - pos.y) <= p.radius + 15) {
              clickedPlayer = p;
              break;
          }
      }

      if (clickedPlayer && Math.hypot(engine.current.ball.x - clickedPlayer.x, engine.current.ball.y - clickedPlayer.y) > 5) {
          engine.current.targetPlayer = clickedPlayer;
          engine.current.status = 'passing';
          const dx = clickedPlayer.x - engine.current.ball.x;
          const dy = clickedPlayer.y - engine.current.ball.y;
          const dist = Math.hypot(dx, dy);
          engine.current.ball.vx = (dx / dist) * 18; 
          engine.current.ball.vy = (dy / dist) * 18;
          return;
      }

      const dx = pos.x - engine.current.ball.x;
      const dy = pos.y - engine.current.ball.y;
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
        engine.current.mouse.isDragging = true;
        engine.current.status = 'aiming';
      }
    };

    const handleMove = (e) => {
      if (appState !== 'game') return;
      e.preventDefault();
      if (engine.current.mouse.isDragging) {
        const pos = getMousePos(e);
        engine.current.mouse.x = pos.x;
        engine.current.mouse.y = pos.y;
      }
    };

    const handleUp = (e) => {
      if (appState !== 'game') return;
      e.preventDefault();
      if (engine.current.mouse.isDragging) {
        engine.current.mouse.isDragging = false;
        engine.current.status = 'moving'; 
        
        const dx = engine.current.ball.x - engine.current.mouse.x;
        const dy = engine.current.ball.y - engine.current.mouse.y;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        const factor = dist > maxDist ? maxDist / dist : 1;
        
        let shakeX = 0;
        let shakeY = 0;
        if (engine.current.passes > 7 || engine.current.time <= 5) {
            const shakeIntensity = Math.max(0, engine.current.passes - 7) * 1.5 + (engine.current.time <= 5 ? (6 - engine.current.time) * 2 : 0);
            shakeX = (Math.random() - 0.5) * shakeIntensity * 10;
            shakeY = (Math.random() - 0.5) * shakeIntensity * 10;
        }

        engine.current.ball.vx = (dx * factor + shakeX) * 0.15;
        engine.current.ball.vy = (dy * factor + shakeY) * 0.15;
      }
    };

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvas.addEventListener('touchstart', handleDown, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    const timerInterval = setInterval(() => {
        if (appState === 'game' && engine.current.status !== 'moving' && engine.current.status !== 'aiming' && engine.current.status !== 'passing' && engine.current.time > 0 && gameStatus === 'playing') {
             engine.current.time -= 1;
             setTimeLeft(engine.current.time);
             if (engine.current.time <= 0 && gameStatus === 'playing') {
                 setGameStatus('timeout');
                 setShowResult(true);
             }
        }
    }, 1000);

    const config = getLevelConfig(level); 

    const render = (time) => {
      const state = engine.current;
      
      if (gameStatus === 'playing' && appState === 'game') {
          state.goalie.x += state.goalie.speed * state.goalie.dir;
          if (state.goalie.x <= state.goal.x1) state.goalie.dir = 1;
          if (state.goalie.x + state.goalie.width >= state.goal.x2) state.goalie.dir = -1;

          // תנועת ההגנה - שמירה אזורית "בין לבין"
          state.defenders.forEach(d => {
              const shiftX = (state.ball.x - 250) * 0.45; 
              const shiftY = (state.ball.y - 250) * 0.15;
              
              // הגבלת התנועה לעד 40 פיקסלים לכל צד כדי שיישארו "בתפרים"
              const targetX = Math.max(d.anchorX - 40, Math.min(d.anchorX + 40, d.anchorX + shiftX));
              const targetY = Math.max(d.anchorY - 20, Math.min(d.anchorY + 20, d.anchorY + shiftY));

              const defSpeed = Math.max(0.3, config.defBaseSpeed - (state.passes * 0.2));

              const dx = targetX - d.x;
              const dy = targetY - d.y;
              const dist = Math.hypot(dx, dy);

              if (dist > defSpeed) {
                  d.x += (dx / dist) * defSpeed;
                  d.y += (dy / dist) * defSpeed;
              } else {
                  d.x = targetX;
                  d.y = targetY;
              }
          });

          if (state.status === 'passing') {
             state.ball.x += state.ball.vx;
             state.ball.y += state.ball.vy;
             
             const distToTarget = Math.hypot(state.ball.x - state.targetPlayer.x, state.ball.y - state.targetPlayer.y);
             if (distToTarget < 15) {
                 state.ball.x = state.targetPlayer.x;
                 state.ball.y = state.targetPlayer.y;
                 state.ball.vx = 0;
                 state.ball.vy = 0;
                 state.status = 'idle';
                 state.passes += 1;
                 
                 setPasses(state.passes);
                 setXG(calculateXG(state.passes));
                 
                 const newSpeed = Math.max(1, config.goalieBaseSpeed - (state.passes * 0.5));
                 state.goalie.speed = newSpeed;
             }
          }

          if (state.status === 'moving') {
            state.ball.x += state.ball.vx;
            state.ball.y += state.ball.vy;
            
            state.ball.vx *= 0.98;
            state.ball.vy *= 0.98;

            if (state.ball.x < 0 || state.ball.x > canvas.width) state.ball.vx *= -1;
            if (state.ball.y > canvas.height) state.ball.vy *= -1;

            const speed = Math.sqrt(state.ball.vx * state.ball.vx + state.ball.vy * state.ball.vy);
            
            let blocked = false;
            for (let i = 0; i < state.defenders.length; i++) {
                const d = state.defenders[i];
                if (Math.hypot(state.ball.x - d.x, state.ball.y - d.y) < d.radius + state.ball.radius) {
                    blocked = true;
                    setGameStatus('miss');
                    setShowResult(true);
                    state.status = 'idle';
                    state.ball.vx = 0; state.ball.vy = 0;
                    break;
                }
            }

            if (!blocked) {
                if (state.ball.y < state.goalie.y + state.goalie.height) {
                    if (state.ball.x > state.goalie.x && state.ball.x < state.goalie.x + state.goalie.width) {
                        setGameStatus('miss');
                        setShowResult(true);
                        state.status = 'idle';
                        state.ball.vx = 0; state.ball.vy = 0;
                    } 
                    else if (state.ball.x > state.goal.x1 && state.ball.x < state.goal.x2 && state.ball.y < state.goal.y + state.goal.height) {
                         setGameStatus('goal');
                         setShowResult(true);
                         state.status = 'idle';
                         state.ball.vx = 0; state.ball.vy = 0;
                    }
                    else if (state.ball.y < 20) {
                        setGameStatus('miss');
                        setShowResult(true);
                        state.status = 'idle';
                        state.ball.vx = 0; state.ball.vy = 0;
                    }
                }
                
                if (speed < 0.2) {
                    state.status = 'idle';
                    setGameStatus('miss');
                    setShowResult(true);
                }
            }
          }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0EA5E9'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; 
      ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(canvas.width, 100); ctx.stroke();
      
      ctx.strokeStyle = '#eab308'; 
      ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(canvas.width, 200); ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(state.goal.x1, state.goal.y, state.goal.x2 - state.goal.x1, state.goal.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(state.goal.x1, state.goal.y, state.goal.x2 - state.goal.x1, state.goal.height);

      state.defenders.forEach((d) => {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.stroke();
      });

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(state.goalie.x, state.goalie.y, state.goalie.width, state.goalie.height, 5);
      ctx.fill();

      state.players.forEach((p) => {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444'; // Red border like in the drawing
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.id.toString(), p.x, p.y); // משתמש ב-ID האמיתי מהשרטוט
      });

      if (state.status === 'aiming') {
          const dx = state.ball.x - state.mouse.x;
          const dy = state.ball.y - state.mouse.y;
          
          let targetX = state.ball.x + dx;
          let targetY = state.ball.y + dy;

          if (state.passes > 7 || state.time <= 5) {
              const pressure = Math.max(0, state.passes - 7) * 2 + (state.time <= 5 ? (6 - state.time) * 3 : 0);
              targetX += (Math.random() - 0.5) * pressure * 8;
              targetY += (Math.random() - 0.5) * pressure * 8;
          }

          ctx.beginPath();
          ctx.moveTo(state.ball.x, state.ball.y);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = (state.passes > 8 || state.time <= 5) ? '#ef4444' : '#fbbf24';
          ctx.lineWidth = 4;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.beginPath();
          ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
          ctx.fillStyle = (state.passes > 8 || state.time <= 5) ? '#ef4444' : '#fbbf24';
          ctx.fill();
      }

      ctx.fillStyle = '#fbbf24'; 
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius - 2, 0, Math.PI);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerInterval);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleDown);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('touchstart', handleDown);
        canvas.removeEventListener('touchmove', handleMove);
      }
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [gameStatus, appState, level]);

  const generateParabolaPath = () => {
      let path = "M 0 100 ";
      for (let p = 0; p <= 12; p++) {
          const x = (p / 12) * 100;
          let y = 85 - 1.5 * Math.pow(p - 7, 2);
          y = Math.max(0, y);
          const svgY = 100 - y; 
          path += `L ${x} ${svgY} `;
      }
      return path;
  };

  const getStatusMessage = () => {
      if (gameStatus === 'goal') return "שער! מצוין!";
      if (gameStatus === 'miss') return "החמצה! השוער או ההגנה עצרו את הכדור.";
      if (gameStatus === 'timeout') return "נגמר זמן ההתקפה!";
      return "";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 font-sans p-4 gap-6" dir="rtl">
      
      {appState === 'start' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border-t-8 border-sky-500">
            <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4">Stats Star</h1>
            <h2 className="text-xl font-bold text-sky-600 mb-2">סימולטור כדור מים 6 על 5</h2>
            <p className="text-md text-slate-500 mb-8">פותח ע"י נדב ונועם</p>
            
            <div className="bg-slate-50 rounded-xl p-6 text-right mb-8 text-slate-700 space-y-3 shadow-inner">
              <h3 className="font-bold text-lg mb-2 text-center">איך משחקים?</h3>
              <p>👆 <strong className="text-sky-600">מסירה:</strong> לחצו (או געו) על שחקן התקפה (לבן) כדי למסור לו את הכדור.</p>
              <p>🎯 <strong className="text-emerald-600">בעיטה:</strong> גררו לאחור מהכדור את החץ כדי לכוון ולבעוט לשער.</p>
              <p>⏱️ <strong className="text-rose-500">שימו לב:</strong> נסו להגיע לאופטימום של 7 מסירות לפני שאתם בועטים! היזהרו משחקני ההגנה החוסמים.</p>
            </div>

            <button 
              onClick={() => setAppState('game')}
              className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-black text-xl py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-sky-500/30"
            >
              התחל משחק
            </button>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6 border-t-8 border-sky-500">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stats Star</h1>
                <h2 className="text-sm font-semibold text-sky-600 mb-2">כדור מים 6 על 5 - חקר xG</h2>
                <p className="text-xs text-slate-500">פותח ע"י נדב ונועם</p>
            </div>
            <div className="bg-sky-100 text-sky-700 font-bold px-4 py-2 rounded-xl text-lg shadow-sm border border-sky-200">
                שלב {level}/5
            </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
            <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-medium">זמן נותר:</span>
                <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">מסירות:</span>
                <span className="text-2xl font-bold text-sky-600">{passes}</span>
            </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">מד הסתברות (xG)</h3>
            <div className="text-center text-3xl font-black text-emerald-500 mb-4">
                {xG.toFixed(1)}%
            </div>
            
            <div className="relative w-full h-32 bg-slate-50 border-l-2 border-b-2 border-slate-300 mt-auto">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                    <line x1="58.3" y1="0" x2="58.3" y2="100" stroke="#fecaca" strokeWidth="1" strokeDasharray="4" />
                    <path d={generateParabolaPath()} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {passes <= 12 && (
                        <circle cx={(passes / 12) * 100} cy={100 - Math.max(0, 85 - 1.5 * Math.pow(passes - 7, 2))} r="4" fill="#10b981" className="transition-all duration-300" />
                    )}
                </svg>
                <div className="absolute -bottom-6 left-0 text-[10px] text-slate-400">0 מסירות</div>
                <div className="absolute -bottom-6 right-0 text-[10px] text-slate-400">12 מסירות</div>
                <div className="absolute -bottom-6 left-[58%] -translate-x-1/2 text-[10px] font-bold text-red-400">אופטימום (7)</div>
            </div>
            
            <p className="text-xs text-slate-500 mt-8 text-center leading-relaxed">
                {passes < 4 ? "ההגנה מסודרת וחזקה, קשה למצוא פרצה." : 
                 passes >= 4 && passes < 7 ? "השוער מתחיל להתעייף ולצאת ממיקום." :
                 passes === 7 || passes === 8 ? "נקודת האופטימום! התפוקה מקסימלית, זה הזמן לבעוט." :
                 "הלחץ עולה! הדיוק יורד - תפוקה שולית פוחתת."}
            </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {appState === 'game' && passes === 0 && gameStatus === 'playing' && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none z-10 backdrop-blur-sm text-center w-3/4">
                 לחצו על שחקן כדי למסור אליו.<br/>גררו את הכדור לאחור כדי לבעוט לשער!
             </div>
        )}
        <canvas ref={canvasRef} width={500} height={500} className="bg-sky-500 shadow-inner rounded-lg cursor-crosshair max-w-full h-auto object-contain" style={{ touchAction: 'none' }} />

        {showResult && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                    <h2 className={`text-3xl font-black mb-2 ${gameStatus === 'goal' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {getStatusMessage()}
                    </h2>
                    
                    <div className="my-6 space-y-2">
                        <p className="text-slate-600">ביצעתם <span className="font-bold text-slate-800">{passes} מסירות</span></p>
                        <p className="text-slate-600">סיכוי ההבקעה (xG) היה: <span className="font-bold text-sky-600">{xG.toFixed(1)}%</span></p>
                        <p className="text-sm text-slate-500 mt-4 px-4">
                            {passes === 7 
                                ? "מעולה! הגעתם לנקודת הקיצון של הפרבולה." 
                                : passes < 7 
                                    ? "מהר מדי... השוער עדיין היה ממוקם היטב. נסו למסור יותר."
                                    : "התעכבתם מדי, חוק התפוקה השולית הפוחתת נכנס לפעולה והדיוק ירד."}
                        </p>
                    </div>

                    {gameStatus === 'goal' && level < 5 ? (
                        <button onClick={() => resetGame(true, false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200">
                            לשלב הבא!
                        </button>
                    ) : gameStatus === 'goal' && level === 5 ? (
                        <div className="space-y-3">
                            <p className="text-xl font-bold text-sky-600">🏆 אלופי המים! סיימתם הכל!</p>
                            <button onClick={() => resetGame(false, true)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200">
                                שחקו שוב מהתחלה
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => resetGame(false, false)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200">
                            נסו שוב את שלב {level}
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

//export default WaterPoloApp;

