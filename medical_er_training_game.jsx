
import React, { useState, useEffect } from 'react';

// Simulated SQL Database Pool of Patients
const INITIAL_PATIENTS_POOL = [
  {
    id: 1,
    name: "Eleanor Vance",
    age: 68,
    gender: "Female",
    chiefComplaint: "Crushing chest pain radiating to left arm, shortness of breath.",
    vitals: { hr: 110, bp: "158/95", temp: "98.6°F", o2: "92%" },
    correctTriage: "Level 1 - Resuscitation",
    correctConsent: "Emergency Doctrine (Unconscious/Impaired - Immediate Life Threat)",
    correctXray: "Normal Cardiac Silhouette / Rule out Aortic Dissection",
    explanation: "Severe acute chest pain with hemodynamic instability requires immediate Level 1 resuscitation and emergency intervention under implied/emergency doctrine."
  },
  {
    id: 2,
    name: "Marcus Brody",
    age: 34,
    gender: "Male",
    chiefComplaint: "Severe right lower quadrant abdominal pain, nausea, low-grade fever.",
    vitals: { hr: 88, bp: "125/80", temp: "100.4°F", o2: "99%" },
    correctTriage: "Level 3 - Urgent",
    correctConsent: "Standard Informed Consent (Surgical Appendectomy)",
    correctXray: "Normal Abdominal Series / Ultrasound Correlation Recommended",
    explanation: "RLQ pain with fever points to acute appendicitis. Stable vitals categorize as Level 3 Urgent, requiring standard informed consent prior to surgical consultation."
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    age: 24,
    gender: "Female",
    chiefComplaint: "Acute shortness of breath, wheezing, use of accessory muscles after peanut exposure.",
    vitals: { hr: 125, bp: "95/60", temp: "98.4°F", o2: "88%" },
    correctTriage: "Level 1 - Resuscitation",
    correctConsent: "Emergency Life-Saving Treatment Consent",
    correctXray: "Hyperinflated Lungs / Clear Lung Fields (Anaphylaxis pattern)",
    explanation: "Anaphylaxis with hypoxia (O2 88%) is a life-threatening Level 1 emergency. Immediate epinephrine and emergency airway protocols apply."
  },
  {
    id: 4,
    name: "Arthur Pendelton",
    age: 79,
    gender: "Male",
    chiefComplaint: "Found down by family, right leg shortened and externally rotated after ground-level fall.",
    vitals: { hr: 78, bp: "135/85", temp: "98.8°F", o2: "96%" },
    correctTriage: "Level 3 - Urgent",
    correctConsent: "Standard Orthopedic Procedure Consent",
    correctXray: "Right Femoral Neck Fracture / Displaced",
    explanation: "Classic presentation of a hip fracture. Stable vitals make it Level 3 Urgent, requiring orthopedic consent and targeted X-ray confirmation."
  }
];

const TUTORIAL_PATIENTS_POOL = [
  {
    id: 5,
    name: "Chloe Grace",
    age: 19,
    gender: "Female",
    chiefComplaint: "Mild laceration to left palm from kitchen knife, bleeding controlled.",
    vitals: { hr: 72, bp: "120/80", temp: "98.6°F", o2: "100%" },
    correctTriage: "Level 4 - Semi-Urgent",
    correctConsent: "Minor Procedure Consent (Suturing)",
    correctXray: "No Radiopaque Foreign Body / Soft Tissue Swelling",
    explanation: "Stable minor wound. Classified as Level 4 Semi-Urgent with local wound care and standard minor consent."
  },
  {
    id: 6,
    name: "Robert Taylor",
    age: 52,
    gender: "Male",
    chiefComplaint: "Sudden weakness on left side, facial drooping, slurred speech starting 45 mins ago.",
    vitals: { hr: 92, bp: "175/100", temp: "98.7°F", o2: "95%" },
    correctTriage: "Level 1 - Resuscitation",
    correctConsent: "Stroke Alert Protocol / Thrombolytic Consent",
    correctXray: "Non-Contrast CT: Rule out acute hemorrhage / Early ischemic signs",
    explanation: "Acute stroke protocol (FAST positive within window). Level 1 immediate activation and specialized emergency neurological consent."
  },
  {
    id: 7,
    name: "Linda Diaz",
    age: 45,
    gender: "Female",
    chiefComplaint: "Severe throbbing right-sided headache with photophobia and nausea for 6 hours.",
    vitals: { hr: 80, bp: "130/85", temp: "98.5°F", o2: "98%" },
    correctTriage: "Level 3 - Urgent",
    correctConsent: "Diagnostic Evaluation & Pain Management Consent",
    correctXray: "Normal Skull Series / Rule out secondary headache causes",
    explanation: "Severe migraine presentation requiring urgent pain management and diagnostic workup."
  },
  {
    id: 8,
    name: "Tommy Cooper",
    age: 8,
    gender: "Male",
    chiefComplaint: "Inhaled small plastic toy piece, mild cough, no acute respiratory distress.",
    vitals: { hr: 100, bp: "100/65", temp: "98.9°F", o2: "96%" },
    correctTriage: "Level 2 - Emergent",
    correctConsent: "Pediatric Emergency Bronchoscopy Consent",
    correctXray: "Radiopaque Foreign Body in Right Main Bronchus",
    explanation: "Airway foreign body risk is Level 2 Emergent. Requires immediate pediatric evaluation and bronchoscopy consent."
  }
];

