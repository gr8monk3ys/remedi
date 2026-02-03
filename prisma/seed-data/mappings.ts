// Mappings between pharmaceuticals and natural remedies
// Each mapping includes: pharmaceuticalName, naturalRemedyName, similarityScore, matchingNutrients, replacementType

export const remedyMappings = [
  // NSAIDs and Pain Relief - Ibuprofen alternatives
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.75, matchingNutrients: JSON.stringify(['Curcumin', 'Anti-inflammatory compounds']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Ginger Root', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Gingerols', 'Anti-inflammatory compounds']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Boswellia (Indian Frankincense)', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Boswellic acids', 'Anti-inflammatory']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'White Willow Bark', similarityScore: 0.78, matchingNutrients: JSON.stringify(['Salicin', 'Natural aspirin precursor']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Devils Claw', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Harpagosides', 'Anti-inflammatory']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['EPA', 'DHA', 'Anti-inflammatory fatty acids']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Ibuprofen', naturalRemedyName: 'Bromelain', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Proteolytic enzymes', 'Anti-inflammatory']), replacementType: 'Supportive' },

  // Aspirin alternatives
  { pharmaceuticalName: 'Aspirin', naturalRemedyName: 'White Willow Bark', similarityScore: 0.82, matchingNutrients: JSON.stringify(['Salicin', 'Natural aspirin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Aspirin', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Curcumin', 'Anti-inflammatory']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Aspirin', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['EPA', 'DHA', 'Blood thinning properties']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Aspirin', naturalRemedyName: 'Garlic (Allium sativum)', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Allicin', 'Blood thinning']), replacementType: 'Supportive' },

  // Naproxen alternatives
  { pharmaceuticalName: 'Naproxen', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Curcumin', 'Anti-inflammatory']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Naproxen', naturalRemedyName: 'Boswellia (Indian Frankincense)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Boswellic acids']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Naproxen', naturalRemedyName: 'Ginger Root', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Gingerols']), replacementType: 'Complementary' },

  // Acetaminophen alternatives
  { pharmaceuticalName: 'Acetaminophen', naturalRemedyName: 'White Willow Bark', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Salicin', 'Pain relief']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Acetaminophen', naturalRemedyName: 'Ginger Root', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Gingerols', 'Pain relief']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Acetaminophen', naturalRemedyName: 'Feverfew', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Parthenolide', 'Headache relief']), replacementType: 'Supportive' },

  // SSRI antidepressant alternatives
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: 'St. Johns Wort (Hypericum perforatum)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Hypericin', 'Hyperforin', 'Serotonin modulation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: 'SAMe (S-Adenosyl-L-Methionine)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['SAMe', 'Neurotransmitter support']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: 'Saffron (Crocus sativus)', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Crocin', 'Safranal', 'Mood support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['EPA', 'DHA', 'Brain health']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: 'Rhodiola Rosea', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Rosavins', 'Salidroside', 'Mood support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sertraline', naturalRemedyName: '5-HTP (5-Hydroxytryptophan)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['5-HTP', 'Serotonin precursor']), replacementType: 'Complementary' },

  { pharmaceuticalName: 'Fluoxetine', naturalRemedyName: 'St. Johns Wort (Hypericum perforatum)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Hypericin', 'Hyperforin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Fluoxetine', naturalRemedyName: 'SAMe (S-Adenosyl-L-Methionine)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['SAMe']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Fluoxetine', naturalRemedyName: 'Saffron (Crocus sativus)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Crocin']), replacementType: 'Complementary' },

  { pharmaceuticalName: 'Escitalopram', naturalRemedyName: 'St. Johns Wort (Hypericum perforatum)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Hypericin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Escitalopram', naturalRemedyName: 'SAMe (S-Adenosyl-L-Methionine)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['SAMe']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Escitalopram', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Withanolides', 'Stress adaptation']), replacementType: 'Supportive' },

  // Benzodiazepine anxiolytic alternatives
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'Kava (Piper methysticum)', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Kavalactones', 'GABA modulation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'Passionflower (Passiflora incarnata)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Chrysin', 'GABA support']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'L-Theanine', similarityScore: 0.65, matchingNutrients: JSON.stringify(['L-Theanine', 'Calm focus']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'Valerian Root', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Valerenic acid', 'GABA support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Magnesium', 'Glycine', 'Nervous system support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Withanolides', 'Stress adaptation']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Alprazolam', naturalRemedyName: 'GABA (Gamma-Aminobutyric Acid)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['GABA']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Lorazepam', naturalRemedyName: 'Kava (Piper methysticum)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Kavalactones']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Lorazepam', naturalRemedyName: 'Passionflower (Passiflora incarnata)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Chrysin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Lorazepam', naturalRemedyName: 'Valerian Root', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Valerenic acid']), replacementType: 'Complementary' },

  { pharmaceuticalName: 'Diazepam', naturalRemedyName: 'Kava (Piper methysticum)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Kavalactones']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Diazepam', naturalRemedyName: 'Valerian Root', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Valerenic acid', 'Muscle relaxation']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Diazepam', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Magnesium', 'Muscle relaxation']), replacementType: 'Supportive' },

  // Non-benzodiazepine anxiolytic
  { pharmaceuticalName: 'Buspirone', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Withanolides']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Buspirone', naturalRemedyName: 'L-Theanine', similarityScore: 0.65, matchingNutrients: JSON.stringify(['L-Theanine']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Buspirone', naturalRemedyName: 'Lavender', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Linalool']), replacementType: 'Complementary' },

  // Sleep medication alternatives
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'Melatonin', similarityScore: 0.75, matchingNutrients: JSON.stringify(['Melatonin', 'Sleep hormone']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'Valerian Root', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Valerenic acid', 'Sleep support']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Magnesium', 'Glycine', 'Sleep support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'L-Theanine', similarityScore: 0.58, matchingNutrients: JSON.stringify(['L-Theanine', 'Relaxation']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'Passionflower (Passiflora incarnata)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Chrysin']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Zolpidem', naturalRemedyName: 'Glycine', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Glycine']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Eszopiclone', naturalRemedyName: 'Melatonin', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Melatonin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Eszopiclone', naturalRemedyName: 'Valerian Root', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Valerenic acid']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Diphenhydramine', naturalRemedyName: 'Melatonin', similarityScore: 0.78, matchingNutrients: JSON.stringify(['Melatonin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Diphenhydramine', naturalRemedyName: 'Chamomile', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Apigenin', 'Relaxation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Diphenhydramine', naturalRemedyName: 'Valerian Root', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Valerenic acid']), replacementType: 'Alternative' },

  // Statin alternatives
  { pharmaceuticalName: 'Atorvastatin', naturalRemedyName: 'Berberine', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Berberine', 'Cholesterol modulation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Atorvastatin', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['EPA', 'DHA', 'Triglyceride reduction']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Atorvastatin', naturalRemedyName: 'Garlic (Allium sativum)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Allicin', 'Cholesterol support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Atorvastatin', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.50, matchingNutrients: JSON.stringify(['CoQ10', 'Statin support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Atorvastatin', naturalRemedyName: 'Artichoke Leaf Extract', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Cynarin', 'Cholesterol support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Simvastatin', naturalRemedyName: 'Berberine', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Berberine']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Simvastatin', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['CoQ10']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Rosuvastatin', naturalRemedyName: 'Berberine', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Berberine']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Rosuvastatin', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['CoQ10']), replacementType: 'Supportive' },

  // Blood pressure medication alternatives
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'Hibiscus', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Anthocyanins', 'ACE inhibition']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'Garlic (Allium sativum)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Allicin', 'Blood pressure support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Magnesium', 'Vasodilation']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['CoQ10', 'Blood pressure support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'Olive Leaf Extract', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Oleuropein', 'ACE inhibition']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Lisinopril', naturalRemedyName: 'Hawthorn Berry', similarityScore: 0.55, matchingNutrients: JSON.stringify(['OPCs', 'Cardiovascular support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Losartan', naturalRemedyName: 'Hibiscus', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Anthocyanins']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Losartan', naturalRemedyName: 'Olive Leaf Extract', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Oleuropein']), replacementType: 'Complementary' },

  { pharmaceuticalName: 'Metoprolol', naturalRemedyName: 'Hawthorn Berry', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Flavonoids', 'Heart rate support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Metoprolol', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Magnesium', 'Heart rhythm']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metoprolol', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['CoQ10']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Amlodipine', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Magnesium', 'Calcium channel effects']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Amlodipine', naturalRemedyName: 'Hawthorn Berry', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Flavonoids']), replacementType: 'Supportive' },

  // Diabetes medication alternatives
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Berberine', similarityScore: 0.78, matchingNutrients: JSON.stringify(['Berberine', 'AMPK activation', 'Blood sugar control']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Cinnamon (Ceylon)', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Cinnamaldehyde', 'Insulin sensitivity']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Bitter Melon (Momordica charantia)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Charantin', 'Blood sugar support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Gymnema Sylvestre', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Gymnemic acids', 'Sugar craving reduction']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Alpha-Lipoic Acid', similarityScore: 0.55, matchingNutrients: JSON.stringify(['ALA', 'Insulin sensitivity']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Chromium Picolinate', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Chromium', 'Insulin sensitivity']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Metformin', naturalRemedyName: 'Fenugreek', similarityScore: 0.52, matchingNutrients: JSON.stringify(['4-hydroxyisoleucine', 'Blood sugar support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Glipizide', naturalRemedyName: 'Berberine', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Berberine']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Glipizide', naturalRemedyName: 'Gymnema Sylvestre', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Gymnemic acids']), replacementType: 'Supportive' },

  // PPI alternatives
  { pharmaceuticalName: 'Omeprazole', naturalRemedyName: 'DGL Licorice', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Glycyrrhizin-free licorice', 'Mucosal protection']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Omeprazole', naturalRemedyName: 'Slippery Elm', similarityScore: 0.62, matchingNutrients: JSON.stringify(['Mucilage', 'Soothing']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Omeprazole', naturalRemedyName: 'Aloe Vera (Internal)', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Acemannan', 'Soothing']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Omeprazole', naturalRemedyName: 'Zinc Carnosine', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Zinc L-carnosine', 'Mucosal healing']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Omeprazole', naturalRemedyName: 'Digestive Enzymes', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Enzymes', 'Digestive support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Pantoprazole', naturalRemedyName: 'DGL Licorice', similarityScore: 0.65, matchingNutrients: JSON.stringify(['DGL']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Pantoprazole', naturalRemedyName: 'Zinc Carnosine', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Zinc carnosine']), replacementType: 'Complementary' },

  // Antihistamine alternatives
  { pharmaceuticalName: 'Cetirizine', naturalRemedyName: 'Quercetin', similarityScore: 0.72, matchingNutrients: JSON.stringify(['Quercetin', 'Mast cell stabilization']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Cetirizine', naturalRemedyName: 'Stinging Nettle (Urtica dioica)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Histamine modulation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Cetirizine', naturalRemedyName: 'Bromelain', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Bromelain', 'Anti-inflammatory']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Cetirizine', naturalRemedyName: 'Vitamin C (Ascorbic Acid)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Vitamin C', 'Histamine reduction']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Cetirizine', naturalRemedyName: 'Butterbur (Petasites hybridus)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Petasin', 'Allergy relief']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Loratadine', naturalRemedyName: 'Quercetin', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Quercetin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Loratadine', naturalRemedyName: 'Stinging Nettle (Urtica dioica)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Leaf extract']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Fexofenadine', naturalRemedyName: 'Quercetin', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Quercetin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Fexofenadine', naturalRemedyName: 'Butterbur (Petasites hybridus)', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Petasin']), replacementType: 'Alternative' },

  // Migraine medication alternatives
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'Feverfew', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Parthenolide', 'Migraine prevention']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'Butterbur (Petasites hybridus)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Petasin', 'Migraine prevention']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Magnesium', 'Migraine prevention']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'Vitamin B2 (Riboflavin)', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Riboflavin', 'Migraine prevention']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['CoQ10', 'Migraine prevention']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sumatriptan', naturalRemedyName: 'Ginger Root', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Gingerols', 'Nausea relief']), replacementType: 'Supportive' },

  // ADHD medication alternatives
  { pharmaceuticalName: 'Methylphenidate', naturalRemedyName: 'L-Theanine', similarityScore: 0.55, matchingNutrients: JSON.stringify(['L-Theanine', 'Focus']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Methylphenidate', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['EPA', 'DHA', 'Brain function']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Methylphenidate', naturalRemedyName: 'Zinc Picolinate', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Zinc', 'Neurotransmitter support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Methylphenidate', naturalRemedyName: 'Bacopa Monnieri', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Bacosides', 'Cognitive support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Methylphenidate', naturalRemedyName: 'Green Tea Extract (EGCG)', similarityScore: 0.48, matchingNutrients: JSON.stringify(['L-Theanine', 'Caffeine', 'Focus']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Amphetamine/Dextroamphetamine', naturalRemedyName: 'L-Tyrosine', similarityScore: 0.52, matchingNutrients: JSON.stringify(['L-Tyrosine', 'Dopamine precursor']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Amphetamine/Dextroamphetamine', naturalRemedyName: 'Rhodiola Rosea', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Rosavins', 'Mental performance']), replacementType: 'Supportive' },

  // Thyroid medication alternatives
  { pharmaceuticalName: 'Levothyroxine', naturalRemedyName: 'Selenium', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Selenium', 'Thyroid conversion']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Levothyroxine', naturalRemedyName: 'Iodine', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Iodine', 'Thyroid hormone synthesis']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Levothyroxine', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Withanolides', 'Thyroid support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Levothyroxine', naturalRemedyName: 'L-Tyrosine', similarityScore: 0.50, matchingNutrients: JSON.stringify(['L-Tyrosine', 'Thyroid hormone precursor']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Levothyroxine', naturalRemedyName: 'Zinc Picolinate', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Zinc', 'Thyroid function']), replacementType: 'Supportive' },

  // Muscle relaxant alternatives
  { pharmaceuticalName: 'Cyclobenzaprine', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Magnesium', 'Muscle relaxation']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Cyclobenzaprine', naturalRemedyName: 'Valerian Root', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Valerenic acid', 'Muscle relaxation']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Cyclobenzaprine', naturalRemedyName: 'Kava (Piper methysticum)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Kavalactones', 'Muscle relaxation']), replacementType: 'Complementary' },

  // Neuropathic pain alternatives
  { pharmaceuticalName: 'Gabapentin', naturalRemedyName: 'Alpha-Lipoic Acid', similarityScore: 0.62, matchingNutrients: JSON.stringify(['ALA', 'Nerve health']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Gabapentin', naturalRemedyName: 'Acetyl-L-Carnitine (ALCAR)', similarityScore: 0.58, matchingNutrients: JSON.stringify(['ALCAR', 'Nerve regeneration']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Gabapentin', naturalRemedyName: 'B-Complex', similarityScore: 0.55, matchingNutrients: JSON.stringify(['B vitamins', 'Nerve health']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Gabapentin', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Magnesium', 'Nerve function']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Pregabalin', naturalRemedyName: 'Alpha-Lipoic Acid', similarityScore: 0.60, matchingNutrients: JSON.stringify(['ALA']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Pregabalin', naturalRemedyName: 'Acetyl-L-Carnitine (ALCAR)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['ALCAR']), replacementType: 'Complementary' },

  // ED medication alternatives
  { pharmaceuticalName: 'Sildenafil', naturalRemedyName: 'L-Citrulline', similarityScore: 0.60, matchingNutrients: JSON.stringify(['L-Citrulline', 'Nitric oxide']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Sildenafil', naturalRemedyName: 'L-Arginine', similarityScore: 0.55, matchingNutrients: JSON.stringify(['L-Arginine', 'Nitric oxide']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Sildenafil', naturalRemedyName: 'Tongkat Ali (Eurycoma longifolia)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Eurycomanone', 'Testosterone support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Sildenafil', naturalRemedyName: 'Maca Root', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Macamides', 'Libido support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Tadalafil', naturalRemedyName: 'L-Citrulline', similarityScore: 0.58, matchingNutrients: JSON.stringify(['L-Citrulline']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Tadalafil', naturalRemedyName: 'L-Arginine', similarityScore: 0.52, matchingNutrients: JSON.stringify(['L-Arginine']), replacementType: 'Complementary' },

  // Joint pain alternatives
  { pharmaceuticalName: 'Celecoxib', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Curcumin', 'COX-2 inhibition']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Celecoxib', naturalRemedyName: 'Boswellia (Indian Frankincense)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Boswellic acids', '5-LOX inhibition']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Celecoxib', naturalRemedyName: 'Glucosamine Sulfate', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Glucosamine', 'Joint support']), replacementType: 'Supportive' },

  // Gout alternatives
  { pharmaceuticalName: 'Allopurinol', naturalRemedyName: 'Tart Cherry Juice', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Anthocyanins', 'Uric acid support']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Allopurinol', naturalRemedyName: 'Vitamin C (Ascorbic Acid)', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Vitamin C', 'Uric acid reduction']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Allopurinol', naturalRemedyName: 'Quercetin', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Quercetin', 'Xanthine oxidase']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Colchicine', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Curcumin', 'Anti-inflammatory']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Colchicine', naturalRemedyName: 'Tart Cherry Juice', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Anthocyanins']), replacementType: 'Supportive' },

  // Prostate alternatives
  { pharmaceuticalName: 'Tadalafil', naturalRemedyName: 'Saw Palmetto', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Fatty acids', 'Prostate support']), replacementType: 'Supportive' },

  // Osteoporosis alternatives
  { pharmaceuticalName: 'Alendronate', naturalRemedyName: 'Vitamin K2 (Menaquinone)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['MK-7', 'Calcium direction']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Alendronate', naturalRemedyName: 'Vitamin D3 (Cholecalciferol)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Vitamin D3', 'Calcium absorption']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Alendronate', naturalRemedyName: 'Calcium Citrate', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Calcium', 'Bone mineral']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Alendronate', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Magnesium', 'Bone health']), replacementType: 'Supportive' },

  // Supplement-to-supplement mappings
  { pharmaceuticalName: 'Vitamin D3 Supplement', naturalRemedyName: 'Sunlight Exposure', similarityScore: 0.95, matchingNutrients: JSON.stringify(['Vitamin D synthesis']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Vitamin D3 Supplement', naturalRemedyName: 'Cod Liver Oil', similarityScore: 0.75, matchingNutrients: JSON.stringify(['Vitamin D3', 'Vitamin A']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Fish Oil Supplement', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.98, matchingNutrients: JSON.stringify(['EPA', 'DHA']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Fish Oil Supplement', naturalRemedyName: 'Krill Oil', similarityScore: 0.85, matchingNutrients: JSON.stringify(['Phospholipid EPA/DHA']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Fish Oil Supplement', naturalRemedyName: 'Algae Oil (Vegan Omega-3)', similarityScore: 0.80, matchingNutrients: JSON.stringify(['Algal DHA']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Melatonin Supplement', naturalRemedyName: 'Melatonin', similarityScore: 0.98, matchingNutrients: JSON.stringify(['Melatonin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Melatonin Supplement', naturalRemedyName: 'Tart Cherry Juice', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Natural melatonin']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Magnesium Supplement', naturalRemedyName: 'Magnesium Glycinate', similarityScore: 0.95, matchingNutrients: JSON.stringify(['Magnesium']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Magnesium Supplement', naturalRemedyName: 'Magnesium Citrate', similarityScore: 0.90, matchingNutrients: JSON.stringify(['Magnesium']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Magnesium Supplement', naturalRemedyName: 'Magnesium L-Threonate', similarityScore: 0.85, matchingNutrients: JSON.stringify(['Magnesium']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Magnesium Supplement', naturalRemedyName: 'Epsom Salt Bath', similarityScore: 0.60, matchingNutrients: JSON.stringify(['Magnesium sulfate']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Calcium Supplement', naturalRemedyName: 'Calcium Citrate', similarityScore: 0.95, matchingNutrients: JSON.stringify(['Calcium']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Probiotic Supplement', naturalRemedyName: 'Multi-Strain Probiotic', similarityScore: 0.95, matchingNutrients: JSON.stringify(['Probiotics']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Probiotic Supplement', naturalRemedyName: 'Lactobacillus Acidophilus', similarityScore: 0.80, matchingNutrients: JSON.stringify(['L. acidophilus']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Probiotic Supplement', naturalRemedyName: 'Saccharomyces Boulardii', similarityScore: 0.75, matchingNutrients: JSON.stringify(['S. boulardii']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Probiotic Supplement', naturalRemedyName: 'Fermented Foods (General)', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Natural probiotics']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Iron Supplement', naturalRemedyName: 'Iron Bisglycinate', similarityScore: 0.95, matchingNutrients: JSON.stringify(['Iron']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'B-Complex Supplement', naturalRemedyName: 'B-Complex', similarityScore: 0.98, matchingNutrients: JSON.stringify(['B vitamins']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'CoQ10 Supplement', naturalRemedyName: 'CoQ10 (Coenzyme Q10)', similarityScore: 0.98, matchingNutrients: JSON.stringify(['CoQ10']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Glucosamine/Chondroitin Supplement', naturalRemedyName: 'Glucosamine Sulfate', similarityScore: 0.90, matchingNutrients: JSON.stringify(['Glucosamine']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Glucosamine/Chondroitin Supplement', naturalRemedyName: 'Chondroitin Sulfate', similarityScore: 0.88, matchingNutrients: JSON.stringify(['Chondroitin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Glucosamine/Chondroitin Supplement', naturalRemedyName: 'MSM (Methylsulfonylmethane)', similarityScore: 0.75, matchingNutrients: JSON.stringify(['MSM']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Glucosamine/Chondroitin Supplement', naturalRemedyName: 'Collagen Peptides', similarityScore: 0.70, matchingNutrients: JSON.stringify(['Collagen']), replacementType: 'Complementary' },

  // Immune support
  { pharmaceuticalName: 'Vitamin D3 Supplement', naturalRemedyName: 'Elderberry (Sambucus nigra)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Immune support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'Vitamin D3 Supplement', naturalRemedyName: 'Echinacea', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Immune support']), replacementType: 'Complementary' },

  // Energy and fatigue
  { pharmaceuticalName: 'B-Complex Supplement', naturalRemedyName: 'Rhodiola Rosea', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Energy support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'B-Complex Supplement', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Energy support']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'B-Complex Supplement', naturalRemedyName: 'Cordyceps Mushroom', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Energy support']), replacementType: 'Complementary' },

  // Cognitive support
  { pharmaceuticalName: 'CoQ10 Supplement', naturalRemedyName: 'Lions Mane Mushroom', similarityScore: 0.50, matchingNutrients: JSON.stringify(['Brain health']), replacementType: 'Complementary' },
  { pharmaceuticalName: 'CoQ10 Supplement', naturalRemedyName: 'Bacopa Monnieri', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Cognitive support']), replacementType: 'Complementary' },

  // Additional antidepressant support
  { pharmaceuticalName: 'Paroxetine', naturalRemedyName: 'St. Johns Wort (Hypericum perforatum)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Hypericin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Citalopram', naturalRemedyName: 'St. Johns Wort (Hypericum perforatum)', similarityScore: 0.68, matchingNutrients: JSON.stringify(['Hypericin']), replacementType: 'Alternative' },

  { pharmaceuticalName: 'Venlafaxine', naturalRemedyName: 'SAMe (S-Adenosyl-L-Methionine)', similarityScore: 0.60, matchingNutrients: JSON.stringify(['SAMe']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Venlafaxine', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.52, matchingNutrients: JSON.stringify(['EPA', 'DHA']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Duloxetine', naturalRemedyName: 'SAMe (S-Adenosyl-L-Methionine)', similarityScore: 0.58, matchingNutrients: JSON.stringify(['SAMe']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Duloxetine', naturalRemedyName: 'Alpha-Lipoic Acid', similarityScore: 0.55, matchingNutrients: JSON.stringify(['ALA', 'Neuropathic support']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Bupropion', naturalRemedyName: 'L-Tyrosine', similarityScore: 0.55, matchingNutrients: JSON.stringify(['L-Tyrosine', 'Dopamine precursor']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Bupropion', naturalRemedyName: 'Rhodiola Rosea', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Rosavins']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Mirtazapine', naturalRemedyName: 'Ashwagandha (Withania somnifera)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Withanolides']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Mirtazapine', naturalRemedyName: 'Valerian Root', similarityScore: 0.52, matchingNutrients: JSON.stringify(['Valerenic acid']), replacementType: 'Supportive' },

  { pharmaceuticalName: 'Trazodone', naturalRemedyName: 'Melatonin', similarityScore: 0.65, matchingNutrients: JSON.stringify(['Melatonin']), replacementType: 'Alternative' },
  { pharmaceuticalName: 'Trazodone', naturalRemedyName: 'Valerian Root', similarityScore: 0.58, matchingNutrients: JSON.stringify(['Valerenic acid']), replacementType: 'Alternative' },

  // Prednisone support
  { pharmaceuticalName: 'Prednisone', naturalRemedyName: 'Turmeric (Curcumin)', similarityScore: 0.55, matchingNutrients: JSON.stringify(['Curcumin', 'Anti-inflammatory']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Prednisone', naturalRemedyName: 'Omega-3 Fish Oil (EPA/DHA)', similarityScore: 0.50, matchingNutrients: JSON.stringify(['EPA', 'DHA']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Prednisone', naturalRemedyName: 'Vitamin D3 (Cholecalciferol)', similarityScore: 0.48, matchingNutrients: JSON.stringify(['Vitamin D', 'Bone protection']), replacementType: 'Supportive' },
  { pharmaceuticalName: 'Prednisone', naturalRemedyName: 'Calcium Citrate', similarityScore: 0.45, matchingNutrients: JSON.stringify(['Calcium', 'Bone protection']), replacementType: 'Supportive' }
]
