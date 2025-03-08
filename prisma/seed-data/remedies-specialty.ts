// Omega fatty acids, specialty nutrients, and miscellaneous remedies
export const specialtyRemedies = [
  {
    name: "Omega-3 Fish Oil (EPA/DHA)",
    description:
      "Essential fatty acids from fish supporting cardiovascular, brain, and inflammatory health.",
    category: "Fatty Acid",
    ingredients: JSON.stringify([
      "EPA (Eicosapentaenoic acid)",
      "DHA (Docosahexaenoic acid)",
      "Fish oil",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Brain function",
      "Anti-inflammatory",
      "Triglyceride reduction",
      "Joint health",
      "Mood support",
    ]),
    usage: "Take with meals containing fat. Refrigerate to reduce oxidation.",
    dosage: "1000-4000 mg EPA+DHA daily; higher for therapeutic uses",
    precautions:
      "May increase bleeding risk. Discontinue before surgery. Choose molecularly distilled products.",
    scientificInfo:
      "EPA and DHA are incorporated into cell membranes and serve as precursors to anti-inflammatory resolvins and protectins.",
    references: JSON.stringify([
      "Calder PC. Omega-3 fatty acids and inflammatory processes. Nutrients. 2010;2(3):355-374.",
      "Mozaffarian D, Wu JH. Omega-3 fatty acids and cardiovascular disease. J Am Coll Cardiol. 2011;58(20):2047-2067.",
    ]),
    relatedRemedies: JSON.stringify([
      "Krill Oil",
      "Algae Oil",
      "Cod Liver Oil",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Krill Oil",
    description:
      "Phospholipid-bound omega-3s from Antarctic krill with enhanced absorption and astaxanthin.",
    category: "Fatty Acid",
    ingredients: JSON.stringify([
      "Phospholipid EPA/DHA",
      "Astaxanthin",
      "Choline",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Joint comfort",
      "PMS relief",
      "Brain health",
      "Antioxidant",
    ]),
    usage:
      "Take with food. Lower doses needed compared to fish oil due to better absorption.",
    dosage: "500-2000 mg daily",
    precautions:
      "Shellfish allergy may preclude use. May increase bleeding risk.",
    scientificInfo:
      "Phospholipid-bound omega-3s have superior bioavailability. Astaxanthin provides additional antioxidant protection.",
    references: JSON.stringify([
      "Ulven SM, et al. Metabolic effects of krill oil are essentially similar to those of fish oil. Lipids. 2011;46(1):37-46.",
      "Sampalis F, et al. Evaluation of the effects of Neptune Krill Oil on chronic inflammation and arthritic symptoms. J Am Coll Nutr. 2007;26(1):39-48.",
    ]),
    relatedRemedies: JSON.stringify(["Fish Oil", "Astaxanthin", "Algae Oil"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Algae Oil (Vegan Omega-3)",
    description:
      "Plant-based source of DHA and EPA from microalgae for vegans and those avoiding fish.",
    category: "Fatty Acid",
    ingredients: JSON.stringify([
      "Algal DHA",
      "Algal EPA",
      "Schizochytrium oil",
    ]),
    benefits: JSON.stringify([
      "Brain health",
      "Heart health",
      "Eye health",
      "Pregnancy support",
      "Vegan omega-3 source",
    ]),
    usage: "Take with food containing fat.",
    dosage: "250-500 mg DHA+EPA daily; higher for therapeutic needs",
    precautions:
      "Generally very safe. Sustainable and mercury-free alternative to fish oil.",
    scientificInfo:
      "Fish obtain DHA from algae in the food chain. Algae oil provides the same omega-3s directly from the original source.",
    references: JSON.stringify([
      "Lane K, et al. Bioavailability and potential uses of vegetarian sources of omega-3 fatty acids. Nutr Rev. 2014;72(8):462-473.",
      "Doughman SD, et al. Omega-3 fatty acids for nutrition and medicine: considering microalgae oil as a vegetarian source. Curr Diabetes Rev. 2007;3(3):198-203.",
    ]),
    relatedRemedies: JSON.stringify(["Fish Oil", "Flaxseed Oil", "Chia Seeds"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Flaxseed Oil",
    description:
      "Plant-based omega-3 (ALA) source supporting heart health and inflammation.",
    category: "Fatty Acid",
    ingredients: JSON.stringify([
      "Alpha-linolenic acid (ALA)",
      "Lignans",
      "Omega-6",
      "Omega-9",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Skin health",
      "Anti-inflammatory",
      "Hormone balance",
      "Digestive regularity",
    ]),
    usage: "Keep refrigerated. Do not heat. Ground flaxseeds also effective.",
    dosage: "1-2 tablespoons oil or 2-4 tablespoons ground seeds daily",
    precautions:
      "Conversion of ALA to EPA/DHA is limited (5-10%). May interact with blood thinners.",
    scientificInfo:
      "ALA is an essential omega-3 but requires conversion to EPA/DHA. Lignans have phytoestrogenic properties.",
    references: JSON.stringify([
      "Pan A, et al. Alpha-linolenic acid and risk of cardiovascular disease: a systematic review and meta-analysis. Am J Clin Nutr. 2012;96(6):1262-1273.",
      "Parikh M, et al. Dietary Flaxseed as a Strategy for Improving Human Health. Nutrients. 2019;11(5):1171.",
    ]),
    relatedRemedies: JSON.stringify(["Chia Seeds", "Walnuts", "Hemp Seeds"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Evening Primrose Oil",
    description:
      "GLA-rich oil supporting hormone balance, skin health, and inflammation.",
    category: "Fatty Acid",
    ingredients: JSON.stringify([
      "Gamma-linolenic acid (GLA)",
      "Linoleic acid",
    ]),
    benefits: JSON.stringify([
      "PMS relief",
      "Skin health",
      "Hormone balance",
      "Breast tenderness relief",
      "Nerve health",
    ]),
    usage: "Take with food. Effects may take 2-3 months to develop.",
    dosage: "500-1500 mg daily providing 50-150 mg GLA",
    precautions:
      "May lower seizure threshold. Use caution with anticoagulants.",
    scientificInfo:
      "GLA is converted to DGLA and anti-inflammatory prostaglandins. Bypasses rate-limiting delta-6-desaturase enzyme.",
    references: JSON.stringify([
      "Stonemetz D. A review of the clinical efficacy of evening primrose. Holist Nurs Pract. 2008;22(3):171-174.",
      "Bayles B, Usatine R. Evening primrose oil. Am Fam Physician. 2009;80(12):1405-1408.",
    ]),
    relatedRemedies: JSON.stringify([
      "Borage Oil",
      "Black Currant Oil",
      "Fish Oil",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "CoQ10 (Coenzyme Q10)",
    description:
      "Vital coenzyme for cellular energy production and antioxidant protection.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Ubiquinone", "Ubiquinol"]),
    benefits: JSON.stringify([
      "Heart health",
      "Energy production",
      "Antioxidant",
      "Statin support",
      "Migraine prevention",
      "Blood pressure support",
    ]),
    usage:
      "Take with fat-containing meal. Ubiquinol is the reduced, more bioavailable form.",
    dosage: "100-300 mg daily; ubiquinol doses can be lower",
    precautions:
      "May reduce effectiveness of blood thinners. Generally very safe.",
    scientificInfo:
      "CoQ10 is essential for mitochondrial electron transport chain. Levels decline with age and statin use.",
    references: JSON.stringify([
      "Rosenfeldt F, et al. Coenzyme Q10 in the treatment of hypertension: a meta-analysis. J Hum Hypertens. 2007;21(4):297-306.",
      "Mortensen SA, et al. The effect of coenzyme Q10 on morbidity and mortality in chronic heart failure. JACC Heart Fail. 2014;2(6):641-649.",
    ]),
    relatedRemedies: JSON.stringify([
      "PQQ",
      "L-Carnitine",
      "Alpha-Lipoic Acid",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Alpha-Lipoic Acid",
    description:
      "Universal antioxidant supporting blood sugar, nerve health, and cellular energy.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Alpha-lipoic acid", "R-lipoic acid", "ALA"]),
    benefits: JSON.stringify([
      "Blood sugar support",
      "Nerve health",
      "Antioxidant",
      "Heavy metal chelation",
      "Skin health",
    ]),
    usage:
      "Take on empty stomach. R-lipoic acid is the natural, more active form.",
    dosage: "300-600 mg daily; 600-1200 mg for neuropathy",
    precautions: "May lower blood sugar significantly. Monitor if diabetic.",
    scientificInfo:
      "ALA is both water and fat soluble, regenerates other antioxidants, and enhances glucose uptake into cells.",
    references: JSON.stringify([
      "Ziegler D, et al. Treatment of symptomatic diabetic polyneuropathy with alpha-lipoic acid. Diabetes Care. 2006;29(11):2365-2370.",
      "Shay KP, et al. Alpha-lipoic acid as a dietary supplement: molecular mechanisms and therapeutic potential. Biochim Biophys Acta. 2009;1790(10):1149-1160.",
    ]),
    relatedRemedies: JSON.stringify([
      "CoQ10",
      "Acetyl-L-Carnitine",
      "B-Complex",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "PQQ (Pyrroloquinoline Quinone)",
    description:
      "Novel redox cofactor supporting mitochondrial biogenesis and cognitive function.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Pyrroloquinoline quinone",
      "PQQ disodium salt",
    ]),
    benefits: JSON.stringify([
      "Mitochondrial support",
      "Cognitive function",
      "Energy",
      "Nerve growth factor",
      "Sleep quality",
    ]),
    usage: "Take in morning. Often combined with CoQ10.",
    dosage: "10-20 mg daily",
    precautions: "Generally safe. Limited long-term human data.",
    scientificInfo:
      "PQQ stimulates mitochondrial biogenesis through PGC-1alpha activation. Supports nerve growth factor production.",
    references: JSON.stringify([
      "Harris CB, et al. Dietary pyrroloquinoline quinone (PQQ) alters indicators of inflammation and mitochondrial-related metabolism. J Nutr Biochem. 2013;24(12):2076-2084.",
      "Nakano M, et al. Effects of antioxidant supplements (BioPQQ) on cerebral blood flow and oxygen metabolism. Adv Exp Med Biol. 2016;876:215-222.",
    ]),
    relatedRemedies: JSON.stringify([
      "CoQ10",
      "L-Carnitine",
      "Nicotinamide Riboside",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Glutathione",
    description:
      "Master antioxidant supporting detoxification, immune function, and cellular health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "L-Glutathione",
      "Reduced glutathione",
      "Liposomal glutathione",
    ]),
    benefits: JSON.stringify([
      "Antioxidant protection",
      "Detoxification",
      "Immune support",
      "Skin brightening",
      "Liver support",
    ]),
    usage:
      "Liposomal or sublingual forms better absorbed. Can also support with precursors (NAC, glycine).",
    dosage: "250-1000 mg daily; liposomal forms may require lower doses",
    precautions:
      "Generally safe. Oral absorption historically poor; newer forms improved.",
    scientificInfo:
      "Glutathione is the primary intracellular antioxidant. Essential for phase II liver detoxification and immune cell function.",
    references: JSON.stringify([
      "Richie JP Jr, et al. Randomized controlled trial of oral glutathione supplementation on body stores of glutathione. Eur J Nutr. 2015;54(2):251-263.",
      "Pizzorno J. Glutathione! Integr Med (Encinitas). 2014;13(1):8-12.",
    ]),
    relatedRemedies: JSON.stringify([
      "N-Acetyl Cysteine",
      "Alpha-Lipoic Acid",
      "Vitamin C",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Phosphatidylserine",
    description:
      "Phospholipid supporting brain cell membrane health, memory, and cognitive function.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Phosphatidylserine", "PS"]),
    benefits: JSON.stringify([
      "Memory support",
      "Cognitive function",
      "Cortisol reduction",
      "Exercise recovery",
      "ADHD support",
    ]),
    usage: "Take with meals. Soy or sunflower-derived options available.",
    dosage: "100-300 mg daily",
    precautions:
      "Generally safe. Soy-derived versions may be concern for those with soy allergy.",
    scientificInfo:
      "Phosphatidylserine is a major component of brain cell membranes. It facilitates neurotransmitter release and receptor function.",
    references: JSON.stringify([
      "Glade MJ, Smith K. Phosphatidylserine and the human brain. Nutrition. 2015;31(6):781-786.",
      "Starks MA, et al. The effects of phosphatidylserine on endocrine response to moderate intensity exercise. J Int Soc Sports Nutr. 2008;5:11.",
    ]),
    relatedRemedies: JSON.stringify(["Alpha-GPC", "Omega-3", "Ginkgo Biloba"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Alpha-GPC",
    description:
      "Highly bioavailable choline source supporting cognitive function and power output.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Alpha-glycerylphosphorylcholine",
      "L-Alpha-GPC",
    ]),
    benefits: JSON.stringify([
      "Cognitive function",
      "Memory",
      "Power output",
      "Growth hormone support",
      "Acetylcholine synthesis",
    ]),
    usage: "Take any time. Often used before workouts or cognitive demands.",
    dosage: "300-600 mg daily; up to 1200 mg for cognitive enhancement",
    precautions:
      "May cause headaches at high doses. Fishy body odor possible with high choline intake.",
    scientificInfo:
      "Alpha-GPC rapidly crosses blood-brain barrier and provides choline for acetylcholine synthesis. 40% choline by weight.",
    references: JSON.stringify([
      "Parker AG, et al. The effects of alpha-glycerylphosphorylcholine, caffeine or placebo on markers of mood, cognitive function, power, speed, and agility. J Int Soc Sports Nutr. 2015;12(Suppl 1):P41.",
      "Traini E, et al. Choline alphoscerate (alpha-GPC) in the cognitive recovery of patients with acute stroke. Ann Neurol. 2013;23(suppl 2):128-134.",
    ]),
    relatedRemedies: JSON.stringify([
      "Phosphatidylserine",
      "Citicoline",
      "Bacopa Monnieri",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Citicoline (CDP-Choline)",
    description:
      "Brain nutrient supporting memory, focus, and neuroprotection.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Cytidine diphosphate-choline",
      "CDP-Choline",
    ]),
    benefits: JSON.stringify([
      "Memory support",
      "Focus",
      "Neuroprotection",
      "Eye health",
      "Stroke recovery support",
    ]),
    usage: "Take any time. Works synergistically with other nootropics.",
    dosage: "250-500 mg daily; up to 2000 mg for clinical applications",
    precautions: "Generally well tolerated. May cause mild GI upset.",
    scientificInfo:
      "Citicoline provides both choline and cytidine (converts to uridine). Supports phospholipid synthesis and dopamine release.",
    references: JSON.stringify([
      "McGlade E, et al. Improved Attentional Performance Following Citicoline Administration in Healthy Adult Women. Food Nutr Sci. 2012;3(6):769-773.",
      "Secades JJ, Lorenzo JL. Citicoline: pharmacological and clinical review. Methods Find Exp Clin Pharmacol. 2006;28(Suppl B):1-56.",
    ]),
    relatedRemedies: JSON.stringify(["Alpha-GPC", "Uridine", "Omega-3"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Resveratrol",
    description:
      "Polyphenol from grapes and berries with longevity and cardiovascular benefits.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Trans-resveratrol", "Resveratrol"]),
    benefits: JSON.stringify([
      "Cardiovascular support",
      "Longevity",
      "Anti-inflammatory",
      "Blood sugar support",
      "Brain health",
    ]),
    usage:
      "Take with fat-containing meal. Trans-resveratrol is the active form.",
    dosage: "150-500 mg trans-resveratrol daily",
    precautions:
      "May interact with blood thinners. High doses may have estrogenic effects.",
    scientificInfo:
      "Resveratrol activates sirtuins and AMPK, mimicking caloric restriction. Has broad anti-aging effects in studies.",
    references: JSON.stringify([
      "Timmers S, et al. Calorie restriction-like effects of 30 days of resveratrol supplementation on energy metabolism in obese humans. Cell Metab. 2011;14(5):612-622.",
      "Witte AV, et al. Effects of resveratrol on memory performance, hippocampal functional connectivity, and glucose metabolism. J Neurosci. 2014;34(23):7862-7870.",
    ]),
    relatedRemedies: JSON.stringify(["Pterostilbene", "Quercetin", "NMN"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Quercetin",
    description:
      "Flavonoid antioxidant with antihistamine and anti-inflammatory properties.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Quercetin",
      "Quercetin dihydrate",
      "Quercetin phytosome",
    ]),
    benefits: JSON.stringify([
      "Allergy relief",
      "Anti-inflammatory",
      "Antioxidant",
      "Immune modulation",
      "Cardiovascular support",
    ]),
    usage:
      "Take with bromelain for enhanced absorption. Phytosome forms better absorbed.",
    dosage: "500-1000 mg daily",
    precautions:
      "May interact with certain antibiotics and blood thinners. Generally safe.",
    scientificInfo:
      "Quercetin stabilizes mast cells, reducing histamine release. Also inhibits inflammatory enzymes and oxidative stress.",
    references: JSON.stringify([
      "Chirumbolo S. The role of quercetin, flavonols and flavones in modulating inflammatory cell function. Inflamm Allergy Drug Targets. 2010;9(4):263-285.",
      "Rogerio AP, et al. Anti-inflammatory activity of quercetin and isoquercitrin in experimental murine allergic asthma. Inflamm Res. 2007;56(10):402-408.",
    ]),
    relatedRemedies: JSON.stringify([
      "Bromelain",
      "Vitamin C",
      "Stinging Nettle",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Bromelain",
    description:
      "Pineapple enzyme with anti-inflammatory and digestive benefits.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Bromelain", "Pineapple enzyme"]),
    benefits: JSON.stringify([
      "Anti-inflammatory",
      "Digestive support",
      "Sinus health",
      "Wound healing",
      "Protein digestion",
    ]),
    usage: "Take between meals for inflammation; with meals for digestion.",
    dosage: "500-2000 GDU daily in divided doses",
    precautions: "May increase bleeding risk. Avoid with pineapple allergy.",
    scientificInfo:
      "Bromelain is a mixture of proteolytic enzymes. It reduces prostaglandins, thromboxanes, and modulates immune response.",
    references: JSON.stringify([
      "Brien S, et al. Bromelain as a Treatment for Osteoarthritis: a Review of Clinical Studies. Evid Based Complement Alternat Med. 2004;1(3):251-257.",
      "Pavan R, et al. Properties and therapeutic application of bromelain: a review. Biotechnol Res Int. 2012;2012:976203.",
    ]),
    relatedRemedies: JSON.stringify(["Quercetin", "Papain", "Turmeric"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Melatonin",
    description:
      "Sleep hormone supporting circadian rhythm, sleep onset, and antioxidant protection.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Melatonin"]),
    benefits: JSON.stringify([
      "Sleep onset",
      "Circadian rhythm",
      "Jet lag relief",
      "Antioxidant",
      "Eye health",
    ]),
    usage:
      "Take 30-60 minutes before desired sleep time. Start with lowest effective dose.",
    dosage: "0.3-5 mg before bed; lower doses often more effective",
    precautions:
      "May cause morning grogginess. Avoid driving after taking. May interact with sedatives and immunosuppressants.",
    scientificInfo:
      "Melatonin is secreted by pineal gland in response to darkness. It sets circadian rhythm and has antioxidant properties.",
    references: JSON.stringify([
      "Ferracioli-Oda E, et al. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One. 2013;8(5):e63773.",
      "Costello RB, et al. The effectiveness of melatonin for promoting healthy sleep: a rapid evidence assessment. Nutr J. 2014;13:106.",
    ]),
    relatedRemedies: JSON.stringify([
      "Magnesium",
      "L-Theanine",
      "Valerian Root",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Hyaluronic Acid",
    description:
      "Glycosaminoglycan supporting joint lubrication, skin hydration, and eye health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Hyaluronic acid", "Sodium hyaluronate"]),
    benefits: JSON.stringify([
      "Joint lubrication",
      "Skin hydration",
      "Eye health",
      "Wound healing",
    ]),
    usage: "Oral or topical forms available. Often combined with collagen.",
    dosage: "100-200 mg daily oral; topical as directed",
    precautions: "Generally very safe. Avoid if history of cancer.",
    scientificInfo:
      "Hyaluronic acid holds 1000 times its weight in water. It provides viscosity to synovial fluid and hydration to skin.",
    references: JSON.stringify([
      "Tashiro T, et al. Oral administration of polymer hyaluronic acid alleviates symptoms of knee osteoarthritis. ScientificWorldJournal. 2012;2012:167928.",
      "Kawada C, et al. Ingested hyaluronan moisturizes dry skin. Nutr J. 2014;13:70.",
    ]),
    relatedRemedies: JSON.stringify(["Collagen", "Glucosamine", "MSM"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Glucosamine Sulfate",
    description:
      "Building block for cartilage supporting joint structure and comfort.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Glucosamine sulfate",
      "Glucosamine hydrochloride",
    ]),
    benefits: JSON.stringify([
      "Joint health",
      "Cartilage support",
      "Osteoarthritis relief",
      "Joint mobility",
    ]),
    usage:
      "Take with food. Sulfate form preferred. Allow 4-8 weeks for benefits.",
    dosage: "1500 mg daily, can be divided",
    precautions:
      "Derived from shellfish; allergic individuals should use synthetic versions. May affect blood sugar.",
    scientificInfo:
      "Glucosamine is a building block for glycosaminoglycans in cartilage. May stimulate proteoglycan synthesis.",
    references: JSON.stringify([
      "Towheed TE, et al. Glucosamine therapy for treating osteoarthritis. Cochrane Database Syst Rev. 2005;(2):CD002946.",
      "Reginster JY, et al. Long-term effects of glucosamine sulphate on osteoarthritis progression: a randomised trial. Lancet. 2001;357(9252):251-256.",
    ]),
    relatedRemedies: JSON.stringify(["Chondroitin", "MSM", "Collagen"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Chondroitin Sulfate",
    description:
      "Cartilage component often combined with glucosamine for joint support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Chondroitin sulfate"]),
    benefits: JSON.stringify([
      "Joint health",
      "Cartilage protection",
      "Osteoarthritis support",
      "Shock absorption",
    ]),
    usage: "Often combined with glucosamine. Take with food.",
    dosage: "800-1200 mg daily",
    precautions:
      "May have blood-thinning effects. Quality varies; choose reputable brands.",
    scientificInfo:
      "Chondroitin attracts water into cartilage and inhibits degradative enzymes. Works synergistically with glucosamine.",
    references: JSON.stringify([
      "Singh JA, et al. Chondroitin for osteoarthritis. Cochrane Database Syst Rev. 2015;1:CD005614.",
      "Clegg DO, et al. Glucosamine, chondroitin sulfate, and the two in combination for painful knee osteoarthritis. N Engl J Med. 2006;354(8):795-808.",
    ]),
    relatedRemedies: JSON.stringify(["Glucosamine", "MSM", "Hyaluronic Acid"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "MSM (Methylsulfonylmethane)",
    description:
      "Bioavailable sulfur compound supporting joints, skin, and detoxification.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Methylsulfonylmethane",
      "MSM",
      "Organic sulfur",
    ]),
    benefits: JSON.stringify([
      "Joint comfort",
      "Skin health",
      "Hair and nail growth",
      "Detoxification",
      "Exercise recovery",
    ]),
    usage: "Take with food. Can be combined with glucosamine and chondroitin.",
    dosage: "1000-6000 mg daily",
    precautions: "Generally very safe. May cause mild GI upset initially.",
    scientificInfo:
      "MSM provides bioavailable sulfur for collagen synthesis and glutathione production. Has anti-inflammatory effects.",
    references: JSON.stringify([
      "Kim LS, et al. Efficacy of methylsulfonylmethane (MSM) in osteoarthritis pain of the knee. Osteoarthritis Cartilage. 2006;14(3):286-294.",
      "Butawan M, et al. Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement. Nutrients. 2017;9(3):290.",
    ]),
    relatedRemedies: JSON.stringify(["Glucosamine", "Collagen", "Vitamin C"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Astaxanthin",
    description:
      "Potent carotenoid antioxidant from algae supporting skin, eye, and cardiovascular health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Astaxanthin", "Haematococcus pluvialis"]),
    benefits: JSON.stringify([
      "Skin health",
      "Eye protection",
      "Exercise recovery",
      "Cardiovascular support",
      "Antioxidant",
    ]),
    usage: "Take with fat-containing meal for absorption.",
    dosage: "4-12 mg daily",
    precautions: "Very safe. May cause reddish coloration of stool.",
    scientificInfo:
      "Astaxanthin is 6000 times stronger than vitamin C as an antioxidant. It spans cell membranes providing unique protection.",
    references: JSON.stringify([
      "Tominaga K, et al. Cosmetic benefits of astaxanthin on humans subjects. Acta Biochim Pol. 2012;59(1):43-47.",
      "Brown DR, et al. Astaxanthin in Exercise Metabolism, Performance and Recovery: A Review. Front Nutr. 2017;4:76.",
    ]),
    relatedRemedies: JSON.stringify(["Krill Oil", "Lutein", "Zeaxanthin"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Lutein and Zeaxanthin",
    description:
      "Carotenoids concentrated in the eye supporting macular health and vision.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Lutein", "Zeaxanthin", "Meso-zeaxanthin"]),
    benefits: JSON.stringify([
      "Eye health",
      "Macular protection",
      "Blue light protection",
      "Visual performance",
      "Cognitive function",
    ]),
    usage:
      "Take with fat-containing meal. Consistent intake builds macular pigment.",
    dosage: "10-20 mg lutein and 2-4 mg zeaxanthin daily",
    precautions: "Very safe. May cause yellowing of skin at very high doses.",
    scientificInfo:
      "Lutein and zeaxanthin form macular pigment, filtering blue light and providing antioxidant protection to the retina.",
    references: JSON.stringify([
      "AREDS2 Research Group. Lutein + zeaxanthin and omega-3 fatty acids for age-related macular degeneration. JAMA. 2013;309(19):2005-2015.",
      "Ma L, et al. Lutein and zeaxanthin intake and the risk of age-related macular degeneration: a systematic review and meta-analysis. Br J Nutr. 2012;107(3):350-359.",
    ]),
    relatedRemedies: JSON.stringify(["Astaxanthin", "Bilberry", "Vitamin A"]),
    evidenceLevel: "Strong",
  },
  {
    name: "D-Ribose",
    description:
      "Simple sugar supporting ATP production and energy in heart and muscle tissue.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["D-Ribose"]),
    benefits: JSON.stringify([
      "Energy production",
      "Heart health",
      "Exercise recovery",
      "Fibromyalgia support",
      "Chronic fatigue support",
    ]),
    usage:
      "Take with meals to avoid blood sugar effects. Can be added to beverages.",
    dosage: "5-15 g daily in divided doses",
    precautions: "May lower blood sugar. Diabetics should monitor glucose.",
    scientificInfo:
      "D-ribose is the backbone of ATP. Supplementation accelerates ATP resynthesis after energy depletion.",
    references: JSON.stringify([
      "Teitelbaum JE, et al. The use of D-ribose in chronic fatigue syndrome and fibromyalgia. J Altern Complement Med. 2006;12(9):857-862.",
      "Omran H, et al. D-Ribose improves diastolic function and quality of life in congestive heart failure patients. Eur J Heart Fail. 2003;5(5):615-619.",
    ]),
    relatedRemedies: JSON.stringify(["CoQ10", "L-Carnitine", "Creatine"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Nicotinamide Riboside (NR)",
    description:
      "NAD+ precursor supporting cellular energy, longevity, and metabolic function.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Nicotinamide riboside", "NR", "Niagen"]),
    benefits: JSON.stringify([
      "NAD+ support",
      "Cellular energy",
      "Longevity",
      "Metabolic health",
      "Cognitive function",
    ]),
    usage: "Take in morning. Often combined with resveratrol or pterostilbene.",
    dosage: "250-500 mg daily",
    precautions: "Generally safe. Limited long-term human data.",
    scientificInfo:
      "NR is efficiently converted to NAD+, a coenzyme essential for hundreds of metabolic reactions. NAD+ declines with age.",
    references: JSON.stringify([
      "Trammell SA, et al. Nicotinamide riboside is uniquely and orally bioavailable in mice and humans. Nat Commun. 2016;7:12948.",
      "Martens CR, et al. Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults. Nat Commun. 2018;9(1):1286.",
    ]),
    relatedRemedies: JSON.stringify(["NMN", "Resveratrol", "Niacin"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    description:
      "Direct NAD+ precursor being studied for anti-aging and metabolic benefits.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Nicotinamide mononucleotide",
      "NMN",
      "Beta-NMN",
    ]),
    benefits: JSON.stringify([
      "NAD+ support",
      "Energy metabolism",
      "Longevity research",
      "Blood sugar support",
      "Exercise capacity",
    ]),
    usage: "Take in morning. Sublingual forms may enhance absorption.",
    dosage: "250-500 mg daily",
    precautions:
      "Generally safe in studies. Long-term human data still emerging.",
    scientificInfo:
      "NMN is one step closer to NAD+ than NR. Human trials showing safety and NAD+ elevation.",
    references: JSON.stringify([
      "Yoshino M, et al. Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women. Science. 2021;372(6547):1224-1229.",
      "Irie J, et al. Effect of oral administration of nicotinamide mononucleotide on clinical parameters and markers in healthy Japanese men. Endocr J. 2020;67(2):153-160.",
    ]),
    relatedRemedies: JSON.stringify([
      "Nicotinamide Riboside",
      "Resveratrol",
      "Pterostilbene",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Sunlight Exposure",
    description:
      "Natural source of vitamin D and circadian rhythm regulation through UV exposure.",
    category: "Natural Source",
    ingredients: JSON.stringify(["UVB radiation", "Natural sunlight"]),
    benefits: JSON.stringify([
      "Vitamin D synthesis",
      "Circadian rhythm",
      "Mood support",
      "Nitric oxide release",
      "Immune function",
    ]),
    usage:
      "Expose skin to midday sun for 10-30 minutes depending on skin tone and latitude.",
    dosage:
      "10-30 minutes of midday sun exposure to face and arms, several times weekly",
    precautions:
      "Avoid sunburn. Use sunscreen for extended exposure. Those with photosensitivity should consult doctor.",
    scientificInfo:
      "UVB converts 7-dehydrocholesterol in skin to vitamin D3. Sunlight also releases nitric oxide from skin stores.",
    references: JSON.stringify([
      "Holick MF. Biological Effects of Sunlight, Ultraviolet Radiation, Visible Light, Infrared Radiation and Vitamin D for Health. Anticancer Res. 2016;36(3):1345-1356.",
      "Liu D, et al. UVA irradiation of human skin vasodilates arterial vasculature and lowers blood pressure independently of nitric oxide synthase. J Invest Dermatol. 2014;134(7):1839-1846.",
    ]),
    relatedRemedies: JSON.stringify([
      "Vitamin D3",
      "Light Therapy",
      "Morning Light Exposure",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Cold Exposure/Cold Therapy",
    description:
      "Deliberate cold exposure for metabolic, immune, and mood benefits.",
    category: "Natural Source",
    ingredients: JSON.stringify(["Cold water", "Ice bath", "Cold shower"]),
    benefits: JSON.stringify([
      "Metabolism boost",
      "Brown fat activation",
      "Mood enhancement",
      "Inflammation reduction",
      "Stress resilience",
    ]),
    usage:
      "Start with cold shower endings, progress to longer cold exposure. Build tolerance gradually.",
    dosage: "2-5 minutes cold exposure daily; cold showers or ice baths",
    precautions:
      "Avoid with cardiovascular disease without medical clearance. Never alone in very cold water.",
    scientificInfo:
      "Cold exposure activates brown adipose tissue, releases norepinephrine, and triggers hormetic stress response.",
    references: JSON.stringify([
      "Shevchuk NA. Adapted cold shower as a potential treatment for depression. Med Hypotheses. 2008;70(5):995-1001.",
      "van der Lans AA, et al. Cold acclimation recruits human brown fat and increases nonshivering thermogenesis. J Clin Invest. 2013;123(8):3395-3403.",
    ]),
    relatedRemedies: JSON.stringify(["Exercise", "Sauna", "Contrast Therapy"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Sauna Therapy",
    description:
      "Heat exposure supporting cardiovascular health, detoxification, and longevity.",
    category: "Natural Source",
    ingredients: JSON.stringify([
      "Heat exposure",
      "Infrared light (infrared sauna)",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Detoxification",
      "Longevity",
      "Pain relief",
      "Skin health",
      "Relaxation",
    ]),
    usage:
      "Traditional Finnish: 15-20 minutes at 80-100C. Infrared: 30-45 minutes at lower temperatures.",
    dosage: "2-7 sessions per week; 15-30 minutes per session",
    precautions:
      "Stay hydrated. Avoid after alcohol. Those with cardiovascular conditions should consult doctor.",
    scientificInfo:
      "Heat stress induces heat shock proteins, improves vascular function, and mimics cardiovascular exercise effects.",
    references: JSON.stringify([
      "Laukkanen T, et al. Association Between Sauna Bathing and Fatal Cardiovascular and All-Cause Mortality Events. JAMA Intern Med. 2015;175(4):542-548.",
      "Hussain J, Cohen M. Clinical Effects of Regular Dry Sauna Bathing: A Systematic Review. Evid Based Complement Alternat Med. 2018;2018:1857413.",
    ]),
    relatedRemedies: JSON.stringify(["Cold Exposure", "Exercise", "Magnesium"]),
    evidenceLevel: "Moderate",
  },
];
