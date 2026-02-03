// Herbal natural remedies
export const herbalRemedies = [
  {
    name: 'Turmeric (Curcumin)',
    description: 'Golden spice containing curcumin, a powerful anti-inflammatory and antioxidant compound used for centuries in traditional medicine.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Curcumin', 'Curcuminoids', 'Turmeric root extract']),
    benefits: JSON.stringify(['Anti-inflammatory', 'Antioxidant', 'Joint health', 'Digestive support', 'Brain health']),
    usage: 'Take with black pepper (piperine) and fat for enhanced absorption.',
    dosage: '500-2000 mg turmeric extract standardized to 95% curcuminoids daily',
    precautions: 'May interact with blood thinners and diabetes medications. Avoid before surgery. May worsen gallbladder issues.',
    scientificInfo: 'Curcumin inhibits NF-kB, COX-2, and other inflammatory mediators. Its bioavailability is enhanced 2000% with piperine.',
    references: JSON.stringify([
      'Hewlings SJ, Kalman DS. Curcumin: A Review of Its Effects on Human Health. Foods. 2017;6(10):92.',
      'Daily JW, et al. Efficacy of Turmeric Extracts and Curcumin for Alleviating Joint Arthritis Symptoms. J Med Food. 2016;19(8):717-729.'
    ]),
    relatedRemedies: JSON.stringify(['Ginger', 'Boswellia', 'Black Pepper']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Ginger Root',
    description: 'Versatile root with anti-inflammatory, digestive, and anti-nausea properties used worldwide.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Gingerols', 'Shogaols', 'Zingerone']),
    benefits: JSON.stringify(['Nausea relief', 'Digestive aid', 'Anti-inflammatory', 'Pain relief', 'Circulation support']),
    usage: 'Can be consumed fresh, dried, as tea, or in supplement form.',
    dosage: '1-4 grams daily; 250 mg four times daily for nausea',
    precautions: 'May increase bleeding risk. Use caution with blood thinners. May affect blood sugar.',
    scientificInfo: 'Gingerols inhibit prostaglandin and leukotriene synthesis. Ginger acts on 5-HT3 receptors for anti-nausea effects.',
    references: JSON.stringify([
      'Viljoen E, et al. A systematic review and meta-analysis of the effect of ginger on nausea and vomiting. Nutr J. 2014;13:20.',
      'Bartels EM, et al. Efficacy and safety of ginger in osteoarthritis patients. Osteoarthritis Cartilage. 2015;23(1):13-21.'
    ]),
    relatedRemedies: JSON.stringify(['Turmeric', 'Peppermint', 'Chamomile']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Ashwagandha (Withania somnifera)',
    description: 'Premier adaptogenic herb from Ayurvedic medicine for stress resilience, energy, and hormone balance.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Withanolides', 'Withaferin A', 'Withanolide D']),
    benefits: JSON.stringify(['Stress reduction', 'Anxiety relief', 'Energy support', 'Thyroid function', 'Testosterone support', 'Sleep quality']),
    usage: 'Take with meals. KSM-66 and Sensoril are standardized extracts.',
    dosage: '300-600 mg standardized extract daily; up to 1000 mg for specific conditions',
    precautions: 'May affect thyroid hormone levels. Avoid during pregnancy. May have sedative effects.',
    scientificInfo: 'Withanolides modulate cortisol, support GABA signaling, and have neuroprotective effects. Shown to reduce cortisol by 25-30%.',
    references: JSON.stringify([
      'Chandrasekhar K, et al. A prospective, randomized double-blind, placebo-controlled study of ashwagandha root. Indian J Psychol Med. 2012;34(3):255-262.',
      'Lopresti AL, et al. An investigation into the stress-relieving and pharmacological actions of ashwagandha. Medicine (Baltimore). 2019;98(37):e17186.'
    ]),
    relatedRemedies: JSON.stringify(['Rhodiola Rosea', 'Holy Basil', 'Eleuthero']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Valerian Root',
    description: 'Traditional sleep-promoting herb that supports relaxation and healthy sleep patterns.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Valerenic acid', 'Isovaleric acid', 'Valepotriates']),
    benefits: JSON.stringify(['Sleep support', 'Relaxation', 'Anxiety relief', 'Stress reduction']),
    usage: 'Take 30-60 minutes before bedtime. May take 2-4 weeks for full effects.',
    dosage: '300-600 mg standardized extract before bed',
    precautions: 'May cause morning grogginess. Avoid combining with sedatives or alcohol. Discontinue 2 weeks before surgery.',
    scientificInfo: 'Valerenic acid inhibits GABA breakdown and enhances GABA receptor binding, promoting relaxation and sleep.',
    references: JSON.stringify([
      'Bent S, et al. Valerian for sleep: a systematic review and meta-analysis. Am J Med. 2006;119(12):1005-1012.',
      'Fernandez-San-Martin MI, et al. The effectiveness of valerian on insomnia: a meta-analysis. Sleep Med Rev. 2010;14(4):227-236.'
    ]),
    relatedRemedies: JSON.stringify(['Passionflower', 'Lemon Balm', 'Hops']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'St. Johns Wort (Hypericum perforatum)',
    description: 'Well-researched herb for mild to moderate mood support, with centuries of traditional use.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Hypericin', 'Hyperforin', 'Flavonoids']),
    benefits: JSON.stringify(['Mood support', 'Mild depression relief', 'Emotional balance', 'Menopausal mood support']),
    usage: 'Take consistently for 4-6 weeks to assess effectiveness.',
    dosage: '300 mg three times daily standardized to 0.3% hypericin',
    precautions: 'MAJOR drug interactions with antidepressants, birth control, blood thinners, HIV medications. Causes photosensitivity. Do not combine with prescription antidepressants.',
    scientificInfo: 'Hyperforin inhibits reuptake of serotonin, dopamine, norepinephrine, GABA, and glutamate. Comparable to SSRIs for mild-moderate depression.',
    references: JSON.stringify([
      'Linde K, et al. St Johns wort for major depression. Cochrane Database Syst Rev. 2008;(4):CD000448.',
      'Apaydin EA, et al. A systematic review of St. Johns wort for major depressive disorder. Syst Rev. 2016;5(1):148.'
    ]),
    relatedRemedies: JSON.stringify(['SAMe', 'Rhodiola Rosea', 'Saffron']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Echinacea',
    description: 'Popular immune-supporting herb used to reduce duration and severity of colds.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Alkylamides', 'Polysaccharides', 'Caffeic acid derivatives']),
    benefits: JSON.stringify(['Immune support', 'Cold symptom relief', 'Upper respiratory health']),
    usage: 'Most effective when started at first sign of illness. Can be taken as tea, tincture, or capsules.',
    dosage: '300-500 mg three times daily; or 2.5 mL tincture three times daily',
    precautions: 'May cause allergic reactions in those sensitive to ragweed. Not recommended for autoimmune conditions.',
    scientificInfo: 'Echinacea alkylamides modulate immune cell activity and cytokine production. May reduce cold duration by 1-4 days.',
    references: JSON.stringify([
      'Shah SA, et al. Evaluation of echinacea for the prevention and treatment of the common cold. Lancet Infect Dis. 2007;7(7):473-480.',
      'Karsch-Volk M, et al. Echinacea for preventing and treating the common cold. Cochrane Database Syst Rev. 2014;(2):CD000530.'
    ]),
    relatedRemedies: JSON.stringify(['Elderberry', 'Vitamin C', 'Zinc']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Elderberry (Sambucus nigra)',
    description: 'Dark purple berry rich in anthocyanins with potent antiviral and immune-supporting properties.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Anthocyanins', 'Flavonoids', 'Phenolic acids']),
    benefits: JSON.stringify(['Immune support', 'Antiviral activity', 'Cold and flu relief', 'Antioxidant protection']),
    usage: 'Take at first sign of illness. Available as syrup, lozenges, or capsules.',
    dosage: '15 mL syrup four times daily or 175 mg extract twice daily during illness',
    precautions: 'Raw elderberries are toxic; use only properly prepared products. May stimulate immune system; caution in autoimmune conditions.',
    scientificInfo: 'Elderberry anthocyanins inhibit viral entry and replication. Studies show reduced flu duration by 3-4 days.',
    references: JSON.stringify([
      'Hawkins J, et al. Black elderberry supplementation reduces cold duration and symptoms in air-travellers. Nutrients. 2019;11(4):887.',
      'Tiralongo E, et al. Elderberry Supplementation Reduces Cold Duration and Symptoms. Nutrients. 2016;8(4):182.'
    ]),
    relatedRemedies: JSON.stringify(['Echinacea', 'Vitamin C', 'Zinc Lozenges']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Milk Thistle (Silymarin)',
    description: 'Premier liver-supporting herb containing silymarin complex, traditionally used for hepatoprotection.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Silymarin', 'Silybin', 'Silychristin', 'Silydianin']),
    benefits: JSON.stringify(['Liver support', 'Detoxification', 'Antioxidant protection', 'Hepatoprotection']),
    usage: 'Take with meals. Phosphatidylcholine-bound forms (Siliphos) have better absorption.',
    dosage: '200-400 mg silymarin extract two to three times daily',
    precautions: 'May lower blood sugar. May have estrogenic effects. Rare allergic reactions in ragweed-sensitive individuals.',
    scientificInfo: 'Silymarin protects hepatocytes by stabilizing cell membranes, promoting protein synthesis, and scavenging free radicals.',
    references: JSON.stringify([
      'Abenavoli L, et al. Milk thistle in liver diseases: past, present, future. Phytother Res. 2010;24(10):1423-1432.',
      'Saller R, et al. The use of silymarin in the treatment of liver diseases. Drugs. 2001;61(14):2035-2063.'
    ]),
    relatedRemedies: JSON.stringify(['N-Acetyl Cysteine', 'Artichoke Leaf', 'Dandelion Root']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Rhodiola Rosea',
    description: 'Arctic adaptogen that enhances stress resilience, mental performance, and physical endurance.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Rosavins', 'Salidroside', 'Tyrosol']),
    benefits: JSON.stringify(['Stress adaptation', 'Mental performance', 'Physical endurance', 'Fatigue reduction', 'Mood support']),
    usage: 'Take in morning on empty stomach. Avoid evening use due to stimulating effects.',
    dosage: '200-600 mg daily standardized to 3% rosavins and 1% salidroside',
    precautions: 'May be stimulating; avoid in anxiety or bipolar disorder. May interact with antidepressants.',
    scientificInfo: 'Rhodiola modulates cortisol, enhances ATP synthesis, and affects monoamine neurotransmitters including serotonin and dopamine.',
    references: JSON.stringify([
      'Panossian A, et al. Rosenroot (Rhodiola rosea): traditional use, chemical composition, pharmacology and clinical efficacy. Phytomedicine. 2010;17(7):481-493.',
      'Olsson EM, et al. A randomised, double-blind, placebo-controlled, parallel-group study of SHR-5 extract of Rhodiola rosea. Planta Med. 2009;75(2):105-112.'
    ]),
    relatedRemedies: JSON.stringify(['Ashwagandha', 'Eleuthero', 'Ginseng']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Ginkgo Biloba',
    description: 'Ancient tree extract supporting cerebral circulation, cognitive function, and memory.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Ginkgo flavone glycosides', 'Terpene lactones', 'Ginkgolides', 'Bilobalide']),
    benefits: JSON.stringify(['Cognitive function', 'Memory support', 'Circulation', 'Eye health', 'Tinnitus support']),
    usage: 'Take with food. Allow 4-6 weeks for cognitive effects.',
    dosage: '120-240 mg daily standardized to 24% flavone glycosides and 6% terpene lactones',
    precautions: 'May increase bleeding risk. Discontinue before surgery. May interact with blood thinners and anticonvulsants.',
    scientificInfo: 'Ginkgo improves microcirculation, has antioxidant effects, and modulates neurotransmitter systems including acetylcholine.',
    references: JSON.stringify([
      'Weinmann S, et al. Effects of Ginkgo biloba in dementia: systematic review and meta-analysis. BMC Geriatr. 2010;10:14.',
      'Laws KR, et al. Is Ginkgo biloba a cognitive enhancer in healthy individuals? Hum Psychopharmacol. 2012;27(6):527-533.'
    ]),
    relatedRemedies: JSON.stringify(['Bacopa Monnieri', 'Lions Mane', 'Phosphatidylserine']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Saw Palmetto',
    description: 'Berry extract traditionally used for prostate health and urinary symptoms in men.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Fatty acids', 'Phytosterols', 'Flavonoids']),
    benefits: JSON.stringify(['Prostate health', 'Urinary flow support', 'DHT modulation', 'Hair loss support']),
    usage: 'Take with food for better absorption.',
    dosage: '320 mg daily of liposterolic extract',
    precautions: 'May affect PSA levels. Inform urologist of use. May have hormonal effects.',
    scientificInfo: 'Saw palmetto inhibits 5-alpha reductase, reducing conversion of testosterone to DHT. May reduce prostate inflammation.',
    references: JSON.stringify([
      'Tacklind J, et al. Serenoa repens for benign prostatic hyperplasia. Cochrane Database Syst Rev. 2012;12:CD001423.',
      'Suzuki M, et al. Pharmacological effects of saw palmetto extract in the lower urinary tract. Acta Pharmacol Sin. 2009;30(3):271-281.'
    ]),
    relatedRemedies: JSON.stringify(['Pygeum', 'Beta-Sitosterol', 'Nettle Root']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Passionflower (Passiflora incarnata)',
    description: 'Calming herb traditionally used for anxiety, sleep support, and nervous tension.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Chrysin', 'Flavonoids', 'Maltol', 'Indole alkaloids']),
    benefits: JSON.stringify(['Anxiety relief', 'Sleep support', 'Relaxation', 'Nervous system calming']),
    usage: 'Take before bed for sleep or during day for anxiety. Can be taken as tea or extract.',
    dosage: '250-500 mg extract daily or 1-2 cups tea',
    precautions: 'May enhance sedative effects of medications. Avoid combining with sedatives or alcohol.',
    scientificInfo: 'Passionflower increases GABA levels in the brain through GABA-A receptor binding and MAO inhibition.',
    references: JSON.stringify([
      'Akhondzadeh S, et al. Passionflower in the treatment of generalized anxiety: a pilot double-blind randomized controlled trial. J Clin Pharm Ther. 2001;26(5):363-367.',
      'Ngan A, Conduit R. A double-blind, placebo-controlled investigation of passionflower on sleep quality. Phytother Res. 2011;25(8):1153-1159.'
    ]),
    relatedRemedies: JSON.stringify(['Valerian Root', 'Lemon Balm', 'Kava']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Lemon Balm (Melissa officinalis)',
    description: 'Gentle calming herb from the mint family, traditionally used for anxiety, sleep, and digestive comfort.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Rosmarinic acid', 'Flavonoids', 'Terpenes', 'Eugenol']),
    benefits: JSON.stringify(['Calm and relaxation', 'Sleep support', 'Digestive comfort', 'Cognitive function', 'Cold sore relief']),
    usage: 'Can be taken as tea, tincture, or capsules. Topical forms for cold sores.',
    dosage: '300-600 mg extract daily or 1.5-4.5 g dried herb as tea',
    precautions: 'May affect thyroid function at high doses. May enhance sedative effects of medications.',
    scientificInfo: 'Lemon balm inhibits GABA transaminase, increasing GABA availability. Also has mild antiviral activity against herpes simplex.',
    references: JSON.stringify([
      'Cases J, et al. Pilot trial of Melissa officinalis L. leaf extract in the treatment of volunteers suffering from mild-to-moderate anxiety. Med J Nutrition Metab. 2011;4(3):211-218.',
      'Kennedy DO, et al. Modulation of mood and cognitive performance following acute administration of Melissa officinalis. Pharmacol Biochem Behav. 2002;72(4):953-964.'
    ]),
    relatedRemedies: JSON.stringify(['Passionflower', 'Chamomile', 'Valerian Root']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Chamomile',
    description: 'Gentle, widely-used herb for relaxation, digestive comfort, and sleep support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Apigenin', 'Bisabolol', 'Chamazulene', 'Flavonoids']),
    benefits: JSON.stringify(['Relaxation', 'Sleep support', 'Digestive comfort', 'Anxiety relief', 'Skin soothing']),
    usage: 'Commonly consumed as tea. Also available as extract or topical preparations.',
    dosage: '1-4 cups tea daily or 220-1100 mg extract',
    precautions: 'May cause allergic reactions in those sensitive to ragweed family. May enhance effects of sedatives.',
    scientificInfo: 'Apigenin in chamomile binds to GABA-A receptors and benzodiazepine receptors, producing calming effects.',
    references: JSON.stringify([
      'Srivastava JK, et al. Chamomile: A herbal medicine of the past with bright future. Mol Med Rep. 2010;3(6):895-901.',
      'Amsterdam JD, et al. Chamomile (Matricaria recutita) may provide antidepressant activity in anxious, depressed humans. Altern Ther Health Med. 2012;18(5):44-49.'
    ]),
    relatedRemedies: JSON.stringify(['Lemon Balm', 'Lavender', 'Passionflower']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Peppermint',
    description: 'Refreshing herb with digestive-soothing and headache-relieving properties.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Menthol', 'Menthone', 'Rosmarinic acid']),
    benefits: JSON.stringify(['Digestive support', 'IBS symptom relief', 'Headache relief', 'Mental clarity', 'Respiratory support']),
    usage: 'Tea, enteric-coated capsules for IBS, or topical oil for headaches.',
    dosage: '0.2-0.4 mL enteric-coated oil capsules three times daily for IBS',
    precautions: 'May worsen GERD symptoms. Enteric coating essential for IBS use. Topical oil can cause skin irritation.',
    scientificInfo: 'Menthol activates cold receptors and relaxes smooth muscle. Enteric-coated oil reduces intestinal spasms in IBS.',
    references: JSON.stringify([
      'Khanna R, et al. Peppermint oil for the treatment of irritable bowel syndrome. J Clin Gastroenterol. 2014;48(6):505-512.',
      'Gobel H, et al. Effectiveness of peppermint oil and paracetamol in tension-type headache. Nervenarzt. 2016;87(12):1355.'
    ]),
    relatedRemedies: JSON.stringify(['Ginger', 'Fennel', 'Caraway']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Feverfew',
    description: 'Traditional herb used for migraine prevention and headache relief.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Parthenolide', 'Sesquiterpene lactones', 'Flavonoids']),
    benefits: JSON.stringify(['Migraine prevention', 'Headache relief', 'Anti-inflammatory']),
    usage: 'Take daily for prevention. May take 4-6 weeks for full effect.',
    dosage: '50-150 mg daily standardized to 0.2-0.4% parthenolide',
    precautions: 'Do not use during pregnancy. May cause mouth ulcers with fresh leaf use. Gradual discontinuation recommended.',
    scientificInfo: 'Parthenolide inhibits serotonin release from platelets and inflammatory mediators, potentially preventing migraine triggers.',
    references: JSON.stringify([
      'Pittler MH, Ernst E. Feverfew for preventing migraine. Cochrane Database Syst Rev. 2004;(1):CD002286.',
      'Wider B, et al. Feverfew for preventing migraine. Cochrane Database Syst Rev. 2015;(4):CD002286.'
    ]),
    relatedRemedies: JSON.stringify(['Butterbur', 'Magnesium', 'Riboflavin']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Butterbur (Petasites hybridus)',
    description: 'European herb with strong evidence for migraine prevention and seasonal allergy relief.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Petasin', 'Isopetasin']),
    benefits: JSON.stringify(['Migraine prevention', 'Allergy relief', 'Anti-inflammatory']),
    usage: 'Use only PA-free (pyrrolizidine alkaloid-free) standardized extracts.',
    dosage: '50-75 mg PA-free extract twice daily',
    precautions: 'ONLY use PA-free products; pyrrolizidine alkaloids are hepatotoxic. Avoid during pregnancy.',
    scientificInfo: 'Petasin and isopetasin inhibit leukotriene synthesis and have spasmolytic effects on smooth muscle.',
    references: JSON.stringify([
      'Lipton RB, et al. Petasites hybridus root (butterbur) is an effective preventive treatment for migraine. Neurology. 2004;63(12):2240-2244.',
      'Schapowal A. Randomised controlled trial of butterbur and cetirizine for treating seasonal allergic rhinitis. BMJ. 2002;324(7330):144-146.'
    ]),
    relatedRemedies: JSON.stringify(['Feverfew', 'Quercetin', 'Stinging Nettle']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Black Cohosh',
    description: 'Native American herb traditionally used for menopausal symptoms and womens health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Triterpene glycosides', 'Actein', 'Cimicifugoside']),
    benefits: JSON.stringify(['Hot flash relief', 'Menopausal symptom support', 'Mood balance', 'Sleep improvement']),
    usage: 'Take consistently for 4-8 weeks to assess effectiveness.',
    dosage: '20-40 mg standardized extract twice daily',
    precautions: 'Rare liver toxicity reported; discontinue if signs of liver problems. Avoid with hormone-sensitive conditions.',
    scientificInfo: 'Mechanism not fully understood but does not appear to have significant estrogenic activity. May affect serotonin receptors.',
    references: JSON.stringify([
      'Leach MJ, Moore V. Black cohosh (Cimicifuga spp.) for menopausal symptoms. Cochrane Database Syst Rev. 2012;(9):CD007244.',
      'Shams T, et al. Efficacy of black cohosh-containing preparations on menopausal symptoms. Altern Ther Health Med. 2010;16(1):36-44.'
    ]),
    relatedRemedies: JSON.stringify(['Red Clover', 'Dong Quai', 'Maca Root']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Hawthorn Berry',
    description: 'Traditional heart tonic herb supporting cardiovascular function and blood pressure.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Oligomeric proanthocyanidins', 'Flavonoids', 'Vitexin']),
    benefits: JSON.stringify(['Heart health', 'Blood pressure support', 'Circulation', 'Antioxidant protection']),
    usage: 'Take with food. May take several weeks for full effects.',
    dosage: '160-900 mg extract daily standardized to flavonoids or OPCs',
    precautions: 'May enhance effects of heart medications. Consult cardiologist if on cardiac drugs.',
    scientificInfo: 'Hawthorn increases coronary blood flow, has positive inotropic effects, and provides antioxidant protection to cardiovascular tissue.',
    references: JSON.stringify([
      'Pittler MH, et al. Hawthorn extract for treating chronic heart failure. Cochrane Database Syst Rev. 2008;(1):CD005312.',
      'Wang J, et al. Hawthorn extract for patients with chronic heart failure. Am J Med. 2003;114(8):650-656.'
    ]),
    relatedRemedies: JSON.stringify(['CoQ10', 'Omega-3 Fatty Acids', 'Garlic']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Garlic (Allium sativum)',
    description: 'Pungent culinary herb with cardiovascular, immune, and antimicrobial benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Allicin', 'S-allyl cysteine', 'Diallyl sulfides']),
    benefits: JSON.stringify(['Blood pressure support', 'Cholesterol support', 'Immune function', 'Antimicrobial', 'Antioxidant']),
    usage: 'Fresh garlic, aged garlic extract, or odorless capsules. Crushing activates allicin.',
    dosage: '600-1200 mg aged garlic extract daily or 4 g fresh garlic',
    precautions: 'May increase bleeding risk. Discontinue before surgery. May interact with HIV medications.',
    scientificInfo: 'Allicin and its derivatives inhibit cholesterol synthesis, relax blood vessels, and have broad antimicrobial activity.',
    references: JSON.stringify([
      'Ried K, et al. Effect of garlic on blood pressure: a systematic review and meta-analysis. BMC Cardiovasc Disord. 2008;8:13.',
      'Ried K, et al. Garlic lowers blood pressure in hypertensive individuals. Eur J Clin Nutr. 2014;68(2):155-161.'
    ]),
    relatedRemedies: JSON.stringify(['Olive Leaf', 'Berberine', 'Omega-3 Fatty Acids']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Holy Basil (Tulsi)',
    description: 'Sacred adaptogenic herb from Ayurveda supporting stress resilience and overall vitality.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Eugenol', 'Ursolic acid', 'Rosmarinic acid', 'Ocimumosides']),
    benefits: JSON.stringify(['Stress adaptation', 'Blood sugar support', 'Immune modulation', 'Respiratory health', 'Cognitive support']),
    usage: 'Can be taken as tea, tincture, or capsules.',
    dosage: '300-600 mg extract daily or 2-3 cups tea',
    precautions: 'May affect blood clotting. May lower blood sugar. Avoid before surgery.',
    scientificInfo: 'Tulsi modulates cortisol, has anti-inflammatory effects, and supports healthy blood glucose metabolism.',
    references: JSON.stringify([
      'Cohen MM. Tulsi - Ocimum sanctum: A herb for all reasons. J Ayurveda Integr Med. 2014;5(4):251-259.',
      'Jamshidi N, Cohen MM. The Clinical Efficacy and Safety of Tulsi in Humans: A Systematic Review. Evid Based Complement Alternat Med. 2017;2017:9217567.'
    ]),
    relatedRemedies: JSON.stringify(['Ashwagandha', 'Rhodiola Rosea', 'Gotu Kola']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Boswellia (Indian Frankincense)',
    description: 'Resin extract with powerful anti-inflammatory properties, especially for joint health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Boswellic acids', 'AKBA', 'Beta-boswellic acid']),
    benefits: JSON.stringify(['Joint health', 'Anti-inflammatory', 'Respiratory support', 'Gut health']),
    usage: 'Take with food. Look for AKBA-enriched extracts.',
    dosage: '300-500 mg three times daily standardized to boswellic acids',
    precautions: 'Generally well tolerated. May cause GI upset in some individuals.',
    scientificInfo: 'Boswellic acids inhibit 5-lipoxygenase, reducing inflammatory leukotrienes. AKBA is the most potent fraction.',
    references: JSON.stringify([
      'Yu G, et al. Effectiveness of Boswellia and Boswellia extract for osteoarthritis patients. BMC Complement Med Ther. 2020;20(1):225.',
      'Sengupta K, et al. A double-blind, randomized, placebo controlled study of the efficacy of 5-Loxin for treatment of osteoarthritis. Arthritis Res Ther. 2008;10(4):R85.'
    ]),
    relatedRemedies: JSON.stringify(['Turmeric', 'Ginger', 'Devils Claw']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Devils Claw',
    description: 'African herb traditionally used for joint pain, back pain, and inflammation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Harpagoside', 'Harpagide', 'Procumbide']),
    benefits: JSON.stringify(['Joint pain relief', 'Back pain support', 'Anti-inflammatory', 'Digestive support']),
    usage: 'Take with food. May take several weeks for full effect.',
    dosage: '600-1200 mg extract daily standardized to harpagosides',
    precautions: 'Avoid with peptic ulcers. May affect heart rate and blood pressure medications.',
    scientificInfo: 'Harpagoside inhibits COX-2 and iNOS expression, reducing inflammatory mediator production.',
    references: JSON.stringify([
      'Gagnier JJ, et al. Harpgophytum procumbens for osteoarthritis and low back pain. BMC Complement Altern Med. 2004;4:13.',
      'Chrubasik S, et al. A randomized double-blind pilot study comparing Doloteffin and Vioxx. Rheumatology. 2003;42(1):141-148.'
    ]),
    relatedRemedies: JSON.stringify(['Boswellia', 'White Willow Bark', 'Turmeric']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'White Willow Bark',
    description: 'Natural source of salicin, the precursor to aspirin, used for pain and inflammation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Salicin', 'Salicortin', 'Flavonoids', 'Tannins']),
    benefits: JSON.stringify(['Pain relief', 'Anti-inflammatory', 'Fever reduction', 'Headache relief']),
    usage: 'Take with food. Slower onset but longer duration than aspirin.',
    dosage: '240 mg salicin daily in divided doses',
    precautions: 'Avoid if allergic to aspirin. Not for children due to Reye syndrome risk. May increase bleeding.',
    scientificInfo: 'Salicin is converted to salicylic acid in the body, inhibiting prostaglandin synthesis. Gentler on stomach than aspirin.',
    references: JSON.stringify([
      'Vlachojannis JE, et al. A systematic review on the effectiveness of willow bark for musculoskeletal pain. Phytother Res. 2009;23(7):897-900.',
      'Shara M, Stohs SJ. Efficacy and Safety of White Willow Bark (Salix alba) Extracts. Phytother Res. 2015;29(8):1112-1116.'
    ]),
    relatedRemedies: JSON.stringify(['Devils Claw', 'Boswellia', 'Turmeric']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Kava (Piper methysticum)',
    description: 'Pacific Island herb with potent anxiolytic effects, traditionally used for relaxation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Kavalactones', 'Kavain', 'Dihydrokavain', 'Methysticin']),
    benefits: JSON.stringify(['Anxiety relief', 'Relaxation', 'Sleep support', 'Muscle relaxation']),
    usage: 'Take in evening. Use water-extracted products from noble kava varieties.',
    dosage: '120-240 mg kavalactones daily',
    precautions: 'Potential liver toxicity with long-term use or poor quality products. Avoid with alcohol. Not for those with liver disease.',
    scientificInfo: 'Kavalactones modulate GABA-A receptors, voltage-gated sodium and calcium channels, and monoamine uptake.',
    references: JSON.stringify([
      'Pittler MH, Ernst E. Kava extract versus placebo for treating anxiety. Cochrane Database Syst Rev. 2003;(1):CD003383.',
      'Sarris J, et al. Kava in the treatment of generalized anxiety disorder. J Clin Psychopharmacol. 2013;33(5):643-648.'
    ]),
    relatedRemedies: JSON.stringify(['Passionflower', 'Valerian Root', 'L-Theanine']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Olive Leaf Extract',
    description: 'Mediterranean herb rich in oleuropein with antimicrobial and cardiovascular benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Oleuropein', 'Hydroxytyrosol', 'Oleocanthal']),
    benefits: JSON.stringify(['Immune support', 'Antimicrobial', 'Blood pressure support', 'Antioxidant', 'Blood sugar support']),
    usage: 'Take with or without food.',
    dosage: '500-1000 mg extract daily standardized to 15-20% oleuropein',
    precautions: 'May enhance effects of blood pressure medications. May cause die-off reactions initially.',
    scientificInfo: 'Oleuropein has broad antimicrobial activity and inhibits ACE, contributing to blood pressure reduction.',
    references: JSON.stringify([
      'Susalit E, et al. Olive (Olea europaea) leaf extract effective in patients with stage-1 hypertension. Phytomedicine. 2011;18(4):251-258.',
      'Lockyer S, et al. Impact of phenolic-rich olive leaf extract on blood pressure, plasma lipids and inflammatory markers. Eur J Nutr. 2017;56(4):1421-1432.'
    ]),
    relatedRemedies: JSON.stringify(['Garlic', 'Hawthorn', 'Hibiscus']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Stinging Nettle (Urtica dioica)',
    description: 'Versatile herb used for allergies, prostate health, and joint support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Lectins', 'Lignans', 'Polysaccharides', 'Sterols']),
    benefits: JSON.stringify(['Allergy relief', 'Prostate support', 'Joint health', 'Urinary function']),
    usage: 'Leaf extract for allergies; root extract for prostate.',
    dosage: '300-600 mg leaf extract for allergies; 120-360 mg root extract for prostate',
    precautions: 'May affect blood sugar and blood pressure. May interact with diabetes and blood pressure medications.',
    scientificInfo: 'Nettle leaf inhibits inflammatory cytokines and histamine release. Root extract affects hormone binding and prostate cell proliferation.',
    references: JSON.stringify([
      'Roschek B Jr, et al. Nettle extract (Urtica dioica) affects key receptors and enzymes associated with allergic rhinitis. Phytother Res. 2009;23(7):920-926.',
      'Safarinejad MR. Urtica dioica for treatment of benign prostatic hyperplasia. J Herb Pharmacother. 2005;5(4):1-11.'
    ]),
    relatedRemedies: JSON.stringify(['Quercetin', 'Butterbur', 'Saw Palmetto']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Dandelion Root',
    description: 'Common weed with powerful digestive and liver-supporting properties.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Inulin', 'Taraxacin', 'Sesquiterpene lactones', 'Phenolic acids']),
    benefits: JSON.stringify(['Liver support', 'Digestive aid', 'Mild diuretic', 'Blood sugar support', 'Prebiotic']),
    usage: 'Root for liver support; leaf for diuretic effect. Can be taken as tea, tincture, or capsules.',
    dosage: '2-8 g dried root daily or 250-500 mg extract',
    precautions: 'May interact with diabetes medications and diuretics. Avoid with bile duct obstruction.',
    scientificInfo: 'Dandelion stimulates bile production and flow. Inulin content supports beneficial gut bacteria.',
    references: JSON.stringify([
      'Clare BA, et al. The diuretic effect in human subjects of an extract of Taraxacum officinale folium. J Altern Complement Med. 2009;15(8):929-934.',
      'Yousefi A, et al. Dandelion as a liver tonic. J Pharm Pharmacol. 2018;70(10):1250-1261.'
    ]),
    relatedRemedies: JSON.stringify(['Milk Thistle', 'Artichoke Leaf', 'Burdock Root']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Artichoke Leaf Extract',
    description: 'Mediterranean herb supporting liver function, digestion, and healthy cholesterol levels.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Cynarin', 'Chlorogenic acid', 'Luteolin', 'Caffeoylquinic acids']),
    benefits: JSON.stringify(['Liver support', 'Digestive comfort', 'Cholesterol support', 'Bile production']),
    usage: 'Take before meals for digestive support.',
    dosage: '300-640 mg extract two to three times daily',
    precautions: 'Avoid with bile duct obstruction or gallstones. May cause allergic reactions in those sensitive to Asteraceae family.',
    scientificInfo: 'Cynarin stimulates bile production. Chlorogenic acid and other compounds have hepatoprotective and lipid-lowering effects.',
    references: JSON.stringify([
      'Wider B, et al. Artichoke leaf extract for treating hypercholesterolaemia. Cochrane Database Syst Rev. 2013;(3):CD003335.',
      'Ben Salem M, et al. Pharmacological Studies of Artichoke Leaf Extract and Their Health Benefits. Plant Foods Hum Nutr. 2015;70(4):441-453.'
    ]),
    relatedRemedies: JSON.stringify(['Milk Thistle', 'Dandelion Root', 'Berberine']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Saffron (Crocus sativus)',
    description: 'Precious spice with mood-supporting properties and antioxidant benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Crocin', 'Safranal', 'Picrocrocin', 'Carotenoids']),
    benefits: JSON.stringify(['Mood support', 'PMS relief', 'Appetite modulation', 'Eye health', 'Antioxidant']),
    usage: 'Take standardized extract for consistent dosing.',
    dosage: '15-30 mg standardized extract daily',
    precautions: 'Expensive; ensure quality sourcing. High doses may be toxic. Avoid during pregnancy.',
    scientificInfo: 'Saffron constituents modulate serotonin reuptake and have antioxidant effects. Comparable to some antidepressants in trials.',
    references: JSON.stringify([
      'Hausenblas HA, et al. Saffron (Crocus sativus L.) and major depressive disorder: a meta-analysis. J Integr Med. 2013;11(6):377-383.',
      'Agha-Hosseini M, et al. Crocus sativus L. (saffron) in the treatment of premenstrual syndrome. BJOG. 2008;115(4):515-519.'
    ]),
    relatedRemedies: JSON.stringify(['St. Johns Wort', 'SAMe', 'Rhodiola Rosea']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Licorice Root (Glycyrrhiza glabra)',
    description: 'Sweet root with adrenal support, digestive, and respiratory benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Glycyrrhizin', 'Glabridin', 'Liquiritin', 'Flavonoids']),
    benefits: JSON.stringify(['Adrenal support', 'Digestive comfort', 'Respiratory health', 'Skin health']),
    usage: 'Use DGL (deglycyrrhizinated) form for digestive support to avoid blood pressure effects.',
    dosage: '250-500 mg DGL before meals; whole root short-term only',
    precautions: 'Glycyrrhizin can raise blood pressure and lower potassium. Use DGL form for long-term use. Avoid with hypertension.',
    scientificInfo: 'Glycyrrhizin inhibits cortisol breakdown, extending its action. DGL retains digestive benefits without affecting blood pressure.',
    references: JSON.stringify([
      'Nazari S, et al. A review of the role of licorice in gastrointestinal diseases. J Complement Integr Med. 2018;15(4).',
      'Armanini D, et al. Licorice consumption and serum testosterone in healthy man. Exp Clin Endocrinol Diabetes. 2003;111(6):341-343.'
    ]),
    relatedRemedies: JSON.stringify(['Slippery Elm', 'Marshmallow Root', 'Aloe Vera']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Slippery Elm',
    description: 'Soothing demulcent herb for digestive and respiratory tract irritation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Mucilage', 'Tannins', 'Flavonoids']),
    benefits: JSON.stringify(['Digestive comfort', 'Throat soothing', 'Gut healing', 'Cough relief']),
    usage: 'Mix powder with water to form gel, or take lozenges for throat.',
    dosage: '400-500 mg three times daily or as needed for throat',
    precautions: 'May slow absorption of medications. Take separately from other supplements and medications.',
    scientificInfo: 'Mucilage forms a protective coating over mucous membranes, reducing irritation and promoting healing.',
    references: JSON.stringify([
      'Langmead L, et al. Antioxidant effects of herbal therapies used by patients with inflammatory bowel disease. Aliment Pharmacol Ther. 2002;16(2):197-205.',
      'Watts CR, Rousseau B. Slippery elm, its biochemistry, and use as a complementary and alternative treatment for laryngeal irritation. J Investig Med. 2012;60(7):1045-1049.'
    ]),
    relatedRemedies: JSON.stringify(['Marshmallow Root', 'DGL Licorice', 'Aloe Vera']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Marshmallow Root',
    description: 'Mucilaginous herb soothing to digestive and respiratory mucous membranes.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Mucilage', 'Pectin', 'Flavonoids', 'Phenolic acids']),
    benefits: JSON.stringify(['Digestive soothing', 'Respiratory support', 'Skin healing', 'Cough relief']),
    usage: 'Cold infusion extracts more mucilage. Also available as capsules or syrup.',
    dosage: '2-5 g dried root daily or 300-500 mg extract',
    precautions: 'May delay absorption of medications. Take separately from other supplements.',
    scientificInfo: 'Mucilage content provides a protective film over irritated tissues, supporting natural healing.',
    references: JSON.stringify([
      'Deters A, et al. Aqueous extracts and polysaccharides from Marshmallow roots: cellular internalisation and stimulation of cell physiology. J Ethnopharmacol. 2010;127(1):62-69.',
      'Benbassat N, et al. Influence of extraction solvent on antioxidant activity of Althaea officinalis L. root extracts. Cent Eur J Biol. 2014;9(2):182-188.'
    ]),
    relatedRemedies: JSON.stringify(['Slippery Elm', 'DGL Licorice', 'Chamomile']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Berberine',
    description: 'Powerful plant alkaloid with metabolic, cardiovascular, and antimicrobial benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Berberine hydrochloride']),
    benefits: JSON.stringify(['Blood sugar support', 'Cholesterol support', 'Gut health', 'Antimicrobial', 'Weight management']),
    usage: 'Take with meals, divided into 2-3 doses daily.',
    dosage: '500 mg two to three times daily with meals',
    precautions: 'May interact with many medications including metformin, antibiotics. May cause GI upset initially.',
    scientificInfo: 'Berberine activates AMPK, improving glucose and lipid metabolism. Comparable to metformin in some studies.',
    references: JSON.stringify([
      'Yin J, et al. Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism. 2008;57(5):712-717.',
      'Dong H, et al. Berberine in the treatment of type 2 diabetes mellitus. Evid Based Complement Alternat Med. 2012;2012:591654.'
    ]),
    relatedRemedies: JSON.stringify(['Chromium', 'Alpha-Lipoic Acid', 'Cinnamon']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Cinnamon (Ceylon)',
    description: 'Aromatic spice supporting healthy blood sugar and metabolic function.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Cinnamaldehyde', 'Proanthocyanidins', 'Eugenol']),
    benefits: JSON.stringify(['Blood sugar support', 'Insulin sensitivity', 'Antioxidant', 'Antimicrobial']),
    usage: 'Use Ceylon cinnamon (true cinnamon) to avoid coumarin content of cassia cinnamon.',
    dosage: '1-6 g daily or 120-500 mg extract',
    precautions: 'Cassia cinnamon contains coumarin which can affect liver at high doses. Choose Ceylon variety.',
    scientificInfo: 'Cinnamon improves insulin receptor sensitivity and inhibits digestive enzymes, moderating glucose absorption.',
    references: JSON.stringify([
      'Allen RW, et al. Cinnamon use in type 2 diabetes: an updated systematic review and meta-analysis. Ann Fam Med. 2013;11(5):452-459.',
      'Davis PA, Yokoyama W. Cinnamon intake lowers fasting blood glucose. J Med Food. 2011;14(9):884-889.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Chromium', 'Alpha-Lipoic Acid']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Fenugreek',
    description: 'Seed with benefits for blood sugar, testosterone, and lactation support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['4-hydroxyisoleucine', 'Saponins', 'Galactomannan fiber']),
    benefits: JSON.stringify(['Blood sugar support', 'Testosterone support', 'Lactation support', 'Digestive health']),
    usage: 'Take with meals. Seeds can be soaked and consumed whole.',
    dosage: '500-600 mg extract twice daily or 2-5 g seeds',
    precautions: 'May cause maple syrup odor in urine and sweat. May affect blood sugar medications.',
    scientificInfo: '4-hydroxyisoleucine stimulates insulin secretion. Galactomannan fiber slows carbohydrate absorption.',
    references: JSON.stringify([
      'Neelakantan N, et al. Effect of fenugreek intake on glycemia: a meta-analysis. J Ethnopharmacol. 2014;153(3):697-704.',
      'Steels E, et al. Physiological aspects of male libido enhanced by standardized Trigonella foenum-graecum extract. Phytother Res. 2011;25(9):1294-1300.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Cinnamon', 'Gymnema']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Gymnema Sylvestre',
    description: 'Ayurvedic herb known as sugar destroyer for its ability to reduce sugar cravings and support blood sugar.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Gymnemic acids', 'Saponins', 'Flavonoids']),
    benefits: JSON.stringify(['Blood sugar support', 'Sugar craving reduction', 'Pancreatic support']),
    usage: 'Take before meals. Chewing leaves temporarily blocks sweet taste.',
    dosage: '400-600 mg extract daily standardized to 25% gymnemic acids',
    precautions: 'May significantly affect blood sugar. Monitor closely if diabetic. May interact with diabetes medications.',
    scientificInfo: 'Gymnemic acids block sugar receptors on taste buds and intestinal glucose absorption. May support beta cell regeneration.',
    references: JSON.stringify([
      'Khan V, et al. A pharmacological appraisal of Gymnema sylvestre. J Pharm Res. 2016;10:33-39.',
      'Pothuraju R, et al. A systematic review of Gymnema sylvestre in obesity and diabetes management. J Sci Food Agric. 2014;94(5):834-840.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Bitter Melon', 'Cinnamon']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Bitter Melon (Momordica charantia)',
    description: 'Tropical fruit with potent blood sugar-lowering properties used in traditional medicine.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Charantin', 'Vicine', 'Polypeptide-p', 'Momordicin']),
    benefits: JSON.stringify(['Blood sugar support', 'Insulin sensitivity', 'Antioxidant', 'Lipid support']),
    usage: 'Can be consumed as fruit, juice, or extract.',
    dosage: '500-1000 mg extract daily or 50-100 mL juice',
    precautions: 'May cause hypoglycemia especially with diabetes medications. Not for use during pregnancy.',
    scientificInfo: 'Contains insulin-like compounds and activates AMPK. Multiple mechanisms contribute to glucose-lowering effects.',
    references: JSON.stringify([
      'Ooi CP, et al. Momordica charantia for type 2 diabetes mellitus. Cochrane Database Syst Rev. 2012;(8):CD007845.',
      'Joseph B, Jini D. Antidiabetic effects of Momordica charantia and its medicinal potency. Asian Pac J Trop Dis. 2013;3(2):93-102.'
    ]),
    relatedRemedies: JSON.stringify(['Gymnema', 'Berberine', 'Fenugreek']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Hibiscus',
    description: 'Colorful flower tea with blood pressure and antioxidant benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Anthocyanins', 'Organic acids', 'Polyphenols']),
    benefits: JSON.stringify(['Blood pressure support', 'Antioxidant', 'Cholesterol support', 'Liver protection']),
    usage: 'Drink as tea or take as extract. Tart flavor can be sweetened.',
    dosage: '1.5-3 g dried flowers as tea 1-3 times daily or 250-500 mg extract',
    precautions: 'May lower blood pressure. May interact with blood pressure and diabetes medications.',
    scientificInfo: 'Anthocyanins have ACE-inhibitory activity. Studies show significant blood pressure reduction comparable to some medications.',
    references: JSON.stringify([
      'Hopkins AL, et al. Hibiscus sabdariffa L. in the treatment of hypertension and hyperlipidemia. J Ethnopharmacol. 2013;150(2):453-461.',
      'Serban C, et al. Effect of sour tea (Hibiscus sabdariffa L.) on arterial hypertension. J Hypertens. 2015;33(6):1119-1127.'
    ]),
    relatedRemedies: JSON.stringify(['Hawthorn', 'Olive Leaf', 'Garlic']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Triphala',
    description: 'Classic Ayurvedic formula of three fruits for digestive health and detoxification.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Amalaki', 'Bibhitaki', 'Haritaki', 'Amla', 'Tannins', 'Gallic acid']),
    benefits: JSON.stringify(['Digestive regularity', 'Detoxification', 'Antioxidant', 'Gut health', 'Eye health']),
    usage: 'Take before bed for bowel regularity or between meals for other benefits.',
    dosage: '500-1000 mg twice daily',
    precautions: 'May cause loose stools initially. Start with lower dose. Not for use during pregnancy.',
    scientificInfo: 'Triphala has prebiotic effects, promotes healthy gut flora, and has gentle laxative action from tannins and anthraquinones.',
    references: JSON.stringify([
      'Peterson CT, et al. Therapeutic Uses of Triphala in Ayurvedic Medicine. J Altern Complement Med. 2017;23(8):607-614.',
      'Belapurkar P, et al. Immunomodulatory effects of Triphala and its individual constituents. Indian J Pharm Sci. 2014;76(6):467-475.'
    ]),
    relatedRemedies: JSON.stringify(['Psyllium Husk', 'Aloe Vera', 'Ginger']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Andrographis',
    description: 'Bitter herb known as King of Bitters with immune-modulating and cold-fighting properties.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Andrographolide', 'Neoandrographolide', 'Deoxyandrographolide']),
    benefits: JSON.stringify(['Immune support', 'Cold symptom relief', 'Upper respiratory health', 'Anti-inflammatory']),
    usage: 'Take at first sign of cold symptoms. Not for long-term use.',
    dosage: '400 mg three times daily standardized to andrographolides during acute illness',
    precautions: 'May affect fertility. Not for use during pregnancy or when trying to conceive. May interact with immunosuppressants.',
    scientificInfo: 'Andrographolide inhibits NF-kB and has antiviral activity. Clinical trials show reduced cold severity and duration.',
    references: JSON.stringify([
      'Coon JT, Ernst E. Andrographis paniculata in the treatment of upper respiratory tract infections. Planta Med. 2004;70(4):293-298.',
      'Saxena RC, et al. A randomized double-blind placebo-controlled clinical evaluation of Andrographis paniculata fixed combination. J Ayurveda Integr Med. 2010;1(4):248-254.'
    ]),
    relatedRemedies: JSON.stringify(['Echinacea', 'Elderberry', 'Astragalus']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Astragalus (Huang Qi)',
    description: 'Premier Qi-tonifying herb in Traditional Chinese Medicine for immune and vitality support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Astragalosides', 'Polysaccharides', 'Flavonoids', 'Saponins']),
    benefits: JSON.stringify(['Immune modulation', 'Energy support', 'Cardiovascular health', 'Kidney support']),
    usage: 'Can be taken long-term for immune support. Traditionally simmered in soups.',
    dosage: '250-500 mg extract two to three times daily or 9-30 g dried root in decoction',
    precautions: 'May interact with immunosuppressants. Use caution in autoimmune conditions.',
    scientificInfo: 'Astragalosides stimulate immune cell activity and have cardioprotective effects. May support telomere length.',
    references: JSON.stringify([
      'Block KI, Mead MN. Immune system effects of Astragalus: review of clinical trials. Integr Cancer Ther. 2003;2(3):247-267.',
      'Liu P, et al. Anti-aging effects of Astragalus membranaceus. Aging Dis. 2017;8(6):868-886.'
    ]),
    relatedRemedies: JSON.stringify(['Reishi Mushroom', 'Eleuthero', 'Ginseng']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Oregano Oil',
    description: 'Potent antimicrobial essential oil with broad-spectrum activity against pathogens.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Carvacrol', 'Thymol', 'Rosmarinic acid']),
    benefits: JSON.stringify(['Antimicrobial', 'Antifungal', 'Immune support', 'Digestive health']),
    usage: 'Use enteric-coated capsules or dilute in carrier oil. Not for topical use undiluted.',
    dosage: '50-200 mg carvacrol in enteric-coated form daily short-term',
    precautions: 'Very potent; can irritate mucous membranes. Not for long-term use. May affect iron absorption.',
    scientificInfo: 'Carvacrol and thymol disrupt bacterial cell membranes. Effective against many bacteria, fungi, and parasites.',
    references: JSON.stringify([
      'Force M, et al. Inhibition of enteric parasites by emulsified oil of oregano in vivo. Phytother Res. 2000;14(3):213-214.',
      'Singletary K. Oregano: overview of the literature on health benefits. Nutr Today. 2010;45(3):129-138.'
    ]),
    relatedRemedies: JSON.stringify(['Garlic', 'Olive Leaf', 'Caprylic Acid']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Lavender',
    description: 'Calming aromatic herb supporting relaxation, sleep, and mood balance.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Linalool', 'Linalyl acetate', 'Lavandulol']),
    benefits: JSON.stringify(['Relaxation', 'Sleep support', 'Anxiety relief', 'Mood balance']),
    usage: 'Inhaled as aromatherapy, taken orally as Silexan capsules, or used topically diluted.',
    dosage: '80-160 mg Silexan (standardized oral lavender) daily or aromatherapy as needed',
    precautions: 'Oral lavender may cause GI upset. May enhance effects of sedatives.',
    scientificInfo: 'Linalool modulates GABA receptors and serotonin transporters. Silexan has shown efficacy comparable to benzodiazepines.',
    references: JSON.stringify([
      'Kasper S, et al. Silexan, an orally administered Lavandula oil preparation, is effective in the treatment of subsyndromal anxiety disorder. Int Clin Psychopharmacol. 2010;25(5):277-287.',
      'Woelk H, Schlafke S. A multi-center, double-blind, randomised study of the Lavender oil preparation Silexan. Phytomedicine. 2010;17(2):94-99.'
    ]),
    relatedRemedies: JSON.stringify(['Chamomile', 'Passionflower', 'Lemon Balm']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Maca Root',
    description: 'Peruvian adaptogen supporting energy, libido, and hormone balance.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Macamides', 'Macaenes', 'Glucosinolates']),
    benefits: JSON.stringify(['Energy support', 'Libido enhancement', 'Hormone balance', 'Fertility support', 'Menopausal support']),
    usage: 'Gelatinized form is easier to digest. Can be added to smoothies.',
    dosage: '1500-3000 mg daily',
    precautions: 'May affect hormone levels. Those with hormone-sensitive conditions should use caution.',
    scientificInfo: 'Maca does not contain hormones but may support hypothalamic-pituitary function and hormone balance.',
    references: JSON.stringify([
      'Gonzales GF. Ethnobiology and Ethnopharmacology of Lepidium meyenii (Maca). Evid Based Complement Alternat Med. 2012;2012:193496.',
      'Lee MS, et al. Maca (Lepidium meyenii) for treatment of menopausal symptoms. Maturitas. 2011;70(3):227-233.'
    ]),
    relatedRemedies: JSON.stringify(['Ashwagandha', 'Tribulus', 'Tongkat Ali']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Tribulus Terrestris',
    description: 'Traditional herb used for libido, athletic performance, and vitality.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Protodioscin', 'Saponins', 'Flavonoids']),
    benefits: JSON.stringify(['Libido support', 'Athletic performance', 'Vitality', 'Urinary health']),
    usage: 'Take with food. Often cycled for athletic use.',
    dosage: '250-750 mg extract daily standardized to saponins',
    precautions: 'Limited evidence for testosterone boosting claims. May interact with diabetes and blood pressure medications.',
    scientificInfo: 'May support nitric oxide production and androgen receptor sensitivity rather than directly increasing testosterone.',
    references: JSON.stringify([
      'Neychev V, Mitev V. The aphrodisiac herb Tribulus terrestris does not influence the androgen production in young men. J Ethnopharmacol. 2005;101(1-3):319-323.',
      'Qureshi A, et al. A systematic review on the herbal extract Tribulus terrestris and the roots of its putative aphrodisiac and performance enhancing effect. J Diet Suppl. 2014;11(1):64-79.'
    ]),
    relatedRemedies: JSON.stringify(['Maca Root', 'Tongkat Ali', 'Ashwagandha']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Green Tea Extract (EGCG)',
    description: 'Concentrated polyphenols from green tea with metabolic and antioxidant benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['EGCG', 'Catechins', 'L-theanine', 'Caffeine']),
    benefits: JSON.stringify(['Metabolism support', 'Antioxidant', 'Cognitive function', 'Heart health', 'Weight management']),
    usage: 'Take with food to reduce potential liver stress. Decaffeinated versions available.',
    dosage: '250-500 mg EGCG daily',
    precautions: 'High doses on empty stomach may affect liver. Limit to reasonable doses. Contains caffeine unless decaffeinated.',
    scientificInfo: 'EGCG enhances thermogenesis, inhibits catechol-O-methyltransferase, and has broad antioxidant activity.',
    references: JSON.stringify([
      'Hursel R, et al. The effects of green tea on weight loss and weight maintenance: a meta-analysis. Int J Obes. 2009;33(9):956-961.',
      'Mancini E, et al. Green tea effects on cognition, mood and human brain function. Phytomedicine. 2017;34:26-37.'
    ]),
    relatedRemedies: JSON.stringify(['L-Theanine', 'Caffeine', 'Resveratrol']),
    evidenceLevel: 'Strong'
  }
]
