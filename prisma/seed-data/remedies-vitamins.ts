// Vitamin-based natural remedies
export const vitaminRemedies = [
  {
    name: 'Vitamin D3 (Cholecalciferol)',
    description: 'Fat-soluble vitamin essential for calcium absorption, bone health, immune function, and mood regulation. Synthesized in skin upon sun exposure.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Cholecalciferol', 'Vitamin D3']),
    benefits: JSON.stringify(['Bone health', 'Calcium absorption', 'Immune support', 'Mood regulation', 'Muscle function']),
    usage: 'Take with a fat-containing meal for optimal absorption.',
    dosage: '600-4000 IU daily depending on blood levels and deficiency status',
    precautions: 'Excessive intake can cause hypercalcemia. Monitor blood levels if taking high doses. May interact with certain heart medications.',
    scientificInfo: 'Vitamin D3 is converted to 25-hydroxyvitamin D in the liver, then to active 1,25-dihydroxyvitamin D in kidneys. It regulates calcium homeostasis and has immunomodulatory effects.',
    references: JSON.stringify([
      'Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.',
      'Martineau AR, et al. Vitamin D supplementation to prevent acute respiratory tract infections. BMJ. 2017;356:i6583.'
    ]),
    relatedRemedies: JSON.stringify(['Sunlight Exposure', 'Cod Liver Oil', 'Fatty Fish']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin C (Ascorbic Acid)',
    description: 'Water-soluble antioxidant vitamin essential for collagen synthesis, immune function, and iron absorption.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Ascorbic acid', 'L-ascorbic acid']),
    benefits: JSON.stringify(['Immune support', 'Antioxidant protection', 'Collagen synthesis', 'Iron absorption', 'Wound healing']),
    usage: 'Can be taken with or without food. Divide large doses throughout the day.',
    dosage: '500-2000 mg daily in divided doses',
    precautions: 'High doses may cause digestive upset or diarrhea. May increase iron absorption, caution in hemochromatosis.',
    scientificInfo: 'Vitamin C is a cofactor for numerous enzymatic reactions including collagen synthesis. It regenerates other antioxidants like vitamin E.',
    references: JSON.stringify([
      'Carr AC, Maggini S. Vitamin C and Immune Function. Nutrients. 2017;9(11):1211.',
      'Hemila H, Chalker E. Vitamin C for preventing and treating the common cold. Cochrane Database Syst Rev. 2013;(1):CD000980.'
    ]),
    relatedRemedies: JSON.stringify(['Citrus Fruits', 'Rose Hips', 'Acerola Cherry']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B12 (Cobalamin)',
    description: 'Essential water-soluble vitamin for nerve function, DNA synthesis, and red blood cell formation. Commonly deficient in vegetarians and elderly.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Methylcobalamin', 'Cyanocobalamin', 'Adenosylcobalamin']),
    benefits: JSON.stringify(['Energy production', 'Nerve health', 'Red blood cell formation', 'DNA synthesis', 'Cognitive function']),
    usage: 'Sublingual forms may be better absorbed. Take in morning for energy support.',
    dosage: '500-2500 mcg daily, higher doses for deficiency',
    precautions: 'Generally safe even at high doses. May interact with metformin, proton pump inhibitors.',
    scientificInfo: 'B12 is a cofactor for methionine synthase and methylmalonyl-CoA mutase. Deficiency causes megaloblastic anemia and neurological damage.',
    references: JSON.stringify([
      'Green R, et al. Vitamin B12 deficiency. Nat Rev Dis Primers. 2017;3:17040.',
      'Pawlak R, et al. The prevalence of cobalamin deficiency among vegetarians. Nutr Rev. 2013;71(2):110-117.'
    ]),
    relatedRemedies: JSON.stringify(['Nutritional Yeast', 'Spirulina', 'Fortified Foods']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B6 (Pyridoxine)',
    description: 'Water-soluble vitamin involved in over 100 enzyme reactions, primarily in protein metabolism and neurotransmitter synthesis.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Pyridoxine', 'Pyridoxal-5-phosphate', 'P5P']),
    benefits: JSON.stringify(['Neurotransmitter synthesis', 'Protein metabolism', 'Immune function', 'Hemoglobin production', 'PMS relief']),
    usage: 'Take with food to minimize stomach upset. P5P form is active and may be better utilized.',
    dosage: '25-100 mg daily',
    precautions: 'Long-term high doses (>200mg/day) may cause peripheral neuropathy. Discontinue if numbness or tingling occurs.',
    scientificInfo: 'Pyridoxal-5-phosphate is the active coenzyme form involved in transamination, decarboxylation, and other amino acid transformations.',
    references: JSON.stringify([
      'Mooney S, et al. Vitamin B6: a long known compound of surprising complexity. Molecules. 2009;14(1):329-351.',
      'Wyatt KM, et al. Efficacy of vitamin B-6 in the treatment of premenstrual syndrome. BMJ. 1999;318(7195):1375-1381.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Chickpeas', 'Potatoes']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B1 (Thiamine)',
    description: 'Essential water-soluble vitamin for energy metabolism and nervous system function.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Thiamine', 'Thiamine mononitrate', 'Benfotiamine']),
    benefits: JSON.stringify(['Energy metabolism', 'Nerve function', 'Cognitive support', 'Carbohydrate metabolism']),
    usage: 'Take with food. Benfotiamine is a fat-soluble form with better bioavailability.',
    dosage: '50-100 mg daily',
    precautions: 'Generally safe. High doses may cause stomach upset in some individuals.',
    scientificInfo: 'Thiamine pyrophosphate is a coenzyme for pyruvate dehydrogenase and alpha-ketoglutarate dehydrogenase in energy metabolism.',
    references: JSON.stringify([
      'Lonsdale D. A review of the biochemistry, metabolism and clinical benefits of thiamin(e). Evid Based Complement Alternat Med. 2006;3(1):49-59.',
      'Gibson GE, Blass JP. Thiamine-dependent processes and treatment strategies in neurodegeneration. Antioxid Redox Signal. 2007;9(10):1605-1619.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Whole Grains', 'Legumes']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B2 (Riboflavin)',
    description: 'Water-soluble vitamin essential for energy production and cellular function.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Riboflavin', 'Riboflavin-5-phosphate']),
    benefits: JSON.stringify(['Energy production', 'Antioxidant function', 'Migraine prevention', 'Red blood cell production']),
    usage: 'Take with food. May cause bright yellow urine, which is harmless.',
    dosage: '25-400 mg daily; 400 mg for migraine prevention',
    precautions: 'Generally very safe. May interfere with some antibiotics.',
    scientificInfo: 'Riboflavin is converted to FMN and FAD, coenzymes essential for numerous oxidation-reduction reactions.',
    references: JSON.stringify([
      'Powers HJ. Riboflavin (vitamin B-2) and health. Am J Clin Nutr. 2003;77(6):1352-1360.',
      'Schoenen J, et al. Effectiveness of high-dose riboflavin in migraine prophylaxis. Neurology. 1998;50(2):466-470.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Dairy Products', 'Almonds']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B3 (Niacin)',
    description: 'Water-soluble vitamin important for energy metabolism and cholesterol management.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Niacin', 'Nicotinic acid', 'Niacinamide', 'Nicotinamide']),
    benefits: JSON.stringify(['Energy metabolism', 'Cholesterol support', 'Skin health', 'Brain function', 'DNA repair']),
    usage: 'Take with food. Start with low doses to minimize flushing. Niacinamide does not cause flushing.',
    dosage: '50-500 mg daily; higher doses for cholesterol under medical supervision',
    precautions: 'High-dose niacin may cause flushing, liver stress, and glucose elevation. Monitor liver function with high doses.',
    scientificInfo: 'Niacin is converted to NAD and NADP, coenzymes in over 400 enzymatic reactions. High-dose niacin raises HDL and lowers triglycerides.',
    references: JSON.stringify([
      'Garg A, et al. Niacin treatment increases plasma homocyst(e)ine levels. Am Heart J. 1999;138(6):1082-1087.',
      'Kamanna VS, Kashyap ML. Mechanism of action of niacin. Am J Cardiol. 2008;101(8A):20B-26B.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Turkey', 'Peanuts']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin B5 (Pantothenic Acid)',
    description: 'Water-soluble vitamin essential for synthesis of coenzyme A and fatty acid metabolism.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Pantothenic acid', 'Calcium pantothenate', 'Pantethine']),
    benefits: JSON.stringify(['Energy metabolism', 'Hormone synthesis', 'Wound healing', 'Cholesterol metabolism']),
    usage: 'Take with food. Pantethine form may be more effective for cholesterol support.',
    dosage: '100-500 mg daily',
    precautions: 'Generally safe. Very high doses may cause diarrhea.',
    scientificInfo: 'Pantothenic acid is a component of coenzyme A, essential for fatty acid synthesis and oxidation, and for the citric acid cycle.',
    references: JSON.stringify([
      'Kelly GS. Pantothenic acid. Altern Med Rev. 2011;16(3):263-274.',
      'Evans M, et al. Pantethine, a derivative of vitamin B5, favorably alters total, LDL and non-HDL cholesterol. Nutr Res. 2014;34(8):647-652.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Avocado', 'Shiitake Mushrooms']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Vitamin B7 (Biotin)',
    description: 'Water-soluble vitamin important for hair, skin, nails, and metabolic function.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Biotin', 'D-biotin']),
    benefits: JSON.stringify(['Hair health', 'Nail strength', 'Skin health', 'Blood sugar metabolism', 'Energy production']),
    usage: 'Can be taken with or without food.',
    dosage: '2500-10000 mcg daily for hair/nail benefits',
    precautions: 'High doses may interfere with certain lab tests (thyroid, cardiac markers). Inform healthcare providers of supplementation.',
    scientificInfo: 'Biotin is a cofactor for carboxylase enzymes involved in gluconeogenesis, fatty acid synthesis, and amino acid catabolism.',
    references: JSON.stringify([
      'Patel DP, et al. A Review of the Use of Biotin for Hair Loss. Skin Appendage Disord. 2017;3(3):166-169.',
      'Zempleni J, et al. Biotin and biotinidase deficiency. Expert Rev Endocrinol Metab. 2008;3(6):715-724.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Egg Yolks', 'Nuts']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Vitamin B9 (Folate)',
    description: 'Essential water-soluble vitamin for DNA synthesis, cell division, and pregnancy health.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Folate', 'Folic acid', 'Methylfolate', '5-MTHF']),
    benefits: JSON.stringify(['DNA synthesis', 'Cell division', 'Pregnancy support', 'Homocysteine metabolism', 'Mood support']),
    usage: 'Methylfolate (5-MTHF) is the active form and may be better utilized, especially for those with MTHFR variants.',
    dosage: '400-800 mcg daily; 800-1000 mcg during pregnancy',
    precautions: 'High doses may mask B12 deficiency. Should be taken with B12. May interact with methotrexate.',
    scientificInfo: 'Folate is essential for one-carbon metabolism, required for DNA synthesis and methylation reactions. Critical during pregnancy for neural tube development.',
    references: JSON.stringify([
      'Bailey LB, Gregory JF. Folate metabolism and requirements. J Nutr. 1999;129(4):779-782.',
      'Czeizel AE, Dudas I. Prevention of the first occurrence of neural-tube defects by periconceptional vitamin supplementation. N Engl J Med. 1992;327(26):1832-1835.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Leafy Greens', 'Legumes']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Vitamin E (Tocopherol)',
    description: 'Fat-soluble antioxidant vitamin protecting cell membranes from oxidative damage.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Alpha-tocopherol', 'Mixed tocopherols', 'Tocotrienols']),
    benefits: JSON.stringify(['Antioxidant protection', 'Skin health', 'Immune function', 'Eye health', 'Cardiovascular support']),
    usage: 'Take with fat-containing meal for absorption. Natural forms (d-alpha) preferred over synthetic (dl-alpha).',
    dosage: '100-400 IU daily',
    precautions: 'High doses may increase bleeding risk. Discontinue before surgery. May interact with blood thinners.',
    scientificInfo: 'Vitamin E is a chain-breaking antioxidant that protects polyunsaturated fatty acids in cell membranes from lipid peroxidation.',
    references: JSON.stringify([
      'Traber MG, Atkinson J. Vitamin E, antioxidant and nothing more. Free Radic Biol Med. 2007;43(1):4-15.',
      'Rizvi S, et al. The role of vitamin E in human health and some diseases. Sultan Qaboos Univ Med J. 2014;14(2):e157-165.'
    ]),
    relatedRemedies: JSON.stringify(['Wheat Germ Oil', 'Almonds', 'Sunflower Seeds']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Vitamin K2 (Menaquinone)',
    description: 'Fat-soluble vitamin essential for calcium metabolism, bone health, and cardiovascular health.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Menaquinone-7', 'MK-7', 'Menaquinone-4', 'MK-4']),
    benefits: JSON.stringify(['Bone health', 'Calcium metabolism', 'Cardiovascular health', 'Dental health']),
    usage: 'Take with fat-containing meal. Often combined with vitamin D3 for synergistic effects.',
    dosage: '100-200 mcg MK-7 daily or 1-15 mg MK-4 daily',
    precautions: 'May interact with blood thinners (warfarin). Consult physician if on anticoagulant therapy.',
    scientificInfo: 'Vitamin K2 activates matrix Gla protein (MGP) which inhibits arterial calcification, and osteocalcin which directs calcium to bones.',
    references: JSON.stringify([
      'Schurgers LJ, et al. Vitamin K-containing dietary supplements. Curr Med Chem. 2007;14(27):2937-2945.',
      'Knapen MH, et al. Three-year low-dose menaquinone-7 supplementation helps decrease bone loss in healthy postmenopausal women. Osteoporos Int. 2013;24(9):2499-2507.'
    ]),
    relatedRemedies: JSON.stringify(['Natto', 'Fermented Foods', 'Vitamin D3']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Vitamin A (Retinol)',
    description: 'Fat-soluble vitamin essential for vision, immune function, and cell growth.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Retinol', 'Retinyl palmitate', 'Beta-carotene']),
    benefits: JSON.stringify(['Vision support', 'Immune function', 'Skin health', 'Cell growth', 'Reproductive health']),
    usage: 'Take with fat-containing meal. Beta-carotene is a safer precursor form.',
    dosage: '2500-10000 IU daily as retinol; higher as beta-carotene',
    precautions: 'Preformed vitamin A (retinol) can be toxic in high doses. Avoid during pregnancy except as prescribed. Beta-carotene is safer.',
    scientificInfo: 'Vitamin A binds to nuclear receptors (RAR, RXR) regulating gene expression. Essential for rhodopsin synthesis in vision.',
    references: JSON.stringify([
      'Sommer A, Vyas KS. A global clinical view on vitamin A and carotenoids. Am J Clin Nutr. 2012;96(5):1204S-1206S.',
      'Ross AC. Vitamin A and retinoic acid in T cell-related immunity. Am J Clin Nutr. 2012;96(5):1166S-1172S.'
    ]),
    relatedRemedies: JSON.stringify(['Cod Liver Oil', 'Sweet Potato', 'Carrots']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'B-Complex',
    description: 'Comprehensive formula containing all eight B vitamins for energy, metabolism, and nervous system support.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Thiamine B1', 'Riboflavin B2', 'Niacin B3', 'Pantothenic acid B5', 'Pyridoxine B6', 'Biotin B7', 'Folate B9', 'Cobalamin B12']),
    benefits: JSON.stringify(['Energy production', 'Nervous system support', 'Stress management', 'Cognitive function', 'Metabolism support']),
    usage: 'Take in the morning with food. May cause bright yellow urine from riboflavin.',
    dosage: 'Follow product label; typically provides 25-100mg of each B vitamin',
    precautions: 'High-dose niacin may cause flushing. High B6 long-term may cause neuropathy.',
    scientificInfo: 'B vitamins work synergistically as coenzymes in energy metabolism, neurotransmitter synthesis, and DNA methylation.',
    references: JSON.stringify([
      'Kennedy DO. B Vitamins and the Brain: Mechanisms, Dose and Efficacy. Nutrients. 2016;8(2):68.',
      'Young LM, et al. A Systematic Review and Meta-Analysis of B Vitamin Supplementation on Depressive Symptoms. Nutrients. 2019;11(9):2232.'
    ]),
    relatedRemedies: JSON.stringify(['Nutritional Yeast', 'Whole Grains', 'Organ Meats']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Cod Liver Oil',
    description: 'Traditional supplement rich in vitamins A and D, plus omega-3 fatty acids.',
    category: 'Vitamin',
    ingredients: JSON.stringify(['Vitamin A', 'Vitamin D3', 'EPA', 'DHA', 'Omega-3 fatty acids']),
    benefits: JSON.stringify(['Vitamin A and D supplementation', 'Joint health', 'Brain function', 'Immune support', 'Skin health']),
    usage: 'Take with food. Liquid or capsule form available.',
    dosage: '1-2 teaspoons liquid or 1-2 capsules daily',
    precautions: 'Contains preformed vitamin A; avoid excessive intake especially during pregnancy. May interact with blood thinners.',
    scientificInfo: 'Cod liver oil has been used for centuries to prevent rickets. It provides a natural ratio of vitamins A and D with anti-inflammatory omega-3s.',
    references: JSON.stringify([
      'Gruenwald J, et al. Effect of cod liver oil on symptoms of rheumatoid arthritis. Adv Ther. 2002;19(2):101-107.',
      'Rajakumar K. Vitamin D, cod-liver oil, sunlight, and rickets: a historical perspective. Pediatrics. 2003;112(2):e132-135.'
    ]),
    relatedRemedies: JSON.stringify(['Fish Oil', 'Vitamin D3', 'Vitamin A']),
    evidenceLevel: 'Strong'
  }
]
