import React, { useState, useEffect } from 'react';
import { api } from './api';
// @ts-nocheck
import { INITIAL_PATIENTS_POOL, TUTORIAL_PATIENTS_POOL } from './patients';

/* ------------------------------------------------------------------ */
/* 1. ASSETS  – put files in  public/assets/  (Vite / CRA / Next)       */
/*    Missing files fall back to CSS art, so the game never breaks.     */
/* ------------------------------------------------------------------ */
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ASSETS = {
  background: '/assets/er-ward.jpeg',                         // <- change background here
  sprite: (id) => `/assets/sprites/patient-${id}.png`,         // 64x64 pixel sprites
  xray: (id) => `/assets/xrays/patient-${id}.png`,             // per-patient image (tried first)
  xrayByFinding: (f) => `/assets/xrays/${slug(f)}.png`,        // e.g. pneumothorax.png (fallback)
};

// Where each bed sits on the scene, in % of the scene box
const BEDS = [{ x: 8, y: 20 }, { x: 58, y: 20 }, { x: 8, y: 58 }, { x: 58, y: 58 }];

/* ------------------------------------------------------------------ */
/* 2. STAGE CONFIG                                                      */
/* ------------------------------------------------------------------ */
const TRIAGE_LEVELS = [
  'Level 1 - Resuscitation', 'Level 2 - Emergent', 'Level 3 - Urgent', 'Level 4 - Semi-Urgent',
];
const ALL = [...INITIAL_PATIENTS_POOL, ...TUTORIAL_PATIENTS_POOL];
const unique = (k) => [...new Set(ALL.map((p) => p[k]))];

const STAGES = {
  triage: {
    label: 'Stage 1: Triage', field: 'triage', correct: 'correctTriage', next: 'consent',
    prompt: 'Click a patient in the ward and assign an ESI level.',
    options: TRIAGE_LEVELS,
    tip: 'Level 1 = needs life-saving help right now. Level 4 = stable, needs one resource.',
  },
  consent: {
    label: 'Stage 2: Consent', field: 'consent', correct: 'correctConsent', next: 'xray',
    prompt: 'Click a patient and choose the correct consent protocol.',
    options: unique('correctConsent'),
    tip: 'Dying or unable to answer? Emergency doctrine. Awake and stable? Informed consent for that specific procedure.',
  },
  xray: {
    label: 'Stage 3: Imaging', field: 'xray', correct: 'correctXray', next: 'completed',
    prompt: 'Click a patient, inspect the image, and pick the finding.',
    options: unique('correctXray'),
    tip: 'Let the complaint tell you what to look for on the film.',
  },
};

// Tutorial = 3 choices only: the right answer + 2 clearly different wrong ones
const easyChoices = (p, stage) => {
  const { options, correct } = STAGES[stage];
  const right = p[correct];
  const lvl = (s) => parseInt(s.match(/\d/)?.[0] ?? '0', 10);
  const others = options.filter((o) => o !== right);
  const shift = p.id % others.length;
  const ordered = stage === 'triage'
    ? [...others].sort((a, b) => Math.abs(lvl(b) - lvl(right)) - Math.abs(lvl(a) - lvl(right)))
    : [...others.slice(shift), ...others.slice(0, shift)];
  const picks = ordered.slice(0, 2);
  picks.splice(p.id % 3, 0, right);
  return picks;
};

