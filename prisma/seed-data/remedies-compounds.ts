// Bioactive Compounds and Advanced Supplements
export const compoundRemedies = [
  {
    name: "Curcumin (Standardized)",
    description:
      "The primary bioactive compound in turmeric, a powerful anti-inflammatory and antioxidant.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Curcuminoids",
      "Demethoxycurcumin",
      "Bisdemethoxycurcumin",
      "Piperine (for absorption)",
    ]),
    benefits: JSON.stringify([
      "Inflammation reduction",
      "Joint health",
      "Brain function",
      "Heart health",
      "Antioxidant protection",
    ]),
    usage:
      "Take 500-2000mg standardized extract with fat and piperine for absorption.",
    dosage: "500-2000mg with 5-20mg piperine",
    precautions:
      "May interact with blood thinners. Avoid with gallbladder issues. May cause GI upset.",
    scientificInfo:
      "Extensive research demonstrates anti-inflammatory effects comparable to some medications.",
    references: JSON.stringify([
      "Journal of Medicinal Food 2017",
      "Annals of Internal Medicine 2019",
      "Foods 2020",
    ]),
    relatedRemedies: JSON.stringify(["Turmeric", "Boswellia", "Ginger"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Sulforaphane",
    description:
      "A potent compound from cruciferous vegetables that activates cellular defense pathways.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Glucoraphanin",
      "Myrosinase enzyme",
      "Broccoli sprout extract",
    ]),
    benefits: JSON.stringify([
      "Detoxification support",
      "Antioxidant activation",
      "Brain health",
      "Cancer prevention research",
      "Autism symptom research",
    ]),
    usage:
      "Take 10-50mg sulforaphane or broccoli sprout extract with myrosinase.",
    dosage: "10-50mg sulforaphane or equivalent sprout extract",
    precautions:
      "May cause GI discomfort. Thyroid concerns with high cruciferous intake. Start low.",
    scientificInfo:
      "Activates Nrf2 pathway, inducing production of protective enzymes.",
    references: JSON.stringify([
      "Molecular Nutrition and Food Research 2018",
      "PNAS 2014",
      "Cancer Prevention Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Broccoli Sprouts", "DIM", "I3C"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Diindolylmethane (DIM)",
    description:
      "A compound from cruciferous vegetables that supports healthy estrogen metabolism.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Diindolylmethane",
      "derived from Indole-3-carbinol",
    ]),
    benefits: JSON.stringify([
      "Estrogen metabolism",
      "Hormonal balance",
      "Prostate health",
      "Breast health",
      "Acne improvement",
    ]),
    usage: "Take 100-200mg daily with food.",
    dosage: "100-200mg daily",
    precautions:
      "May affect hormone levels. Use cautiously with hormone-sensitive conditions.",
    scientificInfo:
      "Research shows modulation of estrogen metabolism favoring protective metabolites.",
    references: JSON.stringify([
      "Nutrition and Cancer 2016",
      "British Journal of Nutrition 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "I3C",
      "Sulforaphane",
      "Calcium D-Glucarate",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Indole-3-Carbinol (I3C)",
    description:
      "A compound from cruciferous vegetables that converts to DIM and supports detoxification.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Indole-3-carbinol",
      "from cruciferous vegetables",
    ]),
    benefits: JSON.stringify([
      "Estrogen balance",
      "Detoxification",
      "Cellular health",
      "Liver support",
      "Immune modulation",
    ]),
    usage: "Take 200-400mg daily with food.",
    dosage: "200-400mg daily",
    precautions:
      "Converts to various compounds in stomach. DIM may be more predictable. Hormone interactions.",
    scientificInfo:
      "Precursor to DIM; research shows estrogen metabolism and detoxification effects.",
    references: JSON.stringify([
      "Nutrition Reviews 2016",
      "Journal of Nutrition 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "DIM",
      "Sulforaphane",
      "Calcium D-Glucarate",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "EGCG (Green Tea Extract)",
    description:
      "The primary catechin in green tea with powerful antioxidant and metabolic effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Epigallocatechin gallate",
      "Green tea polyphenols",
    ]),
    benefits: JSON.stringify([
      "Antioxidant protection",
      "Metabolism support",
      "Brain health",
      "Heart health",
      "Fat oxidation",
    ]),
    usage:
      "Take 300-500mg standardized EGCG extract or drink 3-5 cups green tea.",
    dosage: "300-500mg EGCG or 3-5 cups green tea",
    precautions:
      "High doses may affect liver. Take with food. Caffeine content varies. Iron absorption.",
    scientificInfo:
      "Research shows effects on metabolism, oxidation, and neuroprotection.",
    references: JSON.stringify([
      "American Journal of Clinical Nutrition 2017",
      "Molecules 2019",
    ]),
    relatedRemedies: JSON.stringify(["Green Tea", "Resveratrol", "Quercetin"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Pterostilbene",
    description:
      "A methylated form of resveratrol with superior bioavailability and similar benefits.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Pterostilbene",
      "from blueberries and grape vines",
    ]),
    benefits: JSON.stringify([
      "Cognitive support",
      "Cardiovascular health",
      "Blood sugar balance",
      "Antioxidant effects",
      "Longevity research",
    ]),
    usage: "Take 50-150mg twice daily.",
    dosage: "50-150mg twice daily",
    precautions:
      "Limited long-term safety data. May interact with blood pressure medications.",
    scientificInfo:
      "Better absorbed than resveratrol; activates similar longevity pathways.",
    references: JSON.stringify([
      "Oxidative Medicine and Cellular Longevity 2017",
      "Journal of Agricultural and Food Chemistry 2019",
    ]),
    relatedRemedies: JSON.stringify(["Resveratrol", "Quercetin", "Fisetin"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Fisetin",
    description:
      "A flavonoid found in strawberries and apples with potent senolytic and neuroprotective effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Fisetin",
      "from strawberries, apples, onions",
    ]),
    benefits: JSON.stringify([
      "Senolytic effects",
      "Brain health",
      "Inflammation reduction",
      "Longevity research",
      "Antioxidant protection",
    ]),
    usage: "Take 100-500mg daily or in periodic high-dose protocols.",
    dosage: "100-500mg daily or periodic higher doses",
    precautions:
      "Limited human research. Senolytic protocols require careful consideration.",
    scientificInfo:
      "Research shows senolytic activity (clearing senescent cells) and neuroprotection.",
    references: JSON.stringify([
      "EBioMedicine 2018",
      "Aging Cell 2019",
      "Frontiers in Cellular Neuroscience 2020",
    ]),
    relatedRemedies: JSON.stringify([
      "Quercetin",
      "Pterostilbene",
      "Resveratrol",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Apigenin",
    description:
      "A flavonoid from chamomile and parsley with calming and health-promoting properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Apigenin",
      "from chamomile, parsley, celery",
    ]),
    benefits: JSON.stringify([
      "Sleep support",
      "Anxiety relief",
      "Testosterone support",
      "Anti-inflammatory effects",
      "Neuroprotection",
    ]),
    usage: "Take 50-100mg before bed for sleep, or as directed.",
    dosage: "50-100mg, typically before bed",
    precautions:
      "May cause sedation. Limited human research on isolated compound.",
    scientificInfo:
      "Binds to benzodiazepine receptors and has demonstrated anxiolytic effects.",
    references: JSON.stringify([
      "Molecular Medicine Reports 2016",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Chamomile", "GABA", "L-Theanine"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Luteolin",
    description:
      "A flavonoid with anti-inflammatory and neuroprotective properties found in many plants.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Luteolin",
      "from celery, peppers, chamomile",
    ]),
    benefits: JSON.stringify([
      "Brain health",
      "Inflammation reduction",
      "Mast cell stabilization",
      "Allergy support",
      "Cognitive protection",
    ]),
    usage: "Take 100-200mg daily with food.",
    dosage: "100-200mg daily",
    precautions:
      "Limited human research. May interact with medications metabolized by CYP enzymes.",
    scientificInfo:
      "Research shows anti-inflammatory and mast cell-stabilizing effects.",
    references: JSON.stringify([
      "Frontiers in Pharmacology 2018",
      "Current Medicinal Chemistry 2019",
    ]),
    relatedRemedies: JSON.stringify(["Quercetin", "Apigenin", "Fisetin"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Kaempferol",
    description:
      "A flavonoid found in many vegetables with antioxidant and cardioprotective properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Kaempferol",
      "from kale, spinach, tea, broccoli",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Antioxidant protection",
      "Inflammation reduction",
      "Cancer research",
      "Bone health",
    ]),
    usage: "Primarily obtained through diet; supplements 50-100mg available.",
    dosage: "50-100mg if supplementing",
    precautions:
      "Limited human research on isolated compound. Primarily dietary.",
    scientificInfo:
      "Research shows cardioprotective and anti-inflammatory properties.",
    references: JSON.stringify([
      "European Journal of Medicinal Chemistry 2017",
      "Nutrients 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Quercetin",
      "Myricetin",
      "Green Vegetables",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Hesperidin",
    description:
      "A citrus flavonoid that supports vascular health and reduces inflammation.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Hesperidin",
      "from citrus peels",
      "Diosmin (related)",
    ]),
    benefits: JSON.stringify([
      "Vascular health",
      "Chronic venous insufficiency",
      "Hemorrhoid relief",
      "Inflammation reduction",
      "Blood pressure support",
    ]),
    usage: "Take 500-1000mg daily, often combined with diosmin.",
    dosage: "500-1000mg daily",
    precautions:
      "May interact with blood pressure medications. Generally well-tolerated.",
    scientificInfo:
      "Clinical evidence supports use for venous disorders and vascular health.",
    references: JSON.stringify([
      "Journal of Vascular Surgery 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Diosmin", "Rutin", "Vitamin C"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Rutin",
    description:
      "A bioflavonoid that strengthens blood vessels and supports vascular health.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Rutin (quercetin-3-rutinoside)",
      "from buckwheat, citrus",
    ]),
    benefits: JSON.stringify([
      "Vascular strength",
      "Bruising reduction",
      "Hemorrhoid support",
      "Varicose vein support",
      "Antioxidant effects",
    ]),
    usage: "Take 500-1000mg daily with vitamin C for absorption.",
    dosage: "500-1000mg daily",
    precautions: "Generally safe. May enhance effects of blood thinners.",
    scientificInfo:
      "Supports capillary strength and has demonstrated vascular protective effects.",
    references: JSON.stringify([
      "Phytotherapy Research 2017",
      "European Journal of Pharmacology 2019",
    ]),
    relatedRemedies: JSON.stringify(["Hesperidin", "Quercetin", "Vitamin C"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Naringenin",
    description:
      "A citrus flavonoid with metabolic and liver-protective properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify(["Naringenin", "from grapefruit, citrus"]),
    benefits: JSON.stringify([
      "Liver protection",
      "Metabolic support",
      "Cholesterol management",
      "Antioxidant effects",
      "Blood sugar support",
    ]),
    usage: "Take 100-500mg daily or consume through grapefruit.",
    dosage: "100-500mg daily",
    precautions:
      "Grapefruit compounds interact with many medications. Check drug interactions.",
    scientificInfo: "Research shows hepatoprotective and metabolic effects.",
    references: JSON.stringify([
      "Pharmacological Research 2018",
      "Biochemical Pharmacology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Hesperidin",
      "Milk Thistle",
      "Berberine",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Hydroxytyrosol",
    description:
      "A powerful antioxidant from olive oil with cardiovascular and neuroprotective effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Hydroxytyrosol",
      "from olive oil and olives",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Antioxidant protection",
      "Brain health",
      "Skin protection",
      "Anti-aging",
    ]),
    usage: "Take 5-25mg daily or consume extra virgin olive oil.",
    dosage: "5-25mg or 2+ tablespoons EVOO daily",
    precautions: "Generally safe. Best obtained from quality olive oil.",
    scientificInfo:
      "EFSA-approved health claim for cardiovascular protection at 5mg/day.",
    references: JSON.stringify(["EFSA Journal 2011", "Molecules 2019"]),
    relatedRemedies: JSON.stringify(["Olive Leaf", "Resveratrol", "CoQ10"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Oleuropein",
    description:
      "The primary phenol in olive leaves with antimicrobial and cardiovascular benefits.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify(["Oleuropein", "from olive leaves and fruit"]),
    benefits: JSON.stringify([
      "Blood pressure support",
      "Antimicrobial effects",
      "Antioxidant protection",
      "Cholesterol support",
      "Bone health",
    ]),
    usage: "Take 500-1000mg olive leaf extract standardized to oleuropein.",
    dosage: "500-1000mg olive leaf extract",
    precautions: "May lower blood pressure. Monitor if on BP medications.",
    scientificInfo:
      "Clinical trials show blood pressure-lowering effects comparable to some medications.",
    references: JSON.stringify([
      "Phytomedicine 2017",
      "Journal of Nutrition 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Olive Leaf",
      "Hydroxytyrosol",
      "Hawthorn",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Silymarin (Milk Thistle Extract)",
    description:
      "A standardized extract from milk thistle with powerful liver-protective properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Silybin",
      "Silydianin",
      "Silychristin",
      "Isosilybin",
    ]),
    benefits: JSON.stringify([
      "Liver protection",
      "Detoxification support",
      "Antioxidant effects",
      "Cholesterol support",
      "Skin health",
    ]),
    usage:
      "Take 200-400mg standardized extract (70-80% silymarin) 2-3 times daily.",
    dosage: "200-400mg standardized extract 2-3x daily",
    precautions:
      "May interact with medications metabolized by liver. Generally very safe.",
    scientificInfo:
      "Extensive research confirms hepatoprotective and regenerative effects on liver cells.",
    references: JSON.stringify([
      "World Journal of Hepatology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Milk Thistle", "NAC", "Artichoke"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Cynarin (Artichoke Extract)",
    description:
      "The primary compound in artichoke that supports liver function and cholesterol metabolism.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Cynarin",
      "Chlorogenic acid",
      "from artichoke leaves",
    ]),
    benefits: JSON.stringify([
      "Liver support",
      "Bile production",
      "Cholesterol management",
      "Digestive aid",
      "Blood sugar support",
    ]),
    usage: "Take 320-640mg artichoke leaf extract 2-3 times daily.",
    dosage: "320-640mg artichoke extract 2-3x daily",
    precautions:
      "Avoid with bile duct obstruction. Ragweed allergy cross-reaction possible.",
    scientificInfo:
      "Clinical trials show improvements in dyspepsia and modest cholesterol effects.",
    references: JSON.stringify([
      "Cochrane Database 2013",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Milk Thistle",
      "Dandelion",
      "Globe Artichoke",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Honokiol",
    description:
      "A lignan from magnolia bark with anxiolytic and neuroprotective properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Honokiol",
      "Magnolol",
      "from Magnolia officinalis",
    ]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "Sleep support",
      "Neuroprotection",
      "Anti-inflammatory effects",
      "Stress reduction",
    ]),
    usage:
      "Take 200-400mg magnolia bark extract standardized to honokiol/magnolol.",
    dosage: "200-400mg standardized magnolia extract",
    precautions: "May enhance effects of sedatives. Avoid during pregnancy.",
    scientificInfo:
      "Research shows GABA-A receptor modulation and anxiolytic effects.",
    references: JSON.stringify([
      "Neuropharmacology 2017",
      "Journal of Ethnopharmacology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Magnolia Bark",
      "Passionflower",
      "L-Theanine",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Theanine (L-Theanine)",
    description:
      "An amino acid from tea that promotes calm alertness without sedation.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify(["L-Theanine", "from Camellia sinensis (tea)"]),
    benefits: JSON.stringify([
      "Calm focus",
      "Anxiety reduction",
      "Sleep quality",
      "Cognitive enhancement",
      "Stress resilience",
    ]),
    usage: "Take 100-400mg daily, often combined with caffeine for focus.",
    dosage: "100-400mg daily",
    precautions:
      "Generally very safe. May enhance effects of blood pressure medications.",
    scientificInfo:
      "Research shows increased alpha brain waves and reduced anxiety.",
    references: JSON.stringify([
      "Nutritional Neuroscience 2017",
      "Journal of Clinical Psychiatry 2019",
    ]),
    relatedRemedies: JSON.stringify(["Green Tea", "GABA", "Magnesium"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Palmitoylethanolamide (PEA)",
    description:
      "An endocannabinoid-like compound with anti-inflammatory and pain-relieving properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Palmitoylethanolamide",
      "endogenously produced fatty acid amide",
    ]),
    benefits: JSON.stringify([
      "Pain relief",
      "Inflammation reduction",
      "Nerve health",
      "Immune modulation",
      "Sleep support",
    ]),
    usage: "Take 300-600mg 2-3 times daily for pain and inflammation.",
    dosage: "300-600mg 2-3x daily",
    precautions:
      "Generally well-tolerated. May enhance effects of pain medications.",
    scientificInfo:
      "Clinical trials show analgesic and anti-inflammatory effects via mast cell modulation.",
    references: JSON.stringify([
      "Pain and Therapy 2017",
      "CNS and Neurological Disorders Drug Targets 2019",
    ]),
    relatedRemedies: JSON.stringify(["CBD", "Curcumin", "Omega-3"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Ursolic Acid",
    description:
      "A triterpene found in apple peels and herbs with muscle-preserving and metabolic effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Ursolic acid",
      "from apple peels, rosemary, holy basil",
    ]),
    benefits: JSON.stringify([
      "Muscle preservation",
      "Fat metabolism",
      "Blood sugar support",
      "Anti-inflammatory effects",
      "Skin health",
    ]),
    usage: "Take 150-450mg daily with food.",
    dosage: "150-450mg daily",
    precautions: "Limited human research. Generally well-tolerated.",
    scientificInfo:
      "Animal studies show muscle-sparing and metabolic effects; human research emerging.",
    references: JSON.stringify([
      "Cell Metabolism 2012",
      "Molecular Nutrition and Food Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Holy Basil", "Apple Peel", "Rosemary"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Ginsenosides",
    description:
      "The active compounds in ginseng responsible for adaptogenic and cognitive effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Ginsenoside Rg1",
      "Rb1",
      "Rg3",
      "from Panax ginseng",
    ]),
    benefits: JSON.stringify([
      "Energy enhancement",
      "Cognitive support",
      "Immune modulation",
      "Stress adaptation",
      "Physical performance",
    ]),
    usage: "Take standardized ginseng extract providing 4-7% ginsenosides.",
    dosage: "200-400mg standardized extract (4-7% ginsenosides)",
    precautions:
      "May affect blood sugar and blood pressure. Stimulating for some. Cycle usage.",
    scientificInfo:
      "Different ginsenosides have distinct effects; research shows cognitive and immune benefits.",
    references: JSON.stringify([
      "Journal of Ginseng Research 2018",
      "Frontiers in Pharmacology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Panax Ginseng",
      "American Ginseng",
      "Eleuthero",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Withanolides",
    description:
      "The active compounds in ashwagandha responsible for adaptogenic and stress-relieving effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Withaferin A",
      "Withanolide D",
      "from Withania somnifera",
    ]),
    benefits: JSON.stringify([
      "Stress reduction",
      "Anxiety relief",
      "Thyroid support",
      "Testosterone support",
      "Cognitive enhancement",
    ]),
    usage: "Take standardized ashwagandha extract providing 5% withanolides.",
    dosage: "300-600mg extract (5% withanolides) daily",
    precautions:
      "May affect thyroid. Avoid with autoimmune thyroid conditions without supervision.",
    scientificInfo:
      "Clinical trials demonstrate significant cortisol reduction and stress relief.",
    references: JSON.stringify([
      "Journal of Alternative and Complementary Medicine 2014",
      "Indian Journal of Psychological Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Rhodiola", "Holy Basil"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Ellagic Acid",
    description:
      "A polyphenol found in berries and pomegranate with antioxidant and cellular health properties.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Ellagic acid",
      "Ellagitannins",
      "from pomegranate, berries, walnuts",
    ]),
    benefits: JSON.stringify([
      "Antioxidant protection",
      "Cellular health",
      "Skin protection",
      "Heart health",
      "Gut microbiome support",
    ]),
    usage: "Take 40-240mg daily or consume pomegranate/berry sources.",
    dosage: "40-240mg daily",
    precautions:
      "Generally safe. Metabolized to urolithins by gut bacteria (individual variation).",
    scientificInfo:
      "Converted to urolithins which have demonstrated anti-aging cellular effects.",
    references: JSON.stringify([
      "Nature Medicine 2016",
      "Molecular Nutrition and Food Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Pomegranate", "Urolithin A", "Berries"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Urolithin A",
    description:
      "A metabolite of ellagic acid that enhances mitochondrial function and muscle health.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Urolithin A",
      "gut metabolite of ellagitannins",
    ]),
    benefits: JSON.stringify([
      "Mitochondrial health",
      "Muscle function",
      "Anti-aging",
      "Exercise performance",
      "Cellular renewal",
    ]),
    usage: "Take 250-1000mg daily.",
    dosage: "250-1000mg daily",
    precautions:
      "Newer supplement. Limited long-term data. Generally well-tolerated.",
    scientificInfo:
      "Clinical trials show improvements in mitochondrial function and muscle strength.",
    references: JSON.stringify([
      "Nature Metabolism 2019",
      "JAMA Network Open 2022",
    ]),
    relatedRemedies: JSON.stringify(["Ellagic Acid", "Pomegranate", "NMN"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Spermidine",
    description:
      "A polyamine found in aged cheese and wheat germ that promotes autophagy and longevity.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Spermidine",
      "from wheat germ, aged cheese, soybeans",
    ]),
    benefits: JSON.stringify([
      "Autophagy induction",
      "Longevity research",
      "Heart health",
      "Cognitive function",
      "Hair growth",
    ]),
    usage: "Take 1-6mg daily or consume food sources.",
    dosage: "1-6mg daily",
    precautions:
      "Limited human research on supplementation. Generally safe through food.",
    scientificInfo:
      "Research shows autophagy induction and associations with longevity in population studies.",
    references: JSON.stringify([
      "Nature Medicine 2016",
      "American Journal of Clinical Nutrition 2018",
    ]),
    relatedRemedies: JSON.stringify(["Fasting", "Resveratrol", "NMN"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Ergothioneine",
    description:
      "A unique antioxidant found in mushrooms that accumulates in tissues under oxidative stress.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "L-Ergothioneine",
      "from mushrooms, especially shiitake",
    ]),
    benefits: JSON.stringify([
      "Antioxidant protection",
      "Longevity research",
      "Brain health",
      "Eye health",
      "Cellular protection",
    ]),
    usage: "Take 5-25mg daily or consume mushrooms regularly.",
    dosage: "5-25mg daily",
    precautions: "Generally safe. Limited human research on supplementation.",
    scientificInfo:
      "Body has dedicated transporter; accumulates in tissues under oxidative stress.",
    references: JSON.stringify(["FEBS Letters 2018", "Antioxidants 2020"]),
    relatedRemedies: JSON.stringify(["Mushrooms", "Glutathione", "NAC"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Beta-Glucans",
    description:
      "Polysaccharides from mushrooms and yeast that modulate immune function.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Beta-1,3/1,6-glucan",
      "from mushrooms, yeast, oats",
    ]),
    benefits: JSON.stringify([
      "Immune modulation",
      "Infection resistance",
      "Cholesterol support (oat)",
      "Gut health",
      "Cancer support research",
    ]),
    usage: "Take 250-500mg mushroom or yeast beta-glucan daily.",
    dosage: "250-500mg daily",
    precautions:
      "Generally safe. Immunomodulating effects may not suit all conditions.",
    scientificInfo:
      "Research shows immune cell activation and improved infection outcomes.",
    references: JSON.stringify([
      "Frontiers in Immunology 2017",
      "Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Reishi", "Turkey Tail", "Oats"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Hericenones",
    description:
      "Bioactive compounds from Lion's Mane mushroom that stimulate nerve growth factor.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Hericenones",
      "Erinacines",
      "from Hericium erinaceus",
    ]),
    benefits: JSON.stringify([
      "Nerve regeneration",
      "Cognitive enhancement",
      "Memory support",
      "Mood improvement",
      "Neuroprotection",
    ]),
    usage:
      "Take Lion's Mane extract containing both fruiting body and mycelium.",
    dosage: "500-3000mg Lion's Mane extract daily",
    precautions:
      "Generally safe. May affect blood clotting. Rare allergic reactions.",
    scientificInfo:
      "Research shows stimulation of NGF synthesis and cognitive improvements.",
    references: JSON.stringify([
      "Journal of Agricultural and Food Chemistry 2015",
      "Biomedical Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Lion's Mane", "Bacopa", "Ginkgo"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Gamma-Oryzanol",
    description:
      "A compound from rice bran oil with cholesterol-lowering and antioxidant effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Gamma-oryzanol",
      "Ferulic acid esters",
      "from rice bran oil",
    ]),
    benefits: JSON.stringify([
      "Cholesterol support",
      "Menopause support",
      "Antioxidant effects",
      "Athletic performance",
      "GI health",
    ]),
    usage: "Take 100-300mg daily.",
    dosage: "100-300mg daily",
    precautions:
      "Generally safe. May affect thyroid function with long-term high doses.",
    scientificInfo:
      "Research shows LDL cholesterol reduction and menopausal symptom improvement.",
    references: JSON.stringify([
      "Journal of Nutritional Science and Vitaminology 2016",
      "Nutrients 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Rice Bran Oil",
      "Red Yeast Rice",
      "Plant Sterols",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Policosanol",
    description:
      "A mixture of long-chain alcohols from sugar cane wax with cholesterol-modulating effects.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Octacosanol",
      "Triacontanol",
      "Hexacosanol",
      "from sugar cane",
    ]),
    benefits: JSON.stringify([
      "Cholesterol management",
      "Platelet aggregation",
      "Physical performance",
      "Circulation support",
    ]),
    usage: "Take 10-20mg daily, preferably with dinner.",
    dosage: "10-20mg daily",
    precautions:
      "Cuban studies show stronger effects than independent studies. Quality varies.",
    scientificInfo:
      "Research shows modest LDL reduction; results vary by source and study.",
    references: JSON.stringify([
      "Cochrane Database 2013",
      "Pharmacological Research 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Red Yeast Rice",
      "Plant Sterols",
      "Niacin",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Citrus Bioflavonoids Complex",
    description:
      "A combination of flavonoids from citrus that support vascular health and vitamin C function.",
    category: "Bioactive Compound",
    ingredients: JSON.stringify([
      "Hesperidin",
      "Naringin",
      "Rutin",
      "Quercetin",
      "from citrus",
    ]),
    benefits: JSON.stringify([
      "Vascular health",
      "Vitamin C enhancement",
      "Capillary strength",
      "Antioxidant effects",
      "Allergy support",
    ]),
    usage: "Take 500-1000mg daily, often with vitamin C.",
    dosage: "500-1000mg daily",
    precautions:
      "May interact with medications (grapefruit components). Generally safe.",
    scientificInfo:
      "Support vitamin C function and provide independent vascular benefits.",
    references: JSON.stringify(["Antioxidants 2018", "Nutrients 2020"]),
    relatedRemedies: JSON.stringify(["Vitamin C", "Quercetin", "Rutin"]),
    evidenceLevel: "Moderate",
  },
];
