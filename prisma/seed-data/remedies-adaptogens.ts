// Adaptogenic herbs and functional mushrooms
export const adaptogenRemedies = [
  {
    name: 'Eleuthero (Siberian Ginseng)',
    description: 'Classic adaptogen supporting stress resilience, physical endurance, and immune function.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Eleutherosides', 'Polysaccharides']),
    benefits: JSON.stringify(['Stress adaptation', 'Physical endurance', 'Immune support', 'Mental performance', 'Fatigue reduction']),
    usage: 'Take in morning. Can be used long-term. Cycle 8 weeks on, 2 weeks off.',
    dosage: '300-1200 mg extract daily standardized to eleutherosides',
    precautions: 'May interact with blood thinners and diabetes medications. Avoid with high blood pressure.',
    scientificInfo: 'Eleutherosides modulate HPA axis response and support immune cell function. Unlike true ginseng, does not contain ginsenosides.',
    references: JSON.stringify([
      'Panossian A, Wikman G. Evidence-based efficacy of adaptogens in fatigue. Curr Clin Pharmacol. 2009;4(3):198-219.',
      'Cicero AF, et al. Effects of Siberian ginseng on physical performance. Sports Med. 2004;34(1):35-42.'
    ]),
    relatedRemedies: JSON.stringify(['Rhodiola Rosea', 'Ashwagandha', 'Panax Ginseng']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Panax Ginseng (Korean/Asian Ginseng)',
    description: 'Renowned root supporting energy, cognitive function, and overall vitality.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Ginsenosides', 'Panaxosides', 'Polysaccharides']),
    benefits: JSON.stringify(['Energy support', 'Cognitive function', 'Immune modulation', 'Blood sugar support', 'Erectile function']),
    usage: 'Morning dosing preferred. Red ginseng is steamed, more warming. Cycle use recommended.',
    dosage: '200-400 mg standardized extract daily; or 1-2 g root powder',
    precautions: 'May be stimulating. Avoid with insomnia, anxiety, or hypertension. May interact with blood thinners and diabetes medications.',
    scientificInfo: 'Ginsenosides modulate multiple signaling pathways including nitric oxide production, HPA axis, and immune function.',
    references: JSON.stringify([
      'Reay JL, et al. Effects of Panax ginseng on aspects of mental performance. Psychopharmacology. 2010;211(4):461-474.',
      'Shishtar E, et al. The effect of ginseng (the genus Panax) on glycemic control: a systematic review. PLoS One. 2014;9(9):e107391.'
    ]),
    relatedRemedies: JSON.stringify(['American Ginseng', 'Eleuthero', 'Rhodiola Rosea']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'American Ginseng (Panax quinquefolius)',
    description: 'Cooler, more calming ginseng variety supporting energy, immunity, and blood sugar.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Ginsenosides', 'Rb1', 'Rg1']),
    benefits: JSON.stringify(['Energy support', 'Immune function', 'Blood sugar support', 'Cognitive function', 'Calm energy']),
    usage: 'Can be taken any time. Less stimulating than Asian ginseng.',
    dosage: '200-400 mg extract daily or 1-3 g dried root',
    precautions: 'May affect blood sugar. Interact with diabetes medications and warfarin.',
    scientificInfo: 'American ginseng has higher Rb1:Rg1 ratio than Asian ginseng, contributing to its calmer energizing effects.',
    references: JSON.stringify([
      'Scholey A, et al. Effects of American ginseng on neurocognitive function. Psychopharmacology. 2010;212(3):345-356.',
      'Vuksan V, et al. American ginseng reduces postprandial glycemia in nondiabetic subjects and subjects with type 2 diabetes mellitus. Arch Intern Med. 2000;160(7):1009-1013.'
    ]),
    relatedRemedies: JSON.stringify(['Panax Ginseng', 'Eleuthero', 'Ashwagandha']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Schisandra Berry',
    description: 'Five-flavor berry supporting liver health, stress adaptation, and mental performance.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Schisandrins', 'Lignans', 'Organic acids']),
    benefits: JSON.stringify(['Liver support', 'Stress adaptation', 'Mental clarity', 'Physical endurance', 'Skin health']),
    usage: 'Take with food. Berry or extract forms available.',
    dosage: '500-2000 mg dried berry or 100-300 mg extract daily',
    precautions: 'May cause heartburn in some. Avoid during pregnancy.',
    scientificInfo: 'Schisandrins have hepatoprotective effects and modulate cortisol. The five flavors reflect actions on all five organ systems in TCM.',
    references: JSON.stringify([
      'Panossian A, Wikman G. Pharmacology of Schisandra chinensis Bail.: an overview of Russian research and uses in medicine. J Ethnopharmacol. 2008;118(2):183-212.',
      'Park JY, et al. Schisandrae Fructus: A Review of Its Phytochemistry and Pharmacology. Molecules. 2014;19(3):3384-3407.'
    ]),
    relatedRemedies: JSON.stringify(['Milk Thistle', 'Rhodiola Rosea', 'Eleuthero']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Cordyceps Mushroom',
    description: 'Prized functional mushroom supporting energy, athletic performance, and respiratory function.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Cordycepin', 'Beta-glucans', 'Adenosine']),
    benefits: JSON.stringify(['Energy and stamina', 'Athletic performance', 'Respiratory health', 'Immune support', 'Libido support']),
    usage: 'Take in morning or before exercise. CS-4 and militaris are cultivated forms.',
    dosage: '1000-3000 mg daily',
    precautions: 'May interact with immunosuppressants. Caution in autoimmune conditions.',
    scientificInfo: 'Cordycepin enhances ATP production and oxygen utilization. Traditional use for kidney and lung support.',
    references: JSON.stringify([
      'Hirsch KR, et al. Cordyceps militaris Improves Tolerance to High-Intensity Exercise. J Diet Suppl. 2017;14(1):42-53.',
      'Tuli HS, et al. Pharmacological and therapeutic potential of Cordyceps with special reference to Cordycepin. 3 Biotech. 2014;4(1):1-12.'
    ]),
    relatedRemedies: JSON.stringify(['Reishi Mushroom', 'Lions Mane', 'Rhodiola Rosea']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Reishi Mushroom (Ganoderma lucidum)',
    description: 'Mushroom of immortality in TCM, supporting immune balance, sleep, and stress resilience.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Triterpenoids', 'Beta-glucans', 'Polysaccharides']),
    benefits: JSON.stringify(['Immune modulation', 'Sleep quality', 'Stress reduction', 'Liver support', 'Longevity support']),
    usage: 'Take in evening for sleep benefits. Can be used long-term.',
    dosage: '1500-9000 mg dried mushroom or 980-3000 mg extract daily',
    precautions: 'May interact with blood thinners and immunosuppressants. Rare liver toxicity reported with some products.',
    scientificInfo: 'Beta-glucans modulate immune cell activity. Triterpenoids have anti-inflammatory and hepatoprotective effects.',
    references: JSON.stringify([
      'Wachtel-Galor S, et al. Ganoderma lucidum (Lingzhi or Reishi): A Medicinal Mushroom. In: Herbal Medicine: Biomolecular and Clinical Aspects. 2011.',
      'Jin X, et al. Ganoderma lucidum (Reishi mushroom) for cancer treatment. Cochrane Database Syst Rev. 2016;4:CD007731.'
    ]),
    relatedRemedies: JSON.stringify(['Cordyceps', 'Turkey Tail', 'Chaga']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Lions Mane Mushroom',
    description: 'Brain-supporting mushroom promoting nerve growth factor and cognitive function.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Hericenones', 'Erinacines', 'Beta-glucans']),
    benefits: JSON.stringify(['Cognitive function', 'Nerve regeneration', 'Memory support', 'Mood balance', 'Gut health']),
    usage: 'Can be taken any time. Best with food.',
    dosage: '500-3000 mg daily',
    precautions: 'Generally well tolerated. May cause itchy skin in sensitive individuals.',
    scientificInfo: 'Hericenones and erinacines stimulate nerve growth factor (NGF) synthesis, supporting neurogenesis and myelin formation.',
    references: JSON.stringify([
      'Mori K, et al. Improving effects of the mushroom Yamabushitake on mild cognitive impairment. Phytother Res. 2009;23(3):367-372.',
      'Lai PL, et al. Neurotrophic properties of the Lions mane medicinal mushroom. Int J Med Mushrooms. 2013;15(6):539-554.'
    ]),
    relatedRemedies: JSON.stringify(['Bacopa Monnieri', 'Phosphatidylserine', 'Ginkgo Biloba']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Chaga Mushroom',
    description: 'Siberian fungus with powerful antioxidant and immune-supporting properties.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Betulinic acid', 'Beta-glucans', 'Melanin', 'Polyphenols']),
    benefits: JSON.stringify(['Antioxidant protection', 'Immune support', 'Inflammation modulation', 'Blood sugar support']),
    usage: 'Traditionally prepared as tea. Dual extraction captures all compounds.',
    dosage: '1000-3000 mg daily or 1-2 cups tea',
    precautions: 'May lower blood sugar. High oxalate content - caution with kidney stones.',
    scientificInfo: 'Chaga has one of the highest ORAC values among foods. Betulinic acid from birch trees has unique biological activity.',
    references: JSON.stringify([
      'Glamoclija J, et al. Chemical characterization and biological activity of Chaga. J Ethnopharmacol. 2015;162:323-332.',
      'Lemieszek MK, et al. Anticancer effects of fraction isolated from Inonotus obliquus. BMC Complement Altern Med. 2011;11:16.'
    ]),
    relatedRemedies: JSON.stringify(['Reishi', 'Turkey Tail', 'Astragalus']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Turkey Tail Mushroom (Trametes versicolor)',
    description: 'Colorful polypore mushroom with extensive research for immune support, especially during cancer treatment.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['PSK (Polysaccharide-K)', 'PSP (Polysaccharopeptide)', 'Beta-glucans']),
    benefits: JSON.stringify(['Immune modulation', 'Gut health', 'Cancer support (adjunctive)', 'Antioxidant']),
    usage: 'Can be taken long-term. Often used as adjunctive therapy.',
    dosage: '1000-3000 mg daily',
    precautions: 'May interact with immunosuppressants. Discuss with oncologist if using during cancer treatment.',
    scientificInfo: 'PSK is approved in Japan as adjunctive cancer therapy. Enhances natural killer cell activity and gut microbiome.',
    references: JSON.stringify([
      'Pallav K, et al. Effects of polysaccharopeptide from Trametes versicolor and amoxicillin on the gut microbiome. Gut Microbes. 2014;5(4):458-467.',
      'Fritz H, et al. Polysaccharide K and Coriolus versicolor extracts for lung cancer: a systematic review. Integr Cancer Ther. 2015;14(3):201-211.'
    ]),
    relatedRemedies: JSON.stringify(['Reishi', 'Maitake', 'Shiitake']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Maitake Mushroom',
    description: 'Hen of the woods mushroom supporting immune function and metabolic health.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['D-fraction', 'Beta-glucans', 'Polysaccharides']),
    benefits: JSON.stringify(['Immune support', 'Blood sugar regulation', 'Blood pressure support', 'Cancer support (adjunctive)']),
    usage: 'Can be consumed as food or supplement. D-fraction is concentrated extract.',
    dosage: '500-2500 mg daily or 0.5-1 mg/kg D-fraction',
    precautions: 'May lower blood sugar and blood pressure. Monitor if on related medications.',
    scientificInfo: 'Maitake D-fraction activates macrophages, dendritic cells, and natural killer cells. May improve insulin sensitivity.',
    references: JSON.stringify([
      'Konno S, et al. A possible hypoglycaemic effect of maitake mushroom on Type 2 diabetic patients. Diabet Med. 2001;18(12):1010.',
      'Kodama N, et al. Effects of D-fraction, a polysaccharide from Grifola frondosa on tumor growth involve activation of NK cells. Biol Pharm Bull. 2002;25(12):1647-1650.'
    ]),
    relatedRemedies: JSON.stringify(['Shiitake', 'Turkey Tail', 'Reishi']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Shiitake Mushroom',
    description: 'Culinary and medicinal mushroom supporting immune function and cardiovascular health.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Lentinan', 'Beta-glucans', 'Eritadenine']),
    benefits: JSON.stringify(['Immune support', 'Cholesterol support', 'Cardiovascular health', 'Antiviral']),
    usage: 'Can be consumed fresh, dried, or as extract.',
    dosage: '5-15 g dried mushrooms or 1000-3000 mg extract daily',
    precautions: 'Raw shiitake can cause dermatitis in some people. Cook before eating.',
    scientificInfo: 'Lentinan is approved in Japan as adjunctive cancer therapy. Eritadenine has cholesterol-lowering effects.',
    references: JSON.stringify([
      'Dai X, et al. Consuming Lentinula edodes (Shiitake) Mushrooms Daily Improves Human Immunity. J Am Coll Nutr. 2015;34(6):478-487.',
      'Wasser SP. Medicinal mushrooms as a source of antitumor and immunomodulating polysaccharides. Appl Microbiol Biotechnol. 2002;60(3):258-274.'
    ]),
    relatedRemedies: JSON.stringify(['Maitake', 'Reishi', 'Turkey Tail']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Bacopa Monnieri',
    description: 'Ayurvedic brain tonic herb supporting memory, learning, and cognitive longevity.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Bacosides A and B', 'Bacopasides', 'Alkaloids']),
    benefits: JSON.stringify(['Memory enhancement', 'Learning support', 'Anxiety reduction', 'Neuroprotection', 'Attention improvement']),
    usage: 'Take with food (fat enhances absorption). Effects build over 8-12 weeks.',
    dosage: '300-450 mg daily standardized to 55% bacosides',
    precautions: 'May cause GI upset. Start with lower doses. May have mild sedative effect.',
    scientificInfo: 'Bacosides enhance synaptic communication and have antioxidant effects in the hippocampus. Modulates serotonin and acetylcholine.',
    references: JSON.stringify([
      'Kongkeaw C, et al. Meta-analysis of randomized controlled trials on cognitive effects of Bacopa monnieri extract. J Ethnopharmacol. 2014;151(1):528-535.',
      'Stough C, et al. The chronic effects of an extract of Bacopa monniera on cognitive function in healthy human subjects. Psychopharmacology. 2001;156(4):481-484.'
    ]),
    relatedRemedies: JSON.stringify(['Lions Mane', 'Ginkgo Biloba', 'Gotu Kola']),
    evidenceLevel: 'Strong'
  },
  {
    name: 'Gotu Kola',
    description: 'Brain and longevity herb from Ayurveda supporting cognition, circulation, and wound healing.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Asiaticoside', 'Madecassoside', 'Triterpenoids']),
    benefits: JSON.stringify(['Cognitive support', 'Anxiety relief', 'Wound healing', 'Venous health', 'Skin health']),
    usage: 'Can be taken as tea, tincture, or capsules.',
    dosage: '500-1000 mg extract daily or 1-2 g dried herb',
    precautions: 'May cause drowsiness. Rare liver toxicity reported with prolonged high-dose use.',
    scientificInfo: 'Triterpenoids stimulate collagen synthesis and have anxiolytic effects. Enhances GABA activity.',
    references: JSON.stringify([
      'Wattanathorn J, et al. Positive modulation of cognition and mood in the healthy elderly by standardized extract of Centella asiatica. J Ethnopharmacol. 2008;116(2):325-332.',
      'Jana U, et al. A clinical study on the management of generalized anxiety disorder with Centella asiatica. Nepal Med Coll J. 2010;12(1):8-11.'
    ]),
    relatedRemedies: JSON.stringify(['Bacopa Monnieri', 'Brahmi', 'Ashwagandha']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Mucuna Pruriens (Velvet Bean)',
    description: 'Natural source of L-DOPA supporting dopamine levels, mood, and libido.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['L-DOPA', 'Serotonin', '5-HTP']),
    benefits: JSON.stringify(['Mood support', 'Dopamine support', 'Libido enhancement', 'Testosterone support', 'Stress adaptation']),
    usage: 'Take on empty stomach for best absorption. Morning dosing preferred.',
    dosage: '200-500 mg extract standardized to 15-20% L-DOPA',
    precautions: 'Do not combine with MAOIs or Parkinsons medications without medical supervision. May affect blood sugar.',
    scientificInfo: 'L-DOPA crosses blood-brain barrier and is converted to dopamine. Also reduces cortisol and prolactin in some studies.',
    references: JSON.stringify([
      'Shukla KK, et al. Mucuna pruriens improves male fertility by its action on the hypothalamus-pituitary-gonadal axis. Fertil Steril. 2009;92(6):1934-1940.',
      'Katzenschlager R, et al. Mucuna pruriens in Parkinsons disease: a double-blind clinical and pharmacological study. J Neurol Neurosurg Psychiatry. 2004;75(12):1672-1677.'
    ]),
    relatedRemedies: JSON.stringify(['L-Tyrosine', 'Ashwagandha', 'Rhodiola Rosea']),
    evidenceLevel: 'Moderate'
  },
  {
    name: 'Shilajit',
    description: 'Ancient mineral-rich substance from Himalayan rocks supporting energy, testosterone, and vitality.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Fulvic acid', 'Humic acid', 'Dibenzo-alpha-pyrones']),
    benefits: JSON.stringify(['Energy support', 'Testosterone support', 'Cognitive function', 'Mitochondrial support', 'Mineral delivery']),
    usage: 'Take with warm water or milk. Purified forms recommended.',
    dosage: '250-500 mg purified extract daily',
    precautions: 'Use only purified forms tested for heavy metals. May affect iron metabolism.',
    scientificInfo: 'Fulvic acid enhances nutrient absorption and has antioxidant effects. Dibenzo-alpha-pyrones support CoQ10 and ATP production.',
    references: JSON.stringify([
      'Pandit S, et al. Clinical evaluation of purified Shilajit on testosterone levels in healthy volunteers. Andrologia. 2016;48(5):570-575.',
      'Carrasco-Gallardo C, et al. Shilajit: a natural phytocomplex with potential procognitive activity. Int J Alzheimers Dis. 2012;2012:674142.'
    ]),
    relatedRemedies: JSON.stringify(['Ashwagandha', 'Tongkat Ali', 'CoQ10']),
    evidenceLevel: 'Limited'
  },
  {
    name: 'Tongkat Ali (Eurycoma longifolia)',
    description: 'Malaysian herb supporting testosterone, libido, and physical performance.',
    category: 'Adaptogen',
    ingredients: JSON.stringify(['Eurycomanone', 'Quassinoids', 'Alkaloids']),
    benefits: JSON.stringify(['Testosterone support', 'Libido enhancement', 'Physical performance', 'Stress adaptation', 'Body composition']),
    usage: 'Take in morning. Cycle use recommended (5 days on, 2 days off).',
    dosage: '200-400 mg standardized extract daily',
    precautions: 'May affect hormone levels. Not for use with hormone-sensitive conditions.',
    scientificInfo: 'Eurycomanone may support testosterone by reducing SHBG and cortisol. Adaptogenic effects on HPA axis.',
    references: JSON.stringify([
      'Talbott SM, et al. Effect of Tongkat Ali on stress hormones and psychological mood state. J Int Soc Sports Nutr. 2013;10(1):28.',
      'Henkel RR, et al. Tongkat Ali as a potential herbal supplement for physically active male and female seniors. Phytother Res. 2014;28(4):544-550.'
    ]),
    relatedRemedies: JSON.stringify(['Ashwagandha', 'Maca Root', 'Tribulus']),
    evidenceLevel: 'Moderate'
  }
]
