// Additional pharmaceuticals to add to seed
const additionalPharmaceuticals = [
  {
    fdaId: 'mock-6',
    name: 'Acetaminophen (Tylenol)',
    description: 'Pain reliever and fever reducer',
    category: 'Pain Reliever',
    ingredients: JSON.stringify(['Acetaminophen']),
    benefits: JSON.stringify(['Pain relief', 'Fever reduction', 'Headache relief']),
    usage: 'Take as directed, typically every 4-6 hours. Do not exceed 4000mg per day.',
    warnings: 'Can cause liver damage if taken in excess or with alcohol.',
    interactions: 'May interact with warfarin and other blood thinners.'
  },
  {
    fdaId: 'mock-7',
    name: 'Aspirin',
    description: 'NSAID used for pain relief and heart health',
    category: 'Pain Reliever',
    ingredients: JSON.stringify(['Acetylsalicylic acid']),
    benefits: JSON.stringify(['Pain relief', 'Reduces inflammation', 'Blood thinner', 'Heart attack prevention']),
    usage: 'For pain: 325-650mg every 4-6 hours. For heart health: 81mg daily.',
    warnings: 'May cause stomach bleeding. Not for children with viral infections.',
    interactions: 'Interacts with blood thinners, NSAIDs, and certain diabetes medications.'
  },
  {
    fdaId: 'mock-8',
    name: 'Diphenhydramine (Benadryl)',
    description: 'Antihistamine for allergies and sleep aid',
    category: 'Allergy Medication',
    ingredients: JSON.stringify(['Diphenhydramine HCl']),
    benefits: JSON.stringify(['Allergy relief', 'Sleep aid', 'Reduces itching']),
    usage: 'For allergies: 25-50mg every 4-6 hours. For sleep: 50mg before bed.',
    warnings: 'May cause drowsiness. Do not operate machinery.',
    interactions: 'May interact with sedatives, alcohol, and certain antidepressants.'
  },
  {
    fdaId: 'mock-9',
    name: 'Vitamin C Supplement',
    description: 'Essential vitamin for immune support',
    category: 'Vitamin Supplement',
    ingredients: JSON.stringify(['Ascorbic acid', 'Vitamin C']),
    benefits: JSON.stringify(['Immune support', 'Antioxidant', 'Collagen production']),
    usage: 'Take 500-1000mg daily with food.',
    warnings: 'High doses may cause digestive upset.',
    interactions: 'May interact with chemotherapy drugs and aluminum-containing medications.'
  },
  {
    fdaId: 'mock-10',
    name: 'Calcium Carbonate',
    description: 'Calcium supplement and antacid',
    category: 'Mineral Supplement',
    ingredients: JSON.stringify(['Calcium carbonate']),
    benefits: JSON.stringify(['Bone health', 'Heartburn relief', 'Calcium supplementation']),
    usage: 'Take 500-1000mg with meals, 2-3 times daily.',
    warnings: 'May cause constipation. Do not exceed 2500mg daily.',
    interactions: 'May interfere with absorption of certain antibiotics and thyroid medications.'
  }
];

