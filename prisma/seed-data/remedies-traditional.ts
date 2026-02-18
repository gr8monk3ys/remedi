// Traditional and Folk Medicine Remedies
export const traditionalRemedies = [
  {
    name: "Apple Cider Vinegar (Raw)",
    description:
      'Fermented apple cider with the "mother" intact, used traditionally for digestion and metabolism.',
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Acetic acid",
      "Malic acid",
      "Probiotics (mother)",
      "Enzymes",
      "Minerals",
    ]),
    benefits: JSON.stringify([
      "Blood sugar support",
      "Digestive aid",
      "Weight management",
      "Antimicrobial effects",
      "Skin health",
    ]),
    usage: "Dilute 1-2 tablespoons in water before meals.",
    dosage: "1-2 tablespoons diluted in water, 1-3x daily",
    precautions:
      "Always dilute. May erode tooth enamel. May lower potassium. Monitor blood sugar.",
    scientificInfo:
      "Some studies show modest blood sugar and weight management effects.",
    references: JSON.stringify([
      "Diabetes Care 2004",
      "Journal of Functional Foods 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Fermented Foods",
      "Lemon Water",
      "Digestive Bitters",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Honey (Raw Manuka)",
    description:
      "Medicinal honey from New Zealand with unique antibacterial compound methylglyoxal (MGO).",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Methylglyoxal (MGO)",
      "Hydrogen peroxide",
      "Bee defensin-1",
      "Enzymes",
      "Prebiotics",
    ]),
    benefits: JSON.stringify([
      "Wound healing",
      "Antibacterial effects",
      "Digestive health",
      "Sore throat relief",
      "Skin healing",
    ]),
    usage: "Take 1-2 teaspoons daily or apply topically to wounds.",
    dosage: "1-2 teaspoons daily; topical as needed",
    precautions:
      "Not for infants under 1 year. Diabetics monitor blood sugar. Check UMF/MGO rating.",
    scientificInfo:
      "FDA-approved for wound healing. MGO provides non-peroxide antibacterial activity.",
    references: JSON.stringify([
      "Frontiers in Microbiology 2016",
      "Journal of Clinical Nursing 2018",
    ]),
    relatedRemedies: JSON.stringify(["Propolis", "Royal Jelly", "Bee Pollen"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Colloidal Silver",
    description:
      "Suspension of silver particles in water with antimicrobial properties, used traditionally for infections.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Silver nanoparticles", "Purified water"]),
    benefits: JSON.stringify([
      "Antimicrobial effects",
      "Wound care",
      "Immune support",
      "Water purification",
    ]),
    usage:
      "Topical application or per product directions. Internal use controversial.",
    dosage: "Topical as needed; internal use varies by product",
    precautions:
      "Internal use can cause argyria (permanent skin discoloration). Not FDA-approved for internal use.",
    scientificInfo:
      "Antimicrobial effects documented topically; internal use safety concerns.",
    references: JSON.stringify([
      "Nanomedicine 2017",
      "International Journal of Nanomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Oregano Oil",
      "Tea Tree Oil",
      "Hydrogen Peroxide",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Activated Charcoal",
    description:
      "Highly porous carbon used for toxin binding and digestive cleansing.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Activated carbon",
      "from coconut shells, wood, or bamboo",
    ]),
    benefits: JSON.stringify([
      "Toxin binding",
      "Gas and bloating relief",
      "Teeth whitening",
      "Hangover support",
      "Water filtration",
    ]),
    usage:
      "Take 500-1000mg as needed for digestive issues, away from medications.",
    dosage:
      "500-1000mg as needed, 2 hours away from other supplements/medications",
    precautions:
      "Absorbs medications and nutrients. Take separately. May cause constipation.",
    scientificInfo:
      "Medical use for poisoning; limited evidence for general detox claims.",
    references: JSON.stringify([
      "Clinical Toxicology 2017",
      "Journal of Emergency Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Bentonite Clay",
      "Chlorella",
      "Psyllium",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Bentonite Clay",
    description: "Absorbent clay used for detoxification and skin health.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Montmorillonite clay",
      "Silica",
      "Magnesium",
      "Calcium",
      "Trace minerals",
    ]),
    benefits: JSON.stringify([
      "Toxin binding",
      "Skin health",
      "Digestive cleansing",
      "Heavy metal binding",
      "Oral health",
    ]),
    usage: "Mix 1 teaspoon in water for internal use or apply as face mask.",
    dosage: "1 teaspoon in water internally; topical as needed",
    precautions:
      "May contain lead. Use food-grade only. Take away from medications.",
    scientificInfo:
      "Absorptive properties documented; limited human research for health claims.",
    references: JSON.stringify([
      "Iranian Journal of Public Health 2017",
      "Applied Clay Science 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Activated Charcoal",
      "Diatomaceous Earth",
      "Zeolite",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Diatomaceous Earth (Food Grade)",
    description:
      "Silica-rich powder from fossilized algae, used for detoxification and mineral supplementation.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Amorphous silica",
      "Trace minerals",
      "from fossilized diatoms",
    ]),
    benefits: JSON.stringify([
      "Silica supplementation",
      "Digestive cleansing",
      "Hair and nail health",
      "Cholesterol support",
      "Parasite cleansing",
    ]),
    usage: "Mix 1 teaspoon to 1 tablespoon in water daily.",
    dosage: "1 teaspoon to 1 tablespoon daily",
    precautions:
      "Use only food-grade. Do not inhale. May cause constipation. Drink plenty of water.",
    scientificInfo:
      "Limited human research. Silica may support connective tissue.",
    references: JSON.stringify([
      "Journal of Nutrition Health and Aging 2007",
      "Alternative Medicine Review 2018",
    ]),
    relatedRemedies: JSON.stringify(["Silica", "Bentonite Clay", "Horsetail"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Oil Pulling (Sesame/Coconut)",
    description:
      "Ancient Ayurvedic practice of swishing oil in mouth for oral and systemic health.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Sesame oil or Coconut oil"]),
    benefits: JSON.stringify([
      "Oral health",
      "Teeth whitening",
      "Gum health",
      "Breath freshening",
      "Detoxification",
    ]),
    usage:
      "Swish 1 tablespoon oil for 15-20 minutes, then spit out. Do not swallow.",
    dosage: "15-20 minutes daily, preferably morning",
    precautions:
      "Spit into trash, not sink. Do not swallow. Not a replacement for brushing.",
    scientificInfo:
      "Some studies show reduction in oral bacteria comparable to chlorhexidine.",
    references: JSON.stringify([
      "Journal of Traditional and Complementary Medicine 2017",
      "Nigerian Medical Journal 2018",
    ]),
    relatedRemedies: JSON.stringify(["Coconut Oil", "Neem", "Clove Oil"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Castor Oil Pack",
    description:
      "Traditional remedy using castor oil-soaked flannel applied with heat for detoxification and pain relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Castor oil (Ricinus communis)",
      "Ricinoleic acid",
    ]),
    benefits: JSON.stringify([
      "Lymphatic support",
      "Pain relief",
      "Digestive support",
      "Inflammation reduction",
      "Menstrual comfort",
    ]),
    usage:
      "Soak flannel in castor oil, apply to abdomen with heat pack for 30-60 minutes.",
    dosage: "Apply for 30-60 minutes, 3-4x weekly",
    precautions:
      "Do not use during pregnancy. May stain fabric. External use only.",
    scientificInfo:
      "Ricinoleic acid has anti-inflammatory properties; limited clinical research.",
    references: JSON.stringify([
      "Complementary Therapies in Clinical Practice 2011",
      "International Journal of Naturopathic Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Epsom Salt Bath",
      "Infrared Sauna",
      "Dry Brushing",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Epsom Salt Bath",
    description:
      "Magnesium sulfate bath for muscle relaxation, detoxification, and stress relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Magnesium sulfate heptahydrate"]),
    benefits: JSON.stringify([
      "Muscle relaxation",
      "Stress relief",
      "Magnesium absorption",
      "Detoxification",
      "Sleep improvement",
    ]),
    usage: "Add 2 cups to warm bath and soak for 20-30 minutes.",
    dosage: "2 cups per bath, 2-3x weekly",
    precautions:
      "May lower blood pressure. Avoid with kidney problems. Stay hydrated.",
    scientificInfo:
      "Magnesium absorption through skin is debated; relaxation benefits documented.",
    references: JSON.stringify([
      "Magnesium Research 2017",
      "European Journal of Applied Physiology 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Magnesium",
      "Dead Sea Salt",
      "Hot Springs",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Dry Brushing",
    description:
      "Traditional practice of brushing skin with natural bristles to stimulate lymphatic system.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Natural bristle brush", "Technique"]),
    benefits: JSON.stringify([
      "Lymphatic stimulation",
      "Skin exfoliation",
      "Circulation improvement",
      "Cellulite reduction",
      "Energy boost",
    ]),
    usage: "Brush dry skin toward heart in long strokes before showering.",
    dosage: "5-10 minutes before shower, 3-7x weekly",
    precautions:
      "Avoid on broken skin, sunburn, or irritated areas. Use gentle pressure.",
    scientificInfo:
      "Limited research; benefits attributed to mechanical stimulation and exfoliation.",
    references: JSON.stringify([
      "Journal of the European Academy of Dermatology 2015",
    ]),
    relatedRemedies: JSON.stringify([
      "Lymphatic Massage",
      "Castor Oil Pack",
      "Rebounding",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Bone Broth",
    description:
      "Long-simmered broth from animal bones rich in collagen, minerals, and amino acids.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Collagen",
      "Gelatin",
      "Glycine",
      "Proline",
      "Glucosamine",
      "Minerals",
    ]),
    benefits: JSON.stringify([
      "Gut healing",
      "Joint support",
      "Skin health",
      "Immune support",
      "Amino acid nutrition",
    ]),
    usage: "Drink 1-2 cups daily as beverage or use in cooking.",
    dosage: "1-2 cups daily",
    precautions:
      "May be high in histamines. Lead concerns with some sources. Quality varies.",
    scientificInfo:
      "Contains bioavailable collagen and amino acids; limited clinical research.",
    references: JSON.stringify([
      "Food and Nutrition Research 2017",
      "Nutrients 2019",
    ]),
    relatedRemedies: JSON.stringify(["Collagen", "Gelatin", "L-Glutamine"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Ghee (Clarified Butter)",
    description:
      "Traditional Ayurvedic cooking fat with high smoke point and digestive benefits.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Clarified butterfat",
      "Butyric acid",
      "CLA",
      "Fat-soluble vitamins",
    ]),
    benefits: JSON.stringify([
      "Digestive support",
      "High heat cooking",
      "Lactose-free fat",
      "Vitamin absorption",
      "Ayurvedic medicine carrier",
    ]),
    usage: "Use for cooking or take 1-2 teaspoons daily.",
    dosage: "1-2 teaspoons daily for therapeutic use",
    precautions:
      "High in saturated fat. Use in moderation for cardiovascular concerns.",
    scientificInfo:
      "Contains butyric acid which supports gut health; traditional Ayurvedic vehicle.",
    references: JSON.stringify([
      "Journal of Ayurveda and Integrative Medicine 2016",
      "Lipids 2018",
    ]),
    relatedRemedies: JSON.stringify(["Coconut Oil", "MCT Oil", "Butter"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Sea Salt (Celtic/Himalayan)",
    description:
      "Unrefined mineral-rich salt used for hydration, electrolyte balance, and trace minerals.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Sodium chloride",
      "Magnesium",
      "Potassium",
      "Calcium",
      "Trace minerals",
    ]),
    benefits: JSON.stringify([
      "Electrolyte balance",
      "Hydration support",
      "Trace mineral supplementation",
      "Adrenal support",
      "Digestive stimulation",
    ]),
    usage:
      "Add pinch to water or food. Use sole (saturated salt water) for specific protocols.",
    dosage: "To taste in food/water; sole: 1 tsp in morning water",
    precautions:
      "Monitor if on low-sodium diet. Excess can raise blood pressure.",
    scientificInfo:
      "Provides trace minerals; mineral content varies by source.",
    references: JSON.stringify([
      "Journal of Trace Elements in Medicine and Biology 2017",
    ]),
    relatedRemedies: JSON.stringify(["Electrolytes", "Magnesium", "Potassium"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Neti Pot (Saline Irrigation)",
    description:
      "Traditional nasal irrigation technique for sinus health and allergy relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Sterile saline solution", "Neti pot device"]),
    benefits: JSON.stringify([
      "Sinus clearing",
      "Allergy relief",
      "Cold prevention",
      "Nasal moisture",
      "Mucus removal",
    ]),
    usage:
      "Use sterile water with salt solution. Tilt head and pour through nostril.",
    dosage: "Daily or as needed for sinus issues",
    precautions:
      "Use only sterile or distilled water. Clean pot regularly. Risk of rare brain infection with tap water.",
    scientificInfo:
      "Clinical evidence supports use for chronic rhinosinusitis and allergies.",
    references: JSON.stringify([
      "Cochrane Database 2016",
      "International Forum of Allergy and Rhinology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Steam Inhalation",
      "Eucalyptus Oil",
      "Xylitol Spray",
    ]),
    evidenceLevel: "Strong",
  },
  {
    name: "Steam Inhalation (Herbal)",
    description:
      "Traditional respiratory therapy using steam with optional essential oils or herbs.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Hot water",
      "Optional: eucalyptus, peppermint, thyme oils",
    ]),
    benefits: JSON.stringify([
      "Respiratory clearing",
      "Congestion relief",
      "Sinus opening",
      "Relaxation",
      "Skin moisture",
    ]),
    usage:
      "Inhale steam from bowl of hot water with towel over head for 5-10 minutes.",
    dosage: "5-10 minutes, 1-3x daily for respiratory issues",
    precautions:
      "Risk of burns. Keep safe distance from water. Not for young children.",
    scientificInfo:
      "Provides symptom relief; does not shorten duration of illness.",
    references: JSON.stringify([
      "Cochrane Database 2017",
      "Family Practice 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Neti Pot",
      "Eucalyptus Oil",
      "Hot Compress",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Gua Sha",
    description:
      "Traditional Chinese scraping technique to improve circulation and release muscle tension.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Gua sha tool (jade, rose quartz, or bian stone)",
      "Technique",
    ]),
    benefits: JSON.stringify([
      "Circulation improvement",
      "Muscle tension relief",
      "Facial rejuvenation",
      "Pain relief",
      "Inflammation reduction",
    ]),
    usage:
      "Scrape tool across skin in one direction with oil. Petechiae (red marks) may appear.",
    dosage: "Body: 15-20 minutes as needed. Face: 5-10 minutes daily",
    precautions:
      "Temporary redness/bruising normal. Avoid over broken skin or with bleeding disorders.",
    scientificInfo:
      "Studies show reduced pain and improved circulation; mechanism involves immune response.",
    references: JSON.stringify([
      "Evidence-Based Complementary and Alternative Medicine 2017",
      "Pain Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Cupping", "Acupuncture", "Massage"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Cupping Therapy",
    description:
      "Traditional Chinese therapy using suction cups to improve circulation and relieve pain.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Cupping cups (glass, silicone, or plastic)",
      "Technique",
    ]),
    benefits: JSON.stringify([
      "Pain relief",
      "Muscle relaxation",
      "Circulation improvement",
      "Detoxification",
      "Athletic recovery",
    ]),
    usage:
      "Apply suction cups to skin for 5-20 minutes. May leave circular marks.",
    dosage: "5-20 minutes per session; weekly or as needed",
    precautions:
      "Temporary bruising normal. Avoid on broken skin, varicose veins, or with bleeding disorders.",
    scientificInfo:
      "Research shows pain reduction; mechanism involves increased blood flow and immune modulation.",
    references: JSON.stringify([
      "Journal of Traditional Chinese Medicine 2017",
      "PLoS One 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Gua Sha",
      "Acupuncture",
      "Massage Therapy",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Moxibustion",
    description:
      "Traditional Chinese therapy burning mugwort near acupuncture points to warm and stimulate.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Mugwort (Artemisia vulgaris)",
      "Moxa sticks or cones",
    ]),
    benefits: JSON.stringify([
      "Pain relief",
      "Circulation warming",
      "Immune stimulation",
      "Digestive support",
      "Breech baby turning",
    ]),
    usage:
      "Burn moxa near acupuncture points. Best performed by trained practitioner.",
    dosage: "10-20 minutes per treatment; frequency varies",
    precautions:
      "Fire risk. Smoke may irritate lungs. Not over face or sensitive areas.",
    scientificInfo:
      "Cochrane review supports use for breech presentation; pain relief mechanisms studied.",
    references: JSON.stringify([
      "Cochrane Database 2012",
      "Journal of Alternative and Complementary Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Acupuncture",
      "Cupping",
      "Far Infrared Therapy",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Hot/Cold Therapy",
    description:
      "Traditional contrast therapy alternating heat and cold for circulation and recovery.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Hot water/compress", "Cold water/ice pack"]),
    benefits: JSON.stringify([
      "Circulation improvement",
      "Pain relief",
      "Inflammation reduction",
      "Athletic recovery",
      "Immune stimulation",
    ]),
    usage: "Alternate 3-5 minutes hot, 1 minute cold. End on cold. 3-5 cycles.",
    dosage: "3-5 cycles of hot/cold; daily or as needed",
    precautions:
      "Avoid with cardiovascular issues, Raynauds, or nerve damage. Start gradually.",
    scientificInfo:
      "Contrast therapy improves blood flow and lymphatic drainage.",
    references: JSON.stringify([
      "Journal of Athletic Training 2017",
      "European Journal of Applied Physiology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Cold Exposure",
      "Sauna",
      "Epsom Salt Bath",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Earthing/Grounding",
    description:
      "Practice of direct physical contact with earth for electron transfer and inflammation reduction.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Direct earth contact",
      "Grounding mats/sheets optional",
    ]),
    benefits: JSON.stringify([
      "Inflammation reduction",
      "Sleep improvement",
      "Pain relief",
      "Stress reduction",
      "Blood viscosity",
    ]),
    usage:
      "Walk barefoot on earth or use grounding mats for 30+ minutes daily.",
    dosage: "30+ minutes daily",
    precautions:
      "Be aware of ground hazards. Grounding products vary in quality.",
    scientificInfo:
      "Small studies show reduced inflammation markers and improved sleep; mechanism debated.",
    references: JSON.stringify([
      "Journal of Environmental and Public Health 2012",
      "Explore 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Forest Bathing",
      "Sunlight Exposure",
      "Nature Immersion",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Forest Bathing (Shinrin-yoku)",
    description:
      "Japanese practice of immersive time in forest environments for health benefits.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Forest environment",
      "Phytoncides (tree volatile compounds)",
    ]),
    benefits: JSON.stringify([
      "Stress reduction",
      "Immune enhancement",
      "Blood pressure reduction",
      "Mood improvement",
      "Cognitive restoration",
    ]),
    usage:
      "Spend 2+ hours in forest environment engaging all senses mindfully.",
    dosage: "2+ hours, preferably weekly",
    precautions: "Be aware of outdoor hazards. May trigger allergies in some.",
    scientificInfo:
      "Research shows reduced cortisol, blood pressure, and increased NK cell activity.",
    references: JSON.stringify([
      "Environmental Health and Preventive Medicine 2017",
      "International Journal of Environmental Research 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Earthing",
      "Sunlight Exposure",
      "Aromatherapy",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Hydrogen-Rich Water",
    description:
      "Water infused with molecular hydrogen for antioxidant and anti-inflammatory effects.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Molecular hydrogen (H2)", "Water"]),
    benefits: JSON.stringify([
      "Antioxidant effects",
      "Athletic performance",
      "Recovery enhancement",
      "Anti-inflammatory effects",
      "Metabolic support",
    ]),
    usage: "Drink 0.5-2 liters of hydrogen-rich water daily.",
    dosage: "0.5-2 liters daily",
    precautions:
      "Limited long-term research. Hydrogen dissipates quickly - drink fresh.",
    scientificInfo:
      "Over 1000 studies on molecular hydrogen; selective antioxidant with no toxicity.",
    references: JSON.stringify([
      "Molecular Hydrogen Institute Research",
      "Medical Gas Research 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Electrolyzed Water",
      "Spring Water",
      "Antioxidants",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "Baking Soda (Sodium Bicarbonate)",
    description:
      "Common household item used for alkalizing, athletic performance, and digestive relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Sodium bicarbonate"]),
    benefits: JSON.stringify([
      "Acid reflux relief",
      "Athletic performance",
      "Alkalizing effects",
      "Kidney health",
      "Urinary tract support",
    ]),
    usage:
      "Dissolve 1/4-1/2 teaspoon in water for heartburn. Athletic: 0.3g/kg.",
    dosage: "1/4-1/2 tsp for heartburn; athletic dosing specific",
    precautions:
      "High sodium content. Can cause gas and bloating. Not for regular use.",
    scientificInfo:
      "Sports performance research shows benefits; medical use for acidosis.",
    references: JSON.stringify([
      "Sports Medicine 2017",
      "Clinical Journal of the American Society of Nephrology 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Apple Cider Vinegar",
      "Digestive Enzymes",
      "Electrolytes",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Hydrogen Peroxide (Food Grade)",
    description:
      "Diluted hydrogen peroxide used traditionally for oral health and wound care.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Hydrogen peroxide (H2O2)",
      "Diluted to 3% or less for use",
    ]),
    benefits: JSON.stringify([
      "Oral health",
      "Wound cleaning",
      "Teeth whitening",
      "Antimicrobial effects",
    ]),
    usage:
      "Use diluted (1.5-3%) for mouth rinse or wound cleaning. Never drink or use internally.",
    dosage: "Topical/oral rinse only at 1.5-3% concentration",
    precautions:
      "Never use food-grade strength undiluted. Internal use dangerous. Oral use may damage enamel.",
    scientificInfo:
      "Effective antimicrobial for wound care; internal use not supported by evidence.",
    references: JSON.stringify([
      "Advances in Wound Care 2017",
      "Journal of Periodontology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Colloidal Silver",
      "Iodine",
      "Tea Tree Oil",
    ]),
    evidenceLevel: "Limited",
  },
  {
    name: "DMSO (Dimethyl Sulfoxide)",
    description:
      "Industrial solvent with penetration-enhancing properties used for pain relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Dimethyl sulfoxide", "Sulfur compound"]),
    benefits: JSON.stringify([
      "Pain relief",
      "Inflammation reduction",
      "Drug delivery enhancement",
      "Wound healing",
    ]),
    usage:
      "Apply topically to skin for pain. FDA-approved only for interstitial cystitis.",
    dosage: "Topical application as directed",
    precautions:
      "Penetrates skin - do not mix with harmful substances. Garlic-like taste/odor. FDA-limited use.",
    scientificInfo:
      "FDA-approved for bladder condition; other uses lack FDA approval despite traditional use.",
    references: JSON.stringify([
      "Annals of the New York Academy of Sciences 2017",
    ]),
    relatedRemedies: JSON.stringify(["MSM", "Magnesium Topical", "Arnica"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Lugols Iodine Solution",
    description:
      "Iodine/potassium iodide solution used for thyroid support and antimicrobial effects.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Iodine", "Potassium iodide", "Water"]),
    benefits: JSON.stringify([
      "Thyroid support",
      "Antimicrobial effects",
      "Iodine supplementation",
      "Breast health research",
    ]),
    usage:
      "Take 1-6 drops in water for iodine supplementation. Dosing controversial.",
    dosage: "1-6 drops (150-1000mcg iodine); higher doses controversial",
    precautions:
      "Can cause thyroid problems. Start low. Monitor thyroid. Not for everyone.",
    scientificInfo:
      "Iodine essential for thyroid; optimal supplementation levels debated.",
    references: JSON.stringify([
      "Thyroid 2017",
      "Journal of Clinical Endocrinology 2019",
    ]),
    relatedRemedies: JSON.stringify(["Kelp", "Sea Vegetables", "Selenium"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Comfrey (External)",
    description:
      "Traditional herb used topically for bruises, sprains, and wound healing.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Symphytum officinale",
      "Allantoin",
      "Rosmarinic acid",
      "Mucilage",
    ]),
    benefits: JSON.stringify([
      "Bruise healing",
      "Sprain recovery",
      "Wound healing",
      "Pain relief",
      "Bone knitting",
    ]),
    usage: "Apply cream or poultice to affected area. External use only.",
    dosage: "Topical as needed; maximum 4-6 weeks per year",
    precautions:
      "External use only. Contains pyrrolizidine alkaloids - do not ingest. Limit duration.",
    scientificInfo:
      "Clinical trials support use for bruises, sprains, and muscle pain.",
    references: JSON.stringify([
      "Phytomedicine 2017",
      "Journal of Sports Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Arnica", "DMSO", "Calendula"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Arnica (Homeopathic/Topical)",
    description:
      "Traditional remedy for bruises, muscle soreness, and trauma, used topically or homeopathically.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify(["Arnica montana", "Helenalin", "Flavonoids"]),
    benefits: JSON.stringify([
      "Bruise reduction",
      "Muscle soreness",
      "Post-surgical swelling",
      "Pain relief",
      "Trauma recovery",
    ]),
    usage:
      "Apply topical preparations to unbroken skin. Homeopathic pellets sublingually.",
    dosage: "Topical: apply 2-4x daily. Homeopathic: per product directions",
    precautions:
      "Do not apply to broken skin. Do not ingest herbal form. Ragweed allergy cross-reaction.",
    scientificInfo:
      "Topical shows modest benefits for bruising; homeopathic research mixed.",
    references: JSON.stringify([
      "British Journal of Clinical Pharmacology 2016",
      "Cochrane Database 2019",
    ]),
    relatedRemedies: JSON.stringify(["Comfrey", "Bromelain", "Calendula"]),
    evidenceLevel: "Limited",
  },
  {
    name: "Plantain Leaf (Plantago major)",
    description:
      'Common "weed" traditionally used for wound healing, insect bites, and respiratory support.',
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Plantago major",
      "Aucubin",
      "Allantoin",
      "Mucilage",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Wound healing",
      "Insect bite relief",
      "Respiratory support",
      "Digestive health",
      "Skin soothing",
    ]),
    usage:
      "Apply fresh crushed leaf to bites/stings. Drink as tea. Use as poultice.",
    dosage: "Fresh leaf topically; tea 1-3 cups daily",
    precautions: "Generally very safe. Ensure correct plant identification.",
    scientificInfo:
      "Contains wound-healing compounds; traditional uses have some research support.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Comfrey", "Calendula", "Aloe Vera"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Yarrow",
    description:
      "Traditional herb for wound healing, fever reduction, and menstrual support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Achillea millefolium",
      "Chamazulene",
      "Achilleine",
      "Flavonoids",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Wound healing",
      "Fever reduction",
      "Menstrual regulation",
      "Digestive support",
      "Blood clotting",
    ]),
    usage: "Apply poultice to wounds. Drink as tea for fever and digestion.",
    dosage: "Tea: 1-3 cups daily. Topical: as needed",
    precautions:
      "Avoid during pregnancy. May interact with blood thinners. Ragweed allergy.",
    scientificInfo:
      "Contains wound-healing and fever-reducing compounds; traditional uses documented.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Calendula", "Plantain", "Elderflower"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Mullein Leaf",
    description:
      "Traditional respiratory herb used for coughs, congestion, and ear health.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Verbascum thapsus",
      "Saponins",
      "Mucilage",
      "Flavonoids",
      "Verbascoside",
    ]),
    benefits: JSON.stringify([
      "Cough relief",
      "Respiratory support",
      "Ear infection support",
      "Sore throat relief",
      "Inflammation reduction",
    ]),
    usage:
      "Drink as tea for respiratory issues. Use mullein oil drops for ear health.",
    dosage: "Tea: 2-4 cups daily. Ear oil: as directed",
    precautions: "Strain tea well to remove fine hairs. Generally very safe.",
    scientificInfo:
      "Contains expectorant saponins and soothing mucilage; ear oil traditionally used.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Thyme",
      "Elderflower",
      "Marshmallow Root",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Red Raspberry Leaf",
    description:
      "Traditional womens tonic herb used for uterine health and pregnancy support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Rubus idaeus",
      "Fragarine",
      "Tannins",
      "Flavonoids",
      "Vitamins and minerals",
    ]),
    benefits: JSON.stringify([
      "Uterine toning",
      "Pregnancy support",
      "Menstrual comfort",
      "Labor preparation",
      "Nutrient support",
    ]),
    usage:
      "Drink as tea throughout pregnancy (after first trimester) and for menstrual support.",
    dosage: "1-3 cups tea daily; pregnancy: after first trimester",
    precautions:
      "Avoid in first trimester. May increase Braxton Hicks contractions.",
    scientificInfo:
      "Traditional use for pregnancy; limited but supportive research on labor outcomes.",
    references: JSON.stringify([
      "Journal of Midwifery and Womens Health 2001",
      "Complementary Therapies in Clinical Practice 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Nettle Leaf",
      "Chaste Tree",
      "Dong Quai",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Nettle Leaf",
    description:
      "Nutrient-rich herb used for allergies, inflammation, and mineral supplementation.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Urtica dioica",
      "Chlorophyll",
      "Silica",
      "Iron",
      "Vitamins",
      "Histamine",
    ]),
    benefits: JSON.stringify([
      "Allergy relief",
      "Mineral supplementation",
      "Inflammation reduction",
      "Prostate support",
      "Kidney health",
    ]),
    usage: "Drink as tea or take freeze-dried capsules for allergies.",
    dosage: "Tea: 2-4 cups daily. Capsules: 300-600mg freeze-dried",
    precautions:
      "May lower blood sugar and blood pressure. Fresh plant stings - cook or dry first.",
    scientificInfo:
      "Research supports use for allergies and BPH; rich in nutrients.",
    references: JSON.stringify([
      "Phytotherapy Research 2017",
      "Planta Medica 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Quercetin",
      "Butterbur",
      "Red Raspberry Leaf",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Dandelion Root",
    description:
      "Traditional bitter herb used for liver support, digestion, and as a gentle diuretic.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Taraxacum officinale",
      "Inulin",
      "Taraxacin",
      "Sesquiterpene lactones",
      "Minerals",
    ]),
    benefits: JSON.stringify([
      "Liver support",
      "Digestive stimulation",
      "Gentle diuretic",
      "Prebiotic fiber",
      "Blood sugar support",
    ]),
    usage:
      "Drink roasted root as coffee substitute or take as extract/capsule.",
    dosage: "Tea/decoction: 2-3 cups daily. Extract: as directed",
    precautions:
      "May interact with diuretics and diabetes medications. Ragweed allergy.",
    scientificInfo:
      "Contains bitter compounds for digestive stimulation; traditional liver tonic.",
    references: JSON.stringify([
      "Review of Diabetic Studies 2016",
      "Journal of Ethnopharmacology 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Milk Thistle",
      "Burdock Root",
      "Artichoke",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Burdock Root",
    description:
      "Traditional blood purifier and skin support herb with prebiotic properties.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Arctium lappa",
      "Inulin",
      "Mucilage",
      "Polyacetylenes",
      "Arctigenin",
    ]),
    benefits: JSON.stringify([
      "Skin health",
      "Blood purification",
      "Digestive support",
      "Prebiotic effects",
      "Lymphatic support",
    ]),
    usage:
      "Drink as decoction or eat as vegetable (gobo). Take as capsule or tincture.",
    dosage: "Decoction: 2-4 cups daily. Capsules: as directed",
    precautions:
      "May lower blood sugar. Avoid with ragweed allergy. Ensure correct identification.",
    scientificInfo:
      "Contains inulin prebiotic and compounds with anti-inflammatory effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Inflammopharmacology 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Dandelion Root",
      "Yellow Dock",
      "Red Clover",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Yellow Dock Root",
    description:
      "Traditional bitter herb for iron absorption, liver support, and skin conditions.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Rumex crispus",
      "Anthraquinones",
      "Tannins",
      "Iron",
      "Oxalates",
    ]),
    benefits: JSON.stringify([
      "Iron absorption",
      "Liver support",
      "Skin health",
      "Mild laxative",
      "Blood building",
    ]),
    usage:
      "Take as decoction, tincture, or capsule for iron support and skin health.",
    dosage: "Tincture: 1-2ml 3x daily. Decoction: 1-2 cups daily",
    precautions:
      "Contains oxalates - avoid with kidney stones. Mild laxative effect.",
    scientificInfo:
      "Enhances iron absorption; contains gentle laxative anthraquinones.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Burdock Root",
      "Dandelion Root",
      "Nettle",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Oatstraw",
    description:
      "Nutritive herb from oat plants used for nervous system support and mineral nourishment.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Avena sativa straw",
      "Silica",
      "Calcium",
      "Magnesium",
      "Saponins",
      "Avenanthramides",
    ]),
    benefits: JSON.stringify([
      "Nervous system support",
      "Bone health",
      "Skin health",
      "Stress resilience",
      "Cognitive support",
    ]),
    usage: "Drink as nourishing infusion (long steep) or take as tincture.",
    dosage: "Infusion: 1-4 cups daily (steep 4+ hours). Tincture: as directed",
    precautions:
      "Generally very safe. Gluten concerns - should be gluten-free but check source.",
    scientificInfo:
      "Contains nervous system-nourishing compounds and bioavailable minerals.",
    references: JSON.stringify([
      "Nutrients 2017",
      "Journal of Alternative and Complementary Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Nettle", "Skullcap", "Passionflower"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Lemon Balm",
    description:
      "Calming mint-family herb used for anxiety, sleep, and digestive comfort.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Melissa officinalis",
      "Rosmarinic acid",
      "Citronellal",
      "Eugenol",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Anxiety relief",
      "Sleep support",
      "Digestive comfort",
      "Cognitive enhancement",
      "Cold sore treatment",
    ]),
    usage: "Drink as tea, take as tincture, or apply topically for cold sores.",
    dosage: "Tea: 2-4 cups daily. Extract: 300-600mg. Topical: as needed",
    precautions:
      "May affect thyroid. Use cautiously with hypothyroidism or thyroid medications.",
    scientificInfo:
      "Research shows anxiolytic effects and antiviral activity against herpes.",
    references: JSON.stringify(["Phytomedicine 2017", "Nutrients 2019"]),
    relatedRemedies: JSON.stringify(["Passionflower", "Chamomile", "Lavender"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Catnip",
    description:
      "Calming herb from the mint family used for relaxation, sleep, and digestive support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Nepeta cataria",
      "Nepetalactone",
      "Thymol",
      "Carvacrol",
      "Citronellol",
    ]),
    benefits: JSON.stringify([
      "Relaxation",
      "Sleep support",
      "Digestive comfort",
      "Fever reduction",
      "Colic relief",
    ]),
    usage: "Drink as tea for relaxation and sleep. Safe for children.",
    dosage: "Tea: 1-3 cups daily. Safe for children at reduced doses",
    precautions:
      "Generally very safe. May cause drowsiness. Avoid during pregnancy.",
    scientificInfo:
      "Contains compounds with sedative and antispasmodic properties.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2016"]),
    relatedRemedies: JSON.stringify([
      "Chamomile",
      "Lemon Balm",
      "Passionflower",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Chickweed",
    description:
      "Common garden herb used topically for skin conditions and internally for weight support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Stellaria media",
      "Saponins",
      "Flavonoids",
      "Vitamins C and A",
      "Minerals",
    ]),
    benefits: JSON.stringify([
      "Skin soothing",
      "Itch relief",
      "Weight management",
      "Cooling effects",
      "Nutritive support",
    ]),
    usage:
      "Apply as poultice or salve for skin. Eat fresh in salads. Drink as tea.",
    dosage: "Fresh: eat liberally. Tea: 2-3 cups daily. Topical: as needed",
    precautions: "Generally very safe. Ensure correct plant identification.",
    scientificInfo:
      "Traditional uses for skin conditions; contains soothing mucilage.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2017"]),
    relatedRemedies: JSON.stringify(["Plantain", "Calendula", "Aloe Vera"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "White Willow Bark",
    description:
      "Natural source of salicin, the precursor to aspirin, used for pain and inflammation.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Salix alba",
      "Salicin",
      "Flavonoids",
      "Tannins",
      "Polyphenols",
    ]),
    benefits: JSON.stringify([
      "Pain relief",
      "Inflammation reduction",
      "Fever reduction",
      "Headache relief",
      "Back pain support",
    ]),
    usage: "Take standardized extract providing 120-240mg salicin daily.",
    dosage: "120-240mg salicin daily, in divided doses",
    precautions:
      "Aspirin-like effects. Avoid with aspirin allergy, bleeding disorders, or before surgery.",
    scientificInfo:
      "Clinical trials show effectiveness for low back pain; gentler than aspirin.",
    references: JSON.stringify([
      "Phytotherapy Research 2017",
      "Cochrane Database 2019",
    ]),
    relatedRemedies: JSON.stringify(["Boswellia", "Devils Claw", "Turmeric"]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Devils Claw",
    description:
      "African herb used for arthritis, back pain, and digestive support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Harpagophytum procumbens",
      "Harpagoside",
      "Harpagide",
      "Iridoid glycosides",
    ]),
    benefits: JSON.stringify([
      "Arthritis relief",
      "Back pain support",
      "Anti-inflammatory effects",
      "Digestive stimulation",
      "Appetite improvement",
    ]),
    usage: "Take standardized extract providing 50-100mg harpagoside daily.",
    dosage: "50-100mg harpagoside daily, or 2-4g dried root",
    precautions:
      "Avoid with peptic ulcers, gallstones, or during pregnancy. May interact with blood thinners.",
    scientificInfo:
      "Clinical trials support use for low back pain and osteoarthritis.",
    references: JSON.stringify([
      "Phytomedicine 2017",
      "Cochrane Database 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "White Willow Bark",
      "Boswellia",
      "Turmeric",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Cramp Bark",
    description:
      "Traditional antispasmodic herb used for menstrual cramps and muscle tension.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Viburnum opulus",
      "Scopoletin",
      "Viopudial",
      "Hydroquinones",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Menstrual cramp relief",
      "Muscle relaxation",
      "Uterine antispasmodic",
      "Back pain relief",
      "Pregnancy support",
    ]),
    usage:
      "Take as tincture or decoction for menstrual cramps and muscle spasms.",
    dosage: "Tincture: 2-4ml 3x daily. Decoction: 2-3 cups daily",
    precautions:
      "Generally safe. Use cautiously during pregnancy - consult practitioner.",
    scientificInfo:
      "Contains antispasmodic compounds; traditional use for uterine cramps.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Black Haw", "Ginger", "Magnesium"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Black Haw",
    description:
      "Traditional uterine tonic used for menstrual pain and preventing miscarriage.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Viburnum prunifolium",
      "Scopoletin",
      "Salicin",
      "Tannins",
      "Triterpenes",
    ]),
    benefits: JSON.stringify([
      "Menstrual cramp relief",
      "Uterine toning",
      "Pregnancy support",
      "Muscle relaxation",
      "Blood pressure support",
    ]),
    usage:
      "Take as tincture or decoction. Traditionally used during pregnancy for threatened miscarriage.",
    dosage: "Tincture: 2-4ml 3x daily. Decoction: 2-3 cups daily",
    precautions:
      "Contains salicin - similar precautions to aspirin. Pregnancy use requires practitioner guidance.",
    scientificInfo:
      "Related to cramp bark; traditional use for uterine conditions.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2017"]),
    relatedRemedies: JSON.stringify([
      "Cramp Bark",
      "Wild Yam",
      "False Unicorn",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Wild Yam",
    description:
      "Traditional herb containing diosgenin, used for hormonal support and digestive health.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Dioscorea villosa",
      "Diosgenin",
      "Saponins",
      "Tannins",
      "Starch",
    ]),
    benefits: JSON.stringify([
      "Menstrual support",
      "Digestive comfort",
      "Anti-inflammatory effects",
      "Hormonal balance",
      "Muscle relaxation",
    ]),
    usage:
      "Take as tincture, capsule, or cream for hormonal and digestive support.",
    dosage: "Tincture: 2-4ml 3x daily. Capsules: as directed",
    precautions:
      "Does not convert to progesterone in body despite claims. Hormone effects unclear.",
    scientificInfo:
      "Diosgenin is a precursor for synthetic hormones but body cannot convert it.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Climacteric 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Black Cohosh",
      "Chaste Tree",
      "Dong Quai",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Osha Root",
    description:
      "Native American respiratory herb used for coughs, colds, and high-altitude support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Ligusticum porteri",
      "Z-ligustilide",
      "Phthalides",
      "Terpenes",
      "Ferulic acid",
    ]),
    benefits: JSON.stringify([
      "Respiratory support",
      "Cough relief",
      "Altitude sickness",
      "Immune support",
      "Sore throat relief",
    ]),
    usage:
      "Chew root, drink as tea, or take tincture at onset of respiratory illness.",
    dosage:
      "Tincture: 1-2ml up to 4x daily. Tea: 1-3 cups daily during illness",
    precautions:
      "Endangered in some areas - source sustainably. Avoid during pregnancy. Not for long-term use.",
    scientificInfo:
      "Contains antiviral and respiratory-supporting compounds; traditional Native American medicine.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2017"]),
    relatedRemedies: JSON.stringify(["Elderberry", "Echinacea", "Yerba Santa"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Usnea",
    description:
      "Lichen with powerful antimicrobial properties used for respiratory and urinary infections.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Usnea species (Old Mans Beard)",
      "Usnic acid",
      "Polysaccharides",
      "Mucilage",
    ]),
    benefits: JSON.stringify([
      "Antimicrobial effects",
      "Respiratory support",
      "Urinary tract health",
      "Wound healing",
      "Strep throat",
    ]),
    usage:
      "Take as tincture for infections. Apply topically for wound healing.",
    dosage: "Tincture: 1-2ml 3x daily. Topical: as needed",
    precautions:
      "Usnic acid can be hepatotoxic in high doses. Use moderate amounts.",
    scientificInfo:
      "Usnic acid has documented antimicrobial activity against gram-positive bacteria.",
    references: JSON.stringify([
      "Antimicrobial Agents and Chemotherapy 2016",
      "Phytomedicine 2018",
    ]),
    relatedRemedies: JSON.stringify(["Oregon Grape", "Goldenseal", "Osha"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Grindelia (Gumweed)",
    description:
      "Traditional respiratory herb used for asthma, bronchitis, and poison ivy relief.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Grindelia species",
      "Diterpene acids",
      "Flavonoids",
      "Saponins",
      "Resins",
    ]),
    benefits: JSON.stringify([
      "Asthma support",
      "Bronchitis relief",
      "Poison ivy treatment",
      "Cough relief",
      "Antispasmodic effects",
    ]),
    usage:
      "Take as tincture for respiratory conditions. Apply topically for poison ivy.",
    dosage: "Tincture: 1-2ml 3x daily. Topical: as needed",
    precautions:
      "May cause GI upset in large doses. Use cautiously with heart conditions.",
    scientificInfo:
      "Traditional use for respiratory conditions; contains expectorant compounds.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2016"]),
    relatedRemedies: JSON.stringify(["Mullein", "Elecampane", "Lobelia"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Elecampane",
    description:
      "Traditional respiratory herb with antimicrobial and expectorant properties.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Inula helenium",
      "Inulin",
      "Alantolactone",
      "Isoalantolactone",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Respiratory support",
      "Cough relief",
      "Antimicrobial effects",
      "Digestive aid",
      "Prebiotic fiber",
    ]),
    usage:
      "Take as decoction, tincture, or honey infusion for respiratory conditions.",
    dosage: "Decoction: 1-2 cups daily. Tincture: 1-2ml 3x daily",
    precautions:
      "May cause allergic reactions. Avoid during pregnancy. High doses may cause GI upset.",
    scientificInfo:
      "Contains antimicrobial sesquiterpene lactones and prebiotic inulin.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Mullein", "Thyme", "Horehound"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Horehound",
    description:
      "Traditional bitter herb used for coughs, congestion, and digestive support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Marrubium vulgare",
      "Marrubiin",
      "Diterpenes",
      "Flavonoids",
      "Tannins",
    ]),
    benefits: JSON.stringify([
      "Cough relief",
      "Expectorant effects",
      "Digestive stimulation",
      "Bile production",
      "Throat soothing",
    ]),
    usage:
      "Take as tea, cough drops, or tincture for respiratory and digestive support.",
    dosage: "Tea: 1-3 cups daily. Tincture: 1-2ml 3x daily",
    precautions: "Very bitter. May lower blood sugar. Avoid during pregnancy.",
    scientificInfo:
      "Contains marrubiin with documented expectorant and digestive effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify(["Elecampane", "Mullein", "Thyme"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Lobelia",
    description:
      "Potent traditional herb used for respiratory conditions and smoking cessation.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Lobelia inflata",
      "Lobeline",
      "Lobelanine",
      "Alkaloids",
    ]),
    benefits: JSON.stringify([
      "Respiratory relaxation",
      "Smoking cessation",
      "Asthma support",
      "Muscle relaxation",
      "Lymphatic stimulation",
    ]),
    usage:
      "Take in small doses as tincture. Often used in combination formulas.",
    dosage: "Very small doses: 0.2-0.6ml tincture. Use with caution",
    precautions:
      "Toxic in large doses. May cause nausea, vomiting. Use only small amounts.",
    scientificInfo:
      "Lobeline has nicotinic effects; traditional use requires careful dosing.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2017"]),
    relatedRemedies: JSON.stringify(["Mullein", "Grindelia", "Ephedra"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Blue Vervain",
    description:
      "Traditional nervine herb used for tension, stress, and liver support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Verbena hastata",
      "Verbenalin",
      "Hastatoside",
      "Flavonoids",
      "Iridoids",
    ]),
    benefits: JSON.stringify([
      "Nervous tension relief",
      "Stress support",
      "Liver health",
      "Fever reduction",
      "Sleep improvement",
    ]),
    usage: "Take as tea or tincture for nervous tension and stress.",
    dosage: "Tea: 1-3 cups daily. Tincture: 2-4ml 3x daily",
    precautions: "May lower blood pressure. Avoid during pregnancy.",
    scientificInfo:
      "Contains compounds with sedative and hepatoprotective properties.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2016",
      "Phytotherapy Research 2018",
    ]),
    relatedRemedies: JSON.stringify([
      "Skullcap",
      "Passionflower",
      "Lemon Balm",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Wood Betony",
    description:
      "Traditional European herb for headaches, anxiety, and digestive support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Stachys officinalis",
      "Stachydrine",
      "Betonicine",
      "Tannins",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Headache relief",
      "Anxiety reduction",
      "Digestive support",
      "Nervous system tonic",
      "Memory support",
    ]),
    usage: "Drink as tea or take tincture for headaches and nervousness.",
    dosage: "Tea: 1-3 cups daily. Tincture: 2-4ml 3x daily",
    precautions: "Avoid during pregnancy. May lower blood pressure.",
    scientificInfo: "Traditional nervine with documented sedative properties.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2017"]),
    relatedRemedies: JSON.stringify(["Skullcap", "Vervain", "Lavender"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Motherwort",
    description:
      "Traditional heart and womens herb used for anxiety, palpitations, and menstrual support.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Leonurus cardiaca",
      "Leonurine",
      "Stachydrine",
      "Flavonoids",
      "Iridoids",
    ]),
    benefits: JSON.stringify([
      "Heart palpitation relief",
      "Anxiety reduction",
      "Menstrual regulation",
      "Thyroid support",
      "Stress relief",
    ]),
    usage: "Take as tincture or tea for heart and nervous system support.",
    dosage: "Tincture: 2-4ml 3x daily. Tea: 1-3 cups daily",
    precautions:
      "Avoid during pregnancy (uterine stimulant). May enhance effects of heart medications.",
    scientificInfo:
      "Contains leonurine with cardioprotective and uterotonic effects.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Hawthorn",
      "Lemon Balm",
      "Passionflower",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Cleavers",
    description:
      "Traditional lymphatic herb used for skin conditions and urinary health.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Galium aparine",
      "Iridoids",
      "Flavonoids",
      "Tannins",
      "Citric acid",
    ]),
    benefits: JSON.stringify([
      "Lymphatic support",
      "Urinary health",
      "Skin conditions",
      "Edema reduction",
      "Detoxification",
    ]),
    usage: "Best used fresh as juice or tea. Also available as tincture.",
    dosage: "Fresh juice: 2-4oz daily. Tea: 2-4 cups daily",
    precautions: "Generally very safe. Diuretic effect - stay hydrated.",
    scientificInfo:
      "Traditional lymphatic herb; contains compounds with diuretic properties.",
    references: JSON.stringify(["Journal of Ethnopharmacology 2016"]),
    relatedRemedies: JSON.stringify(["Red Clover", "Burdock", "Dandelion"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Red Clover",
    description:
      "Traditional blood purifier and womens herb containing isoflavones.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Trifolium pratense",
      "Isoflavones (genistein, daidzein)",
      "Coumarins",
      "Flavonoids",
    ]),
    benefits: JSON.stringify([
      "Menopause support",
      "Skin health",
      "Bone health",
      "Cholesterol support",
      "Lymphatic cleansing",
    ]),
    usage: "Drink as tea or take standardized extract for menopausal symptoms.",
    dosage: "Tea: 2-3 cups daily. Extract: 40-160mg isoflavones",
    precautions:
      "Contains phytoestrogens. Avoid with hormone-sensitive conditions. May interact with blood thinners.",
    scientificInfo:
      "Isoflavones have documented effects on menopausal symptoms; research ongoing.",
    references: JSON.stringify([
      "Cochrane Database 2015",
      "Phytomedicine 2019",
    ]),
    relatedRemedies: JSON.stringify([
      "Black Cohosh",
      "Soy Isoflavones",
      "Dong Quai",
    ]),
    evidenceLevel: "Moderate",
  },
  {
    name: "Marshmallow Root",
    description:
      "Soothing mucilaginous herb used for digestive and respiratory comfort.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Althaea officinalis",
      "Mucilage polysaccharides",
      "Flavonoids",
      "Pectin",
      "Asparagine",
    ]),
    benefits: JSON.stringify([
      "Digestive soothing",
      "Throat comfort",
      "Cough relief",
      "Skin healing",
      "Urinary comfort",
    ]),
    usage:
      "Make cold infusion (steep in cold water 4+ hours) or take as capsule/syrup.",
    dosage: "Cold infusion: 2-4 cups daily. Capsules: as directed",
    precautions: "May slow absorption of other medications. Take separately.",
    scientificInfo:
      "Mucilage provides mechanical soothing; traditional demulcent.",
    references: JSON.stringify([
      "Journal of Ethnopharmacology 2017",
      "Complementary Therapies in Medicine 2019",
    ]),
    relatedRemedies: JSON.stringify(["Slippery Elm", "Licorice", "Aloe Vera"]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Slippery Elm Bark",
    description:
      "Mucilaginous bark used for digestive coating, throat soothing, and wound healing.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Ulmus rubra",
      "Mucilage",
      "Tannins",
      "Calcium",
      "Vitamins",
    ]),
    benefits: JSON.stringify([
      "Digestive coating",
      "Throat soothing",
      "GERD relief",
      "IBD support",
      "Cough relief",
    ]),
    usage:
      "Mix powder with water to make paste or gruel. Take lozenges for throat.",
    dosage: "Powder: 1-2 tablespoons in water. Lozenges: as needed",
    precautions:
      "May slow medication absorption. Take separately. Ensure sustainable sourcing.",
    scientificInfo:
      "FDA-approved demulcent; mucilage provides mechanical protection.",
    references: JSON.stringify([
      "Journal of Alternative and Complementary Medicine 2017",
    ]),
    relatedRemedies: JSON.stringify([
      "Marshmallow Root",
      "DGL Licorice",
      "Aloe Vera",
    ]),
    evidenceLevel: "Traditional",
  },
  {
    name: "Ginger Root (Fresh)",
    description:
      "Warming digestive and anti-inflammatory herb used fresh for maximum potency.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Zingiber officinale",
      "Gingerols",
      "Shogaols",
      "Zingerone",
      "Essential oils",
    ]),
    benefits: JSON.stringify([
      "Nausea relief",
      "Digestive support",
      "Inflammation reduction",
      "Circulation improvement",
      "Pain relief",
    ]),
    usage: "Grate fresh into tea, food, or juice. Chew for nausea.",
    dosage: "1-4 grams fresh ginger daily",
    precautions:
      "May interact with blood thinners. High doses may cause heartburn.",
    scientificInfo: "Strong evidence for nausea and anti-inflammatory effects.",
    references: JSON.stringify([
      "Integrative Medicine Insights 2016",
      "Nutrients 2019",
    ]),
    relatedRemedies: JSON.stringify(["Turmeric", "Peppermint", "Chamomile"]),
    evidenceLevel: "Strong",
  },
  {
    name: "Garlic (Raw)",
    description:
      "Powerful antimicrobial and cardiovascular herb used fresh for maximum potency.",
    category: "Traditional Remedy",
    ingredients: JSON.stringify([
      "Allium sativum",
      "Allicin",
      "Ajoene",
      "Diallyl sulfides",
      "Selenium",
    ]),
    benefits: JSON.stringify([
      "Cardiovascular support",
      "Antimicrobial effects",
      "Immune enhancement",
      "Blood pressure support",
      "Cholesterol management",
    ]),
    usage: "Crush and let sit 10 minutes before consuming to activate allicin.",
    dosage: "1-4 fresh cloves daily (crushed)",
    precautions:
      "May interact with blood thinners. GI upset in some. Body odor.",
    scientificInfo:
      "Strong evidence for cardiovascular and antimicrobial benefits.",
    references: JSON.stringify([
      "Cochrane Database 2017",
      "Journal of Nutrition 2019",
    ]),
    relatedRemedies: JSON.stringify(["Onion", "Oregano", "Berberine"]),
    evidenceLevel: "Strong",
  },
];
