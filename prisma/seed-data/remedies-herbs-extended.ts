// Extended herbal remedies for comprehensive coverage
export const extendedHerbalRemedies = [
  // TCM Herbs
  {
    name: 'Dong Quai (Angelica sinensis)',
    description: 'Female ginseng in TCM, used for menstrual and menopausal support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Ferulic acid', 'Ligustilide', 'Polysaccharides']),
    benefits: JSON.stringify(['Menstrual support', 'Blood tonic', 'Circulation', 'Menopausal symptoms']),
    usage: 'Traditionally used in formulas rather than alone.',
    dosage: '500-2000 mg dried root or extract daily',
    precautions: 'Avoid during pregnancy. May increase bleeding risk. Photosensitivity possible.',
    scientificInfo: 'Dong quai has blood-building and circulation-enhancing properties in TCM. Contains ferulic acid with antioxidant effects.',
    references: JSON.stringify([
      'Circosta C, et al. Estrogenic activity of standardized extract of Angelica sinensis. Phytother Res. 2006;20(8):665-669.',
      'Hook IL. Danggui to Angelica sinensis root: are potential benefits to European women a reality? Phytochemistry. 2014;98:1-8.'
    ]),
    relatedRemedies: JSON.stringify(['Black Cohosh', 'Vitex', 'Red Clover']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Burdock Root',
    description: 'Detoxifying root used for skin health and blood purification.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Inulin', 'Arctigenin', 'Polyphenols']),
    benefits: JSON.stringify(['Skin health', 'Liver support', 'Prebiotic', 'Blood purification']),
    usage: 'Can be consumed as food, tea, or supplement.',
    dosage: '1-2 g dried root as tea three times daily',
    precautions: 'May be confused with toxic belladonna. Use reliable sources.',
    scientificInfo: 'Burdock root contains inulin prebiotic fiber and arctigenin with anti-inflammatory properties.',
    references: JSON.stringify([
      'Chan YS, et al. A review of the pharmacological effects of Arctium lappa (burdock). Inflammopharmacology. 2011;19(5):245-254.'
    ]),
    relatedRemedies: JSON.stringify(['Dandelion Root', 'Milk Thistle', 'Yellow Dock']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Cat Claw (Uña de Gato)',
    description: 'Amazon rainforest vine with immune-modulating properties.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Oxindole alkaloids', 'Quinovic acid glycosides', 'Tannins']),
    benefits: JSON.stringify(['Immune modulation', 'Anti-inflammatory', 'Digestive support', 'Joint health']),
    usage: 'Use inner bark preparations. Available as tea or extract.',
    dosage: '250-1000 mg extract daily',
    precautions: 'May interact with immunosuppressants. Avoid before surgery.',
    scientificInfo: 'Oxindole alkaloids modulate immune cell activity. Has been studied for inflammatory conditions.',
    references: JSON.stringify([
      'Mur E, et al. Randomized double blind trial of an extract from the pentacyclic alkaloid chemotype of Uncaria tomentosa for rheumatoid arthritis. J Rheumatol. 2002;29(4):678-681.'
    ]),
    relatedRemedies: JSON.stringify(['Astragalus', 'Echinacea', 'Reishi']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Red Clover',
    description: 'Isoflavone-rich herb for menopausal symptoms and cardiovascular support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Isoflavones', 'Genistein', 'Daidzein', 'Biochanin A']),
    benefits: JSON.stringify(['Menopausal symptoms', 'Bone health', 'Cardiovascular support', 'Skin health']),
    usage: 'Take standardized isoflavone extracts.',
    dosage: '40-160 mg isoflavones daily',
    precautions: 'Avoid with hormone-sensitive conditions. May interact with blood thinners.',
    scientificInfo: 'Red clover isoflavones bind to estrogen receptors with selective effects on different tissues.',
    references: JSON.stringify([
      'Coon JT, et al. Trifolium pratense isoflavones in the treatment of menopausal hot flushes. Maturitas. 2007;57(2):106-121.'
    ]),
    relatedRemedies: JSON.stringify(['Black Cohosh', 'Soy Isoflavones', 'Dong Quai']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Vitex (Chasteberry)',
    description: 'Hormone-balancing herb for PMS and menstrual irregularities.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Iridoids', 'Flavonoids', 'Diterpenes']),
    benefits: JSON.stringify(['PMS relief', 'Menstrual regulation', 'Fertility support', 'Hormonal balance']),
    usage: 'Take in morning. Allow 3-6 months for full effects.',
    dosage: '20-40 mg standardized extract daily',
    precautions: 'May interact with hormone medications and dopamine agonists.',
    scientificInfo: 'Vitex acts on the pituitary to modulate prolactin and support progesterone production.',
    references: JSON.stringify([
      'van Die MD, et al. Vitex agnus-castus extracts for female reproductive disorders. Planta Med. 2013;79(7):562-575.'
    ]),
    relatedRemedies: JSON.stringify(['Dong Quai', 'Maca', 'Evening Primrose Oil']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Horsetail (Equisetum)',
    description: 'Silica-rich herb for hair, skin, nails, and bone support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Silica', 'Flavonoids', 'Caffeic acid esters']),
    benefits: JSON.stringify(['Hair health', 'Nail strength', 'Bone support', 'Connective tissue']),
    usage: 'Use standardized extracts. Tea form also used.',
    dosage: '300-900 mg extract daily',
    precautions: 'May deplete thiamine with long-term use. Supplement B1 if using long-term.',
    scientificInfo: 'Horsetail provides bioavailable silica important for collagen cross-linking and bone matrix.',
    references: JSON.stringify([
      'Corletto F. Female climacteric osteoporosis therapy with titrated horsetail (Equisetum arvense) extract. Minerva Ortop. 1999;50:201-206.'
    ]),
    relatedRemedies: JSON.stringify(['Silica', 'Biotin', 'Collagen']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Nettle Root',
    description: 'Root extract specifically for prostate and urinary health in men.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Lignans', 'Sterols', 'Polysaccharides']),
    benefits: JSON.stringify(['Prostate health', 'Urinary flow', 'BPH support', 'Hormone modulation']),
    usage: 'Root extract is different from leaf. Often combined with saw palmetto.',
    dosage: '300-600 mg root extract daily',
    precautions: 'May interact with diabetes and blood pressure medications.',
    scientificInfo: 'Nettle root contains compounds that inhibit SHBG binding and aromatase, supporting prostate health.',
    references: JSON.stringify([
      'Safarinejad MR. Urtica dioica for treatment of benign prostatic hyperplasia. J Herb Pharmacother. 2005;5(4):1-11.'
    ]),
    relatedRemedies: JSON.stringify(['Saw Palmetto', 'Pygeum', 'Beta-Sitosterol']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Pygeum (Prunus africana)',
    description: 'African bark extract for prostate health and urinary symptoms.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Phytosterols', 'Triterpenes', 'Ferulic acid esters']),
    benefits: JSON.stringify(['Prostate health', 'Urinary symptoms', 'BPH support']),
    usage: 'Take standardized extract daily.',
    dosage: '100-200 mg extract daily',
    precautions: 'Sustainability concerns - choose certified sources.',
    scientificInfo: 'Pygeum inhibits 5-alpha reductase and has anti-inflammatory effects on prostate tissue.',
    references: JSON.stringify([
      'Wilt T, et al. Pygeum africanum for benign prostatic hyperplasia. Cochrane Database Syst Rev. 2002;(1):CD001044.'
    ]),
    relatedRemedies: JSON.stringify(['Saw Palmetto', 'Nettle Root', 'Beta-Sitosterol']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Beta-Sitosterol',
    description: 'Plant sterol for prostate health and cholesterol support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Beta-sitosterol', 'Phytosterols']),
    benefits: JSON.stringify(['Prostate health', 'Urinary flow', 'Cholesterol support']),
    usage: 'Take with meals.',
    dosage: '60-130 mg beta-sitosterol daily',
    precautions: 'Very rare sitosterolemia condition. May reduce absorption of some medications.',
    scientificInfo: 'Beta-sitosterol improves urinary symptoms by reducing inflammation in prostate tissue.',
    references: JSON.stringify([
      'Wilt T, et al. Beta-sitosterols for benign prostatic hyperplasia. Cochrane Database Syst Rev. 2000;(2):CD001043.'
    ]),
    relatedRemedies: JSON.stringify(['Saw Palmetto', 'Pygeum', 'Plant Sterols']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Hops (Humulus lupulus)',
    description: 'Calming herb supporting sleep and menopausal comfort.',
    category: 'Herbal',
    ingredients: JSON.stringify(['2-methyl-3-buten-2-ol', 'Xanthohumol', 'Flavonoids']),
    benefits: JSON.stringify(['Sleep support', 'Relaxation', 'Menopausal symptoms', 'Digestive comfort']),
    usage: 'Often combined with valerian for sleep.',
    dosage: '300-500 mg extract before bed',
    precautions: 'May have estrogenic effects. Sedating.',
    scientificInfo: 'Hops metabolites enhance GABA activity. 8-prenylnaringenin has phytoestrogenic effects.',
    references: JSON.stringify([
      'Salter S, Brownie S. Treating primary insomnia - the efficacy of valerian and hops. Aust Fam Physician. 2010;39(6):433-437.'
    ]),
    relatedRemedies: JSON.stringify(['Valerian', 'Passionflower', 'Lemon Balm']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Catnip (Nepeta cataria)',
    description: 'Gentle calming herb from the mint family for relaxation and digestion.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Nepetalactone', 'Tannins', 'Flavonoids']),
    benefits: JSON.stringify(['Relaxation', 'Digestive comfort', 'Sleep support', 'Mild sedative']),
    usage: 'Most commonly used as tea.',
    dosage: '1-2 cups tea as needed',
    precautions: 'Very safe. May cause drowsiness.',
    scientificInfo: 'Nepetalactone has mild sedative effects in humans, unlike its stimulating effect on cats.',
    references: JSON.stringify([
      'Formisano C, et al. Chemical composition and antimicrobial activity of Nepeta cataria L. Nat Prod Res. 2013;27(18):1641-1645.'
    ]),
    relatedRemedies: JSON.stringify(['Chamomile', 'Lemon Balm', 'Peppermint']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Skullcap (Scutellaria lateriflora)',
    description: 'Nervine herb for anxiety, tension, and nervous system support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Baicalin', 'Scutellarin', 'Flavonoids']),
    benefits: JSON.stringify(['Anxiety relief', 'Nervous system support', 'Sleep support', 'Muscle tension']),
    usage: 'Can be used as tea, tincture, or extract.',
    dosage: '350-500 mg extract up to three times daily',
    precautions: 'May enhance sedatives. Rare liver concerns with adulterated products.',
    scientificInfo: 'Baicalin and other flavonoids modulate GABA-A receptors and have anxiolytic effects.',
    references: JSON.stringify([
      'Wolfson P, Hoffmann DL. An investigation into the efficacy of Scutellaria lateriflora in healthy volunteers. Altern Ther Health Med. 2003;9(2):74-78.'
    ]),
    relatedRemedies: JSON.stringify(['Passionflower', 'Valerian', 'Kava']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'California Poppy',
    description: 'Non-addictive sedative herb for sleep and anxiety support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Californidine', 'Eschscholtzine', 'Isoquinoline alkaloids']),
    benefits: JSON.stringify(['Sleep support', 'Anxiety relief', 'Pain relief', 'Relaxation']),
    usage: 'Use as tea or tincture. Often combined with other sedative herbs.',
    dosage: '300-600 mg extract at bedtime',
    precautions: 'May enhance sedatives. Avoid with MAOIs.',
    scientificInfo: 'Contains mild sedative alkaloids that act on GABA and opioid receptors without addictive properties.',
    references: JSON.stringify([
      'Hanus M, et al. Double-blind, randomised, placebo-controlled study to evaluate the efficacy of a fixed combination containing Eschscholtzia californica. Curr Med Res Opin. 2004;20(1):63-71.'
    ]),
    relatedRemedies: JSON.stringify(['Valerian', 'Passionflower', 'Hops']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Wild Lettuce',
    description: 'Traditional mild sedative and pain-relieving herb.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Lactucin', 'Lactucopicrin', 'Sesquiterpene lactones']),
    benefits: JSON.stringify(['Sleep support', 'Mild pain relief', 'Relaxation', 'Cough relief']),
    usage: 'Use as tincture or dried herb tea.',
    dosage: '30-120 mg dried latex or equivalent',
    precautions: 'Use reliable sources. Large doses may cause adverse effects.',
    scientificInfo: 'Contains compounds with mild sedative and analgesic effects, traditionally called "lettuce opium."',
    references: JSON.stringify([
      'Wesolowska A, et al. Analgesic and sedative activities of lactucin and some lactucin-like guaianolides. J Ethnopharmacol. 2006;107(2):254-258.'
    ]),
    relatedRemedies: JSON.stringify(['California Poppy', 'Valerian', 'Corydalis']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Corydalis',
    description: 'TCM herb for pain relief with alkaloids that affect dopamine receptors.',
    category: 'Herbal',
    ingredients: JSON.stringify(['DHCB', 'Tetrahydropalmatine', 'Alkaloids']),
    benefits: JSON.stringify(['Pain relief', 'Menstrual pain', 'Sleep support', 'Anxiety relief']),
    usage: 'Use in formulas or as standardized extract.',
    dosage: '100-300 mg extract as needed',
    precautions: 'May cause sedation. Avoid with CNS depressants. Not for long-term use.',
    scientificInfo: 'Dehydrocorybulbine (DHCB) has analgesic effects through dopamine receptor modulation without opioid action.',
    references: JSON.stringify([
      'Zhang Y, et al. Analgesic effect of DHCB, a plant alkaloid, in experimental pain models. Curr Biol. 2014;24(2):117-123.'
    ]),
    relatedRemedies: JSON.stringify(['White Willow Bark', 'Turmeric', 'Boswellia']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Blue Vervain',
    description: 'Nervine herb for stress, tension headaches, and digestive support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Verbenalin', 'Verbascoside', 'Iridoids']),
    benefits: JSON.stringify(['Stress relief', 'Tension headaches', 'Digestive support', 'Nervous exhaustion']),
    usage: 'Use as tea or tincture.',
    dosage: '1-2 g dried herb as tea three times daily',
    precautions: 'May stimulate uterine contractions. Avoid during pregnancy.',
    scientificInfo: 'Iridoid glycosides have calming effects on the nervous system and support digestion.',
    references: JSON.stringify([
      'Khan AW, et al. Pharmacological review of Verbena officinalis. Pak J Pharm Res. 2016;2(1):55-61.'
    ]),
    relatedRemedies: JSON.stringify(['Lemon Balm', 'Skullcap', 'Chamomile']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Wood Betony',
    description: 'Traditional European herb for headaches and nervous tension.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Betonicine', 'Stachydrine', 'Tannins']),
    benefits: JSON.stringify(['Headache relief', 'Nervous tension', 'Digestive support', 'Memory support']),
    usage: 'Use as tea or tincture.',
    dosage: '1-2 g dried herb as tea three times daily',
    precautions: 'Avoid during pregnancy. May lower blood pressure.',
    scientificInfo: 'Wood betony has been used for centuries for nervous conditions and headaches.',
    references: JSON.stringify([
      'Grieve M. A Modern Herbal. Dover Publications. 1971.'
    ]),
    relatedRemedies: JSON.stringify(['Feverfew', 'Skullcap', 'Valerian']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Goldenseal',
    description: 'Antimicrobial herb for infections and digestive health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Berberine', 'Hydrastine', 'Canadine']),
    benefits: JSON.stringify(['Antimicrobial', 'Digestive support', 'Immune support', 'Mucosal health']),
    usage: 'Short-term use only (2-3 weeks). Take with food.',
    dosage: '250-500 mg extract three times daily short-term',
    precautions: 'Not for long-term use. Endangered - choose cultivated sources. Avoid during pregnancy.',
    scientificInfo: 'Contains berberine with antimicrobial and metabolic effects. Hydrastine supports mucosal membranes.',
    references: JSON.stringify([
      'Cech NB, et al. Quorum quenching and antimicrobial activity of goldenseal. Planta Med. 2012;78(14):1556-1561.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Oregon Grape', 'Echinacea']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Oregon Grape Root',
    description: 'Berberine-containing herb for skin conditions and digestive support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Berberine', 'Berbamine', 'Oxyacanthine']),
    benefits: JSON.stringify(['Skin health', 'Psoriasis support', 'Digestive health', 'Liver support']),
    usage: 'Use internally or topically for skin conditions.',
    dosage: '250-500 mg extract three times daily',
    precautions: 'Similar cautions to berberine. Avoid during pregnancy.',
    scientificInfo: 'Berberine and other alkaloids have anti-inflammatory and antimicrobial effects beneficial for skin.',
    references: JSON.stringify([
      'Gulliver WP, Donsky HJ. A report on three recent clinical trials using Mahonia aquifolium 10% topical cream for psoriasis. Am J Ther. 2005;12(5):398-406.'
    ]),
    relatedRemedies: JSON.stringify(['Berberine', 'Goldenseal', 'Milk Thistle']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Yarrow',
    description: 'Versatile herb for bleeding, fever, and digestive support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Achillein', 'Azulene', 'Flavonoids', 'Tannins']),
    benefits: JSON.stringify(['Wound healing', 'Fever support', 'Digestive aid', 'Menstrual support']),
    usage: 'Use as tea, tincture, or topically for wounds.',
    dosage: '1-4 g dried herb as tea three times daily',
    precautions: 'Avoid during pregnancy. May cause allergic reactions in those sensitive to Asteraceae.',
    scientificInfo: 'Yarrow has hemostatic, anti-inflammatory, and antimicrobial properties. Named after Achilles.',
    references: JSON.stringify([
      'Benedek B, et al. Achillea millefolium L. revisited: recent findings confirm the traditional use. Wien Med Wochenschr. 2007;157(13-14):312-314.'
    ]),
    relatedRemedies: JSON.stringify(['Calendula', 'Plantain', 'Chamomile']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Calendula (Marigold)',
    description: 'Skin-healing herb for wounds, inflammation, and digestive support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Triterpenoids', 'Flavonoids', 'Carotenoids']),
    benefits: JSON.stringify(['Wound healing', 'Skin health', 'Anti-inflammatory', 'Digestive support']),
    usage: 'Topical for skin. Internal use as tea for digestive support.',
    dosage: 'Topical as needed; 1-2 g dried flowers as tea',
    precautions: 'May cause allergic reactions in those sensitive to Asteraceae. Avoid internal use during pregnancy.',
    scientificInfo: 'Triterpenoids promote wound healing by stimulating epithelialization and angiogenesis.',
    references: JSON.stringify([
      'Leach MJ. Calendula officinalis and wound healing: a systematic review. Wounds. 2008;20(8):236-243.'
    ]),
    relatedRemedies: JSON.stringify(['Comfrey', 'Plantain', 'Aloe Vera']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Plantain (Plantago major)',
    description: 'Common weed with wound healing and respiratory support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Aucubin', 'Mucilage', 'Tannins', 'Flavonoids']),
    benefits: JSON.stringify(['Wound healing', 'Skin soothing', 'Respiratory support', 'Digestive comfort']),
    usage: 'Fresh leaves applied topically. Tea or tincture for internal use.',
    dosage: 'Fresh poultice as needed; 3-5 g dried herb as tea',
    precautions: 'Generally very safe. Not the same as cooking plantain.',
    scientificInfo: 'Aucubin has anti-inflammatory and antimicrobial effects. Mucilage soothes irritated tissues.',
    references: JSON.stringify([
      'Samuelsen AB. The traditional uses, chemical constituents and biological activities of Plantago major L. J Ethnopharmacol. 2000;71(1-2):1-21.'
    ]),
    relatedRemedies: JSON.stringify(['Calendula', 'Comfrey', 'Aloe Vera']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Cleavers (Galium aparine)',
    description: 'Lymphatic-supporting herb for detoxification and skin health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Iridoids', 'Flavonoids', 'Tannins', 'Organic acids']),
    benefits: JSON.stringify(['Lymphatic support', 'Skin health', 'Urinary health', 'Detoxification']),
    usage: 'Fresh juice is traditional. Also used as tea or tincture.',
    dosage: '2-4 g dried herb as tea three times daily',
    precautions: 'Very safe. May have mild diuretic effect.',
    scientificInfo: 'Cleavers supports lymphatic drainage and has mild diuretic properties.',
    references: JSON.stringify([
      'Wichtl M. Herbal Drugs and Phytopharmaceuticals. CRC Press. 2004.'
    ]),
    relatedRemedies: JSON.stringify(['Red Clover', 'Burdock', 'Dandelion']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Yellow Dock',
    description: 'Bitter herb for iron absorption and digestive support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Anthraquinones', 'Tannins', 'Oxalates', 'Iron']),
    benefits: JSON.stringify(['Iron absorption', 'Digestive support', 'Skin health', 'Liver support']),
    usage: 'Use as tea or tincture. Often in iron formulas.',
    dosage: '2-4 g dried root as tea',
    precautions: 'High oxalate content - caution with kidney stones. May cause loose stools.',
    scientificInfo: 'Yellow dock enhances iron absorption and has gentle bitter digestive properties.',
    references: JSON.stringify([
      'Newall CA, et al. Herbal Medicines: A Guide for Health-Care Professionals. Pharmaceutical Press. 1996.'
    ]),
    relatedRemedies: JSON.stringify(['Nettle', 'Dandelion', 'Burdock']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Mullein',
    description: 'Respiratory herb for coughs, congestion, and ear health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Saponins', 'Mucilage', 'Iridoids', 'Flavonoids']),
    benefits: JSON.stringify(['Respiratory support', 'Cough relief', 'Ear health', 'Soothing expectorant']),
    usage: 'Tea from leaves. Oil infusion for ear drops.',
    dosage: '3-4 g dried leaves as tea; mullein ear oil as directed',
    precautions: 'Strain tea well to remove irritating hairs. Use ear oil only with intact eardrum.',
    scientificInfo: 'Saponins have expectorant effects while mucilage soothes irritated respiratory tissue.',
    references: JSON.stringify([
      'Turker AU, Camper ND. Biological activity of common mullein, a medicinal plant. J Ethnopharmacol. 2002;82(2-3):117-125.'
    ]),
    relatedRemedies: JSON.stringify(['Marshmallow', 'Elecampane', 'Licorice']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Elecampane',
    description: 'Expectorant herb for deep respiratory conditions.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Inulin', 'Alantolactone', 'Helenin']),
    benefits: JSON.stringify(['Respiratory support', 'Expectorant', 'Digestive aid', 'Antimicrobial']),
    usage: 'Use as decoction or tincture for respiratory conditions.',
    dosage: '1-2 g dried root as decoction three times daily',
    precautions: 'May cause allergic reactions in those sensitive to Asteraceae.',
    scientificInfo: 'Sesquiterpene lactones have expectorant and antimicrobial properties for respiratory infections.',
    references: JSON.stringify([
      'Seca AM, et al. The genus Inula and their metabolites: from ethnopharmacological to medicinal uses. J Ethnopharmacol. 2014;154(2):286-310.'
    ]),
    relatedRemedies: JSON.stringify(['Mullein', 'Thyme', 'Eucalyptus']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Thyme',
    description: 'Culinary herb with powerful antimicrobial and respiratory benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Thymol', 'Carvacrol', 'Flavonoids']),
    benefits: JSON.stringify(['Respiratory health', 'Antimicrobial', 'Cough relief', 'Digestive support']),
    usage: 'Use as tea, culinary herb, or extract.',
    dosage: '1-4 g dried herb as tea; thyme syrup for cough',
    precautions: 'Generally very safe. Essential oil should be diluted.',
    scientificInfo: 'Thymol has broad-spectrum antimicrobial activity and supports respiratory function.',
    references: JSON.stringify([
      'Kemmerich B, et al. Efficacy and tolerability of a fluid extract combination of thyme herb and ivy leaves. Drug Res. 2006;56(12):652-660.'
    ]),
    relatedRemedies: JSON.stringify(['Oregano', 'Eucalyptus', 'Mullein']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Eucalyptus',
    description: 'Aromatic leaf for respiratory support and mental clarity.',
    category: 'Herbal',
    ingredients: JSON.stringify(['1,8-cineole', 'Eucalyptol', 'Flavonoids']),
    benefits: JSON.stringify(['Respiratory support', 'Decongestant', 'Mental clarity', 'Antimicrobial']),
    usage: 'Use as steam inhalation, chest rub, or internal preparation.',
    dosage: 'Steam inhalation as needed; 200-600 mg cineole-standardized extract',
    precautions: 'Do not apply to face of young children. Internal use of essential oil requires proper formulation.',
    scientificInfo: '1,8-cineole has mucolytic, bronchodilator, and anti-inflammatory effects.',
    references: JSON.stringify([
      'Worth H, et al. Concomitant therapy with Cineole (Eucalyptole) reduces exacerbations in COPD. Respir Res. 2009;10:69.'
    ]),
    relatedRemedies: JSON.stringify(['Peppermint', 'Thyme', 'Tea Tree']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Tea Tree Oil',
    description: 'Potent antimicrobial essential oil for skin and oral health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Terpinen-4-ol', 'Cineole', 'Alpha-terpineol']),
    benefits: JSON.stringify(['Antimicrobial', 'Acne treatment', 'Wound care', 'Oral health']),
    usage: 'Topical use only. Dilute before applying to skin.',
    dosage: '5-15% dilution for topical use',
    precautions: 'Not for internal use. May cause skin irritation. Test on small area first.',
    scientificInfo: 'Terpinen-4-ol provides broad-spectrum antimicrobial activity against bacteria, fungi, and viruses.',
    references: JSON.stringify([
      'Carson CF, et al. Melaleuca alternifolia (Tea Tree) oil: a review of antimicrobial properties. Clin Microbiol Rev. 2006;19(1):50-62.'
    ]),
    relatedRemedies: JSON.stringify(['Oregano Oil', 'Manuka Honey', 'Coconut Oil']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Rosemary',
    description: 'Aromatic herb for memory, circulation, and hair growth.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Carnosic acid', 'Rosmarinic acid', '1,8-cineole']),
    benefits: JSON.stringify(['Memory support', 'Circulation', 'Hair growth', 'Antioxidant']),
    usage: 'Use as culinary herb, tea, extract, or essential oil.',
    dosage: '4-6 g dried herb as tea; topical oil for hair',
    precautions: 'May interact with blood thinners. Avoid high doses during pregnancy.',
    scientificInfo: 'Carnosic acid is a potent antioxidant. Rosemary oil may promote hair growth comparable to minoxidil.',
    references: JSON.stringify([
      'Panahi Y, et al. Rosemary oil vs minoxidil 2% for the treatment of androgenetic alopecia. Skinmed. 2015;13(1):15-21.'
    ]),
    relatedRemedies: JSON.stringify(['Sage', 'Ginkgo', 'Peppermint']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Sage (Salvia officinalis)',
    description: 'Culinary herb for memory, hot flashes, and oral health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Rosmarinic acid', 'Carnosic acid', 'Thujone']),
    benefits: JSON.stringify(['Memory support', 'Hot flash relief', 'Oral health', 'Sore throat relief']),
    usage: 'Use as tea, culinary herb, or extract.',
    dosage: '300-600 mg extract daily; tea as gargle for throat',
    precautions: 'High doses long-term due to thujone. Avoid during pregnancy.',
    scientificInfo: 'Sage inhibits acetylcholinesterase, supporting memory. Also has estrogenic effects for hot flashes.',
    references: JSON.stringify([
      'Scholey AB, et al. An extract of Salvia enhances memory in healthy older adults. Psychopharmacology. 2008;198(1):127-139.'
    ]),
    relatedRemedies: JSON.stringify(['Rosemary', 'Ginkgo', 'Bacopa']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Cranberry',
    description: 'Berry for urinary tract health and antioxidant support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Proanthocyanidins', 'A-type PACs', 'Organic acids']),
    benefits: JSON.stringify(['UTI prevention', 'Urinary health', 'Antioxidant', 'Cardiovascular support']),
    usage: 'Use unsweetened juice or standardized extract.',
    dosage: '500-1500 mg extract or 240-300 mL juice daily',
    precautions: 'May interact with warfarin. High oxalate content.',
    scientificInfo: 'A-type proanthocyanidins prevent E. coli adhesion to urinary tract walls.',
    references: JSON.stringify([
      'Jepson RG, et al. Cranberries for preventing urinary tract infections. Cochrane Database Syst Rev. 2012;10:CD001321.'
    ]),
    relatedRemedies: JSON.stringify(['D-Mannose', 'Uva Ursi', 'Hibiscus']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Uva Ursi (Bearberry)',
    description: 'Urinary antiseptic herb for acute UTI support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Arbutin', 'Hydroquinone glucosides', 'Tannins']),
    benefits: JSON.stringify(['UTI support', 'Urinary antiseptic']),
    usage: 'Short-term use only (1-2 weeks). Works best in alkaline urine.',
    dosage: '400-800 mg arbutin-standardized extract daily short-term',
    precautions: 'Not for long-term use. Requires alkaline urine for activation. Not during pregnancy.',
    scientificInfo: 'Arbutin is converted to hydroquinone in alkaline urine, providing antimicrobial activity.',
    references: JSON.stringify([
      'Larsson B, et al. Prophylactic effect of UVA-E in women with recurrent cystitis. Curr Ther Res. 1993;53:441-443.'
    ]),
    relatedRemedies: JSON.stringify(['Cranberry', 'D-Mannose', 'Juniper']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'D-Mannose',
    description: 'Natural sugar that prevents bacteria from adhering to urinary tract.',
    category: 'Specialty Nutrient',
    ingredients: JSON.stringify(['D-Mannose']),
    benefits: JSON.stringify(['UTI prevention', 'UTI treatment support', 'Urinary health']),
    usage: 'Dissolve in water. Take preventively or at first sign of UTI.',
    dosage: '500 mg two times daily preventively; 500 mg every 2-3 hours acutely',
    precautions: 'May cause loose stools. Monitor blood sugar if diabetic.',
    scientificInfo: 'D-mannose binds to E. coli fimbriae, preventing bacterial adhesion to urinary tract epithelium.',
    references: JSON.stringify([
      'Kranjcec B, et al. D-mannose powder for prophylaxis of recurrent urinary tract infections. World J Urol. 2014;32(1):79-84.'
    ]),
    relatedRemedies: JSON.stringify(['Cranberry', 'Uva Ursi', 'Probiotics']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Black Seed (Nigella sativa)',
    description: 'Blessed seed with broad therapeutic properties from Middle Eastern tradition.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Thymoquinone', 'Thymohydroquinone', 'Nigelline']),
    benefits: JSON.stringify(['Immune support', 'Anti-inflammatory', 'Blood sugar support', 'Respiratory health', 'Antioxidant']),
    usage: 'Use oil or ground seeds. Often taken with honey.',
    dosage: '1-3 g seeds or 1-2 teaspoons oil daily',
    precautions: 'May enhance effects of blood sugar and blood pressure medications.',
    scientificInfo: 'Thymoquinone has potent anti-inflammatory and antioxidant effects. Traditional use for almost everything.',
    references: JSON.stringify([
      'Ahmad A, et al. A review on therapeutic potential of Nigella sativa: A miracle herb. Asian Pac J Trop Biomed. 2013;3(5):337-352.'
    ]),
    relatedRemedies: JSON.stringify(['Turmeric', 'Oregano', 'Garlic']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Moringa',
    description: 'Nutrient-dense tree leaf with broad health benefits.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Isothiocyanates', 'Quercetin', 'Chlorogenic acid', 'Protein']),
    benefits: JSON.stringify(['Nutritional support', 'Blood sugar support', 'Anti-inflammatory', 'Antioxidant']),
    usage: 'Use leaf powder in food or as supplement.',
    dosage: '1-3 g leaf powder daily',
    precautions: 'May lower blood sugar. Avoid root and bark during pregnancy.',
    scientificInfo: 'Moringa is exceptionally nutrient-dense with protein, vitamins, minerals, and beneficial plant compounds.',
    references: JSON.stringify([
      'Stohs SJ, Hartman MJ. Review of the Safety and Efficacy of Moringa oleifera. Phytother Res. 2015;29(6):796-804.'
    ]),
    relatedRemedies: JSON.stringify(['Spirulina', 'Chlorella', 'Wheatgrass']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Neem',
    description: 'Ayurvedic bitter herb for skin, blood sugar, and oral health.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Azadirachtin', 'Nimbin', 'Nimbidin']),
    benefits: JSON.stringify(['Skin health', 'Blood sugar support', 'Oral health', 'Immune support']),
    usage: 'Use as extract internally or oil/paste topically.',
    dosage: '250-500 mg extract daily',
    precautions: 'Not for use during pregnancy or when trying to conceive.',
    scientificInfo: 'Neem has broad antimicrobial and anti-inflammatory properties. Used for dental care in traditional practice.',
    references: JSON.stringify([
      'Subapriya R, Nagini S. Medicinal properties of neem leaves: a review. Curr Med Chem Anticancer Agents. 2005;5(2):149-156.'
    ]),
    relatedRemedies: JSON.stringify(['Turmeric', 'Triphala', 'Aloe Vera']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Spearmint',
    description: 'Gentle mint for digestive comfort and hormone balance in women.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Carvone', 'Limonene', 'Rosmarinic acid']),
    benefits: JSON.stringify(['Digestive comfort', 'Androgen reduction', 'PCOS support', 'Refreshing']),
    usage: 'Drink as tea. 2 cups daily for hormonal effects.',
    dosage: '1-2 cups tea twice daily',
    precautions: 'May reduce androgens - use cautiously in men.',
    scientificInfo: 'Spearmint tea has anti-androgenic effects and may help reduce excess hair growth in women with PCOS.',
    references: JSON.stringify([
      'Grant P. Spearmint herbal tea has significant anti-androgen effects in polycystic ovarian syndrome. Phytother Res. 2010;24(2):186-188.'
    ]),
    relatedRemedies: JSON.stringify(['Peppermint', 'Vitex', 'Saw Palmetto']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Fennel',
    description: 'Digestive herb for bloating, colic, and breastfeeding support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Anethole', 'Fenchone', 'Flavonoids']),
    benefits: JSON.stringify(['Digestive comfort', 'Bloating relief', 'Lactation support', 'Colic relief']),
    usage: 'Use seeds as tea or chew after meals.',
    dosage: '1-2 teaspoons crushed seeds as tea',
    precautions: 'Has mild estrogenic effects. Avoid in estrogen-sensitive conditions.',
    scientificInfo: 'Anethole has carminative effects and mild estrogenic activity supporting lactation.',
    references: JSON.stringify([
      'Alexandrovich I, et al. The effect of fennel seed oil emulsion in infantile colic. Altern Ther Health Med. 2003;9(4):58-61.'
    ]),
    relatedRemedies: JSON.stringify(['Caraway', 'Peppermint', 'Ginger']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Caraway',
    description: 'Digestive seed for bloating and intestinal spasms.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Carvone', 'Limonene', 'Carveol']),
    benefits: JSON.stringify(['Digestive comfort', 'Bloating relief', 'IBS support', 'Carminative']),
    usage: 'Chew seeds after meals or use as tea.',
    dosage: '1-2 teaspoons seeds as tea; often combined with peppermint',
    precautions: 'Generally very safe.',
    scientificInfo: 'Carvone has spasmolytic effects on intestinal smooth muscle.',
    references: JSON.stringify([
      'Madisch A, et al. Treatment of functional dyspepsia with a fixed peppermint oil and caraway oil combination preparation. Arzneim Forsch Drug Res. 1999;49(11):925-932.'
    ]),
    relatedRemedies: JSON.stringify(['Fennel', 'Peppermint', 'Ginger']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Fringetree',
    description: 'Liver and gallbladder supportive herb from Native American tradition.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Saponins', 'Phyllirin', 'Lignans']),
    benefits: JSON.stringify(['Liver support', 'Gallbladder support', 'Digestive stimulant']),
    usage: 'Use as tincture or decoction.',
    dosage: '0.5-2 mL tincture three times daily',
    precautions: 'May stimulate bile flow. Use caution with gallstones.',
    scientificInfo: 'Traditionally used to support liver and gallbladder function and stimulate digestion.',
    references: JSON.stringify([
      'Hoffmann D. Medical Herbalism: The Science and Practice of Herbal Medicine. Healing Arts Press. 2003.'
    ]),
    relatedRemedies: JSON.stringify(['Dandelion', 'Milk Thistle', 'Artichoke']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Gentian Root',
    description: 'Intensely bitter herb for digestive stimulation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Gentiopicrin', 'Amarogentin', 'Gentianine']),
    benefits: JSON.stringify(['Digestive stimulant', 'Appetite support', 'Bile flow', 'Enzyme secretion']),
    usage: 'Use small amount of tincture before meals.',
    dosage: '1-3 mL tincture 15-30 minutes before meals',
    precautions: 'Avoid with gastric ulcers or GERD. Do not use during pregnancy.',
    scientificInfo: 'Bitter compounds stimulate digestive secretions through bitter taste receptors in the gut.',
    references: JSON.stringify([
      'McMullen MK, et al. Bitters: Time for a New Paradigm. Evid Based Complement Alternat Med. 2015;2015:670504.'
    ]),
    relatedRemedies: JSON.stringify(['Artichoke', 'Dandelion', 'Swedish Bitters']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Agrimony',
    description: 'Gentle astringent herb for digestive and urinary support.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Tannins', 'Flavonoids', 'Triterpenes']),
    benefits: JSON.stringify(['Digestive comfort', 'Diarrhea support', 'Wound healing', 'Urinary health']),
    usage: 'Use as tea or tincture.',
    dosage: '2-4 g dried herb as tea three times daily',
    precautions: 'Generally very safe.',
    scientificInfo: 'Tannins provide astringent effects useful for diarrhea and wound healing.',
    references: JSON.stringify([
      'Newall CA, et al. Herbal Medicines: A Guide for Health-Care Professionals. Pharmaceutical Press. 1996.'
    ]),
    relatedRemedies: JSON.stringify(['Plantain', 'Blackberry Leaf', 'Raspberry Leaf']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Eyebright',
    description: 'Traditional herb for eye health and hay fever.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Aucubin', 'Tannins', 'Flavonoids']),
    benefits: JSON.stringify(['Eye health', 'Hay fever support', 'Conjunctivitis support']),
    usage: 'Use as tea or supplement. Eyewashes require sterile preparation.',
    dosage: '2-4 g dried herb as tea',
    precautions: 'Do not use non-sterile preparations in eyes.',
    scientificInfo: 'Anti-inflammatory and astringent properties may support eye and upper respiratory health.',
    references: JSON.stringify([
      'Paduch R, et al. Assessment of eyebright (Euphrasia officinalis L.) extract activity. Int J Mol Med. 2014;34(5):1339-1345.'
    ]),
    relatedRemedies: JSON.stringify(['Bilberry', 'Quercetin', 'Lutein']),
    evidenceLevel: 'Traditional'
  },
  {
    name: 'Bilberry',
    description: 'European blueberry cousin for eye health and circulation.',
    category: 'Herbal',
    ingredients: JSON.stringify(['Anthocyanosides', 'Anthocyanins', 'Phenolic acids']),
    benefits: JSON.stringify(['Eye health', 'Night vision', 'Circulation', 'Blood vessel health']),
    usage: 'Use standardized extract.',
    dosage: '80-160 mg extract standardized to 25% anthocyanosides twice daily',
    precautions: 'May enhance blood thinners.',
    scientificInfo: 'Anthocyanosides support rhodopsin regeneration and capillary integrity.',
    references: JSON.stringify([
      'Canter PH, Ernst E. Anthocyanosides of Vaccinium myrtillus for night vision. Surv Ophthalmol. 2004;49(1):38-50.'
    ]),
    relatedRemedies: JSON.stringify(['Lutein', 'Zeaxanthin', 'Blueberries']),
    evidenceLevel: 'Moderate'
  }
]
