// Comprehensive pharmaceutical database
export const pharmaceuticals = [
  // Pain Relievers - NSAIDs
  {
    fdaId: "nsaid-001",
    name: "Ibuprofen",
    description:
      "Non-steroidal anti-inflammatory drug (NSAID) used for pain, fever, and inflammation. Common brands include Advil, Motrin.",
    category: "Pain Reliever (NSAID)",
    ingredients: JSON.stringify(["Ibuprofen"]),
    benefits: JSON.stringify([
      "Pain relief",
      "Fever reduction",
      "Inflammation reduction",
      "Headache relief",
      "Menstrual cramp relief",
    ]),
    usage:
      "Take with food to reduce stomach upset. Do not exceed 1200mg daily without medical supervision.",
    warnings:
      "May cause stomach bleeding, ulcers, kidney problems. Risk increases with age and prolonged use. Not recommended in third trimester of pregnancy.",
    interactions:
      "May interact with blood thinners, aspirin, lithium, methotrexate, ACE inhibitors, diuretics.",
  },
  {
    fdaId: "nsaid-002",
    name: "Aspirin",
    description:
      "NSAID and antiplatelet agent used for pain, fever, inflammation, and cardiovascular protection. Common brands include Bayer, Bufferin.",
    category: "Pain Reliever (NSAID)",
    ingredients: JSON.stringify(["Acetylsalicylic acid"]),
    benefits: JSON.stringify([
      "Pain relief",
      "Fever reduction",
      "Anti-inflammatory",
      "Blood clot prevention",
      "Heart attack prevention",
    ]),
    usage:
      "Take with food. Low-dose aspirin (81mg) often used daily for heart protection.",
    warnings:
      "Risk of stomach bleeding, Reye syndrome in children with viral infections. Not for use during pregnancy third trimester.",
    interactions:
      "Interacts with blood thinners, other NSAIDs, methotrexate, ACE inhibitors, corticosteroids.",
  },
  {
    fdaId: "nsaid-003",
    name: "Naproxen",
    description:
      "Long-acting NSAID for pain and inflammation. Brands include Aleve, Naprosyn.",
    category: "Pain Reliever (NSAID)",
    ingredients: JSON.stringify(["Naproxen sodium"]),
    benefits: JSON.stringify([
      "Pain relief",
      "Inflammation reduction",
      "Arthritis relief",
      "Menstrual pain relief",
      "Fever reduction",
    ]),
    usage:
      "Take with food or milk. Provides longer-lasting relief than ibuprofen.",
    warnings:
      "Cardiovascular risk with long-term use. GI bleeding risk. Avoid in late pregnancy.",
    interactions:
      "Interactions with blood thinners, lithium, methotrexate, ACE inhibitors, diuretics.",
  },
  {
    fdaId: "nsaid-004",
    name: "Celecoxib",
    description:
      "COX-2 selective NSAID for arthritis and pain with reduced GI side effects. Brand name Celebrex.",
    category: "Pain Reliever (NSAID)",
    ingredients: JSON.stringify(["Celecoxib"]),
    benefits: JSON.stringify([
      "Arthritis pain relief",
      "Inflammation reduction",
      "Lower GI risk than traditional NSAIDs",
    ]),
    usage: "Can be taken with or without food. Prescription only.",
    warnings:
      "Increased cardiovascular risk. Sulfonamide allergy contraindication.",
    interactions:
      "Interacts with blood thinners, lithium, ACE inhibitors, fluconazole.",
  },
  // Pain Relievers - Acetaminophen
  {
    fdaId: "analgesic-001",
    name: "Acetaminophen",
    description:
      "Pain reliever and fever reducer without anti-inflammatory effects. Brand names include Tylenol.",
    category: "Pain Reliever (Analgesic)",
    ingredients: JSON.stringify(["Acetaminophen", "Paracetamol"]),
    benefits: JSON.stringify([
      "Pain relief",
      "Fever reduction",
      "Safe for most people",
      "No stomach irritation",
    ]),
    usage:
      "Do not exceed 3000mg daily. Be aware of acetaminophen in combination products.",
    warnings:
      "Liver toxicity at high doses or with alcohol. Do not exceed recommended dose.",
    interactions:
      "Alcohol increases liver toxicity risk. Warfarin interaction. Found in many combination products.",
  },
  // Opioid Pain Relievers
  {
    fdaId: "opioid-001",
    name: "Tramadol",
    description:
      "Centrally acting opioid analgesic for moderate to moderately severe pain. Brand names include Ultram.",
    category: "Pain Reliever (Opioid)",
    ingredients: JSON.stringify(["Tramadol hydrochloride"]),
    benefits: JSON.stringify([
      "Moderate pain relief",
      "Lower abuse potential than other opioids",
    ]),
    usage:
      "Prescription only. Take as directed. Do not crush extended-release forms.",
    warnings:
      "Seizure risk. Serotonin syndrome risk. Dependence potential. Respiratory depression.",
    interactions:
      "MAOIs, SSRIs, SNRIs, CNS depressants, alcohol, seizure medications.",
  },
  // Antidepressants - SSRIs
  {
    fdaId: "ssri-001",
    name: "Sertraline",
    description:
      "Selective serotonin reuptake inhibitor (SSRI) for depression, anxiety, PTSD, and OCD. Brand name Zoloft.",
    category: "Antidepressant (SSRI)",
    ingredients: JSON.stringify(["Sertraline hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Anxiety relief",
      "PTSD treatment",
      "OCD treatment",
      "Panic disorder treatment",
    ]),
    usage:
      "Take once daily. May take 4-6 weeks for full effect. Do not stop abruptly.",
    warnings:
      "Suicidal thoughts risk in young people. Serotonin syndrome. Sexual side effects. Withdrawal symptoms.",
    interactions:
      "MAOIs, other serotonergic drugs, blood thinners, pimozide, alcohol.",
  },
  {
    fdaId: "ssri-002",
    name: "Fluoxetine",
    description:
      "SSRI antidepressant for depression, OCD, bulimia, and panic disorder. Brand name Prozac.",
    category: "Antidepressant (SSRI)",
    ingredients: JSON.stringify(["Fluoxetine hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "OCD treatment",
      "Bulimia treatment",
      "Panic disorder treatment",
    ]),
    usage:
      "Take in morning. Long half-life means missed doses less problematic.",
    warnings:
      "Suicidal thoughts in young people. Serotonin syndrome. May be activating.",
    interactions:
      "MAOIs, thioridazine, pimozide, other serotonergic drugs, blood thinners.",
  },
  {
    fdaId: "ssri-003",
    name: "Escitalopram",
    description:
      "SSRI for depression and generalized anxiety disorder. Brand name Lexapro.",
    category: "Antidepressant (SSRI)",
    ingredients: JSON.stringify(["Escitalopram oxalate"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Anxiety relief",
      "Generally well tolerated",
    ]),
    usage: "Take once daily with or without food. Taper when discontinuing.",
    warnings:
      "QT prolongation at high doses. Serotonin syndrome. Hyponatremia in elderly.",
    interactions:
      "MAOIs, pimozide, drugs affecting QT interval, serotonergic drugs.",
  },
  {
    fdaId: "ssri-004",
    name: "Paroxetine",
    description:
      "SSRI for depression, anxiety disorders, and PTSD. Brand name Paxil.",
    category: "Antidepressant (SSRI)",
    ingredients: JSON.stringify(["Paroxetine hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Anxiety treatment",
      "PTSD treatment",
      "Social anxiety treatment",
    ]),
    usage: "Take in morning. More sedating than other SSRIs.",
    warnings:
      "Severe withdrawal if stopped abruptly. Weight gain. Sexual dysfunction.",
    interactions: "MAOIs, thioridazine, tamoxifen, other serotonergic drugs.",
  },
  {
    fdaId: "ssri-005",
    name: "Citalopram",
    description:
      "SSRI antidepressant for major depressive disorder. Brand name Celexa.",
    category: "Antidepressant (SSRI)",
    ingredients: JSON.stringify(["Citalopram hydrobromide"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Generally well tolerated",
    ]),
    usage: "Take once daily. Maximum 40mg daily due to QT prolongation.",
    warnings:
      "QT prolongation dose-dependent. Serotonin syndrome. Hyponatremia.",
    interactions: "MAOIs, pimozide, QT-prolonging drugs, serotonergic drugs.",
  },
  // Antidepressants - SNRIs
  {
    fdaId: "snri-001",
    name: "Venlafaxine",
    description:
      "Serotonin-norepinephrine reuptake inhibitor (SNRI) for depression and anxiety. Brand name Effexor.",
    category: "Antidepressant (SNRI)",
    ingredients: JSON.stringify(["Venlafaxine hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Anxiety treatment",
      "Nerve pain relief",
      "Hot flash reduction",
    ]),
    usage:
      "Take with food. Extended-release form preferred. Taper slowly when discontinuing.",
    warnings:
      "Blood pressure elevation. Severe discontinuation syndrome. Serotonin syndrome.",
    interactions: "MAOIs, serotonergic drugs, drugs metabolized by CYP2D6.",
  },
  {
    fdaId: "snri-002",
    name: "Duloxetine",
    description:
      "SNRI for depression, anxiety, fibromyalgia, and neuropathic pain. Brand name Cymbalta.",
    category: "Antidepressant (SNRI)",
    ingredients: JSON.stringify(["Duloxetine hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Anxiety treatment",
      "Fibromyalgia pain relief",
      "Diabetic nerve pain relief",
    ]),
    usage: "Take once daily. Swallow whole, do not crush or chew.",
    warnings:
      "Liver toxicity risk. Serotonin syndrome. Blood pressure changes.",
    interactions: "MAOIs, thioridazine, CYP1A2 inhibitors, serotonergic drugs.",
  },
  // Antidepressants - Other
  {
    fdaId: "antidep-001",
    name: "Bupropion",
    description:
      "Atypical antidepressant also used for smoking cessation. Brand names Wellbutrin, Zyban.",
    category: "Antidepressant (NDRI)",
    ingredients: JSON.stringify(["Bupropion hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Smoking cessation",
      "ADHD off-label",
      "Weight neutral",
    ]),
    usage: "Take as directed. Avoid late afternoon dosing due to insomnia.",
    warnings:
      "Seizure risk dose-related. Avoid in eating disorders, seizure disorders.",
    interactions: "MAOIs, drugs lowering seizure threshold, CYP2B6 substrates.",
  },
  {
    fdaId: "antidep-002",
    name: "Mirtazapine",
    description:
      "Atypical antidepressant with sedating and appetite-stimulating effects. Brand name Remeron.",
    category: "Antidepressant (Atypical)",
    ingredients: JSON.stringify(["Mirtazapine"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Sleep improvement",
      "Appetite stimulation",
      "Anxiety relief",
    ]),
    usage: "Take at bedtime due to sedation. Works faster than SSRIs for some.",
    warnings: "Weight gain. Sedation. Agranulocytosis rare.",
    interactions: "MAOIs, CNS depressants, CYP3A4 inhibitors, alcohol.",
  },
  {
    fdaId: "antidep-003",
    name: "Trazodone",
    description:
      "Antidepressant commonly used off-label for insomnia. Brand name Desyrel.",
    category: "Antidepressant (SARI)",
    ingredients: JSON.stringify(["Trazodone hydrochloride"]),
    benefits: JSON.stringify([
      "Depression treatment",
      "Sleep aid",
      "Anxiety relief",
    ]),
    usage:
      "Take at bedtime when used for sleep. Take after a meal to reduce dizziness.",
    warnings:
      "Priapism rare but serious. Orthostatic hypotension. Serotonin syndrome.",
    interactions:
      "MAOIs, CYP3A4 inhibitors, CNS depressants, serotonergic drugs.",
  },
  // Anxiolytics - Benzodiazepines
  {
    fdaId: "benzo-001",
    name: "Alprazolam",
    description:
      "Benzodiazepine for anxiety and panic disorder. Brand name Xanax.",
    category: "Anxiolytic (Benzodiazepine)",
    ingredients: JSON.stringify(["Alprazolam"]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "Panic attack treatment",
      "Fast-acting",
    ]),
    usage: "Use short-term. High dependence potential. Do not stop abruptly.",
    warnings:
      "Dependence and withdrawal. Respiratory depression. Cognitive impairment.",
    interactions: "Opioids, CNS depressants, CYP3A4 inhibitors, alcohol.",
  },
  {
    fdaId: "benzo-002",
    name: "Lorazepam",
    description:
      "Benzodiazepine for anxiety, insomnia, and seizures. Brand name Ativan.",
    category: "Anxiolytic (Benzodiazepine)",
    ingredients: JSON.stringify(["Lorazepam"]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "Pre-surgical sedation",
      "Seizure treatment",
      "Insomnia treatment",
    ]),
    usage: "Use short-term. Can be given sublingually or IV.",
    warnings: "Dependence. Respiratory depression. Memory impairment.",
    interactions: "Opioids, CNS depressants, alcohol, probenecid.",
  },
  {
    fdaId: "benzo-003",
    name: "Diazepam",
    description:
      "Long-acting benzodiazepine for anxiety, muscle spasms, and seizures. Brand name Valium.",
    category: "Anxiolytic (Benzodiazepine)",
    ingredients: JSON.stringify(["Diazepam"]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "Muscle relaxation",
      "Seizure treatment",
      "Alcohol withdrawal treatment",
    ]),
    usage: "Long half-life. May accumulate with repeated dosing.",
    warnings: "Dependence. Respiratory depression. Falls in elderly.",
    interactions: "Opioids, CNS depressants, CYP enzyme inhibitors, alcohol.",
  },
  {
    fdaId: "benzo-004",
    name: "Clonazepam",
    description:
      "Long-acting benzodiazepine for seizures and panic disorder. Brand name Klonopin.",
    category: "Anxiolytic (Benzodiazepine)",
    ingredients: JSON.stringify(["Clonazepam"]),
    benefits: JSON.stringify([
      "Seizure control",
      "Panic disorder treatment",
      "Restless leg syndrome off-label",
    ]),
    usage: "Take consistently. Do not stop abruptly.",
    warnings: "Dependence. Cognitive impairment. Suicidal thoughts.",
    interactions: "Opioids, CNS depressants, CYP3A4 inhibitors, alcohol.",
  },
  // Anxiolytics - Non-Benzodiazepine
  {
    fdaId: "anxiolytic-001",
    name: "Buspirone",
    description:
      "Non-benzodiazepine anxiolytic for generalized anxiety disorder. Brand name BuSpar.",
    category: "Anxiolytic (Non-Benzodiazepine)",
    ingredients: JSON.stringify(["Buspirone hydrochloride"]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "No dependence potential",
      "No sedation",
      "No withdrawal",
    ]),
    usage:
      "Takes 2-4 weeks for effect. Take consistently with or without food.",
    warnings:
      "Not effective for acute anxiety. Dizziness, headache common initially.",
    interactions: "MAOIs, CYP3A4 inhibitors, grapefruit juice.",
  },
  // Sleep Medications
  {
    fdaId: "sleep-001",
    name: "Zolpidem",
    description: "Non-benzodiazepine hypnotic for insomnia. Brand name Ambien.",
    category: "Sleep Aid",
    ingredients: JSON.stringify(["Zolpidem tartrate"]),
    benefits: JSON.stringify([
      "Sleep initiation",
      "Short-term insomnia treatment",
    ]),
    usage: "Take immediately before bed. Ensure 7-8 hours available for sleep.",
    warnings:
      "Complex sleep behaviors. Next-day impairment. Dependence potential.",
    interactions: "CNS depressants, CYP3A4 inhibitors, alcohol.",
  },
  {
    fdaId: "sleep-002",
    name: "Eszopiclone",
    description:
      "Non-benzodiazepine hypnotic for insomnia. Brand name Lunesta.",
    category: "Sleep Aid",
    ingredients: JSON.stringify(["Eszopiclone"]),
    benefits: JSON.stringify([
      "Sleep initiation",
      "Sleep maintenance",
      "Approved for longer-term use",
    ]),
    usage: "Take immediately before bed. Do not take with high-fat meal.",
    warnings: "Complex sleep behaviors. Unpleasant taste. Next-day impairment.",
    interactions: "CNS depressants, CYP3A4 inhibitors, alcohol.",
  },
  {
    fdaId: "sleep-003",
    name: "Diphenhydramine",
    description:
      "First-generation antihistamine commonly used as OTC sleep aid. Found in Benadryl, ZzzQuil.",
    category: "Sleep Aid (OTC)",
    ingredients: JSON.stringify(["Diphenhydramine hydrochloride"]),
    benefits: JSON.stringify([
      "Sleep induction",
      "Allergy relief",
      "OTC availability",
    ]),
    usage: "Take 30 minutes before bed. Not for long-term use.",
    warnings:
      "Anticholinergic effects. Not for elderly. Cognitive impairment. Dry mouth.",
    interactions: "Anticholinergic drugs, CNS depressants, MAOIs, alcohol.",
  },
  {
    fdaId: "sleep-004",
    name: "Doxylamine",
    description:
      "Antihistamine used as OTC sleep aid and for pregnancy nausea. Found in Unisom, Nyquil.",
    category: "Sleep Aid (OTC)",
    ingredients: JSON.stringify(["Doxylamine succinate"]),
    benefits: JSON.stringify([
      "Sleep induction",
      "Pregnancy nausea relief with B6",
    ]),
    usage: "Take 30 minutes before bed.",
    warnings: "Anticholinergic effects. Avoid in elderly. Next-day grogginess.",
    interactions: "Anticholinergic drugs, CNS depressants, alcohol.",
  },
  // Cardiovascular - Statins
  {
    fdaId: "statin-001",
    name: "Atorvastatin",
    description:
      "HMG-CoA reductase inhibitor (statin) for cholesterol management. Brand name Lipitor.",
    category: "Cholesterol Medication (Statin)",
    ingredients: JSON.stringify(["Atorvastatin calcium"]),
    benefits: JSON.stringify([
      "LDL cholesterol reduction",
      "Triglyceride reduction",
      "Cardiovascular risk reduction",
    ]),
    usage: "Can be taken any time of day. Take consistently.",
    warnings:
      "Muscle pain and weakness. Liver enzyme elevation. Diabetes risk.",
    interactions: "CYP3A4 inhibitors, fibrates, niacin, grapefruit juice.",
  },
  {
    fdaId: "statin-002",
    name: "Simvastatin",
    description:
      "Statin for cholesterol and cardiovascular risk reduction. Brand name Zocor.",
    category: "Cholesterol Medication (Statin)",
    ingredients: JSON.stringify(["Simvastatin"]),
    benefits: JSON.stringify(["LDL reduction", "Cardiovascular protection"]),
    usage: "Take in evening. Maximum 40mg daily for most patients.",
    warnings: "Muscle toxicity dose-related. Liver effects.",
    interactions:
      "CYP3A4 inhibitors, amiodarone, verapamil, diltiazem, grapefruit.",
  },
  {
    fdaId: "statin-003",
    name: "Rosuvastatin",
    description:
      "High-intensity statin for cholesterol management. Brand name Crestor.",
    category: "Cholesterol Medication (Statin)",
    ingredients: JSON.stringify(["Rosuvastatin calcium"]),
    benefits: JSON.stringify([
      "Potent LDL reduction",
      "HDL increase",
      "Cardiovascular protection",
    ]),
    usage: "Can be taken any time. Not extensively metabolized by CYP450.",
    warnings: "Muscle effects. Proteinuria at high doses.",
    interactions: "Cyclosporine, gemfibrozil, lopinavir/ritonavir, warfarin.",
  },
  {
    fdaId: "statin-004",
    name: "Pravastatin",
    description:
      "Hydrophilic statin with fewer drug interactions. Brand name Pravachol.",
    category: "Cholesterol Medication (Statin)",
    ingredients: JSON.stringify(["Pravastatin sodium"]),
    benefits: JSON.stringify([
      "LDL reduction",
      "Fewer drug interactions",
      "Lower muscle toxicity risk",
    ]),
    usage: "Take any time. Good option when drug interactions are concern.",
    warnings: "Muscle effects still possible. Liver monitoring.",
    interactions: "Cyclosporine, gemfibrozil, niacin.",
  },
  // Cardiovascular - Anticoagulants / Antiplatelets
  {
    fdaId: "anticoag-001",
    name: "Warfarin",
    description:
      "Vitamin K antagonist anticoagulant (blood thinner) used to prevent and treat blood clots. Brand name Coumadin.",
    category: "Anticoagulant (Vitamin K Antagonist)",
    ingredients: JSON.stringify(["Warfarin sodium"]),
    benefits: JSON.stringify([
      "Prevents blood clots",
      "Treats deep vein thrombosis (DVT)",
      "Prevents stroke in atrial fibrillation",
    ]),
    usage:
      "Prescription only. Dose is individualized based on INR monitoring. Take at the same time daily.",
    warnings:
      "High bleeding risk. Requires INR monitoring. Many drug and food interactions (vitamin K). Do not stop or change dose without medical supervision.",
    interactions:
      "Many interactions including antibiotics, antifungals, amiodarone, NSAIDs, aspirin, and numerous supplements. Monitor INR closely with any changes.",
  },
  {
    fdaId: "anticoag-002",
    name: "Apixaban",
    description:
      "Direct oral anticoagulant (DOAC) factor Xa inhibitor used to prevent stroke and treat blood clots. Brand name Eliquis.",
    category: "Anticoagulant (DOAC)",
    ingredients: JSON.stringify(["Apixaban"]),
    benefits: JSON.stringify([
      "Prevents stroke in atrial fibrillation",
      "Treats DVT/PE",
      "No routine INR monitoring",
    ]),
    usage:
      "Prescription only. Take exactly as prescribed (often twice daily). Do not skip doses.",
    warnings:
      "Bleeding risk. Stopping suddenly increases clot risk. Not appropriate for all patients (kidney/liver disease, certain valve conditions).",
    interactions:
      "Other anticoagulants/antiplatelets, strong CYP3A4/P-gp inhibitors or inducers (ketoconazole, rifampin), NSAIDs.",
  },
  {
    fdaId: "anticoag-003",
    name: "Rivaroxaban",
    description:
      "Direct oral anticoagulant (DOAC) factor Xa inhibitor for stroke prevention and clot treatment. Brand name Xarelto.",
    category: "Anticoagulant (DOAC)",
    ingredients: JSON.stringify(["Rivaroxaban"]),
    benefits: JSON.stringify([
      "Prevents stroke in atrial fibrillation",
      "Treats DVT/PE",
      "Prevents postoperative clots",
    ]),
    usage:
      "Prescription only. Some doses must be taken with food. Follow dosing instructions carefully.",
    warnings:
      "Bleeding risk. Stopping suddenly increases clot risk. Use caution in kidney/liver impairment.",
    interactions:
      "Other anticoagulants/antiplatelets, strong CYP3A4/P-gp inhibitors or inducers, NSAIDs.",
  },
  {
    fdaId: "anticoag-004",
    name: "Dabigatran",
    description:
      "Direct oral anticoagulant (DOAC) direct thrombin inhibitor used to prevent stroke and treat blood clots. Brand name Pradaxa.",
    category: "Anticoagulant (DOAC)",
    ingredients: JSON.stringify(["Dabigatran etexilate"]),
    benefits: JSON.stringify([
      "Prevents stroke in atrial fibrillation",
      "Treats DVT/PE",
      "No routine INR monitoring",
    ]),
    usage:
      "Prescription only. Swallow capsules whole. Keep in original container to protect from moisture.",
    warnings:
      "Bleeding risk. Stopping suddenly increases clot risk. Use caution in kidney impairment.",
    interactions:
      "Other anticoagulants/antiplatelets, P-gp inhibitors (amiodarone, verapamil), NSAIDs.",
  },
  {
    fdaId: "antiplatelet-001",
    name: "Clopidogrel",
    description:
      "Antiplatelet medication used to reduce risk of heart attack and stroke after certain cardiovascular events or stent placement. Brand name Plavix.",
    category: "Antiplatelet",
    ingredients: JSON.stringify(["Clopidogrel bisulfate"]),
    benefits: JSON.stringify([
      "Prevents platelet aggregation",
      "Reduces heart attack risk",
      "Reduces stroke risk",
    ]),
    usage: "Prescription only. Take once daily. Do not stop without guidance.",
    warnings:
      "Bleeding risk. Rare but serious TTP. Tell clinicians before surgery or dental work.",
    interactions:
      "Aspirin/NSAIDs increase bleeding risk. Some PPIs (omeprazole) may reduce effectiveness. Warfarin and other anticoagulants increase bleeding risk.",
  },
  // Cardiovascular - Blood Pressure
  {
    fdaId: "ace-001",
    name: "Lisinopril",
    description:
      "ACE inhibitor for hypertension and heart failure. Brand names Zestril, Prinivil.",
    category: "Blood Pressure (ACE Inhibitor)",
    ingredients: JSON.stringify(["Lisinopril"]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Heart failure treatment",
      "Kidney protection in diabetes",
    ]),
    usage: "Take once daily. May take weeks for full effect.",
    warnings:
      "Dry cough. Angioedema. Hyperkalemia. Contraindicated in pregnancy.",
    interactions:
      "Potassium supplements, potassium-sparing diuretics, NSAIDs, lithium.",
  },
  {
    fdaId: "ace-002",
    name: "Enalapril",
    description:
      "ACE inhibitor for hypertension and heart failure. Brand name Vasotec.",
    category: "Blood Pressure (ACE Inhibitor)",
    ingredients: JSON.stringify(["Enalapril maleate"]),
    benefits: JSON.stringify([
      "Blood pressure control",
      "Heart failure treatment",
    ]),
    usage: "Take once or twice daily.",
    warnings: "Cough. Angioedema. Contraindicated in pregnancy.",
    interactions: "Potassium supplements, NSAIDs, lithium, aliskiren.",
  },
  {
    fdaId: "arb-001",
    name: "Losartan",
    description:
      "Angiotensin receptor blocker (ARB) for hypertension. Brand name Cozaar.",
    category: "Blood Pressure (ARB)",
    ingredients: JSON.stringify(["Losartan potassium"]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Diabetic nephropathy protection",
      "No cough like ACE inhibitors",
    ]),
    usage: "Take once daily. May be combined with hydrochlorothiazide.",
    warnings: "Hyperkalemia. Contraindicated in pregnancy. Hypotension.",
    interactions: "Potassium supplements, NSAIDs, lithium, rifampin.",
  },
  {
    fdaId: "arb-002",
    name: "Valsartan",
    description: "ARB for hypertension and heart failure. Brand name Diovan.",
    category: "Blood Pressure (ARB)",
    ingredients: JSON.stringify(["Valsartan"]),
    benefits: JSON.stringify([
      "Blood pressure control",
      "Heart failure treatment",
      "Post-MI protection",
    ]),
    usage: "Take once or twice daily.",
    warnings: "Hyperkalemia. Renal impairment. Contraindicated in pregnancy.",
    interactions: "Potassium supplements, NSAIDs, lithium.",
  },
  {
    fdaId: "betablocker-001",
    name: "Metoprolol",
    description:
      "Beta-blocker for hypertension, angina, and heart failure. Brand names Lopressor, Toprol-XL.",
    category: "Blood Pressure (Beta Blocker)",
    ingredients: JSON.stringify([
      "Metoprolol succinate",
      "Metoprolol tartrate",
    ]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Heart rate control",
      "Angina prevention",
      "Heart failure treatment",
    ]),
    usage: "Extended-release taken once daily. Immediate-release twice daily.",
    warnings:
      "Do not stop abruptly. Bradycardia. Mask hypoglycemia symptoms. Fatigue.",
    interactions:
      "CYP2D6 inhibitors, calcium channel blockers, clonidine, MAOIs.",
  },
  {
    fdaId: "betablocker-002",
    name: "Atenolol",
    description:
      "Cardioselective beta-blocker for hypertension and angina. Brand name Tenormin.",
    category: "Blood Pressure (Beta Blocker)",
    ingredients: JSON.stringify(["Atenolol"]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Angina prevention",
      "Less CNS effects than lipophilic beta-blockers",
    ]),
    usage: "Take once daily. Renal dose adjustment needed.",
    warnings: "Do not stop abruptly. Bradycardia. Fatigue.",
    interactions: "Clonidine, calcium channel blockers, NSAIDs.",
  },
  {
    fdaId: "ccb-001",
    name: "Amlodipine",
    description:
      "Calcium channel blocker for hypertension and angina. Brand name Norvasc.",
    category: "Blood Pressure (Calcium Channel Blocker)",
    ingredients: JSON.stringify(["Amlodipine besylate"]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Angina prevention",
      "Once daily dosing",
      "Long half-life",
    ]),
    usage: "Take once daily at any time.",
    warnings: "Peripheral edema. Headache. Flushing.",
    interactions: "CYP3A4 inhibitors, simvastatin (dose limit), cyclosporine.",
  },
  {
    fdaId: "diuretic-001",
    name: "Hydrochlorothiazide",
    description:
      "Thiazide diuretic for hypertension and edema. Often abbreviated HCTZ.",
    category: "Blood Pressure (Diuretic)",
    ingredients: JSON.stringify(["Hydrochlorothiazide"]),
    benefits: JSON.stringify([
      "Blood pressure reduction",
      "Edema reduction",
      "Often combined with other agents",
    ]),
    usage: "Take in morning to avoid nighttime urination.",
    warnings:
      "Electrolyte imbalances. Photosensitivity. Gout exacerbation. Glucose increase.",
    interactions: "NSAIDs, lithium, digoxin, other antihypertensives.",
  },
  {
    fdaId: "diuretic-002",
    name: "Furosemide",
    description: "Loop diuretic for edema and hypertension. Brand name Lasix.",
    category: "Diuretic",
    ingredients: JSON.stringify(["Furosemide"]),
    benefits: JSON.stringify([
      "Rapid diuresis",
      "Edema treatment",
      "Heart failure symptom relief",
    ]),
    usage: "Take in morning. Monitor potassium levels.",
    warnings:
      "Severe electrolyte imbalances. Ototoxicity at high doses. Dehydration.",
    interactions: "Aminoglycosides, NSAIDs, lithium, digoxin.",
  },
  // Diabetes Medications
  {
    fdaId: "diabetes-001",
    name: "Metformin",
    description:
      "First-line medication for type 2 diabetes. Brand names Glucophage, Fortamet.",
    category: "Diabetes Medication (Biguanide)",
    ingredients: JSON.stringify(["Metformin hydrochloride"]),
    benefits: JSON.stringify([
      "Blood sugar reduction",
      "Weight neutral or loss",
      "Cardiovascular benefits",
      "Low hypoglycemia risk",
    ]),
    usage:
      "Take with meals. Start low and increase gradually to minimize GI effects.",
    warnings:
      "GI side effects. Lactic acidosis rare. Hold before contrast procedures. B12 deficiency.",
    interactions:
      "Alcohol, contrast dye, cimetidine, carbonic anhydrase inhibitors.",
  },
  {
    fdaId: "diabetes-002",
    name: "Glipizide",
    description: "Sulfonylurea for type 2 diabetes. Brand name Glucotrol.",
    category: "Diabetes Medication (Sulfonylurea)",
    ingredients: JSON.stringify(["Glipizide"]),
    benefits: JSON.stringify(["Blood sugar reduction", "Fast-acting"]),
    usage: "Take 30 minutes before meals.",
    warnings: "Hypoglycemia risk. Weight gain.",
    interactions:
      "Beta-blockers mask hypoglycemia, NSAIDs, sulfonamides, alcohol.",
  },
  {
    fdaId: "diabetes-003",
    name: "Sitagliptin",
    description: "DPP-4 inhibitor for type 2 diabetes. Brand name Januvia.",
    category: "Diabetes Medication (DPP-4 Inhibitor)",
    ingredients: JSON.stringify(["Sitagliptin phosphate"]),
    benefits: JSON.stringify([
      "Blood sugar reduction",
      "Weight neutral",
      "Low hypoglycemia risk alone",
    ]),
    usage: "Take once daily with or without food.",
    warnings: "Pancreatitis risk. Joint pain. Renal dose adjustment.",
    interactions: "Insulin and sulfonylureas increase hypoglycemia risk.",
  },
  {
    fdaId: "diabetes-004",
    name: "Empagliflozin",
    description:
      "SGLT2 inhibitor for diabetes with cardiovascular and kidney benefits. Brand name Jardiance.",
    category: "Diabetes Medication (SGLT2 Inhibitor)",
    ingredients: JSON.stringify(["Empagliflozin"]),
    benefits: JSON.stringify([
      "Blood sugar reduction",
      "Weight loss",
      "Cardiovascular benefits",
      "Kidney protection",
    ]),
    usage: "Take in morning with or without food.",
    warnings:
      "Genital infections. Diabetic ketoacidosis. Hypotension. Amputations (class effect).",
    interactions: "Diuretics, insulin, sulfonylureas.",
  },
  {
    fdaId: "diabetes-005",
    name: "Liraglutide",
    description:
      "GLP-1 receptor agonist for diabetes and weight loss. Brand names Victoza, Saxenda.",
    category: "Diabetes Medication (GLP-1 Agonist)",
    ingredients: JSON.stringify(["Liraglutide"]),
    benefits: JSON.stringify([
      "Blood sugar reduction",
      "Weight loss",
      "Cardiovascular benefits",
    ]),
    usage: "Daily injection. Increase dose gradually.",
    warnings:
      "Thyroid C-cell tumors in rodents. Pancreatitis. GI side effects.",
    interactions: "Insulin, sulfonylureas increase hypoglycemia risk.",
  },
  // Gastrointestinal Medications
  {
    fdaId: "ppi-001",
    name: "Omeprazole",
    description:
      "Proton pump inhibitor for GERD and ulcers. Brand name Prilosec.",
    category: "Digestive (Proton Pump Inhibitor)",
    ingredients: JSON.stringify(["Omeprazole"]),
    benefits: JSON.stringify([
      "Acid reduction",
      "GERD treatment",
      "Ulcer healing",
      "H. pylori treatment component",
    ]),
    usage: "Take 30-60 minutes before breakfast. Do not crush or chew.",
    warnings:
      "Long-term risks: fractures, B12 deficiency, C. diff, hypomagnesemia.",
    interactions: "Clopidogrel, methotrexate, tacrolimus, atazanavir.",
  },
  {
    fdaId: "ppi-002",
    name: "Pantoprazole",
    description: "PPI for GERD and erosive esophagitis. Brand name Protonix.",
    category: "Digestive (Proton Pump Inhibitor)",
    ingredients: JSON.stringify(["Pantoprazole sodium"]),
    benefits: JSON.stringify([
      "Acid suppression",
      "GERD treatment",
      "IV form available",
    ]),
    usage: "Take before breakfast. IV for hospital use.",
    warnings: "Similar long-term risks as other PPIs.",
    interactions: "Fewer CYP2C19 interactions than omeprazole.",
  },
  {
    fdaId: "h2blocker-001",
    name: "Famotidine",
    description: "H2 blocker for heartburn and ulcers. Brand name Pepcid.",
    category: "Digestive (H2 Blocker)",
    ingredients: JSON.stringify(["Famotidine"]),
    benefits: JSON.stringify([
      "Acid reduction",
      "Heartburn relief",
      "OTC availability",
      "Safer long-term than PPIs",
    ]),
    usage: "Take before meals or at bedtime.",
    warnings: "Headache, dizziness. Renal dose adjustment.",
    interactions:
      "Reduces absorption of drugs needing acid (ketoconazole, atazanavir).",
  },
  // Thyroid Medications
  {
    fdaId: "thyroid-001",
    name: "Levothyroxine",
    description:
      "Synthetic T4 for hypothyroidism. Brand names Synthroid, Levoxyl.",
    category: "Thyroid Medication",
    ingredients: JSON.stringify(["Levothyroxine sodium"]),
    benefits: JSON.stringify([
      "Thyroid hormone replacement",
      "Energy restoration",
      "Metabolism normalization",
    ]),
    usage:
      "Take on empty stomach 30-60 minutes before breakfast. Consistent timing crucial.",
    warnings: "Overtreatment causes hyperthyroidism symptoms. Cardiac effects.",
    interactions:
      "Calcium, iron, antacids reduce absorption. Warfarin interaction.",
  },
  // Respiratory Medications
  {
    fdaId: "antihistamine-001",
    name: "Cetirizine",
    description:
      "Second-generation antihistamine for allergies. Brand name Zyrtec.",
    category: "Antihistamine",
    ingredients: JSON.stringify(["Cetirizine hydrochloride"]),
    benefits: JSON.stringify([
      "Allergy relief",
      "Less sedating than first-generation",
      "Once daily dosing",
    ]),
    usage: "Take once daily with or without food.",
    warnings: "Some sedation possible. Renal dose adjustment.",
    interactions: "CNS depressants, alcohol.",
  },
  {
    fdaId: "antihistamine-002",
    name: "Loratadine",
    description: "Non-drowsy antihistamine for allergies. Brand name Claritin.",
    category: "Antihistamine",
    ingredients: JSON.stringify(["Loratadine"]),
    benefits: JSON.stringify([
      "Allergy relief",
      "Non-sedating",
      "OTC availability",
    ]),
    usage: "Take once daily.",
    warnings: "Generally well tolerated.",
    interactions: "Minimal interactions.",
  },
  {
    fdaId: "antihistamine-003",
    name: "Fexofenadine",
    description:
      "Non-sedating antihistamine for allergies. Brand name Allegra.",
    category: "Antihistamine",
    ingredients: JSON.stringify(["Fexofenadine hydrochloride"]),
    benefits: JSON.stringify([
      "Allergy relief",
      "Truly non-sedating",
      "Does not cross blood-brain barrier",
    ]),
    usage: "Take with water. Avoid fruit juices which reduce absorption.",
    warnings: "Minimal side effects.",
    interactions: "Fruit juice reduces absorption. Antacids.",
  },
  {
    fdaId: "decongestant-001",
    name: "Pseudoephedrine",
    description:
      "Decongestant for nasal and sinus congestion. Brand name Sudafed.",
    category: "Decongestant",
    ingredients: JSON.stringify(["Pseudoephedrine hydrochloride"]),
    benefits: JSON.stringify(["Nasal decongestion", "Sinus pressure relief"]),
    usage:
      "Behind pharmacy counter due to meth precursor. Do not take at bedtime.",
    warnings:
      "Raises blood pressure. Insomnia. Anxiety. Not for those with heart conditions.",
    interactions:
      "MAOIs contraindicated, blood pressure medications, stimulants.",
  },
  {
    fdaId: "bronchodilator-001",
    name: "Albuterol",
    description:
      "Short-acting beta-agonist bronchodilator for asthma. Brand names ProAir, Ventolin.",
    category: "Bronchodilator",
    ingredients: JSON.stringify(["Albuterol sulfate"]),
    benefits: JSON.stringify([
      "Rapid bronchodilation",
      "Asthma attack relief",
      "Exercise-induced asthma prevention",
    ]),
    usage: "Use as rescue inhaler. Prime before first use.",
    warnings: "Tachycardia. Tremor. Hypokalemia with overuse.",
    interactions:
      "Beta-blockers reduce effectiveness, MAOIs, tricyclic antidepressants.",
  },
  // Antibiotics
  {
    fdaId: "antibiotic-001",
    name: "Amoxicillin",
    description: "Broad-spectrum penicillin antibiotic for various infections.",
    category: "Antibiotic (Penicillin)",
    ingredients: JSON.stringify(["Amoxicillin"]),
    benefits: JSON.stringify([
      "Bacterial infection treatment",
      "Well-tolerated",
      "Good oral absorption",
    ]),
    usage: "Take with or without food. Complete full course.",
    warnings: "Allergic reactions. Diarrhea. C. diff risk.",
    interactions: "Warfarin, methotrexate, oral contraceptives potentially.",
  },
  {
    fdaId: "antibiotic-002",
    name: "Azithromycin",
    description:
      "Macrolide antibiotic for respiratory and other infections. Brand name Z-pack.",
    category: "Antibiotic (Macrolide)",
    ingredients: JSON.stringify(["Azithromycin"]),
    benefits: JSON.stringify([
      "Short course treatment",
      "Once daily dosing",
      "Broad spectrum",
    ]),
    usage: "Can be taken with or without food. 3-5 day courses common.",
    warnings: "QT prolongation. Liver effects. Hearing changes.",
    interactions: "Warfarin, QT-prolonging drugs, nelfinavir, antacids.",
  },
  {
    fdaId: "antibiotic-003",
    name: "Ciprofloxacin",
    description:
      "Fluoroquinolone antibiotic for various infections. Brand name Cipro.",
    category: "Antibiotic (Fluoroquinolone)",
    ingredients: JSON.stringify(["Ciprofloxacin hydrochloride"]),
    benefits: JSON.stringify([
      "Broad spectrum",
      "Urinary tract infection treatment",
      "Good tissue penetration",
    ]),
    usage: "Take with plenty of water. Avoid dairy around dose time.",
    warnings:
      "Tendon rupture. CNS effects. QT prolongation. Aortic aneurysm risk.",
    interactions:
      "Tizanidine contraindicated, theophylline, warfarin, antacids, calcium, iron.",
  },
  {
    fdaId: "antibiotic-004",
    name: "Doxycycline",
    description:
      "Tetracycline antibiotic for various infections including acne and Lyme disease.",
    category: "Antibiotic (Tetracycline)",
    ingredients: JSON.stringify([
      "Doxycycline hyclate",
      "Doxycycline monohydrate",
    ]),
    benefits: JSON.stringify([
      "Broad spectrum",
      "Acne treatment",
      "Lyme disease treatment",
      "Malaria prevention",
    ]),
    usage: "Take with food and water. Avoid lying down after dose.",
    warnings:
      "Photosensitivity. Esophageal irritation. Not for pregnant women or children under 8.",
    interactions: "Antacids, calcium, iron, dairy reduce absorption. Warfarin.",
  },
  // Corticosteroids
  {
    fdaId: "steroid-001",
    name: "Prednisone",
    description: "Oral corticosteroid for inflammation and immune suppression.",
    category: "Corticosteroid",
    ingredients: JSON.stringify(["Prednisone"]),
    benefits: JSON.stringify([
      "Anti-inflammatory",
      "Immune suppression",
      "Wide range of conditions",
    ]),
    usage:
      "Take with food. Morning dosing mimics natural cortisol. Taper when stopping.",
    warnings:
      "Adrenal suppression. Osteoporosis. Glucose elevation. Mood changes. Infection risk.",
    interactions: "NSAIDs, vaccines, CYP3A4 inducers, diabetes medications.",
  },
  // ADHD Medications
  {
    fdaId: "adhd-001",
    name: "Methylphenidate",
    description:
      "Stimulant medication for ADHD. Brand names Ritalin, Concerta.",
    category: "ADHD Medication (Stimulant)",
    ingredients: JSON.stringify(["Methylphenidate hydrochloride"]),
    benefits: JSON.stringify([
      "ADHD symptom improvement",
      "Focus enhancement",
      "Various release formulations",
    ]),
    usage:
      "Take in morning to avoid insomnia. Various formulations for different durations.",
    warnings:
      "Appetite suppression. Insomnia. Cardiovascular effects. Growth effects in children.",
    interactions:
      "MAOIs contraindicated, antihypertensives, seizure medications.",
  },
  {
    fdaId: "adhd-002",
    name: "Amphetamine/Dextroamphetamine",
    description: "Mixed amphetamine salts for ADHD. Brand name Adderall.",
    category: "ADHD Medication (Stimulant)",
    ingredients: JSON.stringify([
      "Amphetamine aspartate",
      "Amphetamine sulfate",
      "Dextroamphetamine saccharate",
      "Dextroamphetamine sulfate",
    ]),
    benefits: JSON.stringify(["ADHD treatment", "Narcolepsy treatment"]),
    usage: "Take in morning. XR form once daily.",
    warnings:
      "High abuse potential. Cardiovascular effects. Appetite suppression. Insomnia.",
    interactions:
      "MAOIs contraindicated, acidifying agents, antihypertensives.",
  },
  // Migraine Medications
  {
    fdaId: "migraine-001",
    name: "Sumatriptan",
    description: "Triptan for acute migraine treatment. Brand name Imitrex.",
    category: "Migraine Medication (Triptan)",
    ingredients: JSON.stringify(["Sumatriptan succinate"]),
    benefits: JSON.stringify([
      "Acute migraine relief",
      "Multiple delivery options",
      "Cluster headache treatment",
    ]),
    usage: "Take at onset of migraine. Can repeat after 2 hours if needed.",
    warnings:
      "Cardiovascular risk. Serotonin syndrome. Medication overuse headache.",
    interactions: "MAOIs, ergot derivatives, other triptans, SSRIs/SNRIs.",
  },
  // Erectile Dysfunction
  {
    fdaId: "ed-001",
    name: "Sildenafil",
    description:
      "PDE5 inhibitor for erectile dysfunction and pulmonary hypertension. Brand name Viagra.",
    category: "Erectile Dysfunction (PDE5 Inhibitor)",
    ingredients: JSON.stringify(["Sildenafil citrate"]),
    benefits: JSON.stringify([
      "Erectile dysfunction treatment",
      "Pulmonary hypertension treatment",
    ]),
    usage: "Take 30-60 minutes before activity. Avoid heavy meals.",
    warnings: "Cardiovascular effects. Priapism. Vision changes. Hearing loss.",
    interactions:
      "Nitrates contraindicated, alpha-blockers, CYP3A4 inhibitors.",
  },
  {
    fdaId: "ed-002",
    name: "Tadalafil",
    description:
      "Long-acting PDE5 inhibitor for ED and BPH. Brand name Cialis.",
    category: "Erectile Dysfunction (PDE5 Inhibitor)",
    ingredients: JSON.stringify(["Tadalafil"]),
    benefits: JSON.stringify([
      "Erectile dysfunction",
      "BPH symptom relief",
      "Longer duration of action",
    ]),
    usage: "Can be taken daily or as needed. Lasts up to 36 hours.",
    warnings: "Similar to sildenafil. Back pain and muscle aches more common.",
    interactions:
      "Nitrates contraindicated, alpha-blockers, CYP3A4 inhibitors.",
  },
  // Osteoporosis
  {
    fdaId: "osteo-001",
    name: "Alendronate",
    description:
      "Bisphosphonate for osteoporosis prevention and treatment. Brand name Fosamax.",
    category: "Osteoporosis Medication (Bisphosphonate)",
    ingredients: JSON.stringify(["Alendronate sodium"]),
    benefits: JSON.stringify([
      "Bone density increase",
      "Fracture risk reduction",
    ]),
    usage:
      "Take in morning on empty stomach with full glass of water. Stay upright 30 minutes.",
    warnings:
      "Esophageal irritation. Osteonecrosis of jaw. Atypical femur fractures.",
    interactions: "Calcium, antacids, other medications reduce absorption.",
  },
  // Contraceptives
  {
    fdaId: "contraceptive-001",
    name: "Ethinyl Estradiol/Levonorgestrel",
    description: "Combined oral contraceptive pill for birth control.",
    category: "Contraceptive",
    ingredients: JSON.stringify(["Ethinyl estradiol", "Levonorgestrel"]),
    benefits: JSON.stringify([
      "Contraception",
      "Menstrual regulation",
      "Acne treatment",
      "Endometriosis symptom relief",
    ]),
    usage: "Take at same time daily. Various dosing regimens.",
    warnings:
      "Blood clot risk. Not for smokers over 35. Stroke and heart attack risk.",
    interactions: "Enzyme-inducing drugs, some antibiotics, St. Johns Wort.",
  },
  // Gout
  {
    fdaId: "gout-001",
    name: "Allopurinol",
    description:
      "Xanthine oxidase inhibitor for gout prevention. Brand name Zyloprim.",
    category: "Gout Medication",
    ingredients: JSON.stringify(["Allopurinol"]),
    benefits: JSON.stringify([
      "Uric acid reduction",
      "Gout attack prevention",
      "Kidney stone prevention",
    ]),
    usage:
      "Start low dose. Takes weeks to months for full effect. Continue during flares.",
    warnings:
      "Hypersensitivity syndrome rare but serious. Gout flares initially.",
    interactions: "Azathioprine, mercaptopurine, warfarin, thiazides.",
  },
  {
    fdaId: "gout-002",
    name: "Colchicine",
    description:
      "Anti-inflammatory for acute gout attacks and prevention. Brand name Colcrys.",
    category: "Gout Medication",
    ingredients: JSON.stringify(["Colchicine"]),
    benefits: JSON.stringify([
      "Acute gout treatment",
      "Gout prophylaxis",
      "Familial Mediterranean fever",
    ]),
    usage:
      "For acute attack: high dose initially then lower. For prevention: daily low dose.",
    warnings:
      "GI toxicity. Narrow therapeutic index. Bone marrow suppression with overdose.",
    interactions: "CYP3A4 inhibitors, P-glycoprotein inhibitors, statins.",
  },
  // Muscle Relaxants
  {
    fdaId: "muscle-001",
    name: "Cyclobenzaprine",
    description:
      "Muscle relaxant for acute musculoskeletal conditions. Brand name Flexeril.",
    category: "Muscle Relaxant",
    ingredients: JSON.stringify(["Cyclobenzaprine hydrochloride"]),
    benefits: JSON.stringify([
      "Muscle spasm relief",
      "Adjunct for pain management",
    ]),
    usage:
      "Short-term use only (2-3 weeks). Take at bedtime if drowsiness an issue.",
    warnings: "Sedation. Anticholinergic effects. Not for long-term use.",
    interactions:
      "MAOIs, CNS depressants, serotonergic drugs, anticholinergics.",
  },
  // Anticonvulsants
  {
    fdaId: "anticonv-001",
    name: "Gabapentin",
    description:
      "Anticonvulsant also used for neuropathic pain. Brand name Neurontin.",
    category: "Anticonvulsant",
    ingredients: JSON.stringify(["Gabapentin"]),
    benefits: JSON.stringify([
      "Seizure control",
      "Neuropathic pain relief",
      "Restless leg syndrome off-label",
    ]),
    usage: "Dose three times daily. Renal dose adjustment needed.",
    warnings:
      "Sedation. Dizziness. Suicidal thoughts. Respiratory depression with opioids.",
    interactions: "Opioids, CNS depressants, antacids reduce absorption.",
  },
  {
    fdaId: "anticonv-002",
    name: "Pregabalin",
    description:
      "Anticonvulsant for seizures, neuropathic pain, and fibromyalgia. Brand name Lyrica.",
    category: "Anticonvulsant",
    ingredients: JSON.stringify(["Pregabalin"]),
    benefits: JSON.stringify([
      "Seizure control",
      "Neuropathic pain",
      "Fibromyalgia",
      "Anxiety off-label",
    ]),
    usage: "Schedule V controlled substance. Dose two or three times daily.",
    warnings:
      "Dizziness. Edema. Weight gain. Abuse potential. Suicidal ideation.",
    interactions: "Opioids, CNS depressants, thiazolidinediones.",
  },
  // Antipsychotics
  {
    fdaId: "antipsych-001",
    name: "Quetiapine",
    description:
      "Atypical antipsychotic for schizophrenia, bipolar, and depression adjunct. Brand name Seroquel.",
    category: "Antipsychotic",
    ingredients: JSON.stringify(["Quetiapine fumarate"]),
    benefits: JSON.stringify([
      "Schizophrenia treatment",
      "Bipolar treatment",
      "Depression adjunct",
      "Sedating",
    ]),
    usage: "Take at bedtime for sleep benefits. XR taken once daily.",
    warnings:
      "Metabolic effects. Sedation. QT prolongation. Tardive dyskinesia.",
    interactions:
      "CYP3A4 inhibitors and inducers, CNS depressants, QT-prolonging drugs.",
  },
  // Supplements often compared to pharmaceuticals
  {
    fdaId: "supplement-001",
    name: "Vitamin D3 Supplement",
    description:
      "Cholecalciferol supplement for vitamin D deficiency and bone health.",
    category: "Vitamin Supplement",
    ingredients: JSON.stringify(["Cholecalciferol", "Vitamin D3"]),
    benefits: JSON.stringify([
      "Bone health",
      "Immune support",
      "Mood support",
      "Calcium absorption",
    ]),
    usage: "Take with fat-containing meal for absorption.",
    warnings: "Toxicity possible at very high doses. Monitor blood levels.",
    interactions:
      "Thiazide diuretics, steroids, weight loss drugs, cholesterol medications.",
  },
  {
    fdaId: "supplement-002",
    name: "Fish Oil Supplement",
    description:
      "Omega-3 fatty acid supplement for cardiovascular and brain health.",
    category: "Nutritional Supplement",
    ingredients: JSON.stringify(["EPA", "DHA", "Fish oil"]),
    benefits: JSON.stringify([
      "Heart health",
      "Brain function",
      "Triglyceride reduction",
      "Anti-inflammatory",
    ]),
    usage: "Take with meals to reduce fishy aftertaste.",
    warnings: "May increase bleeding risk. Fishy burps.",
    interactions: "Blood thinners, blood pressure medications.",
  },
  {
    fdaId: "supplement-003",
    name: "Melatonin Supplement",
    description: "Sleep hormone supplement for insomnia and jet lag.",
    category: "Sleep Supplement",
    ingredients: JSON.stringify(["Melatonin"]),
    benefits: JSON.stringify([
      "Sleep onset",
      "Circadian rhythm adjustment",
      "Jet lag relief",
    ]),
    usage: "Take 30-60 minutes before desired sleep time.",
    warnings: "May cause morning drowsiness. Vivid dreams.",
    interactions:
      "Sedatives, blood thinners, immunosuppressants, diabetes medications.",
  },
  {
    fdaId: "supplement-004",
    name: "Magnesium Supplement",
    description: "Essential mineral supplement for numerous body functions.",
    category: "Mineral Supplement",
    ingredients: JSON.stringify([
      "Magnesium citrate",
      "Magnesium glycinate",
      "Magnesium oxide",
    ]),
    benefits: JSON.stringify([
      "Muscle function",
      "Sleep support",
      "Stress relief",
      "Bone health",
      "Heart rhythm",
    ]),
    usage:
      "Different forms for different purposes. Glycinate for sleep, citrate for absorption.",
    warnings: "GI effects with some forms. Caution in kidney disease.",
    interactions:
      "Antibiotics, bisphosphonates, diuretics, proton pump inhibitors.",
  },
  {
    fdaId: "supplement-005",
    name: "Calcium Supplement",
    description:
      "Mineral supplement for bone health and various body functions.",
    category: "Mineral Supplement",
    ingredients: JSON.stringify(["Calcium carbonate", "Calcium citrate"]),
    benefits: JSON.stringify([
      "Bone health",
      "Osteoporosis prevention",
      "Muscle function",
    ]),
    usage: "Calcium citrate can be taken without food. Carbonate needs food.",
    warnings: "Cardiovascular concerns at high doses. Kidney stones risk.",
    interactions: "Thyroid medications, antibiotics, bisphosphonates, iron.",
  },
  {
    fdaId: "supplement-006",
    name: "Probiotic Supplement",
    description: "Live beneficial bacteria for gut health and immune function.",
    category: "Digestive Supplement",
    ingredients: JSON.stringify([
      "Lactobacillus",
      "Bifidobacterium",
      "Various probiotic strains",
    ]),
    benefits: JSON.stringify([
      "Gut health",
      "Immune support",
      "Digestive comfort",
      "Antibiotic-associated diarrhea prevention",
    ]),
    usage: "Take daily. Some require refrigeration.",
    warnings: "Generally safe. Caution in severely immunocompromised.",
    interactions: "Take probiotics 2 hours away from antibiotics.",
  },
  {
    fdaId: "supplement-007",
    name: "Iron Supplement",
    description: "Mineral supplement for iron deficiency anemia.",
    category: "Mineral Supplement",
    ingredients: JSON.stringify([
      "Ferrous sulfate",
      "Ferrous gluconate",
      "Iron bisglycinate",
    ]),
    benefits: JSON.stringify([
      "Anemia treatment",
      "Energy improvement",
      "Oxygen transport",
    ]),
    usage:
      "Take on empty stomach with vitamin C for absorption. Take with food if GI upset.",
    warnings:
      "GI upset common. Constipation. Toxic in overdose especially for children.",
    interactions:
      "Reduces absorption of thyroid meds, antibiotics, levodopa. Dairy, calcium, antacids reduce iron absorption.",
  },
  {
    fdaId: "supplement-008",
    name: "B-Complex Supplement",
    description: "Combination of B vitamins for energy and metabolism.",
    category: "Vitamin Supplement",
    ingredients: JSON.stringify([
      "B1 Thiamine",
      "B2 Riboflavin",
      "B3 Niacin",
      "B5 Pantothenic acid",
      "B6 Pyridoxine",
      "B7 Biotin",
      "B9 Folate",
      "B12 Cobalamin",
    ]),
    benefits: JSON.stringify([
      "Energy metabolism",
      "Nervous system support",
      "Red blood cell production",
      "Stress support",
    ]),
    usage: "Take in morning with food. Will cause bright yellow urine.",
    warnings: "High-dose niacin causes flushing. High B6 can cause neuropathy.",
    interactions: "Levodopa, phenytoin, fluorouracil.",
  },
  {
    fdaId: "supplement-009",
    name: "CoQ10 Supplement",
    description: "Coenzyme Q10 for energy production and heart health.",
    category: "Nutritional Supplement",
    ingredients: JSON.stringify(["Coenzyme Q10", "Ubiquinone", "Ubiquinol"]),
    benefits: JSON.stringify([
      "Heart health",
      "Energy production",
      "Statin-related muscle pain",
      "Antioxidant",
    ]),
    usage: "Take with fat-containing meal. Ubiquinol form better absorbed.",
    warnings: "Generally well tolerated. May reduce blood pressure.",
    interactions:
      "Blood thinners, blood pressure medications, chemotherapy drugs.",
  },
  {
    fdaId: "supplement-010",
    name: "Glucosamine/Chondroitin Supplement",
    description: "Joint health supplement for osteoarthritis.",
    category: "Joint Supplement",
    ingredients: JSON.stringify(["Glucosamine sulfate", "Chondroitin sulfate"]),
    benefits: JSON.stringify([
      "Joint health",
      "Cartilage support",
      "Osteoarthritis symptom relief",
    ]),
    usage: "Take daily. May take 4-8 weeks for benefits.",
    warnings: "Glucosamine from shellfish may affect those with allergies.",
    interactions: "Warfarin, diabetes medications.",
  },
];
