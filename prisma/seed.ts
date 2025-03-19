import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define types based on our schema
type Pharmaceutical = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
};

type NaturalRemedy = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string[];
  benefits: string[];
  imageUrl: string | null;
  sourceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function main() {
  console.log('🌱 Seeding database...');
  
  // Delete all existing records (to avoid duplicates during development)
  await prisma.naturalRemedyMapping.deleteMany({});
  await prisma.pharmaceutical.deleteMany({});
  await prisma.naturalRemedy.deleteMany({});
  
  console.log('Creating pharmaceuticals...');
  
  const pharmaceuticals: Omit<Pharmaceutical, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Vitamin D3 Supplement',
      description: 'Helps with calcium absorption and bone health',
      category: 'Vitamin Supplement',
      ingredients: ['Vitamin D3', 'Calcium', 'Magnesium'],
      benefits: ['Bone health', 'Immune support', 'Mood regulation']
    },
    {
      name: 'Ibuprofen',
      description: 'Non-steroidal anti-inflammatory drug (NSAID) used for pain relief and reducing inflammation',
      category: 'Pain Reliever',
      ingredients: ['Ibuprofen'],
      benefits: ['Pain relief', 'Reduces inflammation', 'Fever reduction']
    },
    {
      name: 'Melatonin',
      description: 'Hormone that regulates sleep cycles',
      category: 'Sleep Aid',
      ingredients: ['Melatonin'],
      benefits: ['Sleep regulation', 'Jet lag treatment']
    },
    {
      name: 'Fish Oil Supplement',
      description: 'Rich in omega-3 fatty acids',
      category: 'Nutritional Supplement',
      ingredients: ['EPA', 'DHA', 'Omega-3 fatty acids'],
      benefits: ['Heart health', 'Brain function', 'Reduces inflammation']
    },
    {
      name: 'Omeprazole',
      description: 'Proton pump inhibitor used to treat acid reflux and heartburn',
      category: 'Digestive Health',
      ingredients: ['Omeprazole'],
      benefits: ['Reduces stomach acid', 'Heartburn relief', 'Treats acid reflux']
    }
  ];
  
  console.log('Creating natural remedies...');
  
  const naturalRemedies: Omit<NaturalRemedy, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Sunlight Exposure',
      description: 'Natural way to boost vitamin D production',
      category: 'Natural Source',
      ingredients: ['Sunlight', 'Skin exposure'],
      benefits: ['Vitamin D production', 'Mood improvement', 'Regulated sleep cycle'],
      imageUrl: 'https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/vitamin-d-from-sun'
    },
    {
      name: 'Fatty Fish',
      description: 'Natural source of vitamin D and omega-3 fatty acids',
      category: 'Food',
      ingredients: ['Salmon', 'Mackerel', 'Tuna', 'Omega-3 fatty acids', 'Vitamin D'],
      benefits: ['Vitamin D intake', 'Heart health', 'Brain function'],
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/9-foods-high-in-vitamin-d'
    },
    {
      name: 'Turmeric',
      description: 'Natural anti-inflammatory spice containing curcumin',
      category: 'Spice',
      ingredients: ['Curcumin', 'Turmeric root'],
      benefits: ['Reduces inflammation', 'Pain relief', 'Antioxidant properties'],
      imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/top-10-evidence-based-health-benefits-of-turmeric'
    },
    {
      name: 'Ginger',
      description: 'Root with anti-inflammatory and digestive properties',
      category: 'Root',
      ingredients: ['Gingerol', 'Ginger root'],
      benefits: ['Reduces inflammation', 'Digestive aid', 'Nausea relief'],
      imageUrl: 'https://images.unsplash.com/photo-1573414404380-7cccfbd3c123?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/11-proven-benefits-of-ginger'
    },
    {
      name: 'Tart Cherry Juice',
      description: 'Natural source of melatonin and anti-inflammatory compounds',
      category: 'Juice',
      ingredients: ['Melatonin', 'Anthocyanins', 'Tart cherries'],
      benefits: ['Sleep improvement', 'Muscle recovery', 'Reduces inflammation'],
      imageUrl: 'https://images.unsplash.com/photo-1596413801212-81206c300da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/cherries-benefits'
    },
    {
      name: 'Chamomile Tea',
      description: 'Herb tea with calming properties',
      category: 'Herbal Tea',
      ingredients: ['Chamomile flowers', 'Apigenin'],
      benefits: ['Sleep aid', 'Relaxation', 'Digestive health'],
      imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/5-benefits-of-chamomile-tea'
    },
    {
      name: 'Aloe Vera',
      description: 'Plant with soothing and healing properties',
      category: 'Plant',
      ingredients: ['Aloe vera gel', 'Aloin'],
      benefits: ['Skin healing', 'Digestive health', 'Anti-inflammatory'],
      imageUrl: 'https://images.unsplash.com/photo-1596276021663-0c3a68ce627d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/health/food-nutrition/aloe-vera-juice-benefits'
    },
    {
      name: 'Apple Cider Vinegar',
      description: 'Fermented apple product with digestive benefits',
      category: 'Fermented Food',
      ingredients: ['Acetic acid', 'Probiotics'],
      benefits: ['Digestive aid', 'Blood sugar regulation', 'Weight management'],
      imageUrl: 'https://images.unsplash.com/photo-1598704710590-4dcf6e59836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      sourceUrl: 'https://www.healthline.com/nutrition/6-proven-health-benefits-of-apple-cider-vinegar'
    }
  ];
  
  // Create pharmaceuticals
  const createdPharmaceuticals = await Promise.all(
    pharmaceuticals.map(async (pharm) => {
      return prisma.pharmaceutical.create({
        data: pharm,
      });
    })
  );
  
  // Create natural remedies
  const createdRemedies = await Promise.all(
    naturalRemedies.map(async (remedy) => {
      return prisma.naturalRemedy.create({
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
      matchingNutrients: ['Vitamin D']
    },
    {
      pharmaceuticalName: 'Vitamin D3 Supplement',
      naturalRemedyName: 'Fatty Fish',
      similarityScore: 0.8,
      matchingNutrients: ['Vitamin D', 'Calcium']
    },
    
    // Ibuprofen mappings
    {
      pharmaceuticalName: 'Ibuprofen',
      naturalRemedyName: 'Turmeric',
      similarityScore: 0.75,
      matchingNutrients: ['Anti-inflammatory compounds']
    },
    {
      pharmaceuticalName: 'Ibuprofen',
      naturalRemedyName: 'Ginger',
      similarityScore: 0.7,
      matchingNutrients: ['Anti-inflammatory compounds']
    },
    
    // Melatonin mappings
    {
      pharmaceuticalName: 'Melatonin',
      naturalRemedyName: 'Tart Cherry Juice',
      similarityScore: 0.85,
      matchingNutrients: ['Melatonin']
    },
    {
      pharmaceuticalName: 'Melatonin',
      naturalRemedyName: 'Chamomile Tea',
      similarityScore: 0.65,
      matchingNutrients: ['Sleep-promoting compounds']
    },
    
    // Fish Oil Supplement mappings
    {
      pharmaceuticalName: 'Fish Oil Supplement',
      naturalRemedyName: 'Fatty Fish',
      similarityScore: 0.9,
      matchingNutrients: ['Omega-3 fatty acids', 'EPA', 'DHA']
    },
    
    // Omeprazole mappings
    {
      pharmaceuticalName: 'Omeprazole',
      naturalRemedyName: 'Aloe Vera',
      similarityScore: 0.6,
      matchingNutrients: ['Digestive soothing compounds']
    },
    {
      pharmaceuticalName: 'Omeprazole',
      naturalRemedyName: 'Apple Cider Vinegar',
      similarityScore: 0.55,
      matchingNutrients: ['Digestive regulation compounds']
    }
  ];
  
  for (const mapping of mappings) {
    const pharmaceutical = createdPharmaceuticals.find(p => p.name === mapping.pharmaceuticalName);
    const naturalRemedy = createdRemedies.find(r => r.name === mapping.naturalRemedyName);
    
    if (pharmaceutical && naturalRemedy) {
      await prisma.naturalRemedyMapping.create({
        data: {
          pharmaceuticalId: pharmaceutical.id,
          naturalRemedyId: naturalRemedy.id,
          similarityScore: mapping.similarityScore,
          matchingNutrients: mapping.matchingNutrients
        }
      });
    }
  }
  
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
