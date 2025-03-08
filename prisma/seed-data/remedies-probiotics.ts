// Probiotics and digestive health remedies
export const probioticRemedies = [
  {
    name: "Lactobacillus Acidophilus",
    description:
      "Most common probiotic strain supporting digestive health and immune function.",
    category: "Probiotic",
    ingredients: JSON.stringify(["Lactobacillus acidophilus"]),
    benefits: JSON.stringify([
      "Digestive health",
      "Immune support",
      "Lactose digestion",
      "Vaginal health",
      "Cholesterol support",
    ]),
    usage:
      "Take on empty stomach or with light meal. Refrigerated products often more stable.",
    dosage: "1-10 billion CFU daily",
    precautions:
      "Generally safe. Those who are immunocompromised should consult healthcare provider.",
    scientificInfo:
      "L. acidophilus produces lactic acid, lowering intestinal pH and inhibiting pathogen growth. Adheres to intestinal epithelium.",
    references: JSON.stringify([
      "Marteau P, et al. Protection from gastrointestinal diseases with the use of probiotics. Am J Clin Nutr. 2001;73(2 Suppl):430S-436S.",
      "Sanders ME, Klaenhammer TR. The scientific basis of Lactobacillus acidophilus NCFM functionality. J Dairy Sci. 2001;84(2):319-331.",
    ]),
    relatedRemedies: JSON.stringify([
      "Bifidobacterium",
      "Saccharomyces Boulardii",
      "Prebiotic Fiber",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Bifidobacterium Lactis",
    description:
      "Probiotic strain supporting immune function, digestive comfort, and nutrient absorption.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Bifidobacterium lactis",
      "B. animalis subsp. lactis",
    ]),
    benefits: JSON.stringify([
      "Immune enhancement",
      "Digestive regularity",
      "Nutrient absorption",
      "Gut barrier function",
    ]),
    usage:
      "Take daily for consistent benefits. Can be taken with or without food.",
    dosage: "1-10 billion CFU daily",
    precautions:
      "Generally very safe. Start with lower CFU if new to probiotics.",
    scientificInfo:
      "B. lactis enhances natural killer cell activity and reduces intestinal permeability. Well-studied for immune function.",
    references: JSON.stringify([
      "Arunachalam K, et al. Enhancement of natural immune function by dietary consumption of Bifidobacterium lactis. Eur J Clin Nutr. 2000;54(3):263-267.",
      "Maneerat S, et al. Consumption of Bifidobacterium lactis Bi-07 by healthy elderly adults enhances phagocytic activity. J Nutr Sci. 2013;2:e44.",
    ]),
    relatedRemedies: JSON.stringify([
      "Lactobacillus",
      "Multi-Strain Probiotic",
      "Prebiotic Fiber",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Lactobacillus Rhamnosus GG",
    description:
      "Extensively researched probiotic strain for gut health, especially during antibiotic use and for children.",
    category: "Probiotic",
    ingredients: JSON.stringify(["Lactobacillus rhamnosus GG", "LGG"]),
    benefits: JSON.stringify([
      "Antibiotic-associated diarrhea prevention",
      "Immune support",
      "Gut health",
      "Childrens health",
      "Travel diarrhea prevention",
    ]),
    usage:
      "Start taking a few days before antibiotics and continue 1-2 weeks after.",
    dosage:
      "10-20 billion CFU daily during antibiotic use; 1-10 billion for maintenance",
    precautions:
      "Generally very safe. One of the most studied probiotic strains.",
    scientificInfo:
      "LGG adheres strongly to intestinal mucosa and produces substances that inhibit pathogenic bacteria. Robust clinical evidence.",
    references: JSON.stringify([
      "Szajewska H, et al. Lactobacillus rhamnosus GG for treating acute gastroenteritis in children. Cochrane Database Syst Rev. 2019;6:CD003323.",
      "Hojsak I, et al. Lactobacillus GG in the prevention of gastrointestinal and respiratory tract infections. Pediatrics. 2010;125(5):e1171-1177.",
    ]),
    relatedRemedies: JSON.stringify([
      "Saccharomyces Boulardii",
      "Multi-Strain Probiotic",
      "Zinc",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Saccharomyces Boulardii",
    description:
      "Beneficial yeast probiotic especially effective for diarrhea and gut infections.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Saccharomyces boulardii",
      "S. boulardii CNCM I-745",
    ]),
    benefits: JSON.stringify([
      "Diarrhea treatment",
      "C. difficile prevention",
      "Antibiotic-associated diarrhea",
      "Traveler diarrhea",
      "H. pylori support",
    ]),
    usage:
      "Can be taken with antibiotics (antibiotics do not kill it). Take 2 hours apart from antifungals.",
    dosage: "250-500 mg (5-10 billion CFU) twice daily",
    precautions:
      "Avoid in immunocompromised patients or those with central venous catheters. Not affected by antibiotics.",
    scientificInfo:
      "S. boulardii is a non-pathogenic yeast that survives stomach acid. It produces enzymes that break down bacterial toxins.",
    references: JSON.stringify([
      "McFarland LV. Systematic review and meta-analysis of Saccharomyces boulardii in adult patients. World J Gastroenterol. 2010;16(18):2202-2222.",
      "Szajewska H, et al. Systematic review: Saccharomyces boulardii for treating acute gastroenteritis in children. Aliment Pharmacol Ther. 2009;30(9):960-961.",
    ]),
    relatedRemedies: JSON.stringify([
      "Lactobacillus Rhamnosus",
      "Zinc",
      "Electrolytes",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Multi-Strain Probiotic",
    description:
      "Broad-spectrum probiotic combining multiple beneficial strains for comprehensive gut support.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Multiple Lactobacillus species",
      "Multiple Bifidobacterium species",
      "Streptococcus thermophilus",
    ]),
    benefits: JSON.stringify([
      "Comprehensive gut support",
      "Immune function",
      "Digestive health",
      "Microbiome diversity",
    ]),
    usage: "Take daily. Some products require refrigeration.",
    dosage: "10-50 billion CFU daily containing multiple strains",
    precautions:
      "Start with lower CFU if new to probiotics. Quality and strain documentation important.",
    scientificInfo:
      "Different strains have different mechanisms and colonize different areas of the gut. Diversity may provide broader benefits.",
    references: JSON.stringify([
      "Chapman CM, et al. Health benefits of probiotics: are mixtures more effective than single strains? Eur J Nutr. 2011;50(1):1-17.",
      "McFarland LV, et al. Strain-specificity and disease-specificity of probiotic efficacy: A systematic review. Front Med. 2018;5:124.",
    ]),
    relatedRemedies: JSON.stringify([
      "Prebiotic Fiber",
      "Fermented Foods",
      "L-Glutamine",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Lactobacillus Plantarum",
    description:
      "Versatile probiotic strain supporting gut barrier, immune function, and inflammation modulation.",
    category: "Probiotic",
    ingredients: JSON.stringify(["Lactobacillus plantarum"]),
    benefits: JSON.stringify([
      "Gut barrier support",
      "IBS symptom relief",
      "Immune modulation",
      "Inflammation reduction",
    ]),
    usage: "Take daily for consistent benefits.",
    dosage: "1-20 billion CFU daily",
    precautions: "Generally safe. May cause initial bloating that subsides.",
    scientificInfo:
      "L. plantarum produces plantaricins with antimicrobial properties. Well-studied for IBS and gut permeability.",
    references: JSON.stringify([
      "Niedzielin K, et al. A controlled, double-blind, randomized study on the efficacy of Lactobacillus plantarum 299V in patients with IBS. Eur J Gastroenterol Hepatol. 2001;13(10):1143-1147.",
      "Liu YW, et al. Effects of Lactobacillus plantarum PS128 on Children with Autism Spectrum Disorder. Nutrients. 2019;11(4):820.",
    ]),
    relatedRemedies: JSON.stringify([
      "Bifidobacterium",
      "Prebiotic Fiber",
      "L-Glutamine",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Spore-Based Probiotic (Bacillus)",
    description:
      "Soil-based organisms in spore form with exceptional stability and immune-modulating effects.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Bacillus coagulans",
      "Bacillus subtilis",
      "Bacillus clausii",
    ]),
    benefits: JSON.stringify([
      "Immune modulation",
      "Digestive health",
      "Shelf stability",
      "Antibiotic resistance",
      "SIBO support",
    ]),
    usage: "Do not require refrigeration. Can be taken with food.",
    dosage: "1-5 billion CFU daily",
    precautions:
      "Generally safe. Some products may be more potent than traditional probiotics.",
    scientificInfo:
      "Spore-forming bacteria survive stomach acid and germinate in intestines. May modulate immune response differently than Lactobacillus.",
    references: JSON.stringify([
      "Garvey SM, et al. The probiotic Bacillus subtilis BS50 decreases gastrointestinal symptoms in healthy adults. Gut Microbes. 2022;14(1):2020455.",
      "Jurenka JS. Bacillus coagulans. Altern Med Rev. 2012;17(1):76-81.",
    ]),
    relatedRemedies: JSON.stringify([
      "Multi-Strain Probiotic",
      "Prebiotic Fiber",
      "Digestive Enzymes",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Prebiotic Fiber (Inulin/FOS)",
    description:
      "Non-digestible fibers that feed beneficial gut bacteria, enhancing probiotic effectiveness.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Inulin",
      "Fructooligosaccharides",
      "FOS",
      "Chicory root fiber",
    ]),
    benefits: JSON.stringify([
      "Feeds beneficial bacteria",
      "Improves mineral absorption",
      "Digestive regularity",
      "Blood sugar support",
    ]),
    usage:
      "Start slowly to minimize gas and bloating. Increase gradually over 2-3 weeks.",
    dosage: "5-15 g daily, starting with 2-3 g",
    precautions:
      "May cause gas and bloating initially. Those with SIBO or FODMAP sensitivity should use caution.",
    scientificInfo:
      "Prebiotics selectively stimulate growth of beneficial Bifidobacteria and Lactobacilli. Fermentation produces short-chain fatty acids.",
    references: JSON.stringify([
      "Roberfroid M, et al. Prebiotic effects: metabolic and health benefits. Br J Nutr. 2010;104(S2):S1-S63.",
      "Slavin J. Fiber and prebiotics: mechanisms and health benefits. Nutrients. 2013;5(4):1417-1435.",
    ]),
    relatedRemedies: JSON.stringify([
      "Probiotics",
      "Psyllium Husk",
      "Acacia Fiber",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Digestive Enzymes",
    description:
      "Supplemental enzymes supporting breakdown and absorption of proteins, fats, and carbohydrates.",
    category: "Digestive Aid",
    ingredients: JSON.stringify([
      "Protease",
      "Lipase",
      "Amylase",
      "Lactase",
      "Cellulase",
    ]),
    benefits: JSON.stringify([
      "Improved digestion",
      "Reduced bloating",
      "Nutrient absorption",
      "Lactose digestion",
      "Food sensitivity support",
    ]),
    usage:
      "Take at beginning of meals containing the foods you need help digesting.",
    dosage: "Follow product directions; typically 1-2 capsules with meals",
    precautions:
      "May not be needed by everyone. Those with ulcers should use caution with protease.",
    scientificInfo:
      "Supplemental enzymes compensate for insufficient endogenous enzyme production and support breakdown of hard-to-digest foods.",
    references: JSON.stringify([
      "Ianiro G, et al. Digestive Enzyme Supplementation in Gastrointestinal Diseases. Curr Drug Metab. 2016;17(2):187-193.",
      "Roxas M. The role of enzyme supplementation in digestive disorders. Altern Med Rev. 2008;13(4):307-314.",
    ]),
    relatedRemedies: JSON.stringify(["Betaine HCl", "Probiotics", "Ginger"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Betaine HCl",
    description:
      "Supplemental stomach acid for those with low stomach acid (hypochlorhydria).",
    category: "Digestive Aid",
    ingredients: JSON.stringify(["Betaine hydrochloride", "Pepsin"]),
    benefits: JSON.stringify([
      "Protein digestion",
      "Mineral absorption",
      "SIBO prevention",
      "Acid reflux relief (in low acid conditions)",
    ]),
    usage:
      "Take at beginning of protein-containing meals. Start with low dose and increase gradually.",
    dosage: "325-650 mg with meals; up to 3000 mg for those who need it",
    precautions:
      "Not for those with ulcers, gastritis, or taking NSAIDs. Discontinue if burning occurs.",
    scientificInfo:
      "Low stomach acid impairs protein digestion and mineral absorption. Common in elderly and those on acid-blocking medications.",
    references: JSON.stringify([
      "Yago MR, et al. Gastric reacidification with betaine HCl in healthy volunteers with rabeprazole-induced hypochlorhydria. Mol Pharm. 2013;10(11):4032-4037.",
      "Kines K, Krupczak T. Nutritional Interventions for Gastroesophageal Reflux, Irritable Bowel Syndrome, and Hypochlorhydria. Integr Med. 2016;15(4):33-37.",
    ]),
    relatedRemedies: JSON.stringify([
      "Apple Cider Vinegar",
      "Digestive Enzymes",
      "Zinc",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Psyllium Husk",
    description:
      "Soluble fiber supporting digestive regularity, cholesterol, and blood sugar.",
    category: "Digestive Aid",
    ingredients: JSON.stringify(["Psyllium husk", "Plantago ovata"]),
    benefits: JSON.stringify([
      "Digestive regularity",
      "Cholesterol reduction",
      "Blood sugar support",
      "Satiety",
      "IBS symptom relief",
    ]),
    usage:
      "Take with large glass of water. Can be taken before meals for blood sugar.",
    dosage: "5-10 g daily in divided doses with at least 8 oz water per dose",
    precautions:
      "Must be taken with adequate water. May cause choking if not. Separate from medications by 2 hours.",
    scientificInfo:
      "Psyllium forms a gel that slows digestion, binds bile acids, and provides bulk. FDA-approved claim for cholesterol reduction.",
    references: JSON.stringify([
      "Anderson JW, et al. Cholesterol-lowering effects of psyllium intake. Am J Clin Nutr. 2000;71(2):472-479.",
      "Bijkerk CJ, et al. Soluble or insoluble fibre in irritable bowel syndrome? BMJ. 2009;339:b3154.",
    ]),
    relatedRemedies: JSON.stringify([
      "Prebiotic Fiber",
      "Acacia Fiber",
      "Flaxseed",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Aloe Vera (Internal)",
    description: "Soothing plant gel for digestive comfort and gut healing.",
    category: "Digestive Aid",
    ingredients: JSON.stringify([
      "Aloe vera gel",
      "Acemannan",
      "Polysaccharides",
    ]),
    benefits: JSON.stringify([
      "Digestive soothing",
      "Gut healing",
      "Acid reflux relief",
      "Constipation relief",
      "IBS support",
    ]),
    usage:
      "Use inner leaf gel or decolorized whole leaf products. Avoid aloin/latex for regular use.",
    dosage: "1-3 oz gel or 100-200 mg concentrated extract daily",
    precautions:
      "Products with aloin cause laxative effect and should not be used long-term. Choose purified products.",
    scientificInfo:
      "Acemannan has immunomodulatory and wound-healing properties. Aloe soothes and protects mucous membranes.",
    references: JSON.stringify([
      "Panahi Y, et al. Efficacy of Aloe vera syrup for the treatment of gastroesophageal reflux disease. J Tradit Chin Med. 2015;35(6):632-636.",
      "Foster M, et al. Evaluation of the Nutritional and Metabolic Effects of Aloe vera. In: Herbal Medicine: Biomolecular and Clinical Aspects. 2011.",
    ]),
    relatedRemedies: JSON.stringify([
      "DGL Licorice",
      "Slippery Elm",
      "L-Glutamine",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Apple Cider Vinegar",
    description:
      "Fermented apple product traditionally used for digestive and metabolic support.",
    category: "Digestive Aid",
    ingredients: JSON.stringify([
      "Acetic acid",
      "Malic acid",
      "Mother culture",
    ]),
    benefits: JSON.stringify([
      "Digestive support",
      "Blood sugar modulation",
      "Appetite control",
      "Antimicrobial",
    ]),
    usage:
      "Dilute 1-2 tablespoons in water before meals. Can damage tooth enamel if undiluted.",
    dosage: "1-2 tablespoons diluted in water, 1-3 times daily before meals",
    precautions:
      "Always dilute. May worsen acid reflux in some. May lower potassium with high doses.",
    scientificInfo:
      "Acetic acid may slow gastric emptying and carbohydrate absorption. Limited but promising research on blood sugar effects.",
    references: JSON.stringify([
      "Johnston CS, et al. Vinegar improves insulin sensitivity to a high-carbohydrate meal in subjects with insulin resistance or type 2 diabetes. Diabetes Care. 2004;27(1):281-282.",
      "Kondo T, et al. Vinegar intake reduces body weight, body fat mass, and serum triglyceride levels. Biosci Biotechnol Biochem. 2009;73(8):1837-1843.",
    ]),
    relatedRemedies: JSON.stringify([
      "Betaine HCl",
      "Digestive Enzymes",
      "Lemon Water",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Zinc Carnosine",
    description:
      "Chelated zinc compound specifically supporting stomach and intestinal lining health.",
    category: "Digestive Aid",
    ingredients: JSON.stringify(["Zinc L-carnosine", "Polaprezinc"]),
    benefits: JSON.stringify([
      "Stomach lining protection",
      "Gut healing",
      "H. pylori support",
      "Ulcer healing",
      "Intestinal integrity",
    ]),
    usage:
      "Take between meals for gut healing. Can be taken with food if stomach sensitive.",
    dosage: "75-150 mg daily (providing approximately 16-32 mg elemental zinc)",
    precautions:
      "High zinc intake long-term requires copper balance. Do not exceed recommended zinc intake.",
    scientificInfo:
      "Zinc carnosine adheres to ulcerated tissue and promotes healing. Approved in Japan for gastric ulcers.",
    references: JSON.stringify([
      "Mahmood A, et al. Zinc carnosine, a health food supplement that stabilises small bowel integrity. Gut. 2007;56(2):168-175.",
      "Sakae K, Yanagisawa H. Oral treatment of pressure ulcers with polaprezinc (zinc L-carnosine complex). Nutr Clin Pract. 2014;29(3):363-370.",
    ]),
    relatedRemedies: JSON.stringify([
      "L-Glutamine",
      "DGL Licorice",
      "Aloe Vera",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Activated Charcoal",
    description:
      "Highly adsorbent carbon for acute digestive distress and detoxification support.",
    category: "Digestive Aid",
    ingredients: JSON.stringify(["Activated charcoal", "Activated carbon"]),
    benefits: JSON.stringify([
      "Gas and bloating relief",
      "Food poisoning support",
      "Toxin binding",
      "Hangover support",
    ]),
    usage:
      "Take 2 hours away from food, medications, and supplements as it adsorbs them.",
    dosage: "500-1000 mg as needed for acute symptoms; not for daily use",
    precautions:
      "Binds medications and nutrients. Not for regular use. May cause constipation. Can interfere with drug absorption.",
    scientificInfo:
      "Activated charcoals highly porous structure provides massive surface area for adsorbing toxins and gases.",
    references: JSON.stringify([
      "Juurlink DN. Activated charcoal for acute overdose. J Toxicol Clin Toxicol. 2005;43(1):61-87.",
      "Silberman J, et al. Activated Charcoal. In: StatPearls. 2023.",
    ]),
    relatedRemedies: JSON.stringify(["Ginger", "Peppermint", "Probiotics"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Fermented Foods (General)",
    description:
      "Traditionally preserved foods providing natural probiotics and enhanced nutrients.",
    category: "Probiotic",
    ingredients: JSON.stringify([
      "Lactobacillus species",
      "Bifidobacterium species",
      "Beneficial yeasts",
      "Organic acids",
    ]),
    benefits: JSON.stringify([
      "Natural probiotics",
      "Improved digestion",
      "Enhanced nutrient availability",
      "Immune support",
      "Microbiome diversity",
    ]),
    usage:
      "Include variety of fermented foods daily. Start slowly if new to fermented foods.",
    dosage: "1-3 servings daily of various fermented foods",
    precautions:
      "Those with histamine intolerance may react to fermented foods. Quality and proper fermentation important.",
    scientificInfo:
      "Fermentation increases nutrient bioavailability, reduces antinutrients, and produces beneficial organic acids and probiotics.",
    references: JSON.stringify([
      "Marco ML, et al. Health benefits of fermented foods: microbiota and beyond. Curr Opin Biotechnol. 2017;44:94-102.",
      "Dimidi E, et al. Fermented Foods: Definitions and Characteristics, Impact on the Gut Microbiota and Effects on Gastrointestinal Health. Nutrients. 2019;11(8):1806.",
    ]),
    relatedRemedies: JSON.stringify([
      "Probiotics",
      "Kimchi",
      "Sauerkraut",
      "Kefir",
      "Kombucha",
    ]),
    evidenceLevel: "Moderate",
  },
];
