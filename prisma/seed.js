// @ts-check
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Delete all existing records (to avoid duplicates during development)
  await prisma.naturalRemedyMapping.deleteMany({});
  await prisma.pharmaceutical.deleteMany({});
  await prisma.naturalRemedy.deleteMany({});
  
  console.log('Creating pharmaceuticals...');
  
  const pharmaceuticals = [
    {
      fdaId: 'mock-1',
      name: 'Vitamin D3 Supplement',
      description: 'Helps with calcium absorption and bone health',
      category: 'Vitamin Supplement',
      ingredients: ['Vitamin D3', 'Calcium', 'Magnesium'],
      benefits: ['Bone health', 'Immune support', 'Mood regulation'],
      usage: 'Take one tablet daily with food.',
      warnings: 'Excess vitamin D can lead to hypercalcemia. Consult with your healthcare provider.',
      interactions: 'May interact with certain blood pressure medications and steroids.'
    },
    {
      fdaId: 'mock-2',
      name: 'Ibuprofen',
      description: 'Non-steroidal anti-inflammatory drug (NSAID) used for pain relief and reducing inflammation',
      category: 'Pain Reliever',
      ingredients: ['Ibuprofen'],
      benefits: ['Pain relief', 'Reduces inflammation', 'Fever reduction'],
      usage: 'Take as needed for pain or fever. Do not exceed recommended dosage.',
      warnings: 'May cause stomach upset or bleeding. Not recommended for long-term use without medical supervision.',
      interactions: 'May interact with blood thinners, aspirin, and certain heart medications.'
    },
    {
      fdaId: 'mock-3',
      name: 'Melatonin',
      description: 'Hormone that regulates sleep cycles',
      category: 'Sleep Aid',
      ingredients: ['Melatonin'],
      benefits: ['Sleep regulation', 'Jet lag treatment'],
      usage: 'Take 30 minutes before bedtime.',
      warnings: 'May cause drowsiness. Do not drive after taking.',
      interactions: 'May interact with blood thinners and immunosuppressants.'
    },
    {
      fdaId: 'mock-4',
      name: 'Fish Oil Supplement',
      description: 'Rich in omega-3 fatty acids',
      category: 'Nutritional Supplement',
      ingredients: ['EPA', 'DHA', 'Omega-3 fatty acids'],
      benefits: ['Heart health', 'Brain function', 'Reduces inflammation'],
      usage: 'Take 1-2 capsules daily with food.',
      warnings: 'May cause fishy aftertaste or mild digestive issues.',
      interactions: 'May enhance the effect of blood-thinning medications.'
    },
    {
      fdaId: 'mock-5',
      name: 'Omeprazole',
      description: 'Proton pump inhibitor used to treat acid reflux and heartburn',
      category: 'Digestive Health',
      ingredients: ['Omeprazole'],
      benefits: ['Reduces stomach acid', 'Heartburn relief', 'Treats acid reflux'],
      usage: 'Take 30-60 minutes before meals, typically once daily.',
      warnings: 'Long-term use may lead to vitamin B12 deficiency or increased risk of bone fractures.',
      interactions: 'May reduce absorption of certain medications including some antibiotics.'
    }
  ];
  
  console.log('Creating natural remedies...');
  
  const naturalRemedies = [
    {
      name: 'Sunlight Exposure',
      description: 'Natural way to boost vitamin D production',
      category: 'Natural Source',
      ingredients: ['Sunlight', 'Skin exposure'],
      benefits: ['Vitamin D production', 'Mood improvement', 'Regulated sleep cycle'],
      imageUrl: 'https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/vitamin-d-from-sun',
      usage: 'Spend 10-30 minutes in direct sunlight a few times per week, with face and arms exposed.',
      dosage: 'Varies by skin tone, location, and time of year. Typically 10-30 minutes several times weekly.',
      precautions: 'Avoid sunburn. Use sunscreen for longer exposure. Not recommended for those with certain skin conditions.',
      scientificInfo: 'UVB radiation from sunlight converts 7-dehydrocholesterol in the skin to previtamin D3, which is then converted to vitamin D3.',
      references: [
        'Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357:266-281.',
        'Nair R, Maseeh A. Vitamin D: The "sunshine" vitamin. J Pharmacol Pharmacother. 2012;3(2):118-126.'
      ],
      relatedRemedies: ['Fatty Fish', 'Mushrooms', 'Egg Yolks'],
      evidenceLevel: 'Strong'
    },
    {
      name: 'Fatty Fish',
      description: 'Natural source of vitamin D and omega-3 fatty acids',
      category: 'Food',
      ingredients: ['Salmon', 'Mackerel', 'Tuna', 'Omega-3 fatty acids', 'Vitamin D'],
      benefits: ['Vitamin D intake', 'Heart health', 'Brain function'],
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/9-foods-high-in-vitamin-d',
      usage: 'Consume 2-3 servings of fatty fish per week as part of a balanced diet.',
      dosage: '3-4 ounce serving, 2-3 times per week',
      precautions: 'Be aware of mercury content in certain fish. Not suitable for those with fish allergies.',
      scientificInfo: 'Fatty fish naturally contains vitamin D3 and omega-3 fatty acids EPA and DHA, which have anti-inflammatory properties.',
      references: [
        'Swanson D, Block R, Mousa SA. Omega-3 fatty acids EPA and DHA: health benefits throughout life. Adv Nutr. 2012;3(1):1-7.',
        'Schmid A, Walther B. Natural vitamin D content in animal products. Adv Nutr. 2013;4(4):453-462.'
      ],
      relatedRemedies: ['Fish Oil Supplements', 'Cod Liver Oil', 'Algae Oil'],
      evidenceLevel: 'Strong'
    },
    {
      name: 'Turmeric',
      description: 'Natural anti-inflammatory spice containing curcumin',
      category: 'Spice',
      ingredients: ['Curcumin', 'Turmeric root'],
      benefits: ['Reduces inflammation', 'Pain relief', 'Antioxidant properties'],
      imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/top-10-evidence-based-health-benefits-of-turmeric',
      usage: 'Add to food or take as supplement. Often combined with black pepper to increase absorption.',
      dosage: '500-2,000 mg of turmeric per day, containing 150-180 mg of curcumin.',
      precautions: 'May interact with blood thinners and diabetes medications. Not recommended before surgery.',
      scientificInfo: 'Curcumin in turmeric inhibits many molecules involved in inflammation, particularly NF-kB, a molecule that travels into cell nuclei and turns on genes related to inflammation.',
      references: [
        'Hewlings SJ, Kalman DS. Curcumin: A Review of Its Effects on Human Health. Foods. 2017;6(10):92.',
        'Daily JW, Yang M, Park S. Efficacy of Turmeric Extracts and Curcumin for Alleviating the Symptoms of Joint Arthritis: A Systematic Review and Meta-Analysis of Randomized Clinical Trials. J Med Food. 2016;19(8):717-729.'
      ],
      relatedRemedies: ['Ginger', 'Boswellia', 'Willow Bark'],
      evidenceLevel: 'Moderate'
    },
    {
      name: 'Ginger',
      description: 'Root with anti-inflammatory and digestive properties',
      category: 'Root',
      ingredients: ['Gingerol', 'Ginger root'],
      benefits: ['Reduces inflammation', 'Digestive aid', 'Nausea relief'],
      imageUrl: 'https://images.unsplash.com/photo-1573414404380-7cccfbd3c123?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/11-proven-benefits-of-ginger',
      usage: 'Can be consumed fresh, dried, powdered, as oil, or as juice.',
      dosage: '1-4 grams of ginger root daily, divided into doses.',
      precautions: 'May increase bile production. Caution advised for those with gallbladder disease.',
      scientificInfo: 'Contains gingerol, which has powerful anti-inflammatory and antioxidant effects. Studies show it may reduce pain and inflammation in conditions like osteoarthritis.',
      references: [
        'Mashhadi NS, Ghiasvand R, Askari G, et al. Anti-oxidative and anti-inflammatory effects of ginger in health and physical activity: review of current evidence. Int J Prev Med. 2013;4(Suppl 1):S36-S42.',
        'Bartels EM, Folmer VN, Bliddal H, et al. Efficacy and safety of ginger in osteoarthritis patients: a meta-analysis of randomized placebo-controlled trials. Osteoarthritis Cartilage. 2015;23(1):13-21.'
      ],
      relatedRemedies: ['Turmeric', 'Peppermint', 'Chamomile'],
      evidenceLevel: 'Moderate'
    },
    {
      name: 'Tart Cherry Juice',
      description: 'Natural source of melatonin and anti-inflammatory compounds',
      category: 'Juice',
      ingredients: ['Melatonin', 'Anthocyanins', 'Tart cherries'],
      benefits: ['Sleep improvement', 'Muscle recovery', 'Reduces inflammation'],
      imageUrl: 'https://images.unsplash.com/photo-1596413801212-81206c300da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/cherries-benefits',
      usage: 'Drink 8-12 oz of tart cherry juice daily, preferably 1-2 hours before bedtime for sleep benefits.',
      dosage: '8-12 oz (240-355 ml) daily',
      precautions: 'Contains natural sugars; may not be suitable for those monitoring carbohydrate intake.',
      scientificInfo: 'Contains natural melatonin and has anti-inflammatory properties due to high anthocyanin content.',
      references: [
        'Losso JN, Finley JW, Karki N, et al. Pilot Study of the Tart Cherry Juice for the Treatment of Insomnia and Investigation of Mechanisms. Am J Ther. 2018;25(2):e194-e201.',
        'Howatson G, Bell PG, Tallent J, Middleton B, McHugh MP, Ellis J. Effect of tart cherry juice (Prunus cerasus) on melatonin levels and enhanced sleep quality. Eur J Nutr. 2012;51(8):909-916.'
      ],
      relatedRemedies: ['Chamomile Tea', 'Valerian Root', 'Magnesium-Rich Foods'],
      evidenceLevel: 'Moderate'
    }
  ];
  
  // Create pharmaceuticals
  await Promise.all(
    pharmaceuticals.map(async (pharm) => {
      await prisma.pharmaceutical.create({
        data: pharm,
      });
    })
  );
  
  // Create natural remedies
  await Promise.all(
    naturalRemedies.map(async (remedy) => {
      await prisma.naturalRemedy.create({
        data: remedy,
      });
    })
  );

  console.log('Creating mappings between pharmaceuticals and natural remedies...');
  
  // Mapping pharmaceuticals to natural remedies
  const mappings = [
    // Vitamin D3 Supplement mappings
    {
      pharmaceuticalName: 'Vitamin D3 Supplement',
      naturalRemedyName: 'Sunlight Exposure',
      similarityScore: 0.95,
      matchingNutrients: ['Vitamin D'],
      replacementType: 'Alternative'
    },
    {
      pharmaceuticalName: 'Vitamin D3 Supplement',
      naturalRemedyName: 'Fatty Fish',
      similarityScore: 0.8,
      matchingNutrients: ['Vitamin D', 'Calcium'],
      replacementType: 'Alternative'
    },
    
    // Ibuprofen mappings
    {
      pharmaceuticalName: 'Ibuprofen',
      naturalRemedyName: 'Turmeric',
      similarityScore: 0.75,
      matchingNutrients: ['Anti-inflammatory compounds'],
      replacementType: 'Complementary'
    },
    {
      pharmaceuticalName: 'Ibuprofen',
      naturalRemedyName: 'Ginger',
      similarityScore: 0.7,
      matchingNutrients: ['Anti-inflammatory compounds'],
      replacementType: 'Complementary'
    },
    
    // Melatonin mappings
    {
      pharmaceuticalName: 'Melatonin',
      naturalRemedyName: 'Tart Cherry Juice',
      similarityScore: 0.85,
      matchingNutrients: ['Melatonin', 'Antioxidants'],
      replacementType: 'Alternative'
    }
  ];
  
  // Create the mappings
  for (const mapping of mappings) {
    const pharmaceutical = await prisma.pharmaceutical.findUnique({
      where: { name: mapping.pharmaceuticalName },
    });
    
    const naturalRemedy = await prisma.naturalRemedy.findUnique({
      where: { name: mapping.naturalRemedyName },
    });
    
    if (pharmaceutical && naturalRemedy) {
      await prisma.naturalRemedyMapping.create({
        data: {
          pharmaceutical: { connect: { id: pharmaceutical.id } },
          naturalRemedy: { connect: { id: naturalRemedy.id } },
          similarityScore: mapping.similarityScore,
          matchingNutrients: mapping.matchingNutrients,
          replacementType: mapping.replacementType
        },
      });
    }
  }

  await prisma.webhookStatus.upsert({
    where: { provider: "stripe" },
    create: {
      provider: "stripe",
      lastReceivedAt: new Date(),
      lastEventType: "seed",
      lastEventId: "seed",
    },
    update: {
      lastReceivedAt: new Date(),
      lastEventType: "seed",
      lastEventId: "seed",
    },
  });
  
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
