// @ts-check
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with extended dataset...');
  
  // Delete all existing records
  await prisma.naturalRemedyMapping.deleteMany({});
  await prisma.pharmaceutical.deleteMany({});
  await prisma.naturalRemedy.deleteMany({});
  
  console.log('Creating 10 pharmaceuticals...');
  
  const pharmas = await Promise.all([
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-1', name: 'Vitamin D3 Supplement', description: 'Helps with calcium absorption and bone health', category: 'Vitamin Supplement', ingredients: JSON.stringify(['Vitamin D3', 'Calcium', 'Magnesium']), benefits: JSON.stringify(['Bone health', 'Immune support', 'Mood regulation']), usage: 'Take one tablet daily with food.', warnings: 'Excess vitamin D can lead to hypercalcemia.', interactions: 'May interact with blood pressure medications.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-2', name: 'Ibuprofen', description: 'NSAID for pain relief', category: 'Pain Reliever', ingredients: JSON.stringify(['Ibuprofen']), benefits: JSON.stringify(['Pain relief', 'Reduces inflammation']), usage: 'Take as needed.', warnings: 'May cause stomach upset.', interactions: 'May interact with blood thinners.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-3', name: 'Melatonin', description: 'Regulates sleep cycles', category: 'Sleep Aid', ingredients: JSON.stringify(['Melatonin']), benefits: JSON.stringify(['Sleep regulation']), usage: 'Take 30 min before bed.', warnings: 'May cause drowsiness.', interactions: 'May interact with immunosuppressants.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-4', name: 'Fish Oil Supplement', description: 'Rich in omega-3', category: 'Nutritional Supplement', ingredients: JSON.stringify(['EPA', 'DHA']), benefits: JSON.stringify(['Heart health', 'Brain function']), usage: 'Take 1-2 capsules daily.', warnings: 'May cause fishy aftertaste.', interactions: 'May enhance blood thinners.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-5', name: 'Omeprazole', description: 'Proton pump inhibitor', category: 'Digestive Health', ingredients: JSON.stringify(['Omeprazole']), benefits: JSON.stringify(['Reduces stomach acid']), usage: 'Take before meals.', warnings: 'Long-term use may affect B12.', interactions: 'May reduce antibiotic absorption.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-6', name: 'Acetaminophen', description: 'Pain reliever', category: 'Pain Reliever', ingredients: JSON.stringify(['Acetaminophen']), benefits: JSON.stringify(['Pain relief', 'Fever reduction']), usage: 'Every 4-6 hours.', warnings: 'Can cause liver damage if exceeded.', interactions: 'May interact with warfarin.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-7', name: 'Aspirin', description: 'NSAID and blood thinner', category: 'Pain Reliever', ingredients: JSON.stringify(['Acetylsalicylic acid']), benefits: JSON.stringify(['Pain relief', 'Heart attack prevention']), usage: '81-325mg daily.', warnings: 'May cause stomach bleeding.', interactions: 'Interacts with NSAIDs.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-8', name: 'Diphenhydramine', description: 'Antihistamine', category: 'Allergy Medication', ingredients: JSON.stringify(['Diphenhydramine HCl']), benefits: JSON.stringify(['Allergy relief', 'Sleep aid']), usage: '25-50mg as needed.', warnings: 'Causes drowsiness.', interactions: 'May interact with sedatives.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-9', name: 'Vitamin C', description: 'Immune support', category: 'Vitamin Supplement', ingredients: JSON.stringify(['Ascorbic acid']), benefits: JSON.stringify(['Immune support', 'Antioxidant']), usage: '500-1000mg daily.', warnings: 'High doses may cause upset.', interactions: 'May interact with chemotherapy.' }}),
    prisma.pharmaceutical.create({ data: { fdaId: 'mock-10', name: 'Calcium Carbonate', description: 'Calcium supplement', category: 'Mineral Supplement', ingredients: JSON.stringify(['Calcium carbonate']), benefits: JSON.stringify(['Bone health']), usage: '500-1000mg with meals.', warnings: 'May cause constipation.', interactions: 'May interfere with antibiotics.' }})
  ]);
  
  console.log('Creating 10 natural remedies...');
  
  const remedies = await Promise.all([
    prisma.naturalRemedy.create({ data: { name: 'Sunlight Exposure', description: 'Vitamin D production', category: 'Natural Source', ingredients: JSON.stringify(['Sunlight']), benefits: JSON.stringify(['Vitamin D production']), imageUrl: 'https://images.unsplash.com/photo-1501862700950-18382cd41497', usage: '10-30 min daily.', dosage: 'Varies by skin tone.', precautions: 'Avoid sunburn.', scientificInfo: 'UVB converts 7-dehydrocholesterol to D3.', references: JSON.stringify(['Holick MF. NEJM 2007']), relatedRemedies: JSON.stringify(['Fatty Fish']), evidenceLevel: 'Strong' }}),
    prisma.naturalRemedy.create({ data: { name: 'Fatty Fish', description: 'Omega-3 source', category: 'Food', ingredients: JSON.stringify(['Omega-3', 'Vitamin D']), benefits: JSON.stringify(['Heart health', 'Brain function']), imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', usage: '2-3 servings weekly.', dosage: '3-4 oz serving.', precautions: 'Mercury content.', scientificInfo: 'Contains EPA and DHA.', references: JSON.stringify(['Swanson D. Adv Nutr 2012']), relatedRemedies: JSON.stringify(['Fish Oil']), evidenceLevel: 'Strong' }}),
    prisma.naturalRemedy.create({ data: { name: 'Turmeric', description: 'Anti-inflammatory', category: 'Spice', ingredients: JSON.stringify(['Curcumin']), benefits: JSON.stringify(['Reduces inflammation']), imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7', usage: 'Add to food or supplement.', dosage: '500-2000mg daily.', precautions: 'May interact with blood thinners.', scientificInfo: 'Inhibits NF-kB inflammation pathway.', references: JSON.stringify(['Hewlings SJ. Foods 2017']), relatedRemedies: JSON.stringify(['Ginger']), evidenceLevel: 'Moderate' }}),
    prisma.naturalRemedy.create({ data: { name: 'Ginger', description: 'Anti-inflammatory root', category: 'Root', ingredients: JSON.stringify(['Gingerol']), benefits: JSON.stringify(['Reduces inflammation', 'Nausea relief']), imageUrl: 'https://images.unsplash.com/photo-1573414404380-7cccfbd3c123', usage: 'Fresh, dried, or supplement.', dosage: '1-4g daily.', precautions: 'May increase bile.', scientificInfo: 'Contains gingerol with antioxidant effects.', references: JSON.stringify(['Mashhadi NS. Int J Prev Med 2013']), relatedRemedies: JSON.stringify(['Turmeric']), evidenceLevel: 'Moderate' }}),
    prisma.naturalRemedy.create({ data: { name: 'Tart Cherry Juice', description: 'Natural melatonin', category: 'Juice', ingredients: JSON.stringify(['Melatonin', 'Anthocyanins']), benefits: JSON.stringify(['Sleep aid', 'Reduces inflammation']), imageUrl: 'https://images.unsplash.com/photo-1596413801212-81206c300da2', usage: '8oz before bed.', dosage: '8-16oz daily.', precautions: 'High in sugar.', scientificInfo: 'Natural melatonin source.', references: JSON.stringify(['Howatson G. Eur J Nutr 2012']), relatedRemedies: JSON.stringify(['Chamomile']), evidenceLevel: 'Moderate' }}),
    prisma.naturalRemedy.create({ data: { name: 'White Willow Bark', description: 'Natural aspirin', category: 'Herbal Remedy', ingredients: JSON.stringify(['Salicin']), benefits: JSON.stringify(['Pain relief']), imageUrl: 'https://images.unsplash.com/photo-1502467722427-648b2980717e', usage: 'Tea or capsule.', dosage: '120-240mg salicin daily.', precautions: 'Similar to aspirin.', scientificInfo: 'Salicin converts to salicylic acid.', references: JSON.stringify(['Vlachojannis JE. Phytother Res 2009']), relatedRemedies: JSON.stringify(['Aspirin']), evidenceLevel: 'Moderate' }}),
    prisma.naturalRemedy.create({ data: { name: 'Chamomile Tea', description: 'Calming herb', category: 'Herbal Tea', ingredients: JSON.stringify(['Apigenin']), benefits: JSON.stringify(['Sleep aid', 'Reduces anxiety']), imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9', usage: 'Steep 5-10 min.', dosage: '1-4 cups daily.', precautions: 'May cause ragweed allergy.', scientificInfo: 'Apigenin binds to benzodiazepine receptors.', references: JSON.stringify(['Srivastava JK. Mol Med Report 2010']), relatedRemedies: JSON.stringify(['Valerian']), evidenceLevel: 'Moderate' }}),
    prisma.naturalRemedy.create({ data: { name: 'Citrus Fruits', description: 'Vitamin C source', category: 'Food', ingredients: JSON.stringify(['Vitamin C', 'Flavonoids']), benefits: JSON.stringify(['Immune support']), imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f', usage: '1-2 servings daily.', dosage: '1 orange = 70mg C.', precautions: 'High amounts may cause upset.', scientificInfo: 'Supports immune function and collagen.', references: JSON.stringify(['Carr AC. Nutrients 2017']), relatedRemedies: JSON.stringify(['Bell Peppers']), evidenceLevel: 'Strong' }}),
    prisma.naturalRemedy.create({ data: { name: 'Leafy Greens', description: 'Calcium source', category: 'Food', ingredients: JSON.stringify(['Calcium', 'Vitamin K']), benefits: JSON.stringify(['Bone health']), imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999', usage: '2-3 servings daily.', dosage: '1 cup cooked greens.', precautions: 'High vitamin K.', scientificInfo: 'Plant-based calcium with high bioavailability.', references: JSON.stringify(['Weaver CM. Am J Clin Nutr 1999']), relatedRemedies: JSON.stringify(['Almonds']), evidenceLevel: 'Strong' }}),
    prisma.naturalRemedy.create({ data: { name: 'Valerian Root', description: 'Sleep aid', category: 'Herbal Remedy', ingredients: JSON.stringify(['Valeric acid']), benefits: JSON.stringify(['Sleep aid', 'Anxiety reduction']), imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7', usage: 'Tea or capsule before bed.', dosage: '300-600mg extract.', precautions: 'Causes drowsiness.', scientificInfo: 'May increase GABA levels.', references: JSON.stringify(['Bent S. Am J Med 2006']), relatedRemedies: JSON.stringify(['Chamomile']), evidenceLevel: 'Moderate' }})
  ]);
  
  console.log('Creating remedy mappings...');
  
  await Promise.all([
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[0].id, naturalRemedyId: remedies[0].id, similarityScore: 0.9, matchingNutrients: JSON.stringify(['Vitamin D']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[0].id, naturalRemedyId: remedies[1].id, similarityScore: 0.85, matchingNutrients: JSON.stringify(['Vitamin D']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[1].id, naturalRemedyId: remedies[2].id, similarityScore: 0.75, matchingNutrients: JSON.stringify(['Anti-inflammatory']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[1].id, naturalRemedyId: remedies[3].id, similarityScore: 0.7, matchingNutrients: JSON.stringify(['Anti-inflammatory']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[2].id, naturalRemedyId: remedies[4].id, similarityScore: 0.8, matchingNutrients: JSON.stringify(['Melatonin']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[2].id, naturalRemedyId: remedies[6].id, similarityScore: 0.65, matchingNutrients: JSON.stringify(['Sleep-promoting']), replacementType: 'Complementary' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[2].id, naturalRemedyId: remedies[9].id, similarityScore: 0.7, matchingNutrients: JSON.stringify(['Sleep aid']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[3].id, naturalRemedyId: remedies[1].id, similarityScore: 0.9, matchingNutrients: JSON.stringify(['Omega-3']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[5].id, naturalRemedyId: remedies[5].id, similarityScore: 0.75, matchingNutrients: JSON.stringify(['Pain relief']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[6].id, naturalRemedyId: remedies[5].id, similarityScore: 0.8, matchingNutrients: JSON.stringify(['Salicin']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[7].id, naturalRemedyId: remedies[6].id, similarityScore: 0.7, matchingNutrients: JSON.stringify(['Sleep aid']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[7].id, naturalRemedyId: remedies[9].id, similarityScore: 0.75, matchingNutrients: JSON.stringify(['Sleep']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[8].id, naturalRemedyId: remedies[7].id, similarityScore: 0.85, matchingNutrients: JSON.stringify(['Vitamin C']), replacementType: 'Alternative' }}),
    prisma.naturalRemedyMapping.create({ data: { pharmaceuticalId: pharmas[9].id, naturalRemedyId: remedies[8].id, similarityScore: 0.8, matchingNutrients: JSON.stringify(['Calcium']), replacementType: 'Alternative' }})
  ]);
  
  console.log('✅ Extended seed completed!');
  console.log(`   - 10 pharmaceuticals`);
  console.log(`   - 10 natural remedies`);
  console.log(`   - 14 remedy mappings`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
