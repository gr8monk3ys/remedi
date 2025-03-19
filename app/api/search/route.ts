import { NextRequest, NextResponse } from "next/server";

// Define types for our mock data
type Pharmaceutical = {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: string[];
  benefits: string[];
};

type NaturalRemedy = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  matchingNutrients: string[];
  similarityScore: number;
};

// Mock pharmaceutical data
const MOCK_PHARMACEUTICALS: Pharmaceutical[] = [
  {
    id: "1",
    name: "Vitamin D3 Supplement",
    description: "Helps with calcium absorption and bone health",
    category: "Vitamin Supplement",
    ingredients: ["Vitamin D3", "Calcium", "Magnesium"],
    benefits: ["Bone health", "Immune support", "Mood regulation"]
  },
  {
    id: "2",
    name: "Ibuprofen",
    description: "Non-steroidal anti-inflammatory drug (NSAID) used for pain relief and reducing inflammation",
    category: "Pain Reliever",
    ingredients: ["Ibuprofen"],
    benefits: ["Pain relief", "Reduces inflammation", "Fever reduction"]
  },
  {
    id: "3",
    name: "Melatonin",
    description: "Hormone that regulates sleep cycles",
    category: "Sleep Aid",
    ingredients: ["Melatonin"],
    benefits: ["Sleep regulation", "Jet lag treatment"]
  },
  {
    id: "4",
    name: "Fish Oil Supplement",
    description: "Rich in omega-3 fatty acids",
    category: "Nutritional Supplement",
    ingredients: ["EPA", "DHA", "Omega-3 fatty acids"],
    benefits: ["Heart health", "Brain function", "Reduces inflammation"]
  },
  {
    id: "5",
    name: "Omeprazole",
    description: "Proton pump inhibitor used to treat acid reflux and heartburn",
    category: "Digestive Health",
    ingredients: ["Omeprazole"],
    benefits: ["Reduces stomach acid", "Heartburn relief", "Treats acid reflux"]
  },
  {
    id: "6",
    name: "Tylenol (Acetaminophen)",
    description: "Pain reliever and fever reducer",
    category: "Pain Reliever",
    ingredients: ["Acetaminophen"],
    benefits: ["Pain relief", "Fever reduction", "Headache relief"]
  }
];

// Define the mapping type with index signature
type RemedyMappings = {
  [key: string]: NaturalRemedy[];
};

