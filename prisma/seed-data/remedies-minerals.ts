// Mineral-based natural remedies
export const mineralRemedies = [
  {
    name: 'Magnesium Glycinate',
    description: 'Highly bioavailable form of magnesium chelated with glycine. Essential for over 300 enzymatic reactions.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Magnesium', 'Glycine']),
    benefits: JSON.stringify(['Muscle relaxation', 'Sleep support', 'Stress reduction', 'Nerve function', 'Blood sugar regulation']),
    usage: 'Take in the evening for sleep benefits. Can be taken with or without food.',
    dosage: '200-400 mg elemental magnesium daily',
    precautions: 'May cause loose stools at high doses. Reduce dose if this occurs. Caution with kidney disease.',
    scientificInfo: 'Magnesium glycinate is well-absorbed and less likely to cause GI upset. Glycine itself has calming neurotransmitter effects.',
    references: JSON.stringify([
      'Abbasi B, et al. The effect of magnesium supplementation on primary insomnia in elderly. J Res Med Sci. 2012;17(12):1161-1169.',
      'Boyle NB, et al. The Effects of Magnesium Supplementation on Subjective Anxiety and Stress. Nutrients. 2017;9(5):429.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium Citrate', 'Magnesium L-Threonate', 'Epsom Salt Bath']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Magnesium Citrate',
    description: 'Well-absorbed form of magnesium bound to citric acid. Supports energy, muscles, and digestive regularity.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Magnesium', 'Citric acid']),
    benefits: JSON.stringify(['Muscle function', 'Energy production', 'Digestive regularity', 'Bone health', 'Heart rhythm']),
    usage: 'Take with water. May have mild laxative effect which can be beneficial for constipation.',
    dosage: '200-400 mg elemental magnesium daily',
    precautions: 'May cause loose stools. Start with lower dose. Caution in kidney disease.',
    scientificInfo: 'Magnesium citrate has good bioavailability and the citrate form may enhance absorption. Commonly used for constipation relief.',
    references: JSON.stringify([
      'Walker AF, et al. Mg citrate found more bioavailable than other Mg preparations in a randomised, double-blind study. Magnes Res. 2003;16(3):183-191.',
      'Lindberg JS, et al. Magnesium bioavailability from magnesium citrate and magnesium oxide. J Am Coll Nutr. 1990;9(1):48-55.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium Glycinate', 'Magnesium Malate', 'Magnesium Oxide']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Magnesium L-Threonate',
    description: 'Specialized form of magnesium that crosses the blood-brain barrier, specifically supporting cognitive function.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Magnesium', 'L-Threonic acid']),
    benefits: JSON.stringify(['Cognitive function', 'Memory support', 'Brain health', 'Learning enhancement', 'Sleep quality']),
    usage: 'Can be taken morning or evening. Some prefer evening for sleep benefits.',
    dosage: '1000-2000 mg magnesium L-threonate (providing 144-288 mg elemental magnesium) daily',
    precautions: 'Generally well tolerated. May need additional magnesium forms for systemic benefits.',
    scientificInfo: 'Research shows magnesium L-threonate increases brain magnesium levels more effectively than other forms, enhancing synaptic plasticity.',
    references: JSON.stringify([
      'Slutsky I, et al. Enhancement of learning and memory by elevating brain magnesium. Neuron. 2010;65(2):165-177.',
      'Liu G, et al. Efficacy and Safety of MMFS-01, a Synapse Density Enhancer, for Treating Cognitive Impairment. J Alzheimers Dis. 2016;49(4):971-990.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium Glycinate', 'Lions Mane Mushroom', 'Bacopa Monnieri']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Zinc Picolinate',
    description: 'Highly absorbable form of zinc essential for immune function, wound healing, and protein synthesis.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Zinc', 'Picolinic acid']),
    benefits: JSON.stringify(['Immune support', 'Wound healing', 'Skin health', 'Testosterone support', 'Taste and smell']),
    usage: 'Take with food to prevent nausea. Avoid taking with high-fiber foods or calcium supplements.',
    dosage: '15-30 mg daily; up to 50 mg short-term for immune support',
    precautions: 'Long-term high doses can cause copper deficiency. Balance with copper supplementation if needed.',
    scientificInfo: 'Zinc is crucial for over 300 enzymes and is essential for immune cell development and function. Picolinate form has enhanced absorption.',
    references: JSON.stringify([
      'Prasad AS. Zinc in human health: effect of zinc on immune cells. Mol Med. 2008;14(5-6):353-357.',
      'Wegmuller R, et al. Zinc absorption by young adults from supplemental zinc citrate is comparable with that from zinc gluconate. J Nutr. 2014;144(2):132-136.'
    ]),
    relatedRemedies: JSON.stringify(['Zinc Citrate', 'Zinc Lozenges', 'Oysters']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Zinc Lozenges',
    description: 'Zinc delivery form designed to dissolve slowly in mouth, providing direct contact with throat tissues for cold support.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Zinc acetate', 'Zinc gluconate']),
    benefits: JSON.stringify(['Cold duration reduction', 'Sore throat relief', 'Immune support']),
    usage: 'Dissolve slowly in mouth every 2-3 hours at first sign of cold. Do not chew.',
    dosage: '75 mg total zinc per day during cold, in divided doses',
    precautions: 'May cause temporary taste disturbance or nausea. Do not use nasal zinc products.',
    scientificInfo: 'Ionic zinc released from lozenges inhibits viral replication in the nasopharynx. Effectiveness depends on zinc ion availability.',
    references: JSON.stringify([
      'Hemila H. Zinc lozenges and the common cold: a meta-analysis comparing zinc acetate and zinc gluconate. JRSM Open. 2017;8(5):2054270417694291.',
      'Science M, et al. Zinc for the treatment of the common cold: a systematic review and meta-analysis. CMAJ. 2012;184(10):E551-561.'
    ]),
    relatedRemedies: JSON.stringify(['Vitamin C', 'Elderberry', 'Echinacea']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Calcium Citrate',
    description: 'Well-absorbed form of calcium that can be taken with or without food. Essential for bone health.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Calcium', 'Citric acid']),
    benefits: JSON.stringify(['Bone health', 'Muscle function', 'Nerve transmission', 'Blood clotting', 'Hormone secretion']),
    usage: 'Can be taken with or without food. Divide doses for better absorption (no more than 500mg at once).',
    dosage: '500-1000 mg daily in divided doses',
    precautions: 'May interfere with absorption of certain medications. Take separately from thyroid medications and antibiotics.',
    scientificInfo: 'Calcium citrate is absorbed in both acidic and neutral pH, making it suitable for those with low stomach acid or on acid-reducing medications.',
    references: JSON.stringify([
      'Heaney RP, et al. Absorbability and cost effectiveness in calcium supplementation. J Am Coll Nutr. 2001;20(3):239-246.',
      'Weaver CM, et al. Calcium plus vitamin D supplementation and risk of fractures. N Engl J Med. 2006;354(21):2285-2286.'
    ]),
    relatedRemedies: JSON.stringify(['Vitamin D3', 'Vitamin K2', 'Dairy Products']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Iron Bisglycinate',
    description: 'Gentle, highly absorbable chelated form of iron that minimizes gastrointestinal side effects.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Iron', 'Glycine']),
    benefits: JSON.stringify(['Red blood cell production', 'Energy support', 'Oxygen transport', 'Cognitive function']),
    usage: 'Take on empty stomach for best absorption, or with food if stomach upset occurs. Vitamin C enhances absorption.',
    dosage: '18-65 mg daily depending on deficiency level',
    precautions: 'Do not take unless deficient. Keep away from children. May cause constipation in some individuals.',
    scientificInfo: 'Iron bisglycinate is chelated to glycine amino acids, protecting it from dietary inhibitors and reducing GI side effects.',
    references: JSON.stringify([
      'Milman N, et al. Ferrous bisglycinate 25 mg iron is as effective as ferrous sulfate 50 mg iron in the prophylaxis of iron deficiency. Ann Hematol. 2014;93(3):505-509.',
      'Name JJ, et al. Iron Bisglycinate Chelate and Polymaltose Iron for the Treatment of Iron Deficiency Anemia. Curr Med Res Opin. 2018;34(9):1577-1584.'
    ]),
    relatedRemedies: JSON.stringify(['Vitamin C', 'Blackstrap Molasses', 'Nettle Leaf']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Selenium',
    description: 'Essential trace mineral with powerful antioxidant properties, critical for thyroid function and immune health.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Selenium', 'Selenomethionine', 'Selenium yeast']),
    benefits: JSON.stringify(['Thyroid function', 'Antioxidant protection', 'Immune support', 'Cognitive function', 'Fertility']),
    usage: 'Take with food. Selenomethionine is well absorbed.',
    dosage: '100-200 mcg daily',
    precautions: 'Do not exceed 400 mcg daily. Toxicity can cause hair loss, nail changes, and neurological issues.',
    scientificInfo: 'Selenium is incorporated into selenoproteins including glutathione peroxidases and thyroid deiodinases. Critical for redox balance.',
    references: JSON.stringify([
      'Rayman MP. Selenium and human health. Lancet. 2012;379(9822):1256-1268.',
      'Ventura M, et al. Selenium and Thyroid Disease: From Pathophysiology to Treatment. Int J Endocrinol. 2017;2017:1297658.'
    ]),
    relatedRemedies: JSON.stringify(['Brazil Nuts', 'Iodine', 'Vitamin E']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Iodine',
    description: 'Essential trace mineral crucial for thyroid hormone synthesis and metabolic function.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Potassium iodide', 'Iodine', 'Kelp-derived iodine']),
    benefits: JSON.stringify(['Thyroid function', 'Metabolism regulation', 'Cognitive development', 'Breast health']),
    usage: 'Take with food. Start with lower doses if not previously supplementing.',
    dosage: '150-300 mcg daily; higher doses only under medical supervision',
    precautions: 'Excess iodine can worsen thyroid conditions. Those with Hashimotos should use caution and consult healthcare provider.',
    scientificInfo: 'Iodine is required for synthesis of thyroid hormones T3 and T4, which regulate metabolism, growth, and development.',
    references: JSON.stringify([
      'Zimmermann MB. Iodine deficiency. Endocr Rev. 2009;30(4):376-408.',
      'Leung AM, Braverman LE. Consequences of excess iodine. Nat Rev Endocrinol. 2014;10(3):136-142.'
    ]),
    relatedRemedies: JSON.stringify(['Kelp', 'Selenium', 'Tyrosine']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Potassium',
    description: 'Essential electrolyte mineral critical for heart rhythm, muscle function, and blood pressure regulation.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Potassium chloride', 'Potassium citrate', 'Potassium gluconate']),
    benefits: JSON.stringify(['Blood pressure regulation', 'Muscle function', 'Heart rhythm', 'Nerve function', 'Fluid balance']),
    usage: 'Take with food and plenty of water. Divide doses throughout day.',
    dosage: '99-500 mg per dose; total intake should reach 2600-3400 mg daily from food and supplements',
    precautions: 'High doses can be dangerous, especially with kidney disease or certain medications. Monitor if on ACE inhibitors or potassium-sparing diuretics.',
    scientificInfo: 'Potassium is the primary intracellular cation, essential for maintaining cell membrane potential and proper muscle and nerve function.',
    references: JSON.stringify([
      'Weaver CM. Potassium and health. Adv Nutr. 2013;4(3):368S-377S.',
      'Aburto NJ, et al. Effect of increased potassium intake on cardiovascular risk factors and disease. BMJ. 2013;346:f1378.'
    ]),
    relatedRemedies: JSON.stringify(['Coconut Water', 'Bananas', 'Magnesium']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Chromium Picolinate',
    description: 'Trace mineral that enhances insulin sensitivity and supports healthy blood sugar metabolism.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Chromium', 'Picolinic acid']),
    benefits: JSON.stringify(['Blood sugar regulation', 'Insulin sensitivity', 'Carbohydrate metabolism', 'Weight management support']),
    usage: 'Take with meals for blood sugar support.',
    dosage: '200-1000 mcg daily',
    precautions: 'May affect blood sugar levels; monitor if diabetic. May interact with diabetes medications.',
    scientificInfo: 'Chromium enhances insulin receptor signaling and glucose transporter activity, improving cellular glucose uptake.',
    references: JSON.stringify([
      'Anderson RA. Chromium and insulin resistance. Nutr Res Rev. 2003;16(2):267-275.',
      'Cefalu WT, Hu FB. Role of chromium in human health and in diabetes. Diabetes Care. 2004;27(11):2741-2751.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Alpha-Lipoic Acid', 'Cinnamon']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Copper',
    description: 'Essential trace mineral for iron metabolism, connective tissue formation, and antioxidant defense.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Copper', 'Copper glycinate', 'Copper citrate']),
    benefits: JSON.stringify(['Iron metabolism', 'Connective tissue health', 'Antioxidant function', 'Nervous system support', 'Energy production']),
    usage: 'Take with food. Often supplemented alongside zinc to maintain proper ratio.',
    dosage: '1-3 mg daily',
    precautions: 'Excess copper can be toxic. Wilson disease patients must avoid supplementation. Maintain zinc-copper balance.',
    scientificInfo: 'Copper is a cofactor for cytochrome c oxidase, superoxide dismutase, and ceruloplasmin. Essential for iron mobilization.',
    references: JSON.stringify([
      'Turnlund JR. Human whole-body copper metabolism. Am J Clin Nutr. 1998;67(5 Suppl):960S-964S.',
      'Prohaska JR. Impact of copper deficiency in humans. Ann N Y Acad Sci. 2014;1314:1-5.'
    ]),
    relatedRemedies: JSON.stringify(['Zinc', 'Iron', 'Vitamin C']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Manganese',
    description: 'Trace mineral essential for bone formation, blood clotting, and antioxidant defense via SOD enzyme.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Manganese', 'Manganese glycinate', 'Manganese citrate']),
    benefits: JSON.stringify(['Bone health', 'Antioxidant function', 'Blood sugar metabolism', 'Wound healing', 'Collagen production']),
    usage: 'Take with food. Avoid taking with calcium, iron, or zinc which may reduce absorption.',
    dosage: '2-5 mg daily',
    precautions: 'Excess can be neurotoxic. Those with liver disease should avoid supplementation. Do not exceed recommended doses.',
    scientificInfo: 'Manganese is a cofactor for manganese superoxide dismutase (MnSOD) and enzymes in gluconeogenesis and bone formation.',
    references: JSON.stringify([
      'Aschner JL, Aschner M. Nutritional aspects of manganese homeostasis. Mol Aspects Med. 2005;26(4-5):353-362.',
      'Li L, Yang X. The Essential Element Manganese, Oxidative Stress, and Metabolic Diseases. Oxid Med Cell Longev. 2018;2018:7580707.'
    ]),
    relatedRemedies: JSON.stringify(['Glucosamine', 'Vitamin K', 'Calcium']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Boron',
    description: 'Trace mineral supporting bone health, hormone metabolism, and cognitive function.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Boron', 'Boron glycinate', 'Calcium fructoborate']),
    benefits: JSON.stringify(['Bone health', 'Hormone balance', 'Cognitive function', 'Joint health', 'Magnesium utilization']),
    usage: 'Take with food. Can be combined with calcium and vitamin D for bone support.',
    dosage: '3-6 mg daily',
    precautions: 'Generally safe at recommended doses. High doses may affect hormone levels.',
    scientificInfo: 'Boron influences the metabolism of calcium, magnesium, and vitamin D. It may also affect steroid hormone levels.',
    references: JSON.stringify([
      'Nielsen FH. Update on the possible nutritional importance of boron. Trace Elem Med. 2008;9(2):46-51.',
      'Pizzorno L. Nothing Boring About Boron. Integr Med (Encinitas). 2015;14(4):35-48.'
    ]),
    relatedRemedies: JSON.stringify(['Calcium', 'Vitamin D3', 'Magnesium']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Silica (Silicon)',
    description: 'Trace mineral important for collagen formation, bone health, and connective tissue integrity.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Silicon dioxide', 'Orthosilicic acid', 'Bamboo silica']),
    benefits: JSON.stringify(['Hair health', 'Nail strength', 'Skin elasticity', 'Bone health', 'Connective tissue support']),
    usage: 'Take with food. Liquid or stabilized forms may be better absorbed.',
    dosage: '5-20 mg daily',
    precautions: 'Generally safe. Choose supplements without aluminum contamination.',
    scientificInfo: 'Silicon is involved in collagen synthesis and glycosaminoglycan formation. May stimulate osteoblast differentiation.',
    references: JSON.stringify([
      'Jugdaohsingh R. Silicon and bone health. J Nutr Health Aging. 2007;11(2):99-110.',
      'Araujo LA, et al. Use of silicon for skin and hair care: an approach of chemical forms available and efficacy. An Bras Dermatol. 2016;91(3):331-335.'
    ]),
    relatedRemedies: JSON.stringify(['Horsetail Extract', 'Collagen', 'Biotin']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Molybdenum',
    description: 'Essential trace mineral required for sulfite oxidase and other enzymes in detoxification.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Molybdenum', 'Molybdenum glycinate']),
    benefits: JSON.stringify(['Sulfite detoxification', 'Enzyme function', 'Uric acid metabolism']),
    usage: 'Take with food. Low doses are typically sufficient.',
    dosage: '75-250 mcg daily',
    precautions: 'Excess intake rare but can interfere with copper metabolism. Avoid high doses.',
    scientificInfo: 'Molybdenum is a cofactor for sulfite oxidase, xanthine oxidase, and aldehyde oxidase enzymes.',
    references: JSON.stringify([
      'Novotny JA, Peterson CA. Molybdenum. Adv Nutr. 2018;9(3):272-273.',
      'Schwarz G. Molybdenum cofactor and human disease. Curr Opin Chem Biol. 2016;31:179-187.'
    ]),
    relatedRemedies: JSON.stringify(['Sulfur amino acids', 'Copper', 'Zinc']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Lithium Orotate',
    description: 'Low-dose lithium supplement for mood support and neuroprotection, distinct from prescription lithium.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Lithium', 'Orotic acid']),
    benefits: JSON.stringify(['Mood support', 'Neuroprotection', 'Brain health', 'Stress resilience']),
    usage: 'Take with food. Start with low doses.',
    dosage: '5-20 mg elemental lithium daily',
    precautions: 'Not a substitute for prescription lithium. May interact with medications. Consult healthcare provider, especially if on psychiatric medications.',
    scientificInfo: 'Low-dose lithium may have neuroprotective effects, promoting BDNF and inhibiting GSK-3 beta. Epidemiological studies suggest benefits for mood.',
    references: JSON.stringify([
      'Schrauzer GN. Lithium: occurrence, dietary intakes, nutritional essentiality. J Am Coll Nutr. 2002;21(1):14-21.',
      'Mauer S, et al. Standard and Trace-Dose Lithium: A Systematic Review of Dementia Prevention and Other Behavioral Benefits. Aust N Z J Psychiatry. 2014;48(9):809-818.'
    ]),
    relatedRemedies: JSON.stringify(['Omega-3 Fatty Acids', 'SAMe', 'Magnesium']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Epsom Salt Bath',
    description: 'Magnesium sulfate dissolved in bath water for transdermal magnesium absorption and muscle relaxation.',
    category: 'Mineral',
    ingredients: JSON.stringify(['Magnesium sulfate', 'Epsom salt']),
    benefits: JSON.stringify(['Muscle relaxation', 'Stress relief', 'Sleep support', 'Skin softening', 'Detoxification support']),
    usage: 'Add 1-2 cups to warm bath water. Soak for 20-30 minutes.',
    dosage: '1-2 cups per bath, 2-3 times per week',
    precautions: 'Avoid with open wounds. Those with kidney disease should consult doctor. Stay hydrated.',
    scientificInfo: 'Magnesium may be absorbed transdermally, though evidence is limited. Warm baths alone provide relaxation benefits.',
    references: JSON.stringify([
      'Gröber U, et al. Myth or Reality-Transdermal Magnesium? Nutrients. 2017;9(8):813.',
      'Chandrasekhar K, et al. A Prospective Study of the Effect of Epsom Salt on Magnesium Levels. J Am Coll Nutr. 2019;38(3):238-242.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium Glycinate', 'Dead Sea Salt', 'Lavender Oil']),
    evidenceLevel: 'Limited'
  }
]
