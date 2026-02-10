/**
 * Mock data fallback for remedy details.
 * Used when the database is unavailable.
 */
export const DETAILED_REMEDIES: Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    matchingNutrients: string[];
    similarityScore: number;
    usage: string;
    dosage: string;
    precautions: string;
    scientificInfo: string;
    references: { title: string; url: string }[];
    relatedRemedies: { id: string; name: string }[];
  }
> = {
  "101": {
    id: "101",
    name: "Sunlight Exposure",
    description:
      "Natural vitamin D production through sunlight exposure on skin.",
    imageUrl: "",
    category: "Lifestyle Change",
    matchingNutrients: ["Vitamin D3"],
    similarityScore: 0.9,
    usage:
      "Spend 15-30 minutes in direct sunlight a few times a week, with arms and legs exposed.",
    dosage:
      "15-30 minutes of sun exposure to face, arms, and legs 2-3 times per week.",
    precautions:
      "Avoid sunburn. Limit exposure during peak sun hours (10 am - 4 pm).",
    scientificInfo:
      "When UVB rays from the sun hit the skin, they interact with 7-dehydrocholesterol to produce vitamin D3.",
    references: [
      {
        title: 'Vitamin D: The "sunshine" vitamin',
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3356951/",
      },
    ],
    relatedRemedies: [
      { id: "102", name: "Fatty Fish" },
      { id: "103", name: "Mushrooms" },
    ],
  },
  "102": {
    id: "102",
    name: "Fatty Fish",
    description: "Salmon, mackerel, and other fatty fish rich in vitamin D.",
    imageUrl: "",
    category: "Food Source",
    matchingNutrients: ["Vitamin D3", "Omega-3"],
    similarityScore: 0.8,
    usage:
      "Include fatty fish like salmon, mackerel, sardines, or herring in your diet regularly.",
    dosage:
      "Consuming fatty fish 2-3 times per week is recommended. A 3.5-ounce serving can provide 200-700 IU of vitamin D.",
    precautions:
      "Be mindful of mercury content in some fish. Pregnant women and young children should follow specific guidelines.",
    scientificInfo:
      "Fatty fish contain vitamin D3 (cholecalciferol), the same form your skin produces when exposed to sunlight.",
    references: [
      {
        title: "Vitamin D in Fish",
        url: "https://www.mdpi.com/2072-6643/10/12/1876",
      },
    ],
    relatedRemedies: [
      { id: "101", name: "Sunlight Exposure" },
      { id: "104", name: "Wild-Caught Fatty Fish" },
    ],
  },
  "103": {
    id: "103",
    name: "Turmeric",
    description: "Contains curcumin which has anti-inflammatory properties.",
    imageUrl: "",
    category: "Herbal Remedy",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
    usage:
      "Turmeric can be used in cooking, taken as a supplement, or made into a paste for topical application.",
    dosage:
      "500-2,000 mg of turmeric extract per day. For cooking, 1-2 teaspoons of ground turmeric per day.",
    precautions:
      "May interact with blood thinners, diabetes medications, and acid-reducing medications.",
    scientificInfo:
      "Curcumin inhibits the activity of COX-2 and 5-LOX enzymes, similar to how NSAIDs work.",
    references: [
      {
        title: "Curcumin: A Review of Its Effects on Human Health",
        url: "https://www.mdpi.com/2072-6643/9/10/1047",
      },
    ],
    relatedRemedies: [
      { id: "104", name: "Ginger" },
      { id: "105", name: "Willow Bark" },
    ],
  },
  "104": {
    id: "104",
    name: "Ginger",
    description: "Root with anti-inflammatory and digestive properties.",
    imageUrl: "",
    category: "Herbal Remedy",
    matchingNutrients: ["Gingerols", "Shogaols"],
    similarityScore: 0.8,
    usage:
      "Can be used fresh, dried, powdered, or as an oil or juice. Add to foods, brew as tea, or take as a supplement.",
    dosage:
      "1-2g of ginger powder, 1-2 teaspoons of fresh ginger, or 400-500mg of extract 2-3 times daily.",
    precautions:
      "May interact with blood thinners and diabetes medications. High doses might cause mild heartburn.",
    scientificInfo:
      "Ginger contains gingerols and shogaols that have powerful anti-inflammatory and antioxidant effects.",
    references: [
      {
        title: "Ginger on Human Health: A Comprehensive Review",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
      },
    ],
    relatedRemedies: [
      { id: "103", name: "Turmeric" },
      { id: "105", name: "Willow Bark" },
    ],
  },
};
