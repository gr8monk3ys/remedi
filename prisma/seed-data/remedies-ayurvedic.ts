// Ayurvedic Medicine Remedies
export const ayurvedicRemedies = [
  {
    name: "Triphala",
    description:
      "A classic Ayurvedic formula combining three fruits (Amalaki, Bibhitaki, Haritaki) for digestive health and detoxification.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Emblica officinalis (Amalaki)",
      "Terminalia bellirica (Bibhitaki)",
      "Terminalia chebula (Haritaki)",
    ]),
    benefits: JSON.stringify([
      "Digestive health",
      "Gentle detoxification",
      "Antioxidant protection",
      "Eye health",
      "Regularity support",
    ]),
    usage:
      "Take 500-1000mg twice daily with warm water, or 1/2-1 tsp powder before bed.",
    dosage: "500-1000mg twice daily or 1/2-1 tsp powder",
    precautions:
      "May cause loose stools initially. Avoid during pregnancy and diarrhea.",
    scientificInfo:
      "Research shows antioxidant, anti-inflammatory, and gentle laxative effects.",
    references: JSON.stringify([
      "Journal of Alternative and Complementary Medicine 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Amalaki", "Haritaki", "Bibhitaki"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Trikatu",
    description:
      "A warming Ayurvedic formula of three pungent herbs that kindles digestive fire (Agni).",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Piper longum (Long Pepper)",
      "Piper nigrum (Black Pepper)",
      "Zingiber officinale (Ginger)",
    ]),
    benefits: JSON.stringify([
      "Digestive stimulation",
      "Metabolism boost",
      "Respiratory clearing",
      "Nutrient absorption",
      "Weight management",
    ]),
    usage: "Take 250-500mg before meals with honey or warm water.",
    dosage: "250-500mg before meals",
    precautions:
      "Very heating. Avoid with Pitta imbalances, acid reflux, or gastritis.",
    scientificInfo:
      "Piperine enhances bioavailability of nutrients and other compounds.",
    references: JSON.stringify([
      "Planta Medica 2016",
      "Journal of Ayurveda and Integrative Medicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Ginger", "Black Pepper", "Long Pepper"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Chyawanprash",
    description:
      "A traditional Ayurvedic jam-like preparation centered on Amla, with numerous herbs for immunity and vitality.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Amla",
      "Ashwagandha",
      "Shatavari",
      "Pippali",
      "Ghee",
      "Honey",
      "40+ herbs",
    ]),
    benefits: JSON.stringify([
      "Immune support",
      "Energy enhancement",
      "Respiratory health",
      "Anti-aging",
      "Vitality boost",
    ]),
    usage: "Take 1-2 teaspoons daily, preferably in the morning with milk.",
    dosage: "1-2 teaspoons daily",
    precautions:
      "Contains sugar. Diabetics should use sugar-free versions or consult practitioner.",
    scientificInfo: "Studies show immunomodulatory and antioxidant effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Ayu 2018",
    ]),
    relatedRemedies: JSON.stringify(["Amla", "Ashwagandha", "Shatavari"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Brahmi (Bacopa)",
    description:
      "A premier Ayurvedic brain tonic that enhances memory, focus, and cognitive function.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Bacopa monnieri",
      "Bacosides A and B",
      "Alkaloids",
      "Saponins",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Memory enhancement",
      "Focus improvement",
      "Anxiety reduction",
      "Neuroprotection",
      "Learning support",
    ]),
    usage:
      "Take 300-450mg standardized extract (45% bacosides) daily with food.",
    dosage: "300-450mg standardized extract daily",
    precautions:
      "May cause GI upset. Effects develop over 8-12 weeks of consistent use.",
    scientificInfo:
      "Multiple clinical trials demonstrate improved memory and cognitive processing.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2014",
      "Neuropsychopharmacology 2016",
      "Phytotherapy Research 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Gotu Kola",
      "Shankhpushpi",
      "Ashwagandha",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Shankhpushpi",
    description:
      "An Ayurvedic herb that calms the mind, enhances memory, and supports mental clarity.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Convolvulus pluricaulis",
      "Scopoletin",
      "Flavonoids",
      "Alkaloids",
      "Glycosides",
    ]),
    benefits: JSON.stringify([
      "Memory enhancement",
      "Anxiety relief",
      "Sleep improvement",
      "Mental clarity",
      "Stress reduction",
    ]),
    usage: "Take 250-500mg extract or 3-6g powder twice daily.",
    dosage: "250-500mg extract or 3-6g powder twice daily",
    precautions:
      "May cause drowsiness. Use cautiously with sedative medications.",
    scientificInfo: "Research shows anxiolytic and memory-enhancing effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Phytotherapy Research 2017",
    ]),
    relatedRemedies: JSON.stringify(["Brahmi", "Gotu Kola", "Jatamansi"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Jatamansi",
    description:
      "An Ayurvedic herb from the Himalayas that calms the mind and promotes restful sleep.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Nardostachys jatamansi root",
      "Jatamansone",
      "Nardostachone",
      "Sesquiterpenes",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Sleep improvement",
      "Anxiety relief",
      "Memory support",
      "Hair health",
      "Stress reduction",
    ]),
    usage: "Take 250-500mg extract or 1-3g powder before bed.",
    dosage: "250-500mg extract or 1-3g powder",
    precautions: "May cause drowsiness. Avoid during pregnancy.",
    scientificInfo:
      "Contains compounds with sedative and neuroprotective properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Valerian",
      "Ashwagandha",
      "Shankhpushpi",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Vacha (Calamus)",
    description:
      "An Ayurvedic herb that enhances speech, memory, and mental clarity while clearing mental fog.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Acorus calamus root",
      "Beta-asarone",
      "Alpha-asarone",
      "Essential oils",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Speech improvement",
      "Mental clarity",
      "Memory support",
      "Digestive aid",
      "Respiratory clearing",
    ]),
    usage: "Take 125-500mg powder with honey.",
    dosage: "125-500mg powder",
    precautions:
      "Contains asarone. Use only Acorus calamus var. americanus (beta-asarone free) or limit use.",
    scientificInfo:
      "Traditional use for cognition, though asarone content raises safety questions.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Phytotherapy Research 2017",
    ]),
    relatedRemedies: JSON.stringify(["Brahmi", "Gotu Kola", "Shankhpushpi"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Punarnava",
    description:
      'An Ayurvedic herb meaning "one that renews" used for kidney health and fluid balance.',
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Boerhavia diffusa root",
      "Punarnavine",
      "Boeravinone",
      "Rotenoids",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Kidney health",
      "Fluid balance",
      "Liver support",
      "Heart health",
      "Anti-inflammatory effects",
    ]),
    usage: "Take 500-1000mg extract or 3-6g powder twice daily.",
    dosage: "500-1000mg extract or 3-6g powder twice daily",
    precautions: "Diuretic effect. Use cautiously with kidney conditions.",
    scientificInfo:
      "Research shows diuretic, hepatoprotective, and anti-inflammatory properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Gokshura", "Varuna", "Pashanbhed"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Gokshura (Tribulus)",
    description:
      "An Ayurvedic herb that supports urinary tract health, reproductive function, and vitality.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Tribulus terrestris fruit",
      "Protodioscin",
      "Saponins",
      "Flavonoids",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Urinary tract health",
      "Reproductive support",
      "Athletic performance",
      "Kidney support",
      "Libido enhancement",
    ]),
    usage: "Take 250-750mg standardized extract or 3-6g powder daily.",
    dosage: "250-750mg extract or 3-6g powder daily",
    precautions:
      "May affect hormone levels. Use cautiously with hormone-sensitive conditions.",
    scientificInfo:
      "Research shows modest effects on sexual function and urinary health.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Shilajit", "Kapikacchu"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Kapikacchu (Mucuna)",
    description:
      "An Ayurvedic herb containing natural L-DOPA that supports mood, reproductive health, and neurological function.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Mucuna pruriens seed",
      "L-DOPA",
      "Serotonin",
      "5-HTP",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Mood support",
      "Reproductive health",
      "Dopamine production",
      "Stress adaptation",
      "Athletic performance",
    ]),
    usage: "Take 250-500mg standardized extract (15% L-DOPA) 1-2 times daily.",
    dosage: "250-500mg standardized extract daily",
    precautions:
      "May interact with MAOIs, dopamine medications, and antipsychotics. Not for Parkinson's patients without supervision.",
    scientificInfo:
      "Contains 3-6% L-DOPA with demonstrated effects on dopamine and testosterone.",
    references: JSON.stringify([
      "Evidence-Based Complementary and Alternative Medicine 2014",
      "Journal of Ethnopharmacology 2017",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Gokshura", "Shilajit"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Vidari Kanda",
    description:
      "An Ayurvedic rejuvenating herb that nourishes tissues and supports reproductive health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Pueraria tuberosa root",
      "Puerarin",
      "Isoflavones",
      "Starch",
      "Saponins",
    ]),
    benefits: JSON.stringify([
      "Tissue nourishment",
      "Reproductive support",
      "Lactation support",
      "Strength building",
      "Vata balancing",
    ]),
    usage: "Take 3-6g powder with milk or as directed.",
    dosage: "3-6g powder with milk",
    precautions: "Heavy to digest. Use cautiously with weak digestion.",
    scientificInfo:
      "Contains phytoestrogens with traditional rejuvenating properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Ayu 2017",
    ]),
    relatedRemedies: JSON.stringify(["Shatavari", "Ashwagandha", "Bala"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Bala",
    description:
      'An Ayurvedic herb meaning "strength" that builds tissues and supports physical vitality.',
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Sida cordifolia",
      "Ephedrine",
      "Pseudoephedrine",
      "Phytosterols",
      "Mucilage",
    ]),
    benefits: JSON.stringify([
      "Strength building",
      "Nerve health",
      "Joint support",
      "Heart health",
      "Energy enhancement",
    ]),
    usage: "Take 3-6g powder or as directed by practitioner.",
    dosage: "3-6g powder daily",
    precautions:
      "Contains ephedrine alkaloids. Avoid with heart conditions, hypertension, or anxiety. Banned in some regions.",
    scientificInfo:
      "Traditional nervine and strength tonic; ephedrine content requires caution.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Ayu 2018",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Vidari", "Shatavari"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Manjistha",
    description:
      "An Ayurvedic blood purifier that supports skin health, lymphatic function, and liver detoxification.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Rubia cordifolia root",
      "Alizarin",
      "Purpurin",
      "Anthraquinones",
      "Mollugin",
    ]),
    benefits: JSON.stringify([
      "Blood purification",
      "Skin health",
      "Lymphatic support",
      "Liver detoxification",
      "Inflammation reduction",
    ]),
    usage: "Take 500-1000mg extract or 3-6g powder twice daily.",
    dosage: "500-1000mg extract or 3-6g powder twice daily",
    precautions:
      "May cause red discoloration of urine (harmless). Avoid during pregnancy.",
    scientificInfo:
      "Research shows anti-inflammatory and hepatoprotective effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Neem", "Turmeric", "Kutki"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Kutki",
    description:
      "A powerful Ayurvedic bitter herb that supports liver function and digestive health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Picrorhiza kurroa root",
      "Picroside I and II",
      "Kutkoside",
      "Iridoids",
      "Cucurbitacins",
    ]),
    benefits: JSON.stringify([
      "Liver protection",
      "Digestive support",
      "Immune modulation",
      "Fever reduction",
      "Skin health",
    ]),
    usage: "Take 250-500mg extract or 1-3g powder twice daily before meals.",
    dosage: "250-500mg extract or 1-3g powder twice daily",
    precautions:
      "Very bitter and cooling. Avoid with Vata imbalances or weak digestion.",
    scientificInfo:
      "Picrosides have demonstrated significant hepatoprotective effects in research.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Milk Thistle",
      "Bhumyamalaki",
      "Kalmegh",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Bhumyamalaki",
    description:
      "An Ayurvedic herb also known as Phyllanthus, used for liver protection and viral conditions.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Phyllanthus niruri",
      "Lignans",
      "Phyllanthin",
      "Hypophyllanthin",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Liver protection",
      "Kidney stone prevention",
      "Viral conditions",
      "Blood sugar support",
      "Digestive health",
    ]),
    usage: "Take 500-1000mg extract or 3-6g powder twice daily.",
    dosage: "500-1000mg extract or 3-6g powder twice daily",
    precautions: "May interact with diabetes and blood pressure medications.",
    scientificInfo:
      "Research shows hepatoprotective effects and potential against hepatitis B.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
      "World Journal of Gastroenterology 2019",
    ]),
    relatedRemedies: JSON.stringify(["Kutki", "Milk Thistle", "Kalmegh"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Kalmegh (Andrographis)",
    description:
      'The "King of Bitters" used for immune support, liver protection, and respiratory health.',
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Andrographis paniculata",
      "Andrographolides",
      "Diterpenes",
      "Flavonoids",
      "Xanthones",
    ]),
    benefits: JSON.stringify([
      "Immune support",
      "Respiratory health",
      "Liver protection",
      "Anti-inflammatory effects",
      "Fever reduction",
    ]),
    usage:
      "Take 400-1200mg standardized extract daily, especially at onset of cold symptoms.",
    dosage: "400-1200mg standardized extract daily",
    precautions:
      "Very bitter and cooling. May cause fatigue, headache, or GI upset. Avoid during pregnancy.",
    scientificInfo:
      "Clinical trials show reduced severity and duration of upper respiratory infections.",
    references: JSON.stringify([
      "Phytomedicine 2017",
      "Journal of Clinical Pharmacy and Therapeutics 2018",
    ]),
    relatedRemedies: JSON.stringify(["Echinacea", "Guduchi", "Kutki"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Haritaki",
    description:
      'One of the three fruits in Triphala, considered the "king of medicines" in Ayurveda and Tibet.',
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Terminalia chebula fruit",
      "Chebulic acid",
      "Chebulagic acid",
      "Tannins",
      "Gallic acid",
    ]),
    benefits: JSON.stringify([
      "Digestive health",
      "Gentle detoxification",
      "Brain function",
      "Heart health",
      "Longevity support",
    ]),
    usage: "Take 500-1500mg powder or as part of Triphala.",
    dosage: "500-1500mg powder or in Triphala formula",
    precautions:
      "Laxative effect in higher doses. Avoid during pregnancy and with severe dehydration.",
    scientificInfo:
      "Research shows antioxidant, antimicrobial, and cardioprotective effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytotherapy Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Amalaki", "Bibhitaki"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Bibhitaki",
    description:
      "One of the three Triphala fruits that particularly benefits the respiratory system and eyes.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Terminalia bellirica fruit",
      "Belleric acid",
      "Gallic acid",
      "Tannins",
      "Lignans",
    ]),
    benefits: JSON.stringify([
      "Respiratory health",
      "Eye health",
      "Digestive support",
      "Hair health",
      "Kapha balancing",
    ]),
    usage: "Take 500-1500mg powder or as part of Triphala.",
    dosage: "500-1500mg powder or in Triphala formula",
    precautions: "May cause loose stools. Avoid during pregnancy.",
    scientificInfo:
      "Contains compounds with antimicrobial and antioxidant properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Amalaki", "Haritaki"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Pippali (Long Pepper)",
    description:
      "A warming Ayurvedic spice that kindles digestive fire and enhances bioavailability of other herbs.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Piper longum fruit",
      "Piperine",
      "Piperlongumine",
      "Alkaloids",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Digestive stimulation",
      "Respiratory support",
      "Bioavailability enhancement",
      "Metabolism boost",
      "Detoxification",
    ]),
    usage: "Take 250-500mg powder or as part of Trikatu formula.",
    dosage: "250-500mg powder, often with other herbs",
    precautions:
      "Very heating. Avoid with Pitta imbalances, acid reflux, or during pregnancy.",
    scientificInfo:
      "Piperine significantly enhances absorption of many nutrients and medicines.",
    references: JSON.stringify([
      "Planta Medica 2016",
      "Critical Reviews in Food Science 2018",
    ]),
    relatedRemedies: JSON.stringify(["Trikatu", "Black Pepper", "Ginger"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Chitrak",
    description:
      "A powerful Ayurvedic herb that kindles digestive fire and scrapes toxins from tissues.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Plumbago zeylanica root",
      "Plumbagin",
      "Flavonoids",
      "Naphthoquinones",
    ]),
    benefits: JSON.stringify([
      "Digestive fire",
      "Weight management",
      "Metabolism boost",
      "Toxin elimination",
      "Joint support",
    ]),
    usage: "Take 250-500mg powder with meals. Often used in formulas.",
    dosage: "250-500mg powder with meals",
    precautions:
      "Very heating and irritating in excess. Avoid during pregnancy and with gastritis.",
    scientificInfo:
      "Plumbagin has demonstrated anti-inflammatory and anticancer properties in research.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Trikatu", "Pippali", "Ginger"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Musta",
    description:
      "An Ayurvedic herb that regulates digestive function and supports healthy menstruation.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Cyperus rotundus tuber",
      "Cyperone",
      "Alpha-cyperone",
      "Sesquiterpenes",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Digestive regulation",
      "Menstrual health",
      "Diarrhea relief",
      "Inflammation reduction",
      "Fever reduction",
    ]),
    usage: "Take 500-1500mg powder or extract twice daily.",
    dosage: "500-1500mg powder twice daily",
    precautions: "May increase menstrual flow. Avoid with heavy menstruation.",
    scientificInfo:
      "Research shows anti-inflammatory and antidiarrheal properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Phytotherapy Research 2017",
    ]),
    relatedRemedies: JSON.stringify(["Ginger", "Kutaja", "Bilva"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Kutaja",
    description:
      "An Ayurvedic herb primarily used for diarrhea, dysentery, and intestinal disorders.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Holarrhena antidysenterica bark",
      "Conessine",
      "Kurchine",
      "Alkaloids",
      "Steroids",
    ]),
    benefits: JSON.stringify([
      "Diarrhea relief",
      "Intestinal health",
      "Amoebic dysentery",
      "Digestive support",
      "Fever reduction",
    ]),
    usage: "Take 500-1000mg powder or extract for acute conditions.",
    dosage: "500-1000mg powder or extract",
    precautions:
      "Primarily for acute conditions. Avoid long-term use without guidance.",
    scientificInfo:
      "Conessine has demonstrated amoebicidal and antidiarrheal effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Indian Journal of Medical Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Bilva", "Musta", "Pomegranate"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Bilva (Bael)",
    description:
      "An Ayurvedic fruit tree whose leaves and unripe fruit benefit digestive and respiratory systems.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Aegle marmelos fruit/leaves",
      "Marmelosin",
      "Luvangetin",
      "Psoralen",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Diarrhea relief",
      "Digestive health",
      "Diabetes support",
      "Respiratory health",
      "Intestinal healing",
    ]),
    usage:
      "Take 3-6g powder or as fruit pulp. Unripe fruit for diarrhea; ripe for constipation.",
    dosage: "3-6g powder or fruit pulp",
    precautions:
      "Unripe fruit is astringent; ripe fruit is laxative. Choose based on condition.",
    scientificInfo:
      "Research shows antimicrobial and antidiarrheal properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Kutaja", "Pomegranate", "Musta"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Arjuna",
    description:
      "A renowned Ayurvedic heart tonic derived from tree bark that supports cardiovascular health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Terminalia arjuna bark",
      "Arjunolic acid",
      "Arjunic acid",
      "Tannins",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Heart health",
      "Blood pressure support",
      "Cholesterol management",
      "Chest pain relief",
      "Cardiac strengthening",
    ]),
    usage: "Take 500-1000mg bark powder or extract twice daily.",
    dosage: "500-1000mg powder or extract twice daily",
    precautions:
      "May interact with heart medications. Use under supervision for heart conditions.",
    scientificInfo:
      "Clinical trials show improvements in ejection fraction and exercise tolerance.",
    references: JSON.stringify([
      "Journal of Association of Physicians of India 2001",
      "Journal of Ethnopharmacology 2018",
    ]),
    relatedRemedies: JSON.stringify(["Hawthorn", "CoQ10", "Omega-3"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Guggul",
    description:
      "An Ayurvedic resin that supports healthy cholesterol levels, thyroid function, and joint health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Commiphora mukul resin",
      "Guggulsterones E and Z",
      "Myrrhanol",
      "Steroids",
      "Diterpenes",
    ]),
    benefits: JSON.stringify([
      "Cholesterol support",
      "Thyroid function",
      "Joint health",
      "Weight management",
      "Anti-inflammatory effects",
    ]),
    usage:
      "Take 25-50mg guggulsterones or 500-1000mg extract three times daily.",
    dosage: "25-50mg guggulsterones or 500-1000mg extract 3x daily",
    precautions:
      "May affect thyroid function. Avoid during pregnancy. May interact with medications.",
    scientificInfo:
      "Research shows effects on lipid metabolism and thyroid hormone production.",
    references: JSON.stringify([
      "Journal of Medicinal Food 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Trikatu", "Shilajit"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Brahma Rasayana",
    description:
      "A traditional Ayurvedic rejuvenative preparation for brain function and longevity.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Haritaki",
      "Amalaki",
      "Ghee",
      "Honey",
      "Various herbs",
    ]),
    benefits: JSON.stringify([
      "Cognitive enhancement",
      "Memory support",
      "Anti-aging",
      "Vitality boost",
      "Immune support",
    ]),
    usage: "Take 1-2 teaspoons daily with warm milk or water.",
    dosage: "1-2 teaspoons daily",
    precautions: "Contains sweeteners. Diabetics should consult practitioner.",
    scientificInfo:
      "Contains adaptogenic and nootropic herbs traditionally used for cognition.",
    references: JSON.stringify([
      "Ayu 2016",
      "Journal of Ayurveda and Integrative Medicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Chyawanprash", "Brahmi", "Ashwagandha"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Amalaki (Indian Gooseberry)",
    description:
      "One of the most prized Ayurvedic rejuvenatives, exceptionally high in vitamin C and antioxidants.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Emblica officinalis fruit",
      "Vitamin C",
      "Emblicanin A and B",
      "Ellagic acid",
      "Gallic acid",
    ]),
    benefits: JSON.stringify([
      "Immune support",
      "Antioxidant protection",
      "Digestive health",
      "Hair and skin health",
      "Anti-aging",
    ]),
    usage: "Take 500-3000mg powder or extract daily.",
    dosage: "500-3000mg powder or extract daily",
    precautions:
      "Generally safe. High vitamin C may cause loose stools in sensitive individuals.",
    scientificInfo:
      "Contains one of the highest natural vitamin C contents with stable antioxidants.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytotherapy Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Haritaki", "Bibhitaki"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Varuna",
    description:
      "An Ayurvedic herb used for urinary tract health, kidney stones, and prostate support.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Crataeva nurvala bark",
      "Lupeol",
      "Betulinic acid",
      "Saponins",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Kidney stone prevention",
      "Prostate health",
      "Urinary tract support",
      "Fluid balance",
      "Bladder toning",
    ]),
    usage: "Take 500-1000mg extract or 3-6g powder twice daily.",
    dosage: "500-1000mg extract or 3-6g powder twice daily",
    precautions: "May increase urination. Ensure adequate hydration.",
    scientificInfo:
      "Research shows lithotriptic (stone-breaking) and prostate-protective effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Urological Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Gokshura", "Punarnava", "Pashanbhed"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Pashanbhed",
    description:
      'The "stone breaker" herb used in Ayurveda for kidney stones and urinary tract health.',
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Bergenia ligulata root",
      "Bergenin",
      "Gallic acid",
      "Tannins",
      "Mucilage",
    ]),
    benefits: JSON.stringify([
      "Kidney stone dissolution",
      "Urinary tract health",
      "Bladder support",
      "Anti-inflammatory effects",
      "Wound healing",
    ]),
    usage: "Take 500-1500mg powder or decoction twice daily.",
    dosage: "500-1500mg powder twice daily",
    precautions:
      "Primarily for urinary conditions. Work with practitioner for kidney stones.",
    scientificInfo:
      "Traditional use for urolithiasis supported by some research.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Phytotherapy Research 2017",
    ]),
    relatedRemedies: JSON.stringify(["Varuna", "Gokshura", "Punarnava"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Sariva",
    description:
      "An Ayurvedic blood purifier and cooling herb that supports skin health and reduces inflammation.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Hemidesmus indicus root",
      "Hemidesminine",
      "Coumarins",
      "Saponins",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Blood purification",
      "Skin health",
      "Cooling effects",
      "Urinary health",
      "Digestive support",
    ]),
    usage: "Take 500-1500mg powder or 3-6g as decoction twice daily.",
    dosage: "500-1500mg powder twice daily",
    precautions: "Cooling herb. Use cautiously with cold conditions.",
    scientificInfo:
      "Research shows anti-inflammatory and antioxidant properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Manjistha", "Neem", "Turmeric"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Khadira",
    description:
      "An Ayurvedic astringent herb used for skin diseases, bleeding disorders, and oral health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Acacia catechu heartwood",
      "Catechin",
      "Epicatechin",
      "Tannins",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Skin health",
      "Oral health",
      "Bleeding control",
      "Digestive support",
      "Wound healing",
    ]),
    usage: "Take 500-1500mg powder or as directed. Also used in gargles.",
    dosage: "500-1500mg powder or as gargle",
    precautions: "Very astringent. May cause constipation with excessive use.",
    scientificInfo:
      "Contains catechins with antioxidant and antimicrobial properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Indian Journal of Dental Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Triphala", "Neem", "Manjistha"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Daruharidra",
    description:
      "Indian barberry, a berberine-containing Ayurvedic herb used for infections and eye health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Berberis aristata root",
      "Berberine",
      "Palmatine",
      "Oxyberberine",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Antimicrobial effects",
      "Eye health",
      "Digestive support",
      "Skin conditions",
      "Liver health",
    ]),
    usage:
      "Take 500-1500mg extract or 3-6g powder. Used in eye washes when prepared properly.",
    dosage: "500-1500mg extract or 3-6g powder",
    precautions: "May interact with medications. Avoid during pregnancy.",
    scientificInfo:
      "Contains berberine with extensive research on metabolic and antimicrobial effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Goldenseal", "Coptis", "Turmeric"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Yashtimadhu (Licorice)",
    description:
      "Ayurvedic licorice root that soothes digestion, supports respiratory health, and nourishes tissues.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Glycyrrhiza glabra root",
      "Glycyrrhizin",
      "Flavonoids",
      "Isoflavones",
      "Coumarins",
    ]),
    benefits: JSON.stringify([
      "Digestive soothing",
      "Respiratory support",
      "Adrenal support",
      "Throat health",
      "Ulcer healing",
    ]),
    usage: "Take 500-1500mg powder or DGL form for digestive issues.",
    dosage: "500-1500mg powder or DGL tablets",
    precautions:
      "Glycyrrhizin raises blood pressure. Use DGL form for extended use. Avoid with hypertension.",
    scientificInfo:
      "Glycyrrhizin has demonstrated anti-ulcer and expectorant effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytotherapy Research 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "DGL Licorice",
      "Slippery Elm",
      "Marshmallow",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Nagkesar",
    description:
      "An Ayurvedic herb used for bleeding disorders, skin conditions, and digestive problems.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Mesua ferrea flower/stamen",
      "Mesuol",
      "Mesuone",
      "Xanthones",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Bleeding control",
      "Skin health",
      "Digestive support",
      "Menstrual regulation",
      "Fever reduction",
    ]),
    usage: "Take 500-1500mg powder twice daily.",
    dosage: "500-1500mg powder twice daily",
    precautions:
      "Avoid during pregnancy. Use cautiously with bleeding disorders.",
    scientificInfo:
      "Contains compounds with hemostatic and anti-inflammatory properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Lodhra", "Ashoka", "Manjistha"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Lodhra",
    description:
      "An Ayurvedic astringent herb primarily used for female reproductive health and skin conditions.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Symplocos racemosa bark",
      "Loturine",
      "Colloturine",
      "Flavonoids",
      "Glycosides",
    ]),
    benefits: JSON.stringify([
      "Menstrual regulation",
      "Uterine health",
      "Skin conditions",
      "Eye health",
      "Diarrhea relief",
    ]),
    usage: "Take 500-1500mg powder twice daily.",
    dosage: "500-1500mg powder twice daily",
    precautions: "Very astringent. Avoid during pregnancy.",
    scientificInfo:
      "Traditional use for gynecological conditions supported by limited research.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2015",
      "Ayu 2017",
    ]),
    relatedRemedies: JSON.stringify(["Ashoka", "Nagkesar", "Shatavari"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Ashoka",
    description:
      "The premier Ayurvedic herb for female reproductive health, supporting healthy menstruation.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Saraca asoca bark",
      "Catechol",
      "Tannins",
      "Glycosides",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Menstrual regulation",
      "Uterine health",
      "Menstrual pain relief",
      "Hormonal balance",
      "Emotional wellbeing",
    ]),
    usage: "Take 500-1500mg extract or 3-6g powder twice daily.",
    dosage: "500-1500mg extract or 3-6g powder twice daily",
    precautions:
      "Avoid during pregnancy. May interact with hormonal medications.",
    scientificInfo:
      "Research shows uterotonic and hormone-regulating properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Shatavari", "Lodhra", "Dong Quai"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Nimba (Neem)",
    description:
      "A powerful Ayurvedic bitter herb with broad antimicrobial and blood-purifying properties.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Azadirachta indica",
      "Azadirachtin",
      "Nimbin",
      "Nimbidine",
      "Quercetin",
    ]),
    benefits: JSON.stringify([
      "Blood purification",
      "Skin health",
      "Antimicrobial effects",
      "Dental health",
      "Immune support",
    ]),
    usage: "Take 500-1000mg extract or 2-4g powder daily. Also used topically.",
    dosage: "500-1000mg extract or 2-4g powder daily",
    precautions:
      "Very bitter and cooling. Avoid during pregnancy and with hypoglycemia.",
    scientificInfo:
      "Extensive research confirms antimicrobial, anti-inflammatory, and hypoglycemic effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2019",
    ]),
    relatedRemedies: JSON.stringify(["Turmeric", "Manjistha", "Khadira"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Kantakari",
    description:
      "An Ayurvedic herb used for respiratory conditions, cough, and asthma support.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Solanum xanthocarpum",
      "Solasodine",
      "Solamargine",
      "Flavonoids",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Respiratory support",
      "Cough relief",
      "Asthma management",
      "Fever reduction",
      "Digestive support",
    ]),
    usage: "Take 500-1500mg powder or as decoction for respiratory conditions.",
    dosage: "500-1500mg powder or decoction",
    precautions: "May cause stomach upset. Use cautiously during pregnancy.",
    scientificInfo:
      "Research shows bronchodilator and anti-asthmatic properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Vasa", "Tulsi", "Pippali"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Vasa (Adhatoda)",
    description:
      "A premier Ayurvedic respiratory herb that opens airways and supports healthy breathing.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Adhatoda vasica leaves",
      "Vasicine",
      "Vasicinone",
      "Alkaloids",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Bronchial support",
      "Cough relief",
      "Asthma management",
      "Expectoration",
      "Respiratory clearing",
    ]),
    usage: "Take 500-2000mg leaf extract or powder for respiratory conditions.",
    dosage: "500-2000mg powder or extract",
    precautions: "May have abortifacient effects. Avoid during pregnancy.",
    scientificInfo:
      "Vasicine has demonstrated bronchodilator and mucolytic properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Kantakari", "Tulsi", "Licorice"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Tulsi (Holy Basil)",
    description:
      "Sacred Ayurvedic adaptogen that supports stress resilience, immunity, and respiratory health.",
    category: "Ayurvedic",
    ingredients: JSON.stringify([
      "Ocimum sanctum",
      "Eugenol",
      "Rosmarinic acid",
      "Ursolic acid",
      "Caryophyllene",
    ]),
    benefits: JSON.stringify([
      "Stress adaptation",
      "Immune support",
      "Respiratory health",
      "Blood sugar balance",
      "Inflammation reduction",
    ]),
    usage: "Take 300-600mg extract or drink as tea (2-3 cups daily).",
    dosage: "300-600mg extract or 2-3 cups tea daily",
    precautions:
      "May enhance effects of blood thinners. Avoid excessive use during pregnancy.",
    scientificInfo:
      "Clinical studies show stress-reducing and immunomodulating effects.",
    references: JSON.stringify([
      "Journal of Ayurveda and Integrative Medicine 2017",
      "Evidence-Based Complementary and Alternative Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Ashwagandha", "Brahmi", "Gotu Kola"]),
    evidenceLevel: "Moderate",
  },
];