export default function App() {
  const [gameState, setGameState] = useState('login'); // login, triage, consent, xray, completed
  const [student, setStudent] = useState({ name: '', role: 'Medical Student' });
  const [currentPatients, setCurrentPatients] = useState(INITIAL_PATIENTS_POOL);
  const [patientAnswers, setPatientAnswers] = useState({});
  const [stageFeedback, setStageFeedback] = useState(null); // { status: 'all_correct' | 'some_error' | 'none_correct', message: '' }
  const [score, setScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!student.name.trim()) return;
    setGameState('triage');
  };

  // Submit Triage Stage
  const handleTriageSubmit = () => {
    let correctCount = 0;
    currentPatients.forEach(p => {
      if (patientAnswers[p.id]?.triage === p.correctTriage) {
        correctCount++;
      }
    });

    evaluateStageCompletion(correctCount, 'consent');
  };

  // Submit Consent Stage
  const handleConsentSubmit = () => {
    let correctCount = 0;
    currentPatients.forEach(p => {
      if (patientAnswers[p.id]?.consent === p.correctConsent) {
        correctCount++;
      }
    });

    evaluateStageCompletion(correctCount, 'xray');
  };

  // Submit X-Ray Stage
  const handleXraySubmit = () => {
    let correctCount = 0;
    currentPatients.forEach(p => {
      if (patientAnswers[p.id]?.xray === p.correctXray) {
        correctCount++;
      }
    });

    evaluateStageCompletion(correctCount, 'completed');
  };

  // Branching Logic Evaluator
  const evaluateStageCompletion = (correctCount, nextStage) => {
    setScore(prev => prev + (correctCount * 25));
    
    if (correctCount === 4) {
      setStageFeedback({
        status: 'all_correct',
        message: 'Excellent clinical judgment! All 4 patient cases correctly managed. Proceeding to the next phase.',
        next: nextStage
      });
    } else if (correctCount > 0) {
      setStageFeedback({
        status: 'some_error',
        message: `Good effort! ${correctCount}/4 correct. Review the explanations below for the errors made, then proceed.`,
        next: nextStage
      });
    } else {
      // None correct -> Load 4 new tutorial patients from simulated DB pool
      setCurrentPatients(TUTORIAL_PATIENTS_POOL);
      setStageFeedback({
        status: 'none_correct',
        message: '0/4 correct. Clinical tutorial triggered! 4 specialized training cases loaded from the database to reinforce core protocols.',
        next: nextStage
      });
    }
  };

  const advanceFromFeedback = (nextStage) => {
    setStageFeedback(null);
    setPatientAnswers({});
    if (nextStage === 'completed') {
      setGameState('completed');
    } else {
      setGameState(nextStage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Hospital Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-xl text-cyan-400">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
              Apex ER Simulator <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">v2.4 SQL Connected</span>
            </h1>
            <p className="text-xs text-slate-400">Interactive Emergency Medicine & Clinical Diagnosis Training Suite</p>
          </div>
        </div>

        {gameState !== 'login' && (
          <div className="flex items-center space-x-6 text-sm">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-slate-400 text-xs">Trainee</span>
              <span className="font-semibold text-cyan-300">{student.name} ({student.role})</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl flex items-center space-x-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className="font-mono font-bold text-emerald-400">{score} XP</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        {gameState === 'login' && (
          <div className="max-w-md mx-auto w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500"></div>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white">Emergency Room Access</h2>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to begin clinical shift training.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Student / Resident Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Alex Mercer"
                  value={student.name}
                  onChange={(e) => setStudent({...student, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Training Level</label>
                <select 
                  value={student.role}
                  onChange={(e) => setStudent({...student, role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Medical Student (MS3/MS4)">Medical Student (MS3/MS4)</option>
                  <option value="ER Resident (PGY-1)">ER Resident (PGY-1)</option>
                  <option value="Nursing Trainee">Nursing Trainee</option>
                  <option value="Paramedic Intern">Paramedic Intern</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Enter Emergency Department</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          </div>
        )}

        {(gameState === 'triage' || gameState === 'consent' || gameState === 'xray') && !stageFeedback && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Stage {gameState === 'triage' ? '1: Triage Assessment' : gameState === 'consent' ? '2: Consent & Diagnosis' : '3: Radiological Investigation'}
                  </span>
                  <span className="text-slate-500 text-xs">• SQL Patient Database Connected</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {gameState === 'triage' && 'Assign ESI Triage Levels (1-5)'}
                  {gameState === 'consent' && 'Review Case Notes & Legal Consent Protocols'}
                  {gameState === 'xray' && 'Inspect Radiographic Imaging & Finalize Diagnosis'}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">Examine the 4 active patients below and make your diagnostic decisions.</p>
              </div>
              <button 
                onClick={
                  gameState === 'triage' ? handleTriageSubmit :
                  gameState === 'consent' ? handleConsentSubmit : handleXraySubmit
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
              >
                <span>Submit Stage Answers</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </button>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPatients.map((patient, index) => (
                <div key={patient.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Bed #{index + 1} • Patient ID #{patient.id}</span>
                        <h3 className="text-lg font-bold text-white">{patient.name}, <span className="text-slate-400 font-normal">{patient.age}y / {patient.gender}</span></h3>
                      </div>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700">ER Bay Active</span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 mb-4 space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Chief Complaint & Vitals</div>
                      <p className="text-sm text-slate-200 italic font-medium">"{patient.chiefComplaint}"</p>
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-center">
                        <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500">HR</div>
                          <div className="text-xs font-mono font-bold text-rose-400">{patient.vitals.hr}</div>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500">BP</div>
                          <div className="text-xs font-mono font-bold text-amber-400">{patient.vitals.bp}</div>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500">Temp</div>
                          <div className="text-xs font-mono font-bold text-blue-400">{patient.vitals.temp}</div>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500">O2 Sat</div>
                          <div className="text-xs font-mono font-bold text-emerald-400">{patient.vitals.o2}</div>
                        </div>
                      </div>
                    </div>

                    {/* Stage Specific Interactive Inputs */}
                    <div className="space-y-3">
                      {gameState === 'triage' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Triage Severity Level:</label>
                          <select 
                            value={patientAnswers[patient.id]?.triage || ''}
                            onChange={(e) => setPatientAnswers({
                              ...patientAnswers,
                              [patient.id]: { ...patientAnswers[patient.id], triage: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Choose Triage Level --</option>
                            <option value="Level 1 - Resuscitation">Level 1 - Resuscitation (Immediate Life Threat)</option>
                            <option value="Level 2 - Emergent">Level 2 - Emergent (High Risk / Confusion)</option>
                            <option value="Level 3 - Urgent">Level 3 - Urgent (Stable, Multiple Resources)</option>
                            <option value="Level 4 - Semi-Urgent">Level 4 - Semi-Urgent (One Resource)</option>
                          </select>
                        </div>
                      )}

                      {gameState === 'consent' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Appropriate Consent / Legal Action:</label>
                          <select 
                            value={patientAnswers[patient.id]?.consent || ''}
                            onChange={(e) => setPatientAnswers({
                              ...patientAnswers,
                              [patient.id]: { ...patientAnswers[patient.id], consent: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Choose Consent Protocol --</option>
                            <option value="Emergency Doctrine (Unconscious/Impaired - Immediate Life Threat)">Emergency Doctrine (Implied Consent)</option>
                            <option value="Standard Informed Consent (Surgical Appendectomy)">Standard Informed Consent (Surgical)</option>
                            <option value="Emergency Life-Saving Treatment Consent">Emergency Life-Saving Treatment Consent</option>
                            <option value="Standard Orthopedic Procedure Consent">Standard Orthopedic Procedure Consent</option>
                            <option value="Minor Procedure Consent (Suturing)">Minor Procedure Consent (Suturing)</option>
                            <option value="Stroke Alert Protocol / Thrombolytic Consent">Stroke Alert Protocol / Thrombolytic Consent</option>
                            <option value="Diagnostic Evaluation & Pain Management Consent">Diagnostic Evaluation & Pain Management</option>
                            <option value="Pediatric Emergency Bronchoscopy Consent">Pediatric Emergency Bronchoscopy Consent</option>
                          </select>
                        </div>
                      )}

                      {gameState === 'xray' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Radiological Diagnosis:</label>
                          <select 
                            value={patientAnswers[patient.id]?.xray || ''}
                            onChange={(e) => setPatientAnswers({
                              ...patientAnswers,
                              [patient.id]: { ...patientAnswers[patient.id], xray: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Choose Imaging Finding --</option>
                            <option value="Normal Cardiac Silhouette / Rule out Aortic Dissection">Normal Cardiac Silhouette / Aortic Rule Out</option>
                            <option value="Normal Abdominal Series / Ultrasound Correlation Recommended">Normal Abdominal Series / US</option>
                            <option value="Hyperinflated Lungs / Clear Lung Fields (Anaphylaxis pattern)">Hyperinflated Lungs (Anaphylaxis Pattern)</option>
                            <option value="Right Femoral Neck Fracture / Displaced">Right Femoral Neck Fracture (Displaced)</option>
                            <option value="No Radiopaque Foreign Body / Soft Tissue Swelling">No Foreign Body / Soft Tissue Swelling</option>
                            <option value="Non-Contrast CT: Rule out acute hemorrhage / Early ischemic signs">CT: Rule Out Acute Hemorrhage / Ischemia</option>
                            <option value="Normal Skull Series / Rule out secondary headache causes">Normal Skull Series / Rule Out Secondary Headache</option>
                            <option value="Radiopaque Foreign Body in Right Main Bronchus">Radiopaque Foreign Body in Right Main Bronchus</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Feedback & Branching Result Modal */}
        {stageFeedback && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                stageFeedback.status === 'all_correct' ? 'bg-emerald-500' :
                stageFeedback.status === 'some_error' ? 'bg-amber-500' : 'bg-rose-500'
              }`}></div>

              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-3 rounded-2xl ${
                  stageFeedback.status === 'all_correct' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  stageFeedback.status === 'some_error' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stageFeedback.status === 'all_correct' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {stageFeedback.status === 'all_correct' && 'Stage Completed Successfully!'}
                    {stageFeedback.status === 'some_error' && 'Completed with Minor Clinical Errors'}
                    {stageFeedback.status === 'none_correct' && 'Tutorial Triggered (Database Fallback)'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">{stageFeedback.message}</p>
                </div>
              </div>

              {/* Educational Review Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Rationale & Explanations:</div>
                {currentPatients.map((p, idx) => (
                  <div key={p.id} className="text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-cyan-300 mb-1">Case #{idx + 1}: {p.name}</div>
                    <p className="text-slate-300 mb-1">{p.explanation}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => advanceFromFeedback(stageFeedback.next)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Next Phase</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Completion & Certificate Screen */}
        {gameState === 'completed' && (
          <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"></div>
            
            <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h2 className="text-3xl font-black text-white mb-2">ER Clinical Certification Awarded</h2>
            <p className="text-slate-400 text-sm mb-6">You have successfully completed the Emergency Room Triage, Consent, and Diagnostic Training Simulation.</p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Trainee Name:</span>
                <span className="font-bold text-white">{student.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Designation:</span>
                <span className="font-bold text-white">{student.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Final Accumulated XP:</span>
                <span className="font-mono font-bold text-emerald-400">{score} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Database Status:</span>
                <span className="font-mono text-cyan-400">All SQL Patient Records Synchronized</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setGameState('login');
                setScore(0);
                setCurrentPatients(INITIAL_PATIENTS_POOL);
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all"
            >
              Restart Simulation Shift
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Apex ER Medical Training Suite &bull; Single-File React Educational Simulation &bull; Simulated SQL Backend
      </footer>
    </div>
  );
}