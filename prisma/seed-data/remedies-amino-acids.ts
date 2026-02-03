// Amino acids and protein-based natural remedies
export const aminoAcidRemedies = [
  {
    name: 'L-Theanine',
    description: 'Calming amino acid from tea that promotes relaxation without drowsiness and enhances focus.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Theanine']),
    benefits: JSON.stringify(['Relaxation without sedation', 'Focus enhancement', 'Sleep quality', 'Stress reduction', 'Cognitive support']),
    usage: 'Can be taken any time. Often combined with caffeine for focused alertness.',
    dosage: '100-400 mg daily; 100-200 mg with caffeine for focus',
    precautions: 'Generally very safe. May enhance effects of blood pressure medications.',
    scientificInfo: 'L-theanine increases alpha brain waves, promoting relaxed alertness. It modulates GABA, dopamine, and serotonin.',
    references: JSON.stringify([
      'Nobre AC, et al. L-theanine, a natural constituent in tea, and its effect on mental state. Asia Pac J Clin Nutr. 2008;17(S1):167-168.',
      'Owen GN, et al. The combined effects of L-theanine and caffeine on cognitive performance and mood. Nutr Neurosci. 2008;11(4):193-198.'
    ]),
    relatedRemedies: JSON.stringify(['Green Tea', 'GABA', 'Magnesium']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'L-Tyrosine',
    description: 'Precursor amino acid to dopamine, norepinephrine, and thyroid hormones supporting mental performance under stress.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Tyrosine', 'N-Acetyl-L-Tyrosine']),
    benefits: JSON.stringify(['Stress resilience', 'Mental performance', 'Mood support', 'Thyroid function', 'Focus under pressure']),
    usage: 'Take on empty stomach for best absorption. Morning dosing preferred.',
    dosage: '500-2000 mg daily on empty stomach',
    precautions: 'May interact with thyroid medications and MAOIs. Avoid with hyperthyroidism.',
    scientificInfo: 'Tyrosine is the rate-limiting precursor for catecholamine synthesis. Supplementation supports performance during stress-induced catecholamine depletion.',
    references: JSON.stringify([
      'Jongkees BJ, et al. Effect of tyrosine supplementation on clinical and healthy populations under stress or cognitive demands. J Psychiatr Res. 2015;70:50-57.',
      'Colzato LS, et al. Food for creativity: tyrosine promotes deep thinking. Psychol Res. 2015;79(5):709-714.'
    ]),
    relatedRemedies: JSON.stringify(['Phenylalanine', 'B-Complex', 'Rhodiola Rosea']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'L-Tryptophan',
    description: 'Essential amino acid precursor to serotonin and melatonin, supporting mood and sleep.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Tryptophan']),
    benefits: JSON.stringify(['Sleep support', 'Mood balance', 'Serotonin production', 'Anxiety relief']),
    usage: 'Take in evening for sleep, or with carbohydrates to enhance brain uptake.',
    dosage: '500-2000 mg daily; 500-1000 mg before bed for sleep',
    precautions: 'Do not combine with SSRIs or MAOIs due to serotonin syndrome risk. Start with lower doses.',
    scientificInfo: 'Tryptophan is converted to 5-HTP, then to serotonin, and finally to melatonin. It competes with other amino acids for brain transport.',
    references: JSON.stringify([
      'Silber BY, Schmitt JA. Effects of tryptophan loading on human cognition, mood, and sleep. Neurosci Biobehav Rev. 2010;34(3):387-407.',
      'Hudson C, et al. Protein source tryptophan versus pharmaceutical grade tryptophan as an efficacious treatment for chronic insomnia. Nutr Neurosci. 2005;8(2):121-127.'
    ]),
    relatedRemedies: JSON.stringify(['5-HTP', 'Melatonin', 'Vitamin B6']),
    evidenceLevel: 'Moderate'
  },
  {
    name: '5-HTP (5-Hydroxytryptophan)',
    description: 'Direct serotonin precursor for mood, sleep, and appetite support.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['5-Hydroxytryptophan', 'Griffonia simplicifolia extract']),
    benefits: JSON.stringify(['Mood support', 'Sleep quality', 'Appetite control', 'Migraine prevention', 'Anxiety relief']),
    usage: 'Take with food to reduce nausea. Evening dosing for sleep.',
    dosage: '50-300 mg daily in divided doses',
    precautions: 'Do NOT combine with SSRIs, SNRIs, or MAOIs - risk of serotonin syndrome. Start low.',
    scientificInfo: '5-HTP crosses the blood-brain barrier and is directly converted to serotonin. Bypasses rate-limiting tryptophan hydroxylase step.',
    references: JSON.stringify([
      'Birdsall TC. 5-Hydroxytryptophan: a clinically-effective serotonin precursor. Altern Med Rev. 1998;3(4):271-280.',
      'Shaw K, et al. Tryptophan and 5-hydroxytryptophan for depression. Cochrane Database Syst Rev. 2002;(1):CD003198.'
    ]),
    relatedRemedies: JSON.stringify(['L-Tryptophan', 'SAMe', 'Vitamin B6']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'GABA (Gamma-Aminobutyric Acid)',
    description: 'Inhibitory neurotransmitter supplement for relaxation and calm.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Gamma-aminobutyric acid', 'GABA']),
    benefits: JSON.stringify(['Relaxation', 'Stress relief', 'Sleep support', 'Growth hormone support']),
    usage: 'Take before bed or during stressful situations.',
    dosage: '250-750 mg daily',
    precautions: 'Debate exists about blood-brain barrier crossing. May cause tingling sensation.',
    scientificInfo: 'Oral GABA may act on peripheral GABA receptors and enteric nervous system. Some evidence suggests limited BBB crossing.',
    references: JSON.stringify([
      'Abdou AM, et al. Relaxation and immunity enhancement effects of gamma-aminobutyric acid (GABA) administration in humans. Biofactors. 2006;26(3):201-208.',
      'Boonstra E, et al. Neurotransmitters as food supplements: the effects of GABA on brain and behavior. Front Psychol. 2015;6:1520.'
    ]),
    relatedRemedies: JSON.stringify(['L-Theanine', 'Magnesium', 'Pharma GABA']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'L-Glutamine',
    description: 'Most abundant amino acid in the body, essential for gut health, immune function, and muscle recovery.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Glutamine']),
    benefits: JSON.stringify(['Gut health', 'Immune support', 'Muscle recovery', 'Blood sugar stability', 'Alcohol craving reduction']),
    usage: 'Take on empty stomach or post-workout. Powder dissolves easily in water.',
    dosage: '5-15 g daily; higher doses for gut healing',
    precautions: 'Generally safe. Those with kidney or liver disease should consult healthcare provider.',
    scientificInfo: 'Glutamine is primary fuel for enterocytes and immune cells. Critical for maintaining intestinal barrier integrity.',
    references: JSON.stringify([
      'Kim MH, Kim H. The Roles of Glutamine in the Intestine and Its Implication in Intestinal Diseases. Int J Mol Sci. 2017;18(5):1051.',
      'Cruzat V, et al. Glutamine: Metabolism and Immune Function. Nutrients. 2018;10(11):1564.'
    ]),
    relatedRemedies: JSON.stringify(['Zinc Carnosine', 'Probiotics', 'Collagen']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'N-Acetyl Cysteine (NAC)',
    description: 'Precursor to glutathione with powerful antioxidant, detoxification, and respiratory support.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['N-Acetyl-L-Cysteine', 'NAC']),
    benefits: JSON.stringify(['Liver support', 'Glutathione production', 'Respiratory health', 'Mental health support', 'Detoxification']),
    usage: 'Take with food to reduce GI effects. Can be taken away from other antioxidants.',
    dosage: '600-1800 mg daily in divided doses',
    precautions: 'May interact with nitroglycerin. Use caution with bleeding disorders.',
    scientificInfo: 'NAC provides cysteine for glutathione synthesis and has direct antioxidant effects. Used medically for acetaminophen overdose.',
    references: JSON.stringify([
      'Mokhtari V, et al. A Review on Various Uses of N-Acetyl Cysteine. Cell J. 2017;19(1):11-17.',
      'Dean O, et al. N-acetyl cysteine in psychiatry: current therapeutic evidence and potential mechanisms of action. J Psychiatry Neurosci. 2011;36(2):78-86.'
    ]),
    relatedRemedies: JSON.stringify(['Glutathione', 'Milk Thistle', 'Alpha-Lipoic Acid']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'L-Carnitine',
    description: 'Amino acid derivative transporting fatty acids into mitochondria for energy production.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Carnitine', 'Acetyl-L-Carnitine', 'ALCAR']),
    benefits: JSON.stringify(['Energy production', 'Fat metabolism', 'Exercise recovery', 'Heart health', 'Cognitive support (ALCAR)']),
    usage: 'Take with food. ALCAR form better for cognitive benefits.',
    dosage: '500-2000 mg daily; ALCAR 500-1500 mg for cognitive support',
    precautions: 'May cause fishy body odor at high doses. TMAO concerns debated.',
    scientificInfo: 'Carnitine shuttles long-chain fatty acids into mitochondria. ALCAR crosses blood-brain barrier for neurological support.',
    references: JSON.stringify([
      'Fielding R, et al. L-Carnitine Supplementation in Recovery after Exercise. Nutrients. 2018;10(3):349.',
      'Malaguarnera M, et al. Acetyl-L-carnitine treatment in elderly patients with fatigue. Arch Gerontol Geriatr. 2008;46(2):181-190.'
    ]),
    relatedRemedies: JSON.stringify(['CoQ10', 'Alpha-Lipoic Acid', 'PQQ']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Acetyl-L-Carnitine (ALCAR)',
    description: 'Brain-penetrating form of carnitine supporting cognitive function and nerve health.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Acetyl-L-Carnitine']),
    benefits: JSON.stringify(['Cognitive function', 'Memory support', 'Nerve health', 'Energy', 'Mood support']),
    usage: 'Take in morning on empty stomach for cognitive effects.',
    dosage: '500-1500 mg daily',
    precautions: 'May be stimulating for some. Start with lower doses.',
    scientificInfo: 'ALCAR provides acetyl groups for acetylcholine synthesis and supports mitochondrial function in neurons.',
    references: JSON.stringify([
      'Montgomery SA, et al. Meta-analysis of double-blind randomized controlled trials of acetyl-L-carnitine versus placebo in depression. J Affect Disord. 2003;75(2):159-168.',
      'Pettegrew JW, et al. Clinical and neurochemical effects of acetyl-L-carnitine in Alzheimers disease. Neurobiol Aging. 1995;16(1):1-4.'
    ]),
    relatedRemedies: JSON.stringify(['Alpha-GPC', 'Lions Mane', 'Phosphatidylserine']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Glycine',
    description: 'Simple amino acid with calming effects, supporting sleep and collagen production.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Glycine']),
    benefits: JSON.stringify(['Sleep quality', 'Collagen synthesis', 'Detoxification support', 'Cognitive function', 'Blood sugar support']),
    usage: 'Take before bed for sleep. Can also be used throughout day.',
    dosage: '3-5 g before bed for sleep; 3-10 g daily for other benefits',
    precautions: 'Generally very safe. May enhance effects of antipsychotic medications.',
    scientificInfo: 'Glycine acts as an inhibitory neurotransmitter and reduces core body temperature, promoting sleep. Essential for glutathione synthesis.',
    references: JSON.stringify([
      'Inagawa K, et al. Subjective effects of glycine ingestion before bedtime on sleep quality. Sleep Biol Rhythms. 2006;4:75-77.',
      'Bannai M, et al. The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers. Front Neurol. 2012;3:61.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium Glycinate', 'Collagen', 'L-Theanine']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Taurine',
    description: 'Amino acid supporting heart health, eye health, and nervous system function.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Taurine', 'L-Taurine']),
    benefits: JSON.stringify(['Heart health', 'Eye health', 'Nervous system support', 'Electrolyte balance', 'Antioxidant']),
    usage: 'Can be taken any time. Often depleted by alcohol consumption.',
    dosage: '500-2000 mg daily',
    precautions: 'Generally very safe. May potentiate effects of some medications.',
    scientificInfo: 'Taurine modulates calcium signaling, has membrane-stabilizing effects, and acts as an antioxidant. Highest concentrations in heart and retina.',
    references: JSON.stringify([
      'Schaffer S, Kim HW. Effects and Mechanisms of Taurine as a Therapeutic Agent. Biomol Ther. 2018;26(3):225-241.',
      'Waldron M, et al. The Effects of an Oral Taurine Dose on Exercise Performance. Amino Acids. 2018;50(5):555-566.'
    ]),
    relatedRemedies: JSON.stringify(['Magnesium', 'CoQ10', 'L-Carnitine']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Branched-Chain Amino Acids (BCAAs)',
    description: 'Essential amino acids (leucine, isoleucine, valine) supporting muscle protein synthesis and recovery.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Leucine', 'L-Isoleucine', 'L-Valine']),
    benefits: JSON.stringify(['Muscle recovery', 'Exercise performance', 'Muscle protein synthesis', 'Reduced muscle soreness']),
    usage: 'Take before, during, or after exercise. Typical ratio is 2:1:1 leucine:isoleucine:valine.',
    dosage: '5-10 g daily around exercise',
    precautions: 'Those with maple syrup urine disease should avoid. May affect blood sugar.',
    scientificInfo: 'BCAAs are metabolized directly in muscle tissue. Leucine is the primary trigger for mTOR-mediated protein synthesis.',
    references: JSON.stringify([
      'Shimomura Y, et al. Nutraceutical effects of branched-chain amino acids on skeletal muscle. J Nutr. 2006;136(2):529S-532S.',
      'Fouré A, Bendahan D. Is Branched-Chain Amino Acids Supplementation an Efficient Nutritional Strategy to Alleviate Skeletal Muscle Damage? Nutrients. 2017;9(10):1047.'
    ]),
    relatedRemedies: JSON.stringify(['Whey Protein', 'Creatine', 'HMB']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Creatine Monohydrate',
    description: 'Naturally occurring compound supporting energy production, strength, and cognitive function.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Creatine monohydrate']),
    benefits: JSON.stringify(['Strength and power', 'Muscle mass', 'Cognitive function', 'Exercise capacity', 'Recovery']),
    usage: 'Take daily consistently. Loading phase optional. Mix with water or juice.',
    dosage: '3-5 g daily; or 20 g daily for 5-7 days loading then 3-5 g maintenance',
    precautions: 'Stay well hydrated. Generally very safe with extensive research.',
    scientificInfo: 'Creatine phosphate regenerates ATP during high-intensity exercise. Brain also uses creatine for energy.',
    references: JSON.stringify([
      'Kreider RB, et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr. 2017;14:18.',
      'Avgerinos KI, et al. Effects of creatine supplementation on cognitive function: systematic review and meta-analysis. Exp Gerontol. 2018;108:166-173.'
    ]),
    relatedRemedies: JSON.stringify(['BCAAs', 'Beta-Alanine', 'HMB']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Beta-Alanine',
    description: 'Amino acid increasing muscle carnosine for improved exercise capacity and reduced fatigue.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Beta-alanine']),
    benefits: JSON.stringify(['Exercise endurance', 'Reduced muscle fatigue', 'High-intensity performance', 'Muscle carnosine']),
    usage: 'Take daily split into multiple doses to reduce tingling. Sustained-release forms available.',
    dosage: '3.2-6.4 g daily in divided doses',
    precautions: 'Causes harmless tingling (paresthesia) that subsides with continued use.',
    scientificInfo: 'Beta-alanine is the rate-limiting precursor to carnosine, which buffers hydrogen ions in muscle during high-intensity exercise.',
    references: JSON.stringify([
      'Hobson RM, et al. Effects of beta-alanine supplementation on exercise performance: a meta-analysis. Amino Acids. 2012;43(1):25-37.',
      'Trexler ET, et al. International society of sports nutrition position stand: Beta-Alanine. J Int Soc Sports Nutr. 2015;12:30.'
    ]),
    relatedRemedies: JSON.stringify(['Creatine', 'Citrulline', 'BCAAs']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'L-Citrulline',
    description: 'Amino acid supporting nitric oxide production for circulation and exercise performance.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Citrulline', 'Citrulline malate']),
    benefits: JSON.stringify(['Blood flow', 'Exercise performance', 'Nitric oxide production', 'Erectile function support', 'Blood pressure support']),
    usage: 'Take 30-60 minutes before exercise. Citrulline malate form provides additional malic acid.',
    dosage: '3-6 g L-citrulline or 6-8 g citrulline malate before exercise',
    precautions: 'Generally safe. May enhance effects of blood pressure medications.',
    scientificInfo: 'Citrulline is converted to arginine in kidneys, providing sustained nitric oxide production. More effective than direct arginine supplementation.',
    references: JSON.stringify([
      'Perez-Guisado J, Jakeman PM. Citrulline malate enhances athletic anaerobic performance and relieves muscle soreness. J Strength Cond Res. 2010;24(5):1215-1222.',
      'Bailey SJ, et al. L-Citrulline supplementation improves O2 uptake kinetics and high-intensity exercise performance. J Appl Physiol. 2015;119(4):385-395.'
    ]),
    relatedRemedies: JSON.stringify(['L-Arginine', 'Beetroot', 'Nitric Oxide Support']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'L-Arginine',
    description: 'Semi-essential amino acid precursor to nitric oxide for cardiovascular and immune function.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['L-Arginine']),
    benefits: JSON.stringify(['Cardiovascular support', 'Blood pressure', 'Immune function', 'Wound healing', 'Erectile function']),
    usage: 'Take on empty stomach. L-citrulline may be more effective for nitric oxide.',
    dosage: '3-6 g daily in divided doses',
    precautions: 'May interact with blood pressure medications and Viagra. Avoid after heart attack. May activate herpes outbreaks.',
    scientificInfo: 'Arginine is the substrate for nitric oxide synthase. However, first-pass metabolism limits effectiveness compared to citrulline.',
    references: JSON.stringify([
      'Bai Y, et al. Increase in fasting vascular endothelial function after short-term oral L-arginine. Eur J Clin Invest. 2009;39(3):200-207.',
      'Dong JY, et al. Effect of oral L-arginine supplementation on blood pressure: a meta-analysis. Am Heart J. 2011;162(6):959-965.'
    ]),
    relatedRemedies: JSON.stringify(['L-Citrulline', 'Beetroot', 'Pycnogenol']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Collagen Peptides',
    description: 'Hydrolyzed protein supporting skin, joint, bone, and gut health.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Hydrolyzed collagen', 'Collagen peptides', 'Type I collagen', 'Type II collagen']),
    benefits: JSON.stringify(['Skin health', 'Joint support', 'Bone density', 'Gut health', 'Hair and nail strength']),
    usage: 'Mix in hot or cold beverages. Type I/III for skin; Type II for joints.',
    dosage: '10-15 g daily',
    precautions: 'Generally very safe. Source quality matters (grass-fed, marine).',
    scientificInfo: 'Collagen peptides are absorbed and distributed to connective tissues. May stimulate fibroblast collagen production.',
    references: JSON.stringify([
      'Proksch E, et al. Oral supplementation of specific collagen peptides has beneficial effects on human skin physiology. Skin Pharmacol Physiol. 2014;27(1):47-55.',
      'Zdzieblik D, et al. Collagen peptide supplementation in combination with resistance training improves body composition. Br J Nutr. 2015;114(8):1237-1245.'
    ]),
    relatedRemedies: JSON.stringify(['Vitamin C', 'Hyaluronic Acid', 'Silica']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Whey Protein',
    description: 'Complete protein from milk supporting muscle synthesis, immune function, and satiety.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Whey protein concentrate', 'Whey protein isolate', 'Whey protein hydrolysate']),
    benefits: JSON.stringify(['Muscle protein synthesis', 'Weight management', 'Immune support', 'Blood sugar regulation', 'Satiety']),
    usage: 'Post-workout or as meal replacement. Isolate form for lactose sensitivity.',
    dosage: '20-40 g per serving; total protein needs vary by body weight and activity',
    precautions: 'Dairy allergy or lactose intolerance may limit use. Choose quality sources.',
    scientificInfo: 'Whey is rapidly absorbed and rich in leucine, maximally stimulating muscle protein synthesis. Contains immunoglobulins and lactoferrin.',
    references: JSON.stringify([
      'Morton RW, et al. A systematic review of protein supplements and their effects on muscle mass and strength. Br J Sports Med. 2018;52(6):376-384.',
      'Devries MC, Phillips SM. Supplemental protein in support of muscle mass and health: advantage whey. J Food Sci. 2015;80(S1):A8-A15.'
    ]),
    relatedRemedies: JSON.stringify(['BCAAs', 'Creatine', 'Casein Protein']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'SAMe (S-Adenosyl-L-Methionine)',
    description: 'Natural compound involved in methylation, supporting mood, liver function, and joint health.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['S-Adenosyl-L-Methionine', 'SAMe']),
    benefits: JSON.stringify(['Mood support', 'Joint health', 'Liver support', 'Methylation support']),
    usage: 'Take on empty stomach for mood benefits. Enteric-coated forms preferred.',
    dosage: '400-1600 mg daily for mood; 600-1200 mg for joints',
    precautions: 'Do not combine with SSRIs or MAOIs. May trigger mania in bipolar disorder. Start with low doses.',
    scientificInfo: 'SAMe is a methyl donor involved in neurotransmitter synthesis, cartilage formation, and liver metabolism. Comparable to antidepressants in trials.',
    references: JSON.stringify([
      'Sharma A, et al. S-Adenosylmethionine (SAMe) for treatment of depression: a meta-analysis. BMC Psychiatry. 2017;17(1):144.',
      'Najm WI, et al. S-adenosyl methionine (SAMe) versus celecoxib for the treatment of osteoarthritis symptoms. BMC Musculoskelet Disord. 2004;5:6.'
    ]),
    relatedRemedies: JSON.stringify(['B-Complex', 'Folate', 'Betaine']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Betaine (TMG)',
    description: 'Methyl donor supporting liver function, homocysteine metabolism, and exercise performance.',
    category: 'Amino Acid',
    ingredients: JSON.stringify(['Trimethylglycine', 'Betaine anhydrous']),
    benefits: JSON.stringify(['Homocysteine reduction', 'Liver support', 'Exercise performance', 'Methylation support', 'Digestive support']),
    usage: 'Take with food. Betaine HCl is different (digestive support).',
    dosage: '500-3000 mg daily for methylation; 2500-6000 mg for exercise',
    precautions: 'May cause digestive upset initially. Those with high cholesterol should monitor lipids.',
    scientificInfo: 'Betaine donates methyl groups to homocysteine, converting it to methionine. Supports cellular hydration as an osmolyte.',
    references: JSON.stringify([
      'Olthof MR, Verhoef P. Effects of betaine intake on plasma homocysteine concentrations. Curr Drug Metab. 2005;6(1):15-22.',
      'Cholewa JM, et al. Effects of betaine on body composition, performance, and homocysteine thiolactone. J Int Soc Sports Nutr. 2013;10(1):39.'
    ]),
    relatedRemedies: JSON.stringify(['SAMe', 'B-Complex', 'Folate']),
    evidenceLevel: 'Moderate'
  }
]
