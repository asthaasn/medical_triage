// Simulated SQL Database Pool of Patients
// @ts-nocheck
// chiefComplaint is written in plain, first-person language (what the patient would actually say).
export const INITIAL_PATIENTS_POOL = [
  {
    id: 1,
    name: "Eleanor Vance",
    age: 68,
    gender: "Female",
    chiefComplaint: "My chest hurts badly, like something is squeezing it. The pain goes into my left arm and I'm struggling to breathe.",
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
    chiefComplaint: "I have sharp pain in the lower right side of my belly. I feel sick to my stomach and I have a mild fever.",
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
    chiefComplaint: "I ate peanuts and now I can't breathe well. I'm wheezing and my chest is working hard to pull in air.",
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
    chiefComplaint: "I fell at home and my family found me on the floor. My right leg looks shorter and is turned outward.",
    vitals: { hr: 78, bp: "135/85", temp: "98.8°F", o2: "96%" },
    correctTriage: "Level 3 - Urgent",
    correctConsent: "Standard Orthopedic Procedure Consent",
    correctXray: "Right Femoral Neck Fracture / Displaced",
    explanation: "Classic presentation of a hip fracture. Stable vitals make it Level 3 Urgent, requiring orthopedic consent and targeted X-ray confirmation."
  }
];

export const TUTORIAL_PATIENTS_POOL = [
  {
    id: 5,
    name: "Chloe Grace",
    age: 19,
    gender: "Female",
    chiefComplaint: "I cut my left palm with a kitchen knife. It hurt at first, but the bleeding has stopped.",
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
    chiefComplaint: "About 45 minutes ago, the left side of my body suddenly felt weak. My face is drooping and my speech is slurred.",
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
    chiefComplaint: "I have a very bad pounding headache on the right side of my head. Bright light hurts my eyes and I feel sick. It started 6 hours ago.",
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
    chiefComplaint: "I breathed in a small piece of a toy. I have a little cough, but I can still breathe okay.",
    vitals: { hr: 100, bp: "100/65", temp: "98.9°F", o2: "96%" },
    correctTriage: "Level 2 - Emergent",
    correctConsent: "Pediatric Emergency Bronchoscopy Consent",
    correctXray: "Radiopaque Foreign Body in Right Main Bronchus",
    explanation: "Airway foreign body risk is Level 2 Emergent. Requires immediate pediatric evaluation and bronchoscopy consent."
  }
];