// Additional natural remedies
const additionalRemedies = [
  {
    name: 'White Willow Bark',
    description: 'Natural source of salicin, similar to aspirin',
    category: 'Herbal Remedy',
    ingredients: JSON.stringify(['Salicin', 'White willow bark extract']),
    benefits: JSON.stringify(['Pain relief', 'Reduces inflammation', 'Fever reduction']),
    imageUrl: 'https://images.unsplash.com/photo-1502467722427-648b2980717e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    sourceUrl: 'https://www.healthline.com/health/white-willow-bark',
    usage: 'Can be taken as tea, tincture, or capsule form.',
    dosage: '120-240mg of salicin per day, divided into doses.',
    precautions: 'Similar precautions to aspirin. Not for children. Avoid if allergic to aspirin.',
    scientificInfo: 'Contains salicin, which is converted to salicylic acid in the body, similar to aspirin mechanism.',
    references: JSON.stringify([
      'Vlachojannis JE, et al. Systematic review on the clinical effectiveness of willow bark for musculoskeletal pain. Phytother Res. 2009;23(7):897-900.',
      'Shara M, Stohs SJ. Efficacy and Safety of White Willow Bark (Salix alba) Extracts. Phytother Res. 2015;29(8):1112-1116.'
    ]),
    relatedRemedies: JSON.stringify(['Aspirin', 'Turmeric', 'Boswellia']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Chamomile Tea',
    description: 'Herb tea with calming and sleep-promoting properties',
    category: 'Herbal Tea',
    ingredients: JSON.stringify(['Chamomile flowers', 'Apigenin']),
    benefits: JSON.stringify(['Sleep aid', 'Reduces anxiety', 'Digestive aid']),
    imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    sourceUrl: 'https://www.healthline.com/nutrition/5-benefits-of-chamomile-tea',
    usage: 'Steep 1-2 tea bags or 1 tablespoon of dried flowers in hot water for 5-10 minutes.',
    dosage: '1-4 cups daily, especially 30 minutes before bed for sleep.',
    precautions: 'May cause allergic reactions in those sensitive to ragweed. Avoid if pregnant.',
    scientificInfo: 'Contains apigenin, an antioxidant that binds to benzodiazepine receptors, promoting sleepiness and reducing anxiety.',
    references: JSON.stringify([
      'Srivastava JK, et al. Chamomile: A herbal medicine of the past with bright future. Mol Med Report. 2010;3(6):895-901.',
      'Adib-Hajbaghery M, Mousavi SN. The effects of chamomile extract on sleep quality. Complement Ther Clin Pract. 2017;29:78-84.'
    ]),
    relatedRemedies: JSON.stringify(['Valerian Root', 'Passionflower', 'Lavender']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Citrus Fruits',
    description: 'Natural source of vitamin C',
    category: 'Food',
    ingredients: JSON.stringify(['Vitamin C', 'Citric acid', 'Flavonoids']),
    benefits: JSON.stringify(['Immune support', 'Antioxidant', 'Skin health']),
    imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    sourceUrl: 'https://www.healthline.com/nutrition/foods-high-in-vitamin-c',
    usage: 'Consume 1-2 servings of citrus fruits daily as part of a balanced diet.',
    dosage: '1 medium orange provides about 70mg of vitamin C (78% DV).',
    precautions: 'High amounts may cause digestive issues. Citrus can interact with some medications.',
    scientificInfo: 'Rich in vitamin C, which supports immune function, collagen synthesis, and acts as a powerful antioxidant.',
    references: JSON.stringify([
      'Carr AC, Maggini S. Vitamin C and Immune Function. Nutrients. 2017;9(11):1211.',
      'Pullar JM, et al. The Roles of Vitamin C in Skin Health. Nutrients. 2017;9(8):866.'
    ]),
    relatedRemedies: JSON.stringify(['Bell Peppers', 'Broccoli', 'Strawberries']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Leafy Greens',
    description: 'Natural source of calcium and other minerals',
    category: 'Food',
    ingredients: JSON.stringify(['Calcium', 'Vitamin K', 'Magnesium', 'Iron']),
    benefits: JSON.stringify(['Bone health', 'Heart health', 'Nutrient-dense']),
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    sourceUrl: 'https://www.healthline.com/nutrition/leafy-green-vegetables',
    usage: 'Consume 2-3 servings of leafy greens daily.',
    dosage: '1 cup cooked greens or 2 cups raw provides significant calcium.',
    precautions: 'High vitamin K content may interfere with blood thinners. Oxalates may affect kidney stones.',
    scientificInfo: 'Collard greens, kale, and bok choy are excellent plant-based calcium sources with high bioavailability.',
    references: JSON.stringify([
      'Weaver CM, et al. Choices for achieving adequate dietary calcium with a vegetarian diet. Am J Clin Nutr. 1999;70(3 Suppl):543S-548S.',
      'Blekkenhorst LC, et al. Cardiovascular Health Benefits of Specific Vegetable Types: A Narrative Review. Nutrients. 2018;10(5):595.'
    ]),
    relatedRemedies: JSON.stringify(['Almonds', 'Dairy Products', 'Fortified Foods']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Valerian Root',
    description: 'Herbal sleep aid and anxiety reducer',
    category: 'Herbal Remedy',
    ingredients: JSON.stringify(['Valeric acid', 'Valerian root extract']),
    benefits: JSON.stringify(['Sleep aid', 'Reduces anxiety', 'Muscle relaxation']),
    imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    sourceUrl: 'https://www.healthline.com/nutrition/valerian-root',
    usage: 'Typically consumed as tea, tincture, or in capsule form before bedtime.',
    dosage: '300-600mg of valerian root extract or 2-3g of dried root 1-2 hours before bed.',
    precautions: 'May cause drowsiness; avoid driving or operating machinery. Not recommended with alcohol or sedatives.',
    scientificInfo: 'May increase GABA levels in the brain, which helps regulate nerve cells and has a calming effect.',
    references: JSON.stringify([
      'Bent S, et al. Valerian for sleep: a systematic review and meta-analysis. Am J Med. 2006;119(12):1005-1012.',
      'Fernández-San-Martín MI, et al. Effectiveness of Valerian on insomnia: a meta-analysis of randomized placebo-controlled trials. Sleep Med. 2010;11(6):505-511.'
    ]),
    relatedRemedies: JSON.stringify(['Chamomile Tea', 'Passionflower', 'Lemon Balm']),
    evidenceLevel: 'Moderate'
  }
];