/* ------------------------------------------------------------------ */
/* 3. PIXEL STYLE                                                       */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.px { font-family: 'Press Start 2P', monospace; }
.px-img { image-rendering: pixelated; }
.px-box { background:#1d2b3a; border:4px solid #0b1320; box-shadow:4px 4px 0 #0b1320, inset 0 0 0 2px #3b5573; }
.px-btn { background:#2fbf71; color:#062015; border:4px solid #0b1320; box-shadow:0 4px 0 #0b1320; padding:.7rem 1rem; }
.px-btn:active:not(:disabled) { transform:translateY(4px); box-shadow:none; }
.px-btn:disabled { opacity:.45; }
.px-opt { border:4px solid #0b1320; padding:.7rem .8rem; text-align:left; width:100%; }
@keyframes bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
.bob { animation:bob 1s steps(2) infinite; }
@media (prefers-reduced-motion: reduce) { .bob, .animate-pulse { animation:none !important; } }

/* Stethoscope mouse pointer (32px pixel art, hotspot on the chest piece).
   To use your own image instead: url(/assets/stethoscope.png) 8 28 */
.px-cursor, .px-cursor * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges'%3E%3Cg stroke='%230b1320' stroke-width='1'%3E%3Crect x='4' y='0' width='4' height='4' fill='%23dfe6ee'/%3E%3Crect x='20' y='0' width='4' height='4' fill='%23dfe6ee'/%3E%3Crect x='4' y='4' width='4' height='14' fill='%23cfd8e3'/%3E%3Crect x='20' y='4' width='4' height='14' fill='%23cfd8e3'/%3E%3Crect x='4' y='16' width='20' height='4' fill='%23cfd8e3'/%3E%3Crect x='12' y='20' width='4' height='4' fill='%23cfd8e3'/%3E%3Crect x='8' y='24' width='12' height='8' fill='%235db3e8'/%3E%3C/g%3E%3C/svg%3E") 14 28, auto !important;
}

/* Print only the certificate */
@media print {
  body * { visibility: hidden; }
  #cert, #cert * { visibility: visible; }
  #cert { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
}
`;

/* ------------------------------------------------------------------ */
/* 4. CLICKABLE PATIENT SPRITE                                          */
/* ------------------------------------------------------------------ */
const TINTS = ['#e85d75', '#5db3e8', '#e8c85d', '#8be85d', '#c85de8', '#e8905d', '#5de8c8', '#a0a0e8'];

function Sprite({ patient, pos, done, showBed, onClick }) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={`Open chart for ${patient.name}`}
      className="absolute group flex flex-col items-center cursor-pointer focus:outline-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: '32%' }}
    >
      {showBed && (
        <div className="absolute w-full h-[45%] bg-slate-200 border-4 border-slate-900" style={{ top: '48%' }} />
      )}
      <div className="relative z-10 transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
           style={{ width: 'clamp(56px, 9vw, 96px)' }}>
        {broken ? (
          <div className="w-full relative" style={{ aspectRatio: '3 / 4' }}>
            <div className="absolute border-4 border-slate-900" style={{ left: '25%', top: 0, width: '50%', height: '35%', background: '#f2c9a0' }} />
            <div className="absolute border-4 border-slate-900" style={{ left: '10%', top: '38%', width: '80%', height: '62%', background: TINTS[patient.id % 8] }} />
          </div>
        ) : (
          <img src={ASSETS.sprite(patient.id)} alt="" onError={() => setBroken(true)} className="w-full px-img" />
        )}
        <span className={`px absolute -top-3 -right-3 text-[10px] px-1.5 py-1 border-4 border-slate-900 ${done ? 'bg-emerald-400 text-black' : 'bg-amber-300 text-black bob'}`}>
          {done ? 'OK' : '!'}
        </span>
      </div>
      <span className="px relative z-10 mt-1 bg-slate-900 text-white text-[8px] px-2 py-1 border-2 border-slate-500 group-hover:bg-cyan-700">
        {patient.name}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 5. PATIENT DIALOG (opens when a sprite is clicked)                   */
/* ------------------------------------------------------------------ */

// Plain-language vitals: label + a Normal/Abnormal flag
const num = (s) => parseFloat(String(s).match(/[\d.]+/)?.[0]);
const isOff = {
  hr: (v) => { const n = num(v); return n < 60 || n > 100; },
  bp: (v) => { const n = num(v); return n < 90 || n > 140; }, // systolic
  temp: (v) => { const n = num(v); const c = n > 45 ? (n - 32) / 1.8 : n; return c < 36 || c > 38; },
  o2: (v) => num(v) < 94,
};
const VITAL_ROWS = [['hr', 'Heart rate'], ['bp', 'Blood pressure'], ['temp', 'Temperature'], ['o2', 'Oxygen']];

function PatientDialog({ patient, stage, tutorial, answer, tut, onPick, onClose }) {
  const [xrayIdx, setXrayIdx] = useState(0);
  const cfg = STAGES[stage];
  const right = patient[cfg.correct];
  const options = tutorial ? easyChoices(patient, stage) : cfg.options;
  const wrong = tut?.wrong ?? [];
  const solved = !!tut?.solved;
  const glow = tutorial && wrong.length >= 2 && !solved; // 2 misses -> highlight the answer
  const xraySrcs = [ASSETS.xray(patient.id), ASSETS.xrayByFinding(patient.correctXray)];

  const look = (o) => {
    if (tutorial) {
      if (solved && o === right) return 'bg-emerald-500 text-black';
      if (wrong.includes(o)) return 'bg-rose-800 line-through opacity-60';
      if (glow && o === right) return 'bg-slate-800 animate-pulse ring-4 ring-amber-300';
      return 'bg-slate-800 hover:bg-slate-700';
    }
    return answer === o ? 'bg-cyan-500 text-black' : 'bg-slate-800 hover:bg-slate-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
           className="px-box px text-[10px] leading-relaxed text-slate-100 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div>
            <div className="text-cyan-300 text-xs">{patient.name}</div>
            <div className="text-slate-400 mt-1">{patient.age} years old / {patient.gender}</div>
          </div>
          <button onClick={onClose} className="px-btn !bg-rose-500 !text-white !py-1 !px-3" aria-label="Close chart">X</button>
        </div>

        {tutorial && (
          <div className="bg-amber-200 text-slate-900 border-4 border-slate-900 p-3 mb-4">
            Guide: {solved ? 'Well done! Close the chart and pick the next patient.' : wrong.length === 0 ? cfg.tip : wrong.length === 1 ? `Not quite. ${cfg.tip}` : `Try again. ${patient.explanation}`}
          </div>
        )}

        <div className="bg-slate-950 border-2 border-slate-600 p-3 mb-4">
          <div className="text-slate-500 text-[8px] mb-2">PATIENT SAYS</div>
          "{patient.simpleComplaint ?? patient.chiefComplaint}"
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-center">
          {VITAL_ROWS.map(([k, label]) => {
            const off = isOff[k](patient.vitals[k]);
            return (
              <div key={k} className="bg-slate-950 border-2 border-slate-600 p-2">
                <div className="text-slate-500 text-[8px]">{label}</div>
                <div className="text-white text-[10px] mt-1">{patient.vitals[k]}</div>
                <div className={`text-[8px] mt-1 ${off ? 'text-rose-300' : 'text-emerald-300'}`}>{off ? 'Abnormal' : 'Normal'}</div>
              </div>
            );
          })}
        </div>

        {stage === 'xray' && (
          <div className="mb-4 bg-black border-4 border-slate-950">
            {xrayIdx >= xraySrcs.length ? (
              <div className="p-6 text-center text-slate-400">Add image: {xraySrcs[0]} or {xraySrcs[1]}</div>
            ) : (
              <img key={xrayIdx} src={xraySrcs[xrayIdx]} alt={`Imaging for ${patient.name}`}
                   onError={() => setXrayIdx((i) => i + 1)}
                   className="w-full max-h-72 object-contain" style={{ filter: 'grayscale(1) contrast(1.15)' }} />
            )}
          </div>
        )}

        <div className="mb-2 text-slate-300">{cfg.label}</div>
        <div className="space-y-2">
          {options.map((o) => (
            <button key={o} onClick={() => onPick(patient, o)}
                    disabled={tutorial && (solved || wrong.includes(o))}
                    className={`px-opt ${look(o)}`}>{o}</button>
          ))}
        </div>
        <button onClick={onClose} className="px-btn w-full mt-4">{tutorial && !solved ? 'Back to ward' : 'Save and close'}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. GAME                                                              */
/* ------------------------------------------------------------------ */
export default function App() {
  const [gameState, setGameState] = useState('login'); // login | triage | consent | xray | tutorial | completed
  const [student, setStudent] = useState({ name: '', role: 'Medical Student' });
  const [answers, setAnswers] = useState({});          // real rounds
  const [tut, setTut] = useState({});                  // tutorial: { [id]: { wrong: [], solved } }
  const [tutorialFor, setTutorialFor] = useState(null); // { stage, next }
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [bgOk, setBgOk] = useState(false);
  const [health, setHealth] = useState(100);            // triage health bar
  const [lastDelta, setLastDelta] = useState(null);
  const [tally, setTally] = useState({ correct: 0, total: 0 }); // for the certificate

  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [ready, setReady] = useState(false);

  // Only draw CSS beds if the background image is missing
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgOk(true);
    img.src = ASSETS.background;
  }, []);

  // Put saved progress back into state
const restore = (p) => {
  setGameState(p.gameState);
  setAnswers(p.answers ?? {});
  setTut(p.tut ?? {});
  setTutorialFor(p.tutorialFor ?? null);
  setScore(p.score ?? 0);
  setHealth(p.health ?? 100);
  setLastDelta(p.lastDelta ?? null);
  setTally(p.tally ?? { correct: 0, total: 0 });
  setFeedback(p.feedback ?? null);
};

// On page load: if there is a saved session, resume it
useEffect(() => {
  if (!api.hasSession()) { setReady(true); return; }
  api.me()
    .then((d) => {
      setStudent({ name: d.name, role: d.role || 'Medical Student' });
      if (d.progress) restore(d.progress);
      else setGameState('triage');
    })
    .catch(() => api.logout())
    .finally(() => setReady(true));
}, []);

// Auto-save 0.4s after anything important changes
useEffect(() => {
  if (!ready || gameState === 'login') return;
  const t = setTimeout(() => {
    api.save({ gameState, tutorialFor, answers, tut, score, health, lastDelta, tally, feedback })
      .catch(() => {}); // ignore network blips; the next change saves again
  }, 400);
  return () => clearTimeout(t);
}, [ready, gameState, tutorialFor, answers, tut, score, health, lastDelta, tally, feedback]);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError('');
  try {
    const d = await api.login(student.name, pin, student.role);
    setStudent({ name: d.name, role: d.role || student.role });
    if (d.progress) restore(d.progress);
    else setGameState('triage');
  } catch (err) {
    setLoginError(err.message);
  }
};

  const inTutorial = gameState === 'tutorial';
  const stage = inTutorial ? tutorialFor.stage : gameState;
  const cfg = STAGES[stage];
  const patients = inTutorial ? TUTORIAL_PATIENTS_POOL : INITIAL_PATIENTS_POOL;
  const selected = patients.find((p) => p.id === selectedId);
  const isDone = (p) => (inTutorial ? tut[p.id]?.solved : !!answers[p.id]?.[cfg.field]);
  const doneCount = cfg ? patients.filter(isDone).length : 0;

  // Right answer = +10, wrong = -15 (clamped 0..100)
  const adjustHealth = (ok) => {
    const d = ok ? 10 : -15;
    setHealth((h) => Math.max(0, Math.min(100, h + d)));
    setLastDelta(d);
  };

  const pick = (p, option) => {
    const ok = option === p[cfg.correct];
    if (inTutorial) {
      const t = tut[p.id] ?? { wrong: [], solved: false };
      if (stage === 'triage' && !t.solved) adjustHealth(ok);
      setTut({ ...tut, [p.id]: ok ? { ...t, solved: true } : { ...t, wrong: [...t.wrong, option] } });
    } else {
      // Only the first answer per patient moves the bar, so re-clicking can't farm health
      if (stage === 'triage' && answers[p.id]?.[cfg.field] === undefined) adjustHealth(ok);
      setAnswers({ ...answers, [p.id]: { ...answers[p.id], [cfg.field]: option } });
    }
  };

  const submitStage = () => {
    const correct = patients.filter((p) => answers[p.id]?.[cfg.field] === p[cfg.correct]).length;
    setScore((s) => s + correct * 25);
    setTally((t) => ({ correct: t.correct + correct, total: t.total + patients.length }));
    // 0 correct -> tutorial for THIS stage, immediately after
    setFeedback({ correct, next: correct === 0 ? 'tutorial' : cfg.next });
  };

  const advance = () => {
    const { next } = feedback;
    setFeedback(null); setAnswers({}); setTut({}); setSelectedId(null);
    if (next === 'tutorial') {
      setTutorialFor({ stage: gameState, next: cfg.next });
      setGameState('tutorial');
    } else setGameState(next);
  };

  const finishTutorial = () => {
    setTut({}); setSelectedId(null);
    setGameState(tutorialFor.next); // use tutorialFor.stage instead to make them retry the failed stage
  };

  const newShift = () => {
    api.clear().catch(() => {}).finally(() => api.logout());
    setGameState('login'); setScore(0); setAnswers({}); setTut({});
    setTally({ correct: 0, total: 0 }); setHealth(100); setLastDelta(null);
    setFeedback(null); setPin('');
  };

  const sceneStyle = {
    backgroundColor: '#3a6b78',
    backgroundImage: `url(${ASSETS.background}), repeating-conic-gradient(#4b8391 0% 25%, #3a6b78 0% 50%)`,
    backgroundSize: 'cover, 48px 48px',
    imageRendering: 'pixelated',
  };

  const healthColor = health > 60 ? 'bg-emerald-400' : health > 30 ? 'bg-amber-300' : 'bg-rose-500';

  return (
    <div className="px px-cursor min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <style>{CSS}</style>

      <header className="px-box !border-x-0 !border-t-0 px-4 py-3 flex items-center justify-between text-[10px]">
        <span className="text-cyan-300 text-xs">APEX ER</span>
        {gameState !== 'login' && (
          <span className="flex gap-4"><span className="hidden md:inline">{student.name}</span><span className="text-emerald-300">{score} XP</span></span>
        )}
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col justify-center gap-4" style={{ paddingBottom: '5rem' }}>
        {gameState === 'login' && ready && (
  <form onSubmit={handleLogin}
        className="px-box max-w-md mx-auto w-full p-6 space-y-4 text-[10px]">
    <h2 className="text-sm text-cyan-300">Start your shift</h2>
    <label className="block">Your name
      <input required value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })}
             placeholder="Dr. Alex Mercer" className="mt-2 w-full bg-slate-950 border-4 border-slate-900 p-3 text-white" />
    </label>
    <label className="block">4-digit PIN
      <input required type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
             value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
             placeholder="1234" className="mt-2 w-full bg-slate-950 border-4 border-slate-900 p-3 text-white" />
      <span className="block mt-2 text-slate-400 text-[8px]">New here? Pick any PIN. Use the same name and PIN next time to continue.</span>
    </label>
    <label className="block">Training level
      <select value={student.role} onChange={(e) => setStudent({ ...student, role: e.target.value })}
              className="mt-2 w-full bg-slate-950 border-4 border-slate-900 p-3 text-white">
        {['Medical Student', 'ER Resident (PGY-1)', 'Nursing Trainee', 'Paramedic Intern'].map((r) => <option key={r}>{r}</option>)}
      </select>
    </label>
    {loginError && <div className="text-rose-300">{loginError}</div>}
    <button type="submit" className="px-btn w-full">Enter the ER</button>
  </form>
)}

        {cfg && gameState !== 'completed' && (
          <>
            <div className="px-box p-4 flex flex-wrap items-center justify-between gap-3 text-[10px]">
              <div>
                <div className="text-cyan-300">{inTutorial ? `Tutorial: ${cfg.label}` : cfg.label}</div>
                <div className="mt-2 text-slate-300">{inTutorial ? 'Guided practice. Click each patient to start.' : cfg.prompt}</div>
              </div>
              {inTutorial ? (
                <button className="px-btn" disabled={doneCount < patients.length} onClick={finishTutorial}>Finish tutorial</button>
              ) : (
                <button className="px-btn" onClick={submitStage}>Submit ({doneCount}/{patients.length})</button>
              )}
            </div>

            {/* THE SCENE: background + clickable sprites */}
            <div className="relative w-full border-4 border-slate-900 overflow-hidden" style={{ ...sceneStyle, aspectRatio: '16 / 9' }}>
              {patients.map((p, i) => (
                <Sprite key={p.id} patient={p} pos={BEDS[i]} done={isDone(p)} showBed={!bgOk} onClick={() => setSelectedId(p.id)} />
              ))}
            </div>
          </>
        )}

        {selected && cfg && (
          <PatientDialog key={selected.id} patient={selected} stage={stage} tutorial={inTutorial}
                         answer={answers[selected.id]?.[cfg.field]} tut={tut[selected.id]}
                         onPick={pick} onClose={() => setSelectedId(null)} />
        )}

        {feedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75">
            <div className="px-box w-full max-w-2xl p-6 text-[10px] leading-relaxed">
              <h3 className={`text-sm mb-3 ${feedback.correct === 4 ? 'text-emerald-300' : feedback.correct > 0 ? 'text-amber-300' : 'text-rose-300'}`}>
                {feedback.correct === 4 ? 'Perfect round' : feedback.correct > 0 ? `${feedback.correct}/4 correct` : '0/4 correct'}
              </h3>
              <p className="text-slate-300 mb-4">
                {feedback.correct === 0 ? 'A guided practice round starts next, with simpler choices and hints.' : 'Review the rationale, then move on.'}
              </p>
              <div className="bg-slate-950 border-4 border-slate-900 p-3 mb-4 max-h-56 overflow-y-auto space-y-3">
                {INITIAL_PATIENTS_POOL.map((p) => (
                  <div key={p.id}><span className="text-cyan-300">{p.name}</span><p className="text-slate-300 mt-1">{p.explanation}</p></div>
                ))}
              </div>
              <button className="px-btn w-full" onClick={advance}>{feedback.correct === 0 ? 'Start tutorial' : 'Next stage'}</button>
            </div>
          </div>
        )}

        {gameState === 'completed' && (() => {
          const pct = tally.total ? Math.round((tally.correct / tally.total) * 100) : 0;
          return (
            <div className="max-w-2xl mx-auto w-full">
              <div id="cert" className="px-box p-8 text-center text-[10px] leading-loose"
                   style={{ background: '#f6efd9', color: '#1d2b3a', borderColor: '#b8892b',
                            boxShadow: '4px 4px 0 #0b1320, inset 0 0 0 4px #e0c06a' }}>
                <div className="text-xs">APEX ER</div>
                <h2 className="text-base my-4">Certificate of Completion</h2>
                <p>This certifies that</p>
                <p className="text-sm my-3">{student.name}</p>
                <p>({student.role})</p>
                <p className="mt-3">has completed the emergency room training shift with a score of</p>
                <p className="text-2xl my-4">{pct}%</p>
                <p>{tally.correct} of {tally.total} answers correct / {score} XP</p>
                <p className="mt-4 text-[8px]">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="no-print flex flex-wrap gap-3 justify-center mt-4">
                <button className="px-btn" onClick={() => window.print()}>Print / Save as PDF</button>
                <button className="px-btn" onClick={newShift}>Start a new shift</button>
              </div>
            </div>
          );
        })()}
      </main>

      {/* HEALTH BAR – triage stage only (real round and tutorial) */}
      {stage === 'triage' && cfg && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-box !border-x-0 !border-b-0 px-4 py-3 flex items-center gap-3 text-[10px]">
          <span>PATIENT CARE</span>
          <div className="flex-1 flex gap-1" role="progressbar" aria-label="Patient care"
               aria-valuenow={health} aria-valuemin={0} aria-valuemax={100}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={`h-4 flex-1 border-2 border-slate-900 ${i < Math.ceil(health / 10) ? healthColor : 'bg-slate-800'}`} />
            ))}
          </div>
          <span>{health}%</span>
          {lastDelta !== null && (
            <span className={lastDelta > 0 ? 'text-emerald-300' : 'text-rose-300'}>{lastDelta > 0 ? '+' : ''}{lastDelta}</span>
          )}
        </div>
      )}
    </div>
  );
}
