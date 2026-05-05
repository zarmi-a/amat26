import React, { useState, useEffect } from 'react';
import { Activity, Dumbbell, Ruler, Target, RotateCcw, BookOpen } from 'lucide-react';


export default function App() {
  const [exercise, setExercise] = useState('lateral'); // 'lateral' | 'curl'
  const [angle, setAngle] = useState(45); // 0 to 180 degrees
  const [weight, setWeight] = useState(10); // 1 to 50 kg
  const [length, setLength] = useState(50); // 20 to 100 cm
  const [isChallengeMode, setIsChallengeMode] = useState(false);


  // Constants
  const GRAVITY = 9.81;
  const PI = Math.PI;


  // Math Calculations
  const force = weight * GRAVITY;
  const lengthMeters = length / 100;
  const angleRad = (angle * PI) / 180;
 
  const momentArmMeters = lengthMeters * Math.sin(angleRad);
  const currentMoment = force * Math.abs(momentArmMeters);
 
  const currentMaxMoment = force * lengthMeters * 1;


  const effortPercentage = currentMaxMoment > 0 ? (currentMoment / currentMaxMoment) * 100 : 0;
  const effortHue = 120 - (effortPercentage / 100) * 120;
  const gaugeColor = `hsl(${effortHue}, 80%, 45%)`;


  // SVG Coordinates & Layout
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 450;
 
  // Adjusted Character Coordinates for Vector Body
  const headCenter = { x: 120, y: 90 };
  const shoulder = { x: 120, y: 140 };
  const hip = { x: 120, y: 270 };
  const elbowFixed = { x: 120, y: 220 }; // For curl
 
  // Dynamic joint based on exercise
  const joint = exercise === 'lateral' ? shoulder : elbowFixed;
  const armPixels = length * 2.5;


  const handX = joint.x + armPixels * Math.sin(angleRad);
  const handY = joint.y + armPixels * Math.cos(angleRad);


  // Dynamic Dumbbell Size based on Weight
  const dumbbellPlateHeight = 16 + weight * 0.8;


  // Colors for Vector Art
  const colors = {
    skin: "#fed7aa", // Peach
    shirt: "#3b82f6", // Blue
    pants: "#1e293b", // Slate
    shoes: "#ef4444", // Red
    dumbbell: "#334155",
    handle: "#94a3b8"
  };


  useEffect(() => {
    if (exercise === 'curl') {
      setAngle(90);
      setLength(35);
    } else {
      setAngle(45);
      setLength(60);
    }
    setIsChallengeMode(false);
  }, [exercise]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
       
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">מעבדת מומנטים ביומכנית 🦾</h1>
          <p className="text-slate-500">פותח ע"י עמית ולביא - פרויקט חקר מתמטי (כיתה ט' עמ"ט)</p>
        </header>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
          {/* Right Column: Controls & Dictionary */}
          <div className="lg:col-span-5 space-y-6">
           
            {/* Exercise Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-indigo-500" />
                בחירת תרגיל
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setExercise('lateral')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    exercise === 'lateral'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  הרחקת כתפיים
                  <div className="text-xs font-normal opacity-80 mt-1">(Lateral Raise)</div>
                </button>
                <button
                  onClick={() => setExercise('curl')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    exercise === 'curl'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  כפיפת מרפקים
                  <div className="text-xs font-normal opacity-80 mt-1">(Barbell Curl)</div>
                </button>
              </div>
            </div>


            {/* Control Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  לוח בקרה
                </h2>
                <button
                  onClick={() => setIsChallengeMode(!isChallengeMode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    isChallengeMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  {isChallengeMode ? 'בטל אתגר' : 'מצב אתגר'}
                </button>
              </div>


              {isChallengeMode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm font-medium">
                  🎯 אתגר: מצאו את הזווית שבה העומס על השריר (המומנט) הוא המקסימלי ביותר! מתי המד הופך לאדום לגמרי?
                  {effortPercentage > 99 && (
                    <div className="mt-2 text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-200">
                      🎉 אלופים! מצאתם את נקודת הכשל! ב-90 מעלות הפונקציה (sin(90)) שווה ל-1, וזרוע המומנט הגדולה ביותר.
                    </div>
                  )}
                </div>
              )}


              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> זווית המפרק ($\theta$)
                    </label>
                    {!isChallengeMode && <span className="text-sm font-bold text-indigo-600">{angle}°</span>}
                    {isChallengeMode && <span className="text-sm font-bold text-amber-600">?</span>}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>0° (מטה)</span>
                    <span>90° (אופקי)</span>
                    <span>180° (מעלה)</span>
                  </div>
                </div>


                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" /> משקל (W)
                    </label>
                    <span className="text-sm font-bold text-indigo-600">{weight} ק"ג</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>


                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Ruler className="w-4 h-4" /> אורך האיבר (L)
                    </label>
                    <span className="text-sm font-bold text-indigo-600">{length} ס"מ</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>


            {/* Dictionary / Glossary Section */}
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-800">
                <BookOpen className="w-5 h-5" />
                מילון מושגים במעבדה
              </h2>
              <ul className="space-y-4 text-sm text-slate-700">
                <li>
                  <strong className="text-indigo-700">מומנט ($\tau$):</strong> כוח סיבובי הפועל על המפרק. מחושב ככפל בין הכוח הפועל (המשקולת) לבין זרוע המומנט. זהו "המאמץ" שאנו מרגישים בשריר.
                </li>
                <li>
                  <strong className="text-indigo-700">זרוע מומנט ($d$):</strong> המרחק הניצב בין ציר הסיבוב (המפרק) לקו הכוח. מיוצג באנימציה כ<span className="text-red-500 font-bold border-b-2 border-red-500 border-dashed pb-0.5 mx-1">קו אדום מקווקו</span>. הוא הניצב במשולש ישר הזווית ומחושב בעזרת הסינוס: $d = L \cdot \sin(\theta)$.
                </li>
                <li>
                  <strong className="text-indigo-700">קו הכוח:</strong> כיוון הפעולה של כוח הכובד (כדור הארץ המושך את המשקולת מטה). מיוצג באנימציה כ<span className="text-blue-500 font-bold border-b-2 border-blue-500 border-dashed pb-0.5 mx-1">קו כחול מקווקו</span>.
                </li>
                <li>
                  <strong className="text-indigo-700">אורך האיבר ($L$):</strong> המרחק הפיזי והקבוע מהמפרק ועד לנקודת אחיזת המשקולת (היתר במשולש שלנו).
                </li>
              </ul>
            </div>


          </div>


          {/* Left Column: Visualization */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
           
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 relative flex-1 flex flex-col items-center justify-center min-h-[450px] overflow-hidden">
             
              <div className="absolute top-4 right-4 bg-indigo-50/90 backdrop-blur-sm text-indigo-700 text-xs px-3 py-1 rounded-full font-medium border border-indigo-200 z-20 shadow-sm">
                מעבדה ויזואלית: שכבת רנטגן מופעלת
              </div>
             
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="overflow-visible z-10" dir="ltr">
               
                {/* --- BACKGROUND LAYER (Animated Gym) --- */}
                <g id="gym-background">
                  {/* Wall */}
                  <rect x="0" y="0" width={SVG_WIDTH} height="350" fill="#f8fafc" />
                 
                  {/* Floor */}
                  <rect x="0" y="350" width={SVG_WIDTH} height={SVG_HEIGHT - 350} fill="#cbd5e1" />
                  <path d="M 0 350 L 400 350" stroke="#94a3b8" strokeWidth="6" />


                  {/* Gym Mirror */}
                  <rect x="40" y="60" width="160" height="250" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="6" rx="8" />
                  {/* Mirror Reflection Highlights */}
                  <line x1="160" y1="80" x2="190" y2="110" stroke="#f0f9ff" strokeWidth="12" strokeLinecap="round" />
                  <line x1="175" y1="70" x2="190" y2="85" stroke="#f0f9ff" strokeWidth="8" strokeLinecap="round" />


                  {/* Dumbbell Rack */}
                  <g transform="translate(260, 210)">
                    <rect x="0" y="0" width="90" height="140" fill="#475569" rx="6" />
                    {/* Shelves */}
                    <rect x="5" y="30" width="80" height="8" fill="#1e293b" />
                    <rect x="5" y="80" width="80" height="8" fill="#1e293b" />
                    <rect x="5" y="130" width="80" height="8" fill="#1e293b" />
                    {/* Weights on rack */}
                    <rect x="15" y="18" width="10" height="24" fill="#64748b" rx="2" />
                    <rect x="35" y="18" width="10" height="24" fill="#64748b" rx="2" />
                    <rect x="65" y="18" width="10" height="24" fill="#64748b" rx="2" />
                   
                    <rect x="15" y="62" width="14" height="36" fill="#334155" rx="3" />
                    <rect x="35" y="62" width="14" height="36" fill="#334155" rx="3" />
                    <rect x="60" y="62" width="14" height="36" fill="#334155" rx="3" />
                  </g>
                </g>




                {/* --- CHARACTER LAYER --- */}
                <g id="character">
                  {/* Left (Back) Arm (Static, resting) */}
                  {exercise === 'curl' && (
                    <path d={`M ${shoulder.x - 10} ${shoulder.y} Q ${shoulder.x - 20} ${shoulder.y + 60} ${shoulder.x - 5} ${hip.y}`} fill="none" stroke={colors.skin} strokeWidth="16" strokeLinecap="round" />
                  )}


                  {/* Legs */}
                  <path d={`M ${hip.x - 15} ${hip.y - 10} L ${hip.x - 20} 380 L ${hip.x + 5} 380 L ${hip.x} ${hip.y - 10} Z`} fill={colors.pants} />
                  <path d={`M ${hip.x + 15} ${hip.y - 10} L ${hip.x + 25} 380 L ${hip.x} 380 L ${hip.x} ${hip.y - 10} Z`} fill={colors.pants} />
                 
                  {/* Shoes */}
                  <ellipse cx={hip.x - 10} cy={385} rx="20" ry="10" fill={colors.shoes} />
                  <ellipse cx={hip.x + 15} cy={385} rx="20" ry="10" fill={colors.shoes} />


                  {/* Torso (Shirt) */}
                  <path d={`M ${shoulder.x - 25} ${shoulder.y}
                           Q ${shoulder.x} ${shoulder.y - 15} ${shoulder.x + 25} ${shoulder.y}
                           L ${hip.x + 18} ${hip.y}
                           Q ${hip.x} ${hip.y + 10} ${hip.x - 18} ${hip.y} Z`}
                        fill={colors.shirt} />


                  {/* Head & Neck */}
                  <line x1={headCenter.x} y1={headCenter.y + 10} x2={headCenter.x} y2={headCenter.y + 30} stroke={colors.skin} strokeWidth="12" />
                  <circle cx={headCenter.x} cy={headCenter.y} r="22" fill={colors.skin} />
                  {/* Headband / Sweatband */}
                  <rect x={headCenter.x - 21} y={headCenter.y - 12} width="42" height="8" fill="#ef4444" transform={`rotate(-5, ${headCenter.x}, ${headCenter.y})`} />


                  {/* Fixed Upper Arm (For Curl) */}
                  {exercise === 'curl' && (
                    <g>
                      <line x1={shoulder.x} y1={shoulder.y} x2={elbowFixed.x} y2={elbowFixed.y} stroke={colors.skin} strokeWidth="18" strokeLinecap="round" />
                      {/* Short Sleeve */}
                      <line x1={shoulder.x} y1={shoulder.y - 5} x2={shoulder.x} y2={shoulder.y + 40} stroke={colors.shirt} strokeWidth="24" strokeLinecap="round" />
                    </g>
                  )}
                </g>




                {/* --- MOVING ARM & WEIGHT LAYER --- */}
                <g id="moving-arm">
                  {/* Arm Skin */}
                  <line x1={joint.x} y1={joint.y} x2={handX} y2={handY} stroke={colors.skin} strokeWidth="16" strokeLinecap="round" />
                 
                  {/* Short Sleeve (Only for Lateral Raise, since for curl it's on the fixed arm) */}
                  {exercise === 'lateral' && (
                    <line x1={joint.x} y1={joint.y - 5}
                          x2={joint.x + (handX - joint.x)*0.25}
                          y2={joint.y + (handY - joint.y)*0.25}
                          stroke={colors.shirt} strokeWidth="24" strokeLinecap="round" />
                  )}
                 
                  {/* Hand Fist */}
                  <circle cx={handX} cy={handY} r="12" fill={colors.skin} />


                  {/* Dumbbell */}
                  <g transform={`translate(${handX}, ${handY})`}>
                    {/* Handle */}
                    <rect x="-18" y="-4" width="36" height="8" fill={colors.handle} rx="2"/>
                    {/* Left Plate */}
                    <rect x="-24" y={-dumbbellPlateHeight/2} width="12" height={dumbbellPlateHeight} fill={colors.dumbbell} rx="3"/>
                    {/* Right Plate */}
                    <rect x="12" y={-dumbbellPlateHeight/2} width="12" height={dumbbellPlateHeight} fill={colors.dumbbell} rx="3"/>
                    {/* Weight Text inside a small badge */}
                    <circle cx="0" cy="0" r="10" fill="#1e293b" />
                    <text x="0" y="3.5" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
                      {weight}
                    </text>
                  </g>
                </g>




                {/* --- MATH X-RAY LAYER (Always on top to be visible) --- */}
                <g id="math-layer">
                  {/* Moment Arm (d) - Horizontal Red Line */}
                  <line
                    x1={joint.x} y1={joint.y}
                    x2={handX} y2={joint.y}
                    stroke="#ef4444" strokeWidth="3" strokeDasharray="6,6"
                  />
                  {/* Gravity Line of Action - Vertical Blue Line */}
                  <line
                    x1={handX} y1={joint.y}
                    x2={handX} y2={handY}
                    stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" opacity="0.8"
                  />
                  {/* Right Angle Square */}
                  <rect
                    x={handX < joint.x ? handX : handX - 15}
                    y={joint.y}
                    width="15" height="15"
                    fill="none" stroke="#ef4444" strokeWidth="2"
                    transform={`translate(${handX < joint.x ? 0 : 0}, ${handY < joint.y ? -15 : 0})`}
                  />


                  {/* Math Labels */}
                  {!isChallengeMode && (
                    <g fontSize="14" fontWeight="bold">
                      {/* Angle Arc */}
                      <path
                        d={`M ${joint.x} ${joint.y + 35} A 35 35 0 0 ${handX < joint.x ? 1 : 0} ${joint.x + 35 * Math.sin(angleRad)} ${joint.y + 35 * Math.cos(angleRad)}`}
                        fill="none" stroke="#8b5cf6" strokeWidth="2.5"
                      />
                      {/* Angle Background to make it pop */}
                      <rect x={joint.x + 45 * Math.sin(angleRad/2) - 15} y={joint.y + 45 * Math.cos(angleRad/2) - 8} width="30" height="18" fill="white" opacity="0.8" rx="4"/>
                      <text x={joint.x + 45 * Math.sin(angleRad/2)} y={joint.y + 45 * Math.cos(angleRad/2) + 5} fill="#8b5cf6" textAnchor="middle">
                        {angle}°
                      </text>
                     
                      {/* d (Moment Arm) Label */}
                      <rect x={(joint.x + handX) / 2 - 35} y={joint.y - 25} width="70" height="22" fill="white" opacity="0.9" rx="4" stroke="#fca5a5" strokeWidth="1"/>
                      <text x={(joint.x + handX) / 2} y={joint.y - 9} fill="#ef4444" textAnchor="middle">
                        d = {momentArmMeters.toFixed(2)}m
                      </text>


                      {/* L (Length) Label */}
                      <rect
                        x={(joint.x + handX) / 2 - 25}
                        y={(joint.y + handY) / 2 - 22}
                        width="20" height="20" fill="white" opacity="0.8" rx="4"
                        transform={`rotate(${-angle}, ${(joint.x + handX) / 2}, ${(joint.y + handY) / 2})`}
                      />
                      <text x={(joint.x + handX) / 2 - 15} y={(joint.y + handY) / 2 - 7} fill="#1e293b" textAnchor="middle" transform={`rotate(${-angle}, ${(joint.x + handX) / 2}, ${(joint.y + handY) / 2})`}>
                        L
                      </text>
                    </g>
                  )}
                </g>


              </svg>
            </div>


            {/* Effort Gauge & Real-time Math Dashboard */}
            <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">מד מאמץ (מומנט) בזמן אמת</h3>
             
              <div className="space-y-4">
                <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden border border-slate-600 shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-300 ease-out"
                    style={{
                      width: `${effortPercentage}%`,
                      backgroundColor: gaugeColor
                    }}
                  />
                </div>
               
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-x-reverse divide-slate-600">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">כוח (F)</div>
                    <div className="text-xl font-mono">{force.toFixed(1)}<span className="text-sm ml-1 text-slate-400">N</span></div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">זרוע מומנט (d)</div>
                    <div className="text-xl font-mono text-red-400">{Math.abs(momentArmMeters).toFixed(2)}<span className="text-sm ml-1 text-slate-400">m</span></div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">מומנט כללי ($\tau$)</div>
                    <div className="text-xl font-bold font-mono text-white" style={{ color: gaugeColor }}>
                      {currentMoment.toFixed(1)}<span className="text-sm ml-1 text-slate-400">Nm</span>
                    </div>
                  </div>
                </div>


                <div className="mt-4 pt-4 border-t border-slate-700 text-center font-mono text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                  <div><span className="text-amber-400 font-bold">τ</span> = F × L × sin(θ)</div>
                  <div className="hidden md:block text-slate-500">|</div>
                  <div><span className="text-amber-400 font-bold">{currentMoment.toFixed(1)}</span> = {force.toFixed(1)} × {lengthMeters.toFixed(2)} × {Math.abs(Math.sin(angleRad)).toFixed(2)}</div>
                </div>


              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

