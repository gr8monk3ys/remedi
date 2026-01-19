/**
 * Mock data for fallback search when database and FDA API don't have results
 */

import type { ProcessedDrug, NaturalRemedy } from './types';

export const MOCK_PHARMACEUTICALS: ProcessedDrug[] = [
  {
    id: '1',
    fdaId: 'mock-1',
    name: 'Vitamin D3 Supplement',
    description: 'Helps with calcium absorption and bone health',
    category: 'Vitamin Supplement',
    ingredients: ['Vitamin D3', 'Calcium', 'Magnesium'],
    benefits: ['Bone health', 'Immune support', 'Mood regulation'],
    similarityScore: 1.0,
  },
  {
    id: '2',
    fdaId: 'mock-2',
    name: 'Ibuprofen',
    description:
      'Non-steroidal anti-inflammatory drug (NSAID) used for pain relief and reducing inflammation',
    category: 'Pain Reliever',
    ingredients: ['Ibuprofen'],
    benefits: ['Pain relief', 'Reduces inflammation', 'Fever reduction'],
    similarityScore: 1.0,
  },
  {
    id: '3',
    fdaId: 'mock-3',
    name: 'Melatonin',
    description: 'Hormone that regulates sleep cycles',
    category: 'Sleep Aid',
    ingredients: ['Melatonin'],
    benefits: ['Sleep regulation', 'Jet lag treatment'],
    similarityScore: 1.0,
  },
  {
    id: '4',
    fdaId: 'mock-4',
    name: 'Fish Oil Supplement',
    description: 'Rich in omega-3 fatty acids',
    category: 'Nutritional Supplement',
    ingredients: ['EPA', 'DHA', 'Omega-3 fatty acids'],
    benefits: ['Heart health', 'Brain function', 'Reduces inflammation'],
    similarityScore: 1.0,
  },
  {
    id: '5',
    fdaId: 'mock-5',
    name: 'Omeprazole',
    description: 'Proton pump inhibitor used to treat acid reflux and heartburn',
    category: 'Digestive Health',
    ingredients: ['Omeprazole'],
    benefits: ['Reduces stomach acid', 'Heartburn relief', 'Treats acid reflux'],
    similarityScore: 1.0,
  },
  {
    id: '6',
    fdaId: 'mock-6',
    name: 'Tylenol (Acetaminophen)',
    description: 'Pain reliever and fever reducer',
    category: 'Pain Reliever',
    ingredients: ['Acetaminophen'],
    benefits: ['Pain relief', 'Fever reduction', 'Headache relief'],
    similarityScore: 1.0,
  },
];

export const MOCK_REMEDY_MAPPINGS: Record<string, NaturalRemedy[]> = {
  '1': [
    // Vitamin D3 Supplement
    {
      id: '101',
      name: 'Sunlight Exposure',
      description: 'Natural way to boost vitamin D production',
      imageUrl:
        'https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Lifestyle Change',
      matchingNutrients: ['Vitamin D'],
      similarityScore: 0.95,
    },
    {
      id: '102',
      name: 'Fatty Fish',
      description: 'Natural source of vitamin D and omega-3 fatty acids',
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Food Source',
      matchingNutrients: ['Vitamin D', 'Calcium'],
      similarityScore: 0.8,
    },
  ],
  '2': [
    // Ibuprofen
    {
      id: '103',
      name: 'Turmeric',
      description: 'Natural anti-inflammatory spice containing curcumin',
      imageUrl:
        'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Anti-inflammatory compounds'],
      similarityScore: 0.75,
    },
    {
      id: '104',
      name: 'Ginger',
      description: 'Root with anti-inflammatory and digestive properties',
      imageUrl:
        'https://images.unsplash.com/photo-1573414404380-7cccfbd3c123?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Anti-inflammatory compounds'],
      similarityScore: 0.7,
    },
  ],
  '3': [
    // Melatonin
    {
      id: '105',
      name: 'Tart Cherry Juice',
      description: 'Natural source of melatonin and anti-inflammatory compounds',
      imageUrl:
        'https://images.unsplash.com/photo-1596413801212-81206c300da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Food Source',
      matchingNutrients: ['Melatonin'],
      similarityScore: 0.85,
    },
    {
      id: '106',
      name: 'Chamomile Tea',
      description: 'Herb tea with calming properties',
      imageUrl:
        'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Sleep-promoting compounds'],
      similarityScore: 0.65,
    },
  ],
  '4': [
    // Fish Oil Supplement
    {
      id: '102',
      name: 'Fatty Fish',
      description: 'Natural source of vitamin D and omega-3 fatty acids',
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Food Source',
      matchingNutrients: ['Omega-3 fatty acids', 'EPA', 'DHA'],
      similarityScore: 0.9,
    },
  ],
  '5': [
    // Omeprazole
    {
      id: '107',
      name: 'Aloe Vera',
      description: 'Plant with soothing and healing properties',
      imageUrl:
        'https://images.unsplash.com/photo-1596276021663-0c3a68ce627d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Digestive soothing compounds'],
      similarityScore: 0.6,
    },
    {
      id: '108',
      name: 'Apple Cider Vinegar',
      description: 'Fermented apple product with digestive benefits',
      imageUrl:
        'https://images.unsplash.com/photo-1598704710590-4dcf6e59836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Supplement',
      matchingNutrients: ['Digestive regulation compounds'],
      similarityScore: 0.55,
    },
  ],
  '6': [
    // Tylenol (Acetaminophen)
    {
      id: '109',
      name: 'White Willow Bark',
      description:
        'Natural ingredient that contains salicin, a compound similar to aspirin',
      imageUrl:
        'https://images.unsplash.com/photo-1502467722427-648b2980717e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Anti-inflammatory compounds', 'Pain-relieving properties'],
      similarityScore: 0.75,
    },
    {
      id: '110',
      name: 'Peppermint Oil',
      description: 'Essential oil used for pain relief and headaches',
      imageUrl:
        'https://images.unsplash.com/photo-1559135081-9a065a1c7df3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      category: 'Herbal Remedy',
      matchingNutrients: ['Menthol', 'Pain-relieving compounds'],
      similarityScore: 0.7,
    },
  ],
};
