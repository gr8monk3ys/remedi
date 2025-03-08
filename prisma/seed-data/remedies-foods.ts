// Food-based and additional natural remedies
export const foodRemedies = [
  {
    name: "Tart Cherry Juice",
    description:
      "Natural source of melatonin, anthocyanins, and anti-inflammatory compounds for sleep and recovery.",
    category: "Food",
    ingredients: JSON.stringify([
      "Anthocyanins",
      "Melatonin",
      "Quercetin",
      "Tart cherries",
    ]),
    benefits: JSON.stringify([
      "Sleep improvement",
      "Muscle recovery",
      "Uric acid reduction",
      "Anti-inflammatory",
      "Antioxidant",
    ]),
    usage:
      "Drink 8-16 oz daily, ideally 1-2 hours before bed for sleep benefits.",
    dosage:
      "8-16 oz (240-480 mL) tart cherry juice or equivalent concentrate daily",
    precautions:
      "Contains natural sugars. May interact with blood thinners due to vitamin K content.",
    scientificInfo:
      "Tart cherries contain natural melatonin and high levels of anthocyanins that reduce inflammation and oxidative stress.",
    references: JSON.stringify([
      "Howatson G, et al. Effect of tart cherry juice on melatonin levels and enhanced sleep quality. Eur J Nutr. 2012;51(8):909-916.",
      "Kelley DS, et al. A Review of the Health Benefits of Cherries. Nutrients. 2018;10(3):368.",
    ]),
    relatedRemedies: JSON.stringify([
      "Melatonin",
      "Quercetin",
      "Anthocyanin-rich foods",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "DGL Licorice",
    description:
      "Deglycyrrhizinated licorice for digestive comfort without blood pressure effects of regular licorice.",
    category: "Herbal",
    ingredients: JSON.stringify([
      "Deglycyrrhizinated licorice",
      "Glycyrrhiza glabra extract",
    ]),
    benefits: JSON.stringify([
      "Stomach lining protection",
      "Acid reflux relief",
      "Ulcer support",
      "Digestive comfort",
    ]),
    usage: "Chew tablets 20 minutes before meals for best effect.",
    dosage: "380-760 mg chewable tablets before meals, up to 3 times daily",
    precautions:
      "DGL form is safe for those with blood pressure concerns. Regular licorice may raise blood pressure.",
    scientificInfo:
      "DGL stimulates mucus production and protects the stomach lining without the aldosterone-like effects of glycyrrhizin.",
    references: JSON.stringify([
      "Raveendra KR, et al. An Extract of Glycyrrhiza glabra (GutGard) Alleviates Symptoms of Functional Dyspepsia. Evid Based Complement Alternat Med. 2012;2012:216970.",
      "Aly AM, et al. Licorice: a possible anti-inflammatory and anti-ulcer drug. AAPS PharmSciTech. 2005;6(1):E74-82.",
    ]),
    relatedRemedies: JSON.stringify([
      "Slippery Elm",
      "Marshmallow Root",
      "Aloe Vera",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Fatty Fish",
    description:
      "Cold-water fish rich in omega-3 fatty acids for heart, brain, and inflammatory health.",
    category: "Food",
    ingredients: JSON.stringify([
      "EPA",
      "DHA",
      "Omega-3 fatty acids",
      "Vitamin D",
      "Selenium",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Brain function",
      "Anti-inflammatory",
      "Joint health",
      "Mood support",
    ]),
    usage:
      "Consume 2-3 servings per week of salmon, mackerel, sardines, or herring.",
    dosage: "3-4 oz serving, 2-3 times per week",
    precautions:
      "Be aware of mercury content in larger fish. Choose wild-caught when possible.",
    scientificInfo:
      "Fatty fish provide EPA and DHA in their natural triglyceride form, along with other nutrients like vitamin D and selenium.",
    references: JSON.stringify([
      "Mozaffarian D, Rimm EB. Fish intake, contaminants, and human health: evaluating the risks and benefits. JAMA. 2006;296(15):1885-1899.",
      "Swanson D, et al. Omega-3 fatty acids EPA and DHA: health benefits throughout life. Adv Nutr. 2012;3(1):1-7.",
    ]),
    relatedRemedies: JSON.stringify(["Fish Oil", "Krill Oil", "Algae Oil"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Leafy Greens",
    description:
      "Nutrient-dense vegetables providing vitamins, minerals, and phytonutrients.",
    category: "Food",
    ingredients: JSON.stringify([
      "Vitamin K",
      "Folate",
      "Magnesium",
      "Nitrates",
      "Lutein",
      "Fiber",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Bone health",
      "Eye health",
      "Detoxification",
      "Blood pressure support",
    ]),
    usage:
      "Include 1-2 cups of leafy greens daily in salads, smoothies, or cooked dishes.",
    dosage: "2-3 cups raw or 1-1.5 cups cooked daily",
    precautions:
      "Those on warfarin should maintain consistent vitamin K intake. High oxalate greens may affect kidney stone formers.",
    scientificInfo:
      "Leafy greens are among the most nutrient-dense foods, providing nitrates that convert to nitric oxide for cardiovascular benefits.",
    references: JSON.stringify([
      "Morris MC, et al. Nutrients and bioactives in green leafy vegetables and cognitive decline. Neurology. 2018;90(3):e214-e222.",
      "Blekkenhorst LC, et al. Cardiovascular Health Benefits of Specific Vegetable Types. Adv Nutr. 2018;9(5):569-579.",
    ]),
    relatedRemedies: JSON.stringify(["Folate", "Vitamin K", "Magnesium"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Bone Broth",
    description:
      "Nutrient-rich broth made from simmering bones, providing collagen, amino acids, and minerals.",
    category: "Food",
    ingredients: JSON.stringify([
      "Collagen",
      "Glycine",
      "Proline",
      "Glutamine",
      "Minerals",
      "Gelatin",
    ]),
    benefits: JSON.stringify([
      "Gut health",
      "Joint support",
      "Skin health",
      "Immune support",
      "Digestive comfort",
    ]),
    usage: "Drink 1-2 cups daily as a warm beverage or use as base for soups.",
    dosage: "8-16 oz daily",
    precautions:
      "Quality varies widely. Choose organic, grass-fed sources. May contain lead from bones.",
    scientificInfo:
      "Bone broth provides bioavailable collagen peptides and amino acids like glycine and glutamine that support gut and connective tissue.",
    references: JSON.stringify([
      "Shoulders MD, Raines RT. Collagen structure and stability. Annu Rev Biochem. 2009;78:929-958.",
      "Bello AE, Oesser S. Collagen hydrolysate for the treatment of osteoarthritis and other joint disorders. Curr Med Res Opin. 2006;22(11):2221-2232.",
    ]),
    relatedRemedies: JSON.stringify([
      "Collagen Peptides",
      "L-Glutamine",
      "Glycine",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Dark Chocolate (85%+)",
    description:
      "High-cocoa chocolate providing flavanols for cardiovascular and cognitive benefits.",
    category: "Food",
    ingredients: JSON.stringify([
      "Cocoa flavanols",
      "Theobromine",
      "Magnesium",
      "Polyphenols",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Blood pressure support",
      "Cognitive function",
      "Mood enhancement",
      "Antioxidant",
    ]),
    usage: "Consume 1-2 oz of 85%+ dark chocolate daily.",
    dosage: "1-2 oz (30-60 g) of high-cocoa chocolate daily",
    precautions:
      "Contains caffeine and theobromine. May cause migraine in sensitive individuals.",
    scientificInfo:
      "Cocoa flavanols improve endothelial function, enhance nitric oxide availability, and may support cognitive performance.",
    references: JSON.stringify([
      "Katz DL, et al. Cocoa and chocolate in human health and disease. Antioxid Redox Signal. 2011;15(10):2779-2811.",
      "Socci V, et al. Enhancing Human Cognition with Cocoa Flavonoids. Front Nutr. 2017;4:19.",
    ]),
    relatedRemedies: JSON.stringify([
      "Cocoa Flavanols",
      "Magnesium",
      "Resveratrol",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Fermented Vegetables",
    description:
      "Traditionally fermented vegetables providing natural probiotics and enhanced nutrients.",
    category: "Food",
    ingredients: JSON.stringify([
      "Lactobacillus species",
      "Organic acids",
      "Vitamins",
      "Fiber",
    ]),
    benefits: JSON.stringify([
      "Gut health",
      "Immune support",
      "Nutrient absorption",
      "Digestive health",
    ]),
    usage: "Include 1-2 tablespoons to 1/2 cup with meals.",
    dosage: "1-4 tablespoons daily",
    precautions:
      "Start slowly to allow gut adaptation. Those with histamine intolerance may react.",
    scientificInfo:
      "Lacto-fermentation creates beneficial bacteria and organic acids while preserving and enhancing vegetable nutrients.",
    references: JSON.stringify([
      "Parvez S, et al. Probiotics and their fermented food products are beneficial for health. J Appl Microbiol. 2006;100(6):1171-1185.",
      "Dimidi E, et al. Fermented Foods: Definitions and Characteristics, Impact on the Gut Microbiota. Nutrients. 2019;11(8):1806.",
    ]),
    relatedRemedies: JSON.stringify(["Probiotics", "Sauerkraut", "Kimchi"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Blueberries",
    description:
      "Antioxidant-rich berries supporting brain health, cardiovascular function, and blood sugar.",
    category: "Food",
    ingredients: JSON.stringify([
      "Anthocyanins",
      "Pterostilbene",
      "Fiber",
      "Vitamin C",
      "Vitamin K",
    ]),
    benefits: JSON.stringify([
      "Brain health",
      "Cognitive function",
      "Cardiovascular support",
      "Blood sugar regulation",
      "Antioxidant",
    ]),
    usage: "Consume 1/2 to 1 cup fresh or frozen blueberries daily.",
    dosage: "1/2 to 1 cup (75-150 g) daily",
    precautions:
      "Generally very safe. Organic preferred to reduce pesticide exposure.",
    scientificInfo:
      "Blueberry anthocyanins cross the blood-brain barrier and accumulate in brain regions important for learning and memory.",
    references: JSON.stringify([
      "Miller MG, et al. Dietary blueberry improves cognition among older adults. Eur J Nutr. 2018;57(3):1169-1180.",
      "Kalt W, et al. Recent Research on the Health Benefits of Blueberries and Their Anthocyanins. Adv Nutr. 2020;11(2):224-236.",
    ]),
    relatedRemedies: JSON.stringify([
      "Anthocyanins",
      "Pterostilbene",
      "Resveratrol",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Walnuts",
    description:
      "Brain-shaped nuts providing ALA omega-3s, polyphenols, and melatonin.",
    category: "Food",
    ingredients: JSON.stringify([
      "Alpha-linolenic acid",
      "Polyphenols",
      "Melatonin",
      "Vitamin E",
      "Copper",
    ]),
    benefits: JSON.stringify([
      "Brain health",
      "Heart health",
      "Anti-inflammatory",
      "Gut microbiome",
      "Sleep support",
    ]),
    usage: "Consume 1-2 oz (a small handful) of walnuts daily.",
    dosage: "1-2 oz (28-56 g) daily",
    precautions: "Tree nut allergy. High calorie density.",
    scientificInfo:
      "Walnuts are the only nut with significant ALA omega-3 content and contain unique polyphenols with antioxidant activity.",
    references: JSON.stringify([
      "Chauhan A, Chauhan V. Beneficial Effects of Walnuts on Cognition and Brain Health. Nutrients. 2020;12(2):550.",
      "Ros E. Health benefits of nut consumption. Nutrients. 2010;2(7):652-682.",
    ]),
    relatedRemedies: JSON.stringify(["Flaxseed", "Fish Oil", "Almonds"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Extra Virgin Olive Oil",
    description:
      "Cold-pressed olive oil rich in oleocanthal and other polyphenols with anti-inflammatory properties.",
    category: "Food",
    ingredients: JSON.stringify([
      "Oleocanthal",
      "Oleic acid",
      "Hydroxytyrosol",
      "Polyphenols",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Anti-inflammatory",
      "Brain health",
      "Antioxidant",
      "Blood sugar support",
    ]),
    usage:
      "Use 2-4 tablespoons daily for cooking at low-medium heat or as dressing.",
    dosage: "2-4 tablespoons (30-60 mL) daily",
    precautions:
      "Choose high-quality extra virgin. Store away from light and heat.",
    scientificInfo:
      "Oleocanthal has similar anti-inflammatory action to ibuprofen. EVOO polyphenols protect LDL from oxidation.",
    references: JSON.stringify([
      "Beauchamp GK, et al. Phytochemistry: ibuprofen-like activity in extra-virgin olive oil. Nature. 2005;437(7055):45-46.",
      "Covas MI, et al. The effect of polyphenols in olive oil on heart disease risk factors. Ann Intern Med. 2006;145(5):333-341.",
    ]),
    relatedRemedies: JSON.stringify([
      "Olive Leaf Extract",
      "Mediterranean Diet",
      "Omega-9",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Turmeric Golden Milk",
    description:
      "Traditional warm beverage combining turmeric with fat and black pepper for optimal absorption.",
    category: "Food",
    ingredients: JSON.stringify([
      "Turmeric",
      "Black pepper",
      "Coconut milk",
      "Ginger",
      "Cinnamon",
    ]),
    benefits: JSON.stringify([
      "Anti-inflammatory",
      "Sleep support",
      "Digestive comfort",
      "Joint health",
      "Immune support",
    ]),
    usage:
      "Drink 1 cup in the evening for relaxation and anti-inflammatory benefits.",
    dosage: "1 cup daily, typically containing 1/2 to 1 teaspoon turmeric",
    precautions:
      "May stain clothes and surfaces. Use caution with gallbladder issues.",
    scientificInfo:
      "Combining turmeric with black pepper (piperine) increases curcumin absorption by 2000%. Fat also enhances absorption.",
    references: JSON.stringify([
      "Shoba G, et al. Influence of piperine on the pharmacokinetics of curcumin. Planta Med. 1998;64(4):353-356.",
      "Hewlings SJ, Kalman DS. Curcumin: A Review of Its Effects on Human Health. Foods. 2017;6(10):92.",
    ]),
    relatedRemedies: JSON.stringify(["Turmeric", "Ginger", "Cinnamon"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Apple Cider Vinegar (with Mother)",
    description:
      "Raw, unfiltered apple cider vinegar containing beneficial bacteria and enzymes.",
    category: "Food",
    ingredients: JSON.stringify([
      "Acetic acid",
      "Malic acid",
      "Mother culture",
      "Probiotics",
    ]),
    benefits: JSON.stringify([
      "Blood sugar support",
      "Digestive aid",
      "Weight management",
      "Antimicrobial",
    ]),
    usage:
      "Dilute 1-2 tablespoons in water before meals. Never drink undiluted.",
    dosage: "1-2 tablespoons diluted in 8 oz water, 1-3 times daily",
    precautions:
      "Always dilute to protect tooth enamel and esophagus. May worsen acid reflux in some.",
    scientificInfo:
      "Acetic acid may slow gastric emptying and reduce post-meal blood sugar spikes. The mother contains beneficial bacteria.",
    references: JSON.stringify([
      "Johnston CS, et al. Vinegar improves insulin sensitivity to a high-carbohydrate meal. Diabetes Care. 2004;27(1):281-282.",
      "Petsiou EI, et al. Effect and mechanisms of action of vinegar on glucose metabolism. Nutr Rev. 2014;72(10):651-661.",
    ]),
    relatedRemedies: JSON.stringify([
      "Digestive Enzymes",
      "Betaine HCl",
      "Probiotics",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Manuka Honey",
    description:
      "Medicinal honey from New Zealand with unique antibacterial properties.",
    category: "Food",
    ingredients: JSON.stringify([
      "Methylglyoxal",
      "Hydrogen peroxide",
      "Bee defensin-1",
      "Enzymes",
    ]),
    benefits: JSON.stringify([
      "Wound healing",
      "Antibacterial",
      "Sore throat relief",
      "Digestive support",
      "Skin health",
    ]),
    usage: "Take 1-2 teaspoons daily or apply topically for wound care.",
    dosage: "1-2 teaspoons daily; UMF 10+ or MGO 263+ for therapeutic use",
    precautions:
      "Not for infants under 1 year. Contains sugar. Choose verified UMF or MGO ratings.",
    scientificInfo:
      "Methylglyoxal (MGO) in Manuka honey provides unique non-peroxide antibacterial activity effective against drug-resistant bacteria.",
    references: JSON.stringify([
      "Molan PC. The antibacterial activity of honey. Bee World. 1992;73(1):5-28.",
      "Carter DA, et al. Therapeutic Manuka Honey: No Longer So Alternative. Front Microbiol. 2016;7:569.",
    ]),
    relatedRemedies: JSON.stringify(["Raw Honey", "Propolis", "Bee Pollen"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Green Tea",
    description:
      "Traditional beverage providing EGCG, L-theanine, and gentle caffeine for calm alertness.",
    category: "Food",
    ingredients: JSON.stringify([
      "EGCG",
      "L-theanine",
      "Caffeine",
      "Catechins",
    ]),
    benefits: JSON.stringify([
      "Antioxidant",
      "Calm focus",
      "Metabolism support",
      "Cardiovascular health",
      "Brain health",
    ]),
    usage: "Drink 2-3 cups daily. Steep at 160-180F to avoid bitterness.",
    dosage: "2-4 cups daily",
    precautions:
      "Contains caffeine. May reduce iron absorption if drunk with meals.",
    scientificInfo:
      "Green tea provides L-theanine which counteracts caffeine jitters while EGCG offers potent antioxidant benefits.",
    references: JSON.stringify([
      "Mancini E, et al. Green tea effects on cognition, mood and human brain function. Phytomedicine. 2017;34:26-37.",
      "Cabrera C, et al. Beneficial effects of green tea-a review. J Am Coll Nutr. 2006;25(2):79-99.",
    ]),
    relatedRemedies: JSON.stringify([
      "L-Theanine",
      "Green Tea Extract",
      "Matcha",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Coconut Oil",
    description:
      "Medium-chain triglyceride-rich oil for energy, brain function, and antimicrobial support.",
    category: "Food",
    ingredients: JSON.stringify([
      "Lauric acid",
      "Caprylic acid",
      "Capric acid",
      "MCTs",
    ]),
    benefits: JSON.stringify([
      "Quick energy",
      "Brain fuel",
      "Antimicrobial",
      "Skin and hair health",
    ]),
    usage: "Use for cooking, in coffee, or as a skin moisturizer.",
    dosage: "1-2 tablespoons daily",
    precautions:
      "High in saturated fat. May not be suitable for those with certain cardiovascular risks.",
    scientificInfo:
      "Medium-chain triglycerides are rapidly absorbed and converted to ketones, providing quick energy for brain and body.",
    references: JSON.stringify([
      "Mumme K, Stonehouse W. Effects of medium-chain triglycerides on weight loss and body composition. J Acad Nutr Diet. 2015;115(2):249-263.",
      "Fernando WM, et al. The role of dietary coconut for the prevention and treatment of Alzheimers disease. Br J Nutr. 2015;114(1):1-14.",
    ]),
    relatedRemedies: JSON.stringify([
      "MCT Oil",
      "Lauric Acid",
      "Ketogenic Diet",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Beetroot",
    description:
      "Nitrate-rich root vegetable supporting blood pressure and exercise performance.",
    category: "Food",
    ingredients: JSON.stringify([
      "Dietary nitrates",
      "Betalains",
      "Betaine",
      "Folate",
      "Potassium",
    ]),
    benefits: JSON.stringify([
      "Blood pressure support",
      "Exercise performance",
      "Endurance",
      "Circulation",
      "Anti-inflammatory",
    ]),
    usage:
      "Consume raw, juiced, or roasted. Beetroot juice or powder also effective.",
    dosage: "1-2 cups cooked beets or 250-500 mL juice daily",
    precautions:
      "May cause pink/red urine (beeturia) - harmless. High in oxalates.",
    scientificInfo:
      "Dietary nitrates convert to nitric oxide, improving blood vessel function and oxygen efficiency during exercise.",
    references: JSON.stringify([
      "Siervo M, et al. Inorganic nitrate and beetroot juice supplementation reduces blood pressure in adults. J Nutr. 2013;143(6):818-826.",
      "Jones AM. Dietary nitrate supplementation and exercise performance. Sports Med. 2014;44(S1):S35-45.",
    ]),
    relatedRemedies: JSON.stringify([
      "L-Citrulline",
      "L-Arginine",
      "Nitric Oxide Support",
    ]),
    evidenceLevel: "Strong",
  },
];