// Mock natural remedy mappings
const MOCK_REMEDY_MAPPINGS: RemedyMappings = {
  "1": [ // Vitamin D3 Supplement
    {
      id: "101",
      name: "Sunlight Exposure",
      description: "Natural way to boost vitamin D production",
      imageUrl: "https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Vitamin D"],
      similarityScore: 0.95
    },
    {
      id: "102",
      name: "Fatty Fish",
      description: "Natural source of vitamin D and omega-3 fatty acids",
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Vitamin D", "Calcium"],
      similarityScore: 0.8
    }
  ],
  "2": [ // Ibuprofen
    {
      id: "103",
      name: "Turmeric",
      description: "Natural anti-inflammatory spice containing curcumin",
      imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Anti-inflammatory compounds"],
      similarityScore: 0.75
    },
    {
      id: "104",
      name: "Ginger",
      description: "Root with anti-inflammatory and digestive properties",
      imageUrl: "https://images.unsplash.com/photo-1573414404380-7cccfbd3c123?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Anti-inflammatory compounds"],
      similarityScore: 0.7
    }
  ],
  "3": [ // Melatonin
    {
      id: "105",
      name: "Tart Cherry Juice",
      description: "Natural source of melatonin and anti-inflammatory compounds",
      imageUrl: "https://images.unsplash.com/photo-1596413801212-81206c300da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Melatonin"],
      similarityScore: 0.85
    },
    {
      id: "106",
      name: "Chamomile Tea",
      description: "Herb tea with calming properties",
      imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Sleep-promoting compounds"],
      similarityScore: 0.65
    }
  ],
  "4": [ // Fish Oil Supplement
    {
      id: "102",
      name: "Fatty Fish",
      description: "Natural source of vitamin D and omega-3 fatty acids",
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Omega-3 fatty acids", "EPA", "DHA"],
      similarityScore: 0.9
    }
  ],
  "5": [ // Omeprazole
    {
      id: "107",
      name: "Aloe Vera",
      description: "Plant with soothing and healing properties",
      imageUrl: "https://images.unsplash.com/photo-1596276021663-0c3a68ce627d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Digestive soothing compounds"],
      similarityScore: 0.6
    },
    {
      id: "108",
      name: "Apple Cider Vinegar",
      description: "Fermented apple product with digestive benefits",
      imageUrl: "https://images.unsplash.com/photo-1598704710590-4dcf6e59836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Digestive regulation compounds"],
      similarityScore: 0.55
    }
  ],
  "6": [ // Tylenol (Acetaminophen)
    {
      id: "109",
      name: "White Willow Bark",
      description: "Natural ingredient that contains salicin, a compound similar to aspirin",
      imageUrl: "https://images.unsplash.com/photo-1502467722427-648b2980717e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Anti-inflammatory compounds", "Pain-relieving properties"],
      similarityScore: 0.75
    },
    {
      id: "110",
      name: "Peppermint Oil",
      description: "Essential oil used for pain relief and headaches",
      imageUrl: "https://images.unsplash.com/photo-1559135081-9a065a1c7df3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      matchingNutrients: ["Menthol", "Pain-relieving compounds"],
      similarityScore: 0.7
    }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    console.log("API received search query:", query);
    console.log("Available pharmaceuticals:", MOCK_PHARMACEUTICALS.map(p => p.name));

    if (!query) {
      console.log("No query provided");
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Process query - remove common suffixes and extra words
    let processedQuery = query.toLowerCase();
    // Remove common suffixes that might cause search issues
    const commonSuffixes = ['supplement', 'pill', 'medication', 'medicine', 'drug', 'capsule', 'tablet'];
    commonSuffixes.forEach(suffix => {
      processedQuery = processedQuery.replace(new RegExp(`\\s${suffix}s?\\b`, 'gi'), '');
    });
    
    // Handle common spelling variants
    const spellingVariants: Record<string, string[]> = {
      'ibuprofen': ['ibuprofin', 'ibuprophen', 'ibuprofen'],
      'acetaminophen': ['acetaminophen', 'acetaminofin', 'acetaminophine', 'tylenol'],
      'tylenol': ['tylanol', 'tylenol', 'tilenol'],
      'vitamin': ['vitamine', 'vitamin', 'vitamins'],
      'melatonin': ['melatonine', 'melatonin', 'melatonen']
    };
    
    // Find if any variant matches and replace with standard spelling
    Object.entries(spellingVariants).forEach(([standard, variants]) => {
      variants.forEach(variant => {
        if (processedQuery.includes(variant)) {
          processedQuery = processedQuery.replace(new RegExp(variant, 'gi'), standard);
        }
      });
    });
    
    processedQuery = processedQuery.trim();
    console.log("Processed query:", processedQuery);

    // Find pharmaceutical by name (case insensitive)
    // Make the search more flexible by checking if query is included anywhere in name,
    // category, ingredients, or benefits
    const pharmaceutical = MOCK_PHARMACEUTICALS.find(p => {
      const lowerName = p.name.toLowerCase();
      const lowerCategory = p.category.toLowerCase();
      const lowerIngredients = p.ingredients.map(i => i.toLowerCase());
      const lowerBenefits = p.benefits.map(b => b.toLowerCase());
      
      // Check name - split by words for partial matching
      const nameWords = processedQuery.split(/\s+/);
      const nameMatch = nameWords.some(word => {
        return word.length > 2 && lowerName.includes(word);
      }) || lowerName.includes(processedQuery);
      
      // Check category
      const categoryMatch = lowerCategory.includes(processedQuery);
      
      // Check ingredients - more lenient matching
      const ingredientMatch = lowerIngredients.some(ingredient => {
        // Try to match by word parts
        return processedQuery.split(/\s+/).some(word => 
          word.length > 2 && ingredient.includes(word)
        );
      });
      
      // Check benefits
      const benefitMatch = lowerBenefits.some(benefit => {
        return processedQuery.split(/\s+/).some(word => 
          word.length > 2 && benefit.includes(word)
        );
      });
      
      console.log(`Checking ${p.name}: name=${nameMatch}, category=${categoryMatch}, ingredients=${ingredientMatch}, benefits=${benefitMatch}`);
      
      return nameMatch || categoryMatch || ingredientMatch || benefitMatch;
    });

    console.log("Found pharmaceutical:", pharmaceutical);

    if (!pharmaceutical) {
      console.log("No pharmaceutical found for query:", query);
      // Let's attempt to find a close match for a helpful error
      const allNames = MOCK_PHARMACEUTICALS.map(p => p.name.toLowerCase());
      const closeMatches = allNames.filter(name => {
        // Check if any part of the query matches any part of the name
        return processedQuery.split(/\s+/).some(word => 
          word.length > 2 && name.includes(word)
        );
      });
      
      console.log("Close matches:", closeMatches);
      return NextResponse.json([]);
    }

    // Find natural remedies for the pharmaceutical
    const remedies = MOCK_REMEDY_MAPPINGS[pharmaceutical.id] || [];
    console.log(`Found ${remedies.length} remedies for ${pharmaceutical.name}:`, remedies);

    return NextResponse.json(remedies);
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
