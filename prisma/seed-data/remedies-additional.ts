// Additional natural remedies for comprehensive coverage
export const additionalRemedies = [
  // More TCM and Ayurvedic Herbs
  {
    name: "He Shou Wu (Fo-Ti)",
    description:
      "TCM longevity herb for vitality, hair health, and healthy aging.",
    category: "Herbal",
    ingredients: JSON.stringify(["Stilbene glycosides", "Emodin", "Catechins"]),
    benefits: JSON.stringify([
      "Longevity support",
      "Hair health",
      "Vitality",
      "Liver and kidney tonic",
    ]),
    usage: "Use prepared (processed) form only. Raw form can cause GI upset.",
    dosage: "500-1000 mg prepared extract daily",
    precautions:
      "Use only prepared form. Raw form hepatotoxic. Rare liver concerns even with prepared form.",
    scientificInfo:
      "Prepared Fo-Ti has antioxidant and potential longevity benefits through multiple mechanisms.",
    references: JSON.stringify([
      "Lin L, et al. The pharmacological profile of prepared Polygonum multiflorum Thunb. J Ethnopharmacol. 2015;159:158-183.",
    ]),
    relatedRemedies: JSON.stringify(["Goji Berry", "Astragalus", "Reishi"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Goji Berry (Lycium)",
    description: "Nutrient-rich berry from TCM for longevity and eye health.",
    category: "Herbal",
    ingredients: JSON.stringify([
      "Lycium barbarum polysaccharides",
      "Zeaxanthin",
      "Beta-carotene",
    ]),
    benefits: JSON.stringify([
      "Eye health",
      "Immune support",
      "Antioxidant",
      "Energy",
      "Longevity",
    ]),
    usage: "Eat dried berries or use powder/extract.",
    dosage: "15-30 g dried berries or 500-1000 mg extract daily",
    precautions: "May interact with blood thinners and diabetes medications.",
    scientificInfo:
      "Rich in zeaxanthin for macular health and unique polysaccharides with immunomodulating effects.",
    references: JSON.stringify([
      "Amagase H, Farnsworth NR. A review of botanical characteristics, phytochemistry, clinical relevance in efficacy of Lycium barbarum fruit. Food Res Int. 2011;44(7):1702-1717.",
    ]),
    relatedRemedies: JSON.stringify(["Astragalus", "Schisandra", "Reishi"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Amla (Indian Gooseberry)",
    description:
      "Vitamin C-rich Ayurvedic fruit for immunity and rejuvenation.",
    category: "Herbal",
    ingredients: JSON.stringify([
      "Vitamin C",
      "Tannins",
      "Gallic acid",
      "Ellagic acid",
    ]),
    benefits: JSON.stringify([
      "Immune support",
      "Hair health",
      "Digestive support",
      "Antioxidant",
      "Blood sugar support",
    ]),
    usage: "Use as powder, juice, or supplement.",
    dosage: "500-1000 mg extract or 1-2 teaspoons powder daily",
    precautions: "May enhance blood thinners. Very sour taste.",
    scientificInfo:
      "Amla has exceptionally high and stable vitamin C content with synergistic tannins.",
    references: JSON.stringify([
      "Krishnaveni M, Mirunalini S. Therapeutic potential of Phyllanthus emblica (amla): the ayurvedic wonder. J Basic Clin Physiol Pharmacol. 2010;21(1):93-105.",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Vitamin C", "Rose Hips"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Guduchi (Tinospora cordifolia)",
    description: 'Ayurvedic immunomodulator known as "heavenly elixir."',
    category: "Herbal",
    ingredients: JSON.stringify([
      "Tinosporin",
      "Cordifolioside",
      "Berberine",
      "Polysaccharides",
    ]),
    benefits: JSON.stringify([
      "Immune modulation",
      "Fever support",
      "Digestive support",
      "Liver protection",
    ]),
    usage: "Use as extract or traditional preparation.",
    dosage: "300-500 mg extract twice daily",
    precautions:
      "May lower blood sugar. Use caution with diabetes medications.",
    scientificInfo:
      "Guduchi has immunomodulating effects and supports both innate and adaptive immunity.",
    references: JSON.stringify([
      "Saha S, Ghosh S. Tinospora cordifolia: One plant, many roles. Anc Sci Life. 2012;31(4):151-159.",
    ]),
    relatedRemedies: JSON.stringify([
      "Astragalus",
      "Andrographis",
      "Holy Basil",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Shatavari",
    description: "Ayurvedic womens tonic for reproductive and hormonal health.",
    category: "Herbal",
    ingredients: JSON.stringify([
      "Steroidal saponins",
      "Shatavarins",
      "Isoflavones",
    ]),
    benefits: JSON.stringify([
      "Womens health",
      "Lactation support",
      "Hormonal balance",
      "Digestive soothing",
    ]),
    usage: "Use as extract or traditional preparation with milk.",
    dosage: "500-1000 mg extract twice daily",
    precautions: "Avoid with estrogen-sensitive conditions.",
    scientificInfo:
      "Shatavari has adaptogenic and phytoestrogenic effects supporting female reproductive health.",
    references: JSON.stringify([
      "Alok S, et al. Plant profile, phytochemistry and pharmacology of Asparagus racemosus (Shatavari). Asian Pac J Trop Dis. 2013;3(3):242-251.",
    ]),
    relatedRemedies: JSON.stringify(["Vitex", "Dong Quai", "Maca"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Bhringaraj",
    description: "Ayurvedic herb for hair growth and liver support.",
    category: "Herbal",
    ingredients: JSON.stringify(["Wedelolactone", "Ecliptine", "Coumestans"]),
    benefits: JSON.stringify([
      "Hair growth",
      "Hair pigmentation",
      "Liver support",
      "Skin health",
    ]),
    usage: "Internal use as extract. Topical oil for hair.",
    dosage: "300-500 mg extract daily; topical oil as directed",
    precautions: "Generally safe. May lower blood sugar.",
    scientificInfo:
      "Wedelolactone has hepatoprotective effects and traditional use for hair health.",
    references: JSON.stringify([
      "Singh B, et al. Hepatoprotective effect of Eclipta alba on experimental liver damage in rats. Phytother Res. 2001;15(8):705-709.",
    ]),
    relatedRemedies: JSON.stringify(["Amla", "Rosemary", "Biotin"]),
    evidenceLevel: "Limited",
  },
  // Superfoods and functional foods
  {
    name: "Spirulina",
    description: "Blue-green algae superfood rich in protein and nutrients.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Phycocyanin",
      "Chlorophyll",
      "Complete protein",
      "Iron",
      "B vitamins",
    ]),
    benefits: JSON.stringify([
      "Nutritional support",
      "Energy",
      "Detoxification",
      "Immune support",
      "Antioxidant",
    ]),
    usage: "Use powder or tablets. Start with small amount.",
    dosage: "1-10 g daily",
    precautions:
      "Choose tested products free of contamination. May interact with immunosuppressants.",
    scientificInfo:
      "Spirulina is 60-70% complete protein with phycocyanin providing unique antioxidant effects.",
    references: JSON.stringify([
      "Deng R, Chow TJ. Hypolipidemic, antioxidant, and antiinflammatory activities of microalgae Spirulina. Cardiovasc Ther. 2010;28(4):e33-45.",
    ]),
    relatedRemedies: JSON.stringify([
      "Chlorella",
      "Wheatgrass",
      "Barley Grass",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Chlorella",
    description: "Green algae for detoxification and nutritional support.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Chlorella growth factor",
      "Chlorophyll",
      "Protein",
      "Iron",
      "B12",
    ]),
    benefits: JSON.stringify([
      "Detoxification",
      "Heavy metal binding",
      "Immune support",
      "Nutritional support",
    ]),
    usage: "Use cracked cell wall chlorella for absorption.",
    dosage: "2-10 g daily",
    precautions: "May cause digestive upset initially. Choose tested products.",
    scientificInfo:
      "Chlorella binds heavy metals and provides growth factor that may support cellular repair.",
    references: JSON.stringify([
      "Merchant RE, Andre CA. A review of recent clinical trials of the nutritional supplement Chlorella pyrenoidosa. Altern Ther Health Med. 2001;7(3):79-91.",
    ]),
    relatedRemedies: JSON.stringify([
      "Spirulina",
      "Cilantro",
      "Activated Charcoal",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Wheatgrass",
    description: "Young wheat plant juice for detoxification and alkalizing.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Chlorophyll",
      "Enzymes",
      "Amino acids",
      "Vitamins",
    ]),
    benefits: JSON.stringify([
      "Detoxification",
      "Alkalizing",
      "Energy",
      "Digestive support",
    ]),
    usage: "Fresh juice or freeze-dried powder.",
    dosage: "30-60 mL fresh juice or 3-5 g powder daily",
    precautions:
      "Start slowly. May cause nausea in some. Gluten-free as harvested before seed develops.",
    scientificInfo:
      "Chlorophyll has structural similarity to hemoglobin and traditional use for blood building.",
    references: JSON.stringify([
      "Bar-Sela G, et al. Wheat grass juice in the supportive care of cancer patients. Nutr Cancer. 2007;58(1):43-48.",
    ]),
    relatedRemedies: JSON.stringify([
      "Barley Grass",
      "Spirulina",
      "Chlorophyll",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Barley Grass",
    description: "Young barley plant for antioxidant and alkalizing support.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Superoxide dismutase",
      "Chlorophyll",
      "Beta-glucan",
      "Vitamins",
    ]),
    benefits: JSON.stringify([
      "Antioxidant",
      "Alkalizing",
      "Cholesterol support",
      "Energy",
    ]),
    usage: "Use juice or powder.",
    dosage: "3-5 g powder daily",
    precautions: "Gluten-free as harvested before grain develops.",
    scientificInfo:
      "Contains superoxide dismutase (SOD) and other antioxidants.",
    references: JSON.stringify([
      "Benedet JA, et al. Antioxidant activity of young barley grass powder. J Agric Food Chem. 2007;55(4):1206-1214.",
    ]),
    relatedRemedies: JSON.stringify(["Wheatgrass", "Spirulina", "Chlorella"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Bee Pollen",
    description:
      "Nutrient-dense pollen collected by bees for energy and immunity.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Protein",
      "Vitamins",
      "Minerals",
      "Enzymes",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Energy",
      "Immune support",
      "Allergy relief",
      "Athletic performance",
    ]),
    usage: "Start with small amount to test for allergy.",
    dosage: "1-2 teaspoons daily, working up gradually",
    precautions:
      "May cause severe allergic reactions in bee-allergic individuals. Start with tiny amount.",
    scientificInfo:
      "Bee pollen is approximately 25% protein with all essential amino acids and rich in enzymes.",
    references: JSON.stringify([
      "Komosinska-Vassev K, et al. Bee pollen: chemical composition and therapeutic application. Evid Based Complement Alternat Med. 2015;2015:297425.",
    ]),
    relatedRemedies: JSON.stringify([
      "Royal Jelly",
      "Propolis",
      "Manuka Honey",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Royal Jelly",
    description: "Bee secretion fed to queen bees for longevity and vitality.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "10-HDA",
      "Royalactin",
      "Proteins",
      "B vitamins",
    ]),
    benefits: JSON.stringify([
      "Energy",
      "Skin health",
      "Fertility support",
      "Cognitive function",
    ]),
    usage: "Keep refrigerated. Take fresh or lyophilized.",
    dosage: "500-3000 mg daily",
    precautions:
      "Potential for severe allergic reactions. Avoid with bee allergies.",
    scientificInfo:
      "10-HDA is a unique fatty acid with potential metabolic and longevity effects.",
    references: JSON.stringify([
      "Ramadan MF, Al-Ghamdi A. Bioactive compounds and health-promoting properties of royal jelly: A review. J Funct Foods. 2012;4(1):39-52.",
    ]),
    relatedRemedies: JSON.stringify(["Bee Pollen", "Propolis", "Manuka Honey"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Propolis",
    description:
      "Bee resin with antimicrobial and immune-supporting properties.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "CAPE",
      "Flavonoids",
      "Phenolic acids",
      "Resins",
    ]),
    benefits: JSON.stringify([
      "Immune support",
      "Antimicrobial",
      "Wound healing",
      "Oral health",
    ]),
    usage: "Use as tincture, spray, or lozenge.",
    dosage: "500-1500 mg daily or as directed for specific use",
    precautions: "May cause allergic reactions. Test small amount first.",
    scientificInfo:
      "CAPE (caffeic acid phenethyl ester) has potent anti-inflammatory and antimicrobial effects.",
    references: JSON.stringify([
      "Wagh VD. Propolis: a wonder bees product and its pharmacological potentials. Adv Pharmacol Sci. 2013;2013:308249.",
    ]),
    relatedRemedies: JSON.stringify([
      "Manuka Honey",
      "Bee Pollen",
      "Echinacea",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Cacao (Raw)",
    description:
      "Unprocessed cocoa for mood, cardiovascular health, and antioxidants.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Theobromine",
      "Flavanols",
      "Magnesium",
      "Anandamide",
      "PEA",
    ]),
    benefits: JSON.stringify([
      "Mood enhancement",
      "Cardiovascular support",
      "Antioxidant",
      "Energy",
    ]),
    usage: "Use raw cacao powder or nibs.",
    dosage: "1-2 tablespoons raw cacao powder daily",
    precautions: "Contains caffeine and theobromine. May be stimulating.",
    scientificInfo:
      "Raw cacao retains more flavanols than processed chocolate and contains mood-enhancing compounds.",
    references: JSON.stringify([
      "Katz DL, et al. Cocoa and chocolate in human health and disease. Antioxid Redox Signal. 2011;15(10):2779-2811.",
    ]),
    relatedRemedies: JSON.stringify([
      "Dark Chocolate",
      "Magnesium",
      "Green Tea",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Acai Berry",
    description: "Amazon berry with high antioxidant content.",
    category: "Superfood",
    ingredients: JSON.stringify([
      "Anthocyanins",
      "Proanthocyanidins",
      "Healthy fats",
      "Fiber",
    ]),
    benefits: JSON.stringify([
      "Antioxidant",
      "Cardiovascular support",
      "Skin health",
      "Energy",
    ]),
    usage: "Use freeze-dried powder or frozen pulp.",
    dosage: "1-2 tablespoons powder or 100 g frozen pulp daily",
    precautions: "Some products high in sugar. Choose unsweetened.",
    scientificInfo:
      "Acai has one of the highest ORAC values among fruits due to anthocyanin content.",
    references: JSON.stringify([
      "Schauss AG, et al. Antioxidant capacity and other bioactivities of the freeze-dried Amazonian palm berry, Euterpe oleraceae mart. (acai). J Agric Food Chem. 2006;54(22):8604-8610.",
    ]),
    relatedRemedies: JSON.stringify([
      "Blueberries",
      "Goji Berry",
      "Resveratrol",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Pomegranate",
    description:
      "Antioxidant-rich fruit for cardiovascular and prostate health.",
    category: "Food",
    ingredients: JSON.stringify([
      "Punicalagins",
      "Ellagic acid",
      "Anthocyanins",
      "Punicic acid",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular health",
      "Prostate health",
      "Antioxidant",
      "Blood pressure support",
    ]),
    usage: "Consume fruit, juice, or extract.",
    dosage: "240 mL juice or 500-1000 mg extract daily",
    precautions: "May interact with statins and blood pressure medications.",
    scientificInfo:
      "Punicalagins are potent antioxidants with cardiovascular and anti-inflammatory benefits.",
    references: JSON.stringify([
      "Aviram M, et al. Pomegranate juice consumption reduces oxidative stress, atherogenic modifications to LDL, and platelet aggregation. Am J Clin Nutr. 2000;71(5):1062-1076.",
    ]),
    relatedRemedies: JSON.stringify([
      "Resveratrol",
      "Grape Seed Extract",
      "Green Tea",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Grape Seed Extract",
    description:
      "Concentrated proanthocyanidins for vascular health and antioxidant support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Proanthocyanidins", "OPCs", "Resveratrol"]),
    benefits: JSON.stringify([
      "Vascular health",
      "Antioxidant",
      "Skin health",
      "Blood pressure support",
    ]),
    usage: "Take with or without food.",
    dosage: "100-300 mg standardized extract daily",
    precautions: "May enhance blood thinners.",
    scientificInfo:
      "OPCs strengthen capillaries and have potent antioxidant effects 20x stronger than vitamin C.",
    references: JSON.stringify([
      "Feringa HH, et al. The effect of grape seed extract on cardiovascular risk markers. J Am Diet Assoc. 2011;111(8):1173-1181.",
    ]),
    relatedRemedies: JSON.stringify(["Pycnogenol", "Resveratrol", "Hawthorn"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Pycnogenol (Pine Bark Extract)",
    description:
      "French maritime pine bark extract for circulation and antioxidant support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Procyanidins", "OPCs", "Bioflavonoids"]),
    benefits: JSON.stringify([
      "Circulation",
      "Skin health",
      "ADHD support",
      "Chronic venous insufficiency",
      "Antioxidant",
    ]),
    usage: "Take with or without food.",
    dosage: "50-200 mg daily",
    precautions: "May enhance effects of blood thinners.",
    scientificInfo:
      "Pycnogenol improves endothelial function and has extensive clinical research.",
    references: JSON.stringify([
      "Rohdewald P. A review of the French maritime pine bark extract (Pycnogenol). Int J Clin Pharmacol Ther. 2002;40(4):158-168.",
    ]),
    relatedRemedies: JSON.stringify([
      "Grape Seed Extract",
      "Hawthorn",
      "Vitamin C",
    ]),
    evidenceLevel: "Strong",
  },
  // More specialized supplements
  {
    name: "HMB (Beta-Hydroxy Beta-Methylbutyrate)",
    description: "Leucine metabolite for muscle preservation and strength.",
    category: "Amino Acid",
    ingredients: JSON.stringify(["Beta-Hydroxy Beta-Methylbutyrate", "HMB"]),
    benefits: JSON.stringify([
      "Muscle preservation",
      "Strength gains",
      "Recovery",
      "Sarcopenia prevention",
    ]),
    usage: "Take in divided doses around exercise.",
    dosage: "3 g daily in divided doses",
    precautions: "Generally safe. May interact with statins.",
    scientificInfo:
      "HMB reduces protein breakdown and may enhance mTOR signaling for muscle protein synthesis.",
    references: JSON.stringify([
      "Wilson JM, et al. International Society of Sports Nutrition Position Stand: beta-hydroxy-beta-methylbutyrate (HMB). J Int Soc Sports Nutr. 2013;10(1):6.",
    ]),
    relatedRemedies: JSON.stringify(["BCAAs", "Creatine", "Whey Protein"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Ornithine",
    description:
      "Amino acid supporting ammonia detoxification and growth hormone.",
    category: "Amino Acid",
    ingredients: JSON.stringify([
      "L-Ornithine",
      "Ornithine alpha-ketoglutarate",
    ]),
    benefits: JSON.stringify([
      "Ammonia detoxification",
      "Sleep quality",
      "Exercise recovery",
      "Growth hormone support",
    ]),
    usage: "Take before bed or after exercise.",
    dosage: "2-6 g daily",
    precautions: "Generally safe. May cause GI upset at high doses.",
    scientificInfo:
      "Ornithine is part of the urea cycle and may reduce fatigue by removing ammonia.",
    references: JSON.stringify([
      "Sugino T, et al. L-ornithine supplementation attenuates physical fatigue in healthy volunteers. Nutr Res. 2008;28(11):738-743.",
    ]),
    relatedRemedies: JSON.stringify(["Arginine", "Citrulline", "Glutamine"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Phosphatidylcholine",
    description: "Essential phospholipid for liver health and cell membranes.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Phosphatidylcholine", "Lecithin"]),
    benefits: JSON.stringify([
      "Liver support",
      "Brain function",
      "Cell membrane integrity",
      "Fat metabolism",
    ]),
    usage: "Take with meals.",
    dosage: "1-3 g daily",
    precautions: "May cause fishy odor. Generally safe.",
    scientificInfo:
      "Phosphatidylcholine is the predominant phospholipid in cell membranes and bile.",
    references: JSON.stringify([
      "Gundermann KJ, et al. Activity of essential phospholipids (EPL) from soybean in liver diseases. Pharmacol Rep. 2011;63(3):643-659.",
    ]),
    relatedRemedies: JSON.stringify(["Choline", "Lecithin", "Milk Thistle"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Inositol",
    description:
      "B-vitamin-like compound for mood, PCOS, and metabolic health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Myo-inositol", "D-chiro-inositol"]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "PCOS support",
      "Insulin sensitivity",
      "Mood balance",
    ]),
    usage:
      "Myo-inositol most common. D-chiro-inositol specifically for insulin.",
    dosage: "2-18 g myo-inositol daily depending on use",
    precautions: "May cause GI upset at high doses. Start low.",
    scientificInfo:
      "Inositol is a second messenger in insulin and neurotransmitter signaling.",
    references: JSON.stringify([
      "Carlomagno G, Unfer V. Inositol safety: clinical evidences. Eur Rev Med Pharmacol Sci. 2011;15(8):931-936.",
    ]),
    relatedRemedies: JSON.stringify(["Chromium", "NAC", "Berberine"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Diindolylmethane (DIM)",
    description: "Cruciferous vegetable compound for estrogen metabolism.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Diindolylmethane", "DIM"]),
    benefits: JSON.stringify([
      "Estrogen metabolism",
      "Hormone balance",
      "Prostate health",
      "Skin health",
    ]),
    usage: "Take with food for absorption.",
    dosage: "100-300 mg daily",
    precautions:
      "May affect hormone-sensitive conditions. Can cause harmless change in urine color.",
    scientificInfo:
      "DIM promotes favorable estrogen metabolite ratios (2-hydroxy vs 16-alpha-hydroxy estrogens).",
    references: JSON.stringify([
      "Thomson CA, et al. Chemopreventive properties of 3,3-diindolylmethane in breast cancer. Expert Opin Investig Drugs. 2004;13(12):1561-1568.",
    ]),
    relatedRemedies: JSON.stringify([
      "I3C",
      "Cruciferous Vegetables",
      "Calcium D-Glucarate",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Calcium D-Glucarate",
    description: "Supports glucuronidation detoxification pathway.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Calcium D-glucarate"]),
    benefits: JSON.stringify([
      "Detoxification support",
      "Estrogen clearance",
      "Cellular health",
    ]),
    usage: "Take with meals.",
    dosage: "500-1500 mg daily",
    precautions: "May enhance clearance of certain drugs.",
    scientificInfo:
      "Inhibits beta-glucuronidase, preventing reabsorption of compounds being detoxified.",
    references: JSON.stringify([
      "Walaszek Z. Potential use of D-glucaric acid derivatives in cancer prevention. Cancer Lett. 1990;54(1-2):1-8.",
    ]),
    relatedRemedies: JSON.stringify(["DIM", "Milk Thistle", "NAC"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Serrapeptase",
    description:
      "Proteolytic enzyme with anti-inflammatory and fibrinolytic properties.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Serratiopeptidase", "Serrapeptase"]),
    benefits: JSON.stringify([
      "Anti-inflammatory",
      "Sinus support",
      "Fibrin breakdown",
      "Pain relief",
    ]),
    usage: "Take on empty stomach away from meals.",
    dosage: "60,000-120,000 SPU daily",
    precautions: "May enhance blood thinners. Discontinue before surgery.",
    scientificInfo:
      "Serrapeptase breaks down inflammatory proteins and may thin mucus secretions.",
    references: JSON.stringify([
      "Bhagat S, et al. Serratiopeptidase: a systematic review of the existing evidence. Int J Surg. 2013;11(3):209-217.",
    ]),
    relatedRemedies: JSON.stringify(["Nattokinase", "Bromelain", "Papain"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Nattokinase",
    description:
      "Soy-derived enzyme supporting cardiovascular health and blood flow.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify(["Nattokinase"]),
    benefits: JSON.stringify([
      "Cardiovascular support",
      "Blood flow",
      "Fibrin breakdown",
      "Blood pressure support",
    ]),
    usage: "Take on empty stomach. Often taken at bedtime.",
    dosage: "2000-4000 FU daily",
    precautions:
      "May enhance blood thinners. Discontinue before surgery. Not with bleeding disorders.",
    scientificInfo:
      "Nattokinase has direct fibrinolytic activity and may support healthy blood viscosity.",
    references: JSON.stringify([
      "Weng Y, et al. Nattokinase: An Oral Antithrombotic Agent for the Prevention of Cardiovascular Disease. Int J Mol Sci. 2017;18(3):523.",
    ]),
    relatedRemedies: JSON.stringify(["Serrapeptase", "Omega-3", "Vitamin E"]),
    evidenceLevel: "Moderate",
  },
  // Eye health supplements
  {
    name: "Macular Support Formula",
    description: "Combination of nutrients for age-related macular health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Lutein",
      "Zeaxanthin",
      "Meso-zeaxanthin",
      "Zinc",
      "Vitamin C",
      "Vitamin E",
    ]),
    benefits: JSON.stringify([
      "Macular health",
      "Blue light protection",
      "Vision support",
    ]),
    usage: "Take with fat-containing meal.",
    dosage: "Follow AREDS2 formula guidelines",
    precautions:
      "AREDS2 formula preferred over AREDS1 (no beta-carotene for smokers).",
    scientificInfo:
      "Based on Age-Related Eye Disease Study showing reduced progression of macular degeneration.",
    references: JSON.stringify([
      "AREDS2 Research Group. Lutein + zeaxanthin and omega-3 fatty acids for AMD. JAMA. 2013;309(19):2005-2015.",
    ]),
    relatedRemedies: JSON.stringify([
      "Lutein and Zeaxanthin",
      "Astaxanthin",
      "Bilberry",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Vision Support (General)",
    description:
      "Comprehensive eye health formula with multiple supportive nutrients.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Vitamin A",
      "Bilberry",
      "Lutein",
      "Taurine",
      "Zinc",
    ]),
    benefits: JSON.stringify([
      "General eye health",
      "Night vision",
      "Eye fatigue",
      "Dry eye support",
    ]),
    usage: "Take daily with food.",
    dosage: "Follow product directions",
    precautions: "Avoid high-dose vitamin A during pregnancy.",
    scientificInfo:
      "Combination of antioxidants and nutrients that support various aspects of eye health.",
    references: JSON.stringify([
      "Rasmussen HM, Johnson EJ. Nutrients for the aging eye. Clin Interv Aging. 2013;8:741-748.",
    ]),
    relatedRemedies: JSON.stringify(["Lutein", "Bilberry", "Astaxanthin"]),
    evidenceLevel: "Moderate",
  },
  // Sleep support
  {
    name: "Sleep Support Complex",
    description: "Multi-ingredient formula for natural sleep enhancement.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Melatonin",
      "Valerian",
      "Magnesium",
      "L-Theanine",
      "GABA",
      "Chamomile",
    ]),
    benefits: JSON.stringify([
      "Sleep onset",
      "Sleep quality",
      "Relaxation",
      "Stress reduction",
    ]),
    usage: "Take 30-60 minutes before bed.",
    dosage: "Follow product directions",
    precautions: "May cause morning grogginess. Avoid driving after taking.",
    scientificInfo:
      "Combines multiple evidence-based sleep-supporting ingredients for synergistic effect.",
    references: JSON.stringify([
      "Bent S, et al. Valerian for sleep: a systematic review. Am J Med. 2006;119(12):1005-1012.",
    ]),
    relatedRemedies: JSON.stringify(["Melatonin", "Magnesium", "Valerian"]),
    evidenceLevel: "Moderate",
  },
  // Stress and adrenal support
  {
    name: "Adrenal Support Formula",
    description:
      "Adaptogen and nutrient blend for stress resilience and adrenal health.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Ashwagandha",
      "Rhodiola",
      "Holy Basil",
      "B vitamins",
      "Vitamin C",
      "Magnesium",
    ]),
    benefits: JSON.stringify([
      "Stress resilience",
      "Energy",
      "Adrenal support",
      "Cortisol modulation",
    ]),
    usage: "Take in morning and early afternoon. Avoid evening dosing.",
    dosage: "Follow product directions",
    precautions: "May affect thyroid. May be stimulating for some.",
    scientificInfo:
      "Combines adaptogens and nutrients depleted by stress for comprehensive adrenal support.",
    references: JSON.stringify([
      "Panossian A, Wikman G. Effects of Adaptogens on the Central Nervous System. Pharmaceuticals. 2010;3(1):188-224.",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Rhodiola", "B-Complex"]),
    evidenceLevel: "Moderate",
  },
  // Liver support
  {
    name: "Liver Support Formula",
    description: "Comprehensive liver health and detoxification support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Milk Thistle",
      "NAC",
      "Alpha-Lipoic Acid",
      "Dandelion",
      "Artichoke",
      "Turmeric",
    ]),
    benefits: JSON.stringify([
      "Liver protection",
      "Detoxification",
      "Bile flow",
      "Antioxidant support",
    ]),
    usage: "Take with meals.",
    dosage: "Follow product directions",
    precautions: "May interact with medications metabolized by liver.",
    scientificInfo:
      "Combines hepatoprotective herbs and nutrients for comprehensive liver support.",
    references: JSON.stringify([
      "Abenavoli L, et al. Milk thistle in liver diseases: past, present, future. Phytother Res. 2010;24(10):1423-1432.",
    ]),
    relatedRemedies: JSON.stringify(["Milk Thistle", "NAC", "Dandelion Root"]),
    evidenceLevel: "Moderate",
  },
  // Heart health
  {
    name: "Cardiovascular Support Formula",
    description: "Comprehensive heart health and circulation support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "CoQ10",
      "Omega-3",
      "Hawthorn",
      "Magnesium",
      "Vitamin K2",
      "Garlic",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Blood pressure support",
      "Cholesterol support",
      "Circulation",
    ]),
    usage: "Take with meals containing fat.",
    dosage: "Follow product directions",
    precautions:
      "May interact with blood thinners and blood pressure medications.",
    scientificInfo:
      "Combines evidence-based cardiovascular nutrients for comprehensive heart support.",
    references: JSON.stringify([
      "Mortensen SA, et al. The effect of coenzyme Q10 on morbidity and mortality in chronic heart failure. JACC Heart Fail. 2014;2(6):641-649.",
    ]),
    relatedRemedies: JSON.stringify(["CoQ10", "Omega-3", "Hawthorn"]),
    evidenceLevel: "Moderate",
  },
  // Bone health
  {
    name: "Bone Health Formula",
    description: "Comprehensive mineral and vitamin support for bone density.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Calcium",
      "Vitamin D3",
      "Vitamin K2",
      "Magnesium",
      "Boron",
      "Strontium",
    ]),
    benefits: JSON.stringify([
      "Bone density",
      "Calcium absorption",
      "Bone matrix",
      "Fracture prevention",
    ]),
    usage: "Divide calcium doses for absorption. Take with food.",
    dosage: "Follow product directions",
    precautions:
      "Strontium separate from calcium by 2 hours. K2 caution with blood thinners.",
    scientificInfo:
      "Combines bone-building minerals with vitamins D3 and K2 for proper calcium utilization.",
    references: JSON.stringify([
      "Weaver CM, et al. Calcium plus vitamin D supplementation and risk of fractures. N Engl J Med. 2006;354(21):2285-2286.",
    ]),
    relatedRemedies: JSON.stringify(["Calcium", "Vitamin D3", "Vitamin K2"]),
    evidenceLevel: "Strong",
  },
  // Joint health
  {
    name: "Joint Health Formula",
    description: "Comprehensive support for joint structure and comfort.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Glucosamine",
      "Chondroitin",
      "MSM",
      "Hyaluronic Acid",
      "Collagen",
      "Turmeric",
    ]),
    benefits: JSON.stringify([
      "Joint comfort",
      "Cartilage support",
      "Joint lubrication",
      "Flexibility",
    ]),
    usage: "Take daily. Allow 4-8 weeks for benefits.",
    dosage: "Follow product directions",
    precautions:
      "Shellfish allergy caution with glucosamine. May affect blood sugar.",
    scientificInfo:
      "Combines cartilage building blocks with anti-inflammatory support.",
    references: JSON.stringify([
      "Clegg DO, et al. Glucosamine, chondroitin sulfate, and the two in combination for painful knee osteoarthritis. N Engl J Med. 2006;354(8):795-808.",
    ]),
    relatedRemedies: JSON.stringify(["Glucosamine", "Collagen", "Turmeric"]),
    evidenceLevel: "Moderate",
  },
  // Brain health
  {
    name: "Brain Health Formula",
    description: "Comprehensive cognitive support for memory and focus.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Lions Mane",
      "Bacopa",
      "Ginkgo",
      "Phosphatidylserine",
      "Omega-3 DHA",
      "B vitamins",
    ]),
    benefits: JSON.stringify([
      "Memory",
      "Focus",
      "Cognitive function",
      "Neuroprotection",
    ]),
    usage: "Take with fat-containing meal for absorption.",
    dosage: "Follow product directions",
    precautions:
      "Ginkgo may interact with blood thinners. Allow 4-12 weeks for effects.",
    scientificInfo: "Combines nootropic herbs with brain-supporting nutrients.",
    references: JSON.stringify([
      "Kennedy DO. B Vitamins and the Brain: Mechanisms, Dose and Efficacy. Nutrients. 2016;8(2):68.",
    ]),
    relatedRemedies: JSON.stringify(["Lions Mane", "Bacopa", "Omega-3"]),
    evidenceLevel: "Moderate",
  },
  // Immune support
  {
    name: "Immune Support Formula",
    description: "Comprehensive daily immune system support.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Vitamin C",
      "Vitamin D3",
      "Zinc",
      "Elderberry",
      "Echinacea",
      "Astragalus",
    ]),
    benefits: JSON.stringify([
      "Immune function",
      "Cold prevention",
      "Respiratory health",
    ]),
    usage: "Take daily for prevention or increase during illness.",
    dosage: "Follow product directions",
    precautions: "May interact with immunosuppressants.",
    scientificInfo:
      "Combines immune-essential nutrients with traditional immune herbs.",
    references: JSON.stringify([
      "Carr AC, Maggini S. Vitamin C and Immune Function. Nutrients. 2017;9(11):1211.",
    ]),
    relatedRemedies: JSON.stringify(["Vitamin C", "Elderberry", "Zinc"]),
    evidenceLevel: "Moderate",
  },
  // Mens health
  {
    name: "Mens Prostate Formula",
    description: "Comprehensive prostate and urinary health support for men.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Saw Palmetto",
      "Pygeum",
      "Nettle Root",
      "Beta-Sitosterol",
      "Zinc",
      "Lycopene",
    ]),
    benefits: JSON.stringify([
      "Prostate health",
      "Urinary flow",
      "BPH support",
    ]),
    usage: "Take daily with food.",
    dosage: "Follow product directions",
    precautions: "May affect PSA readings. Inform urologist.",
    scientificInfo:
      "Combines evidence-based prostate-supporting herbs and nutrients.",
    references: JSON.stringify([
      "Tacklind J, et al. Serenoa repens for benign prostatic hyperplasia. Cochrane Database Syst Rev. 2012;12:CD001423.",
    ]),
    relatedRemedies: JSON.stringify(["Saw Palmetto", "Pygeum", "Zinc"]),
    evidenceLevel: "Moderate",
  },
  // Womens health
  {
    name: "Womens Hormone Balance",
    description: "Comprehensive hormonal support for women.",
    category: "Specialty Nutrient",
    ingredients: JSON.stringify([
      "Vitex",
      "Dong Quai",
      "Black Cohosh",
      "Maca",
      "Evening Primrose Oil",
      "B6",
    ]),
    benefits: JSON.stringify([
      "Hormone balance",
      "PMS relief",
      "Menstrual regularity",
      "Menopausal support",
    ]),
    usage: "Take daily. Allow 2-3 months for effects.",
    dosage: "Follow product directions",
    precautions:
      "Avoid with hormone-sensitive conditions. Not during pregnancy.",
    scientificInfo: "Combines traditional womens herbs for hormonal balance.",
    references: JSON.stringify([
      "van Die MD, et al. Vitex agnus-castus extracts for female reproductive disorders. Planta Med. 2013;79(7):562-575.",
    ]),
    relatedRemedies: JSON.stringify(["Vitex", "Black Cohosh", "Maca"]),
    evidenceLevel: "Moderate",
  },
];
