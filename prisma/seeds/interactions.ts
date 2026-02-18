/**
 * Drug Interaction Seed Data
 *
 * Contains well-known drug-supplement interactions sourced from
 * established medical references including NIH, Mayo Clinic,
 * and peer-reviewed pharmacological literature.
 *
 * DISCLAIMER: This data is for informational purposes only.
 * Always consult a qualified healthcare provider before making
 * decisions about medications or supplements.
 */

export interface InteractionSeedData {
  substanceA: string;
  substanceAType: "pharmaceutical" | "natural_remedy";
  substanceB: string;
  substanceBType: "pharmaceutical" | "natural_remedy";
  severity: "mild" | "moderate" | "severe" | "contraindicated";
  description: string;
  mechanism: string;
  recommendation: string;
  evidence: "established" | "theoretical" | "case_report";
  sources: string[];
}

export const drugInteractions: InteractionSeedData[] = [
  // ── St. John's Wort Interactions ──────────────────────────────────────
  {
    substanceA: "St. John's Wort",
    substanceAType: "natural_remedy",
    substanceB: "SSRIs (Selective Serotonin Reuptake Inhibitors)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Combining St. John's Wort with SSRIs such as fluoxetine, sertraline, or paroxetine can cause serotonin syndrome, a potentially life-threatening condition characterized by agitation, confusion, rapid heart rate, high blood pressure, dilated pupils, muscle twitching, and hyperthermia.",
    mechanism:
      "St. John's Wort contains hypericin and hyperforin, which inhibit the reuptake of serotonin, norepinephrine, and dopamine. When combined with SSRIs, which also inhibit serotonin reuptake, excessive serotonin accumulation can occur in the central nervous system.",
    recommendation:
      "Do not use St. John's Wort concurrently with SSRIs. If switching between the two, allow an adequate washout period. Consult a healthcare provider before making any changes to antidepressant therapy.",
    evidence: "established",
    sources: [
      "NIH National Center for Complementary and Integrative Health: St. John's Wort and Depression",
      "Lantz MS, et al. St. John's Wort and antidepressant drug interactions. J Geriatr Psychiatry Neurol. 1999;12(1):7-10.",
      "FDA Public Health Advisory: Risk of Drug Interactions with St. John's Wort, 2000",
    ],
  },
  {
    substanceA: "St. John's Wort",
    substanceAType: "natural_remedy",
    substanceB: "Oral Contraceptives (Birth Control Pills)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "St. John's Wort can reduce the effectiveness of oral contraceptives, leading to breakthrough bleeding and unintended pregnancy. Multiple case reports document contraceptive failure associated with concurrent use.",
    mechanism:
      "Hyperforin in St. John's Wort is a potent inducer of CYP3A4 and P-glycoprotein. This accelerates the metabolism of ethinyl estradiol and progestins, reducing their plasma concentrations below therapeutic levels.",
    recommendation:
      "Use additional or alternative contraceptive methods while taking St. John's Wort and for at least one menstrual cycle after discontinuation. Consider non-hormonal contraception alternatives.",
    evidence: "established",
    sources: [
      "Hall SD, et al. The interaction between St John's Wort and an oral contraceptive. Clin Pharmacol Ther. 2003;74(6):525-35.",
      "Murphy PA, et al. Interaction of St. John's Wort with oral contraceptives. J Midwifery Womens Health. 2005;50(3):e9-13.",
    ],
  },
  {
    substanceA: "St. John's Wort",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "St. John's Wort significantly reduces the anticoagulant effect of warfarin, increasing the risk of blood clots, stroke, and other thromboembolic events. INR values can drop substantially within 1-2 weeks of concurrent use.",
    mechanism:
      "Hyperforin induces CYP2C9, CYP3A4, and CYP1A2 enzymes, which are responsible for warfarin metabolism. This increases warfarin clearance and reduces its anticoagulant effect. St. John's Wort also induces P-glycoprotein, further reducing warfarin bioavailability.",
    recommendation:
      "Do not combine St. John's Wort with warfarin. If a patient has been taking both, monitor INR closely when discontinuing St. John's Wort, as warfarin levels will rise. Dose adjustments will be needed.",
    evidence: "established",
    sources: [
      "Jiang X, et al. Effect of St John's Wort and ginseng on the pharmacokinetics and pharmacodynamics of warfarin. Br J Clin Pharmacol. 2004;57(5):592-9.",
      "FDA MedWatch Safety Alert: St. John's Wort",
    ],
  },
  {
    substanceA: "St. John's Wort",
    substanceAType: "natural_remedy",
    substanceB: "Cyclosporine",
    substanceBType: "pharmaceutical",
    severity: "contraindicated",
    description:
      "St. John's Wort dramatically reduces cyclosporine blood levels, which can lead to organ transplant rejection. Multiple cases of acute transplant rejection have been documented following initiation of St. John's Wort.",
    mechanism:
      "Hyperforin powerfully induces CYP3A4 and P-glycoprotein in the intestine and liver, increasing first-pass metabolism and reducing absorption of cyclosporine. Blood levels can drop by 50% or more.",
    recommendation:
      "This combination is absolutely contraindicated. Transplant patients must be explicitly warned never to take St. John's Wort. Any herbal supplement use should be discussed with the transplant team.",
    evidence: "established",
    sources: [
      "Ruschitzka F, et al. Acute heart transplant rejection due to Saint John's Wort. Lancet. 2000;355(9203):548-9.",
      "Barone GW, et al. Drug interaction between St. John's Wort and cyclosporine. Ann Pharmacother. 2000;34(9):1013-6.",
    ],
  },
  {
    substanceA: "St. John's Wort",
    substanceAType: "natural_remedy",
    substanceB: "HIV Protease Inhibitors (Indinavir, Ritonavir)",
    substanceBType: "pharmaceutical",
    severity: "contraindicated",
    description:
      "St. John's Wort reduces blood levels of HIV protease inhibitors to subtherapeutic concentrations, potentially leading to treatment failure, viral rebound, and development of drug resistance.",
    mechanism:
      "CYP3A4 and P-glycoprotein induction by hyperforin dramatically increases the metabolism of protease inhibitors. Indinavir AUC can be reduced by 57% with concurrent St. John's Wort use.",
    recommendation:
      "This combination is contraindicated. Patients on antiretroviral therapy must avoid St. John's Wort entirely. HIV treatment teams should screen for herbal supplement use at every visit.",
    evidence: "established",
    sources: [
      "Piscitelli SC, et al. Indinavir concentrations and St John's Wort. Lancet. 2000;355(9203):547-8.",
      "FDA Public Health Advisory: St. John's Wort and Indinavir, February 2000",
    ],
  },

  // ── Ginkgo Biloba Interactions ────────────────────────────────────────
  {
    substanceA: "Ginkgo Biloba",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Ginkgo biloba can potentiate the anticoagulant effect of warfarin, significantly increasing the risk of bleeding. Cases of spontaneous subdural hematoma, intracerebral hemorrhage, and hyphema have been reported.",
    mechanism:
      "Ginkgolides, particularly ginkgolide B, are potent platelet-activating factor (PAF) antagonists that inhibit platelet aggregation. Combined with the vitamin K antagonism of warfarin, this creates a synergistic anticoagulant effect.",
    recommendation:
      "Avoid concurrent use. If ginkgo is being used, monitor INR more frequently and watch for signs of bleeding (unusual bruising, blood in urine or stool, prolonged bleeding from cuts). Discontinue ginkgo at least 36 hours before surgery.",
    evidence: "established",
    sources: [
      "Bent S, et al. Safety and efficacy of citrus aurantium for weight loss. Am J Cardiol. 2004;94(10):1359-61.",
      "Rosenblatt M, Mindel J. Spontaneous hyphema associated with ingestion of Ginkgo biloba extract. N Engl J Med. 1997;336(15):1108.",
      "NIH NCCIH: Ginkgo Biloba Fact Sheet",
    ],
  },
  {
    substanceA: "Ginkgo Biloba",
    substanceAType: "natural_remedy",
    substanceB: "Aspirin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Combined use of ginkgo biloba and aspirin increases bleeding risk. A case of spontaneous bleeding from the iris (hyphema) was reported in a patient taking both substances.",
    mechanism:
      "Both ginkgo and aspirin independently inhibit platelet function through different mechanisms. Aspirin irreversibly inhibits cyclooxygenase (COX-1), while ginkgolide B antagonizes platelet-activating factor. Together, they produce additive antiplatelet effects.",
    recommendation:
      "Use caution when combining these substances. Monitor for signs of increased bleeding. Inform your healthcare provider if you use ginkgo while on aspirin therapy. Discontinue ginkgo before any surgical procedures.",
    evidence: "established",
    sources: [
      "Rosenblatt M, Mindel J. Spontaneous hyphema associated with ingestion of Ginkgo biloba extract. N Engl J Med. 1997;336(15):1108.",
      "Bone KM. Potential interaction of Ginkgo biloba leaf with antiplatelet or anticoagulant drugs. Thromb Haemost. 2008;100(4):634-40.",
    ],
  },
  {
    substanceA: "Ginkgo Biloba",
    substanceAType: "natural_remedy",
    substanceB: "Anticonvulsants (Valproic Acid, Carbamazepine)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Ginkgo biloba may reduce the effectiveness of certain anticonvulsant medications, potentially lowering the seizure threshold and increasing seizure frequency.",
    mechanism:
      "Ginkgo toxin (4-O-methylpyridoxine), found primarily in ginkgo seeds but also in small amounts in leaf extracts, is a neurotoxin that antagonizes the inhibitory neurotransmitter GABA, potentially lowering seizure threshold. Ginkgo may also induce CYP enzymes that metabolize anticonvulsants.",
    recommendation:
      "Patients with epilepsy or seizure disorders should avoid ginkgo biloba. If used, monitor anticonvulsant blood levels and seizure control closely. Report any changes in seizure frequency to your healthcare provider immediately.",
    evidence: "case_report",
    sources: [
      "Granger AS. Ginkgo biloba precipitating epileptic seizures. Age Ageing. 2001;30(6):523-5.",
      "Kupiec T, Raj V. Fatal seizures due to potential herb-drug interactions with Ginkgo biloba. J Anal Toxicol. 2005;29(7):755-8.",
    ],
  },

  // ── Garlic Supplement Interactions ────────────────────────────────────
  {
    substanceA: "Garlic Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Garlic supplements can enhance the anticoagulant effect of warfarin, increasing the risk of bleeding. This applies primarily to concentrated garlic supplements rather than culinary amounts of garlic.",
    mechanism:
      "Ajoene and other organosulfur compounds in garlic inhibit platelet aggregation by interfering with thromboxane synthesis. Garlic may also have mild fibrinolytic activity. These effects are additive with warfarin anticoagulation.",
    recommendation:
      "Inform your healthcare provider about garlic supplement use while on warfarin. Monitor INR more frequently when starting or stopping garlic supplements. Culinary amounts of garlic are generally safe but avoid concentrated supplements.",
    evidence: "established",
    sources: [
      "Scharbert G, et al. Garlic at dietary doses does not impair platelet function. Anesth Analg. 2007;105(5):1214-8.",
      "Macan H, et al. Aged Garlic Extract May Be Safe for Patients on Warfarin Therapy. J Nutr. 2006;136(3):793S-795S.",
      "NIH NCCIH: Garlic Fact Sheet",
    ],
  },
  {
    substanceA: "Garlic Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Saquinavir (HIV Protease Inhibitor)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Garlic supplements can reduce blood levels of saquinavir by approximately 50%, potentially compromising HIV treatment efficacy and promoting viral resistance.",
    mechanism:
      "Garlic constituents induce CYP3A4 and P-glycoprotein, increasing the metabolism and reducing the absorption of saquinavir. The effect persists for approximately 10 days after discontinuation of garlic supplements.",
    recommendation:
      "Avoid garlic supplements while taking saquinavir or other HIV protease inhibitors. Culinary garlic in food is unlikely to cause significant interactions. Discuss all supplement use with your HIV care team.",
    evidence: "established",
    sources: [
      "Piscitelli SC, et al. The effect of garlic supplements on the pharmacokinetics of saquinavir. Clin Infect Dis. 2002;34(2):234-8.",
    ],
  },

  // ── Turmeric/Curcumin Interactions ────────────────────────────────────
  {
    substanceA: "Turmeric/Curcumin",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Curcumin may potentiate the anticoagulant effect of warfarin, increasing the risk of bleeding. Case reports have documented elevated INR values in patients combining turmeric supplements with warfarin.",
    mechanism:
      "Curcumin inhibits platelet aggregation by inhibiting thromboxane A2 synthesis and enhancing prostacyclin production. It may also inhibit CYP enzymes involved in warfarin metabolism (CYP2C9, CYP1A2), potentially increasing warfarin blood levels.",
    recommendation:
      "Use caution combining turmeric/curcumin supplements with warfarin. Monitor INR closely. Culinary amounts of turmeric in food are generally considered safe. Consult your healthcare provider before using curcumin supplements while on anticoagulant therapy.",
    evidence: "case_report",
    sources: [
      "Shin HW, et al. Effect of curcumin on the pharmacokinetics of warfarin in a rabbit model. Korean J Physiol Pharmacol. 2012;16(2):131-5.",
      "NIH NCCIH: Turmeric Fact Sheet",
      "Antithrombotic effect of turmeric. Thromb Res. 1985;40(3):413-7.",
    ],
  },
  {
    substanceA: "Turmeric/Curcumin",
    substanceAType: "natural_remedy",
    substanceB: "Diabetes Medications (Metformin, Sulfonylureas)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Curcumin may enhance the blood sugar-lowering effects of diabetes medications, potentially increasing the risk of hypoglycemia (dangerously low blood sugar).",
    mechanism:
      "Curcumin has demonstrated hypoglycemic properties through multiple mechanisms: improving insulin sensitivity, enhancing pancreatic beta-cell function, and reducing hepatic glucose production. These effects are additive with diabetes medications.",
    recommendation:
      "Monitor blood glucose levels closely if using turmeric/curcumin supplements alongside diabetes medications. Watch for symptoms of hypoglycemia (dizziness, sweating, confusion, shakiness). Dose adjustments of diabetes medication may be necessary.",
    evidence: "theoretical",
    sources: [
      "Zhang DW, et al. Curcumin and diabetes: a systematic review. Evid Based Complement Alternat Med. 2013;2013:636053.",
      "Chuengsamarn S, et al. Curcumin extract for prevention of type 2 diabetes. Diabetes Care. 2012;35(11):2121-7.",
    ],
  },

  // ── Valerian Interactions ─────────────────────────────────────────────
  {
    substanceA: "Valerian",
    substanceAType: "natural_remedy",
    substanceB: "Benzodiazepines (Diazepam, Alprazolam, Lorazepam)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Valerian may enhance the sedative effects of benzodiazepines, leading to excessive drowsiness, impaired cognitive function, and increased risk of respiratory depression.",
    mechanism:
      "Valerenic acid and other constituents in valerian modulate GABA-A receptors, increasing GABAergic transmission. Benzodiazepines work through the same receptor system by binding to a different site. Combined use produces additive or synergistic central nervous system depression.",
    recommendation:
      "Avoid combining valerian with benzodiazepines without medical supervision. If used together, reduce doses of one or both substances. Do not drive or operate heavy machinery. Be especially cautious in elderly patients who are more sensitive to sedative effects.",
    evidence: "established",
    sources: [
      "Gutierrez S, et al. Assessing subjective and psychomotor effects of the herbal medication valerian with an alcohol-like hangover. Hum Psychopharmacol. 2004;19(1):55-60.",
      "NIH NCCIH: Valerian Fact Sheet",
      "Yuan CS, et al. The gamma-aminobutyric acidergic effects of valerian and valerenic acid on rat brainstem neuronal activity. Anesth Analg. 2004;98(2):353-8.",
    ],
  },
  {
    substanceA: "Valerian",
    substanceAType: "natural_remedy",
    substanceB: "Barbiturates (Phenobarbital)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Concurrent use of valerian with barbiturates may cause excessive sedation, respiratory depression, and potentially dangerous CNS depression.",
    mechanism:
      "Both valerian and barbiturates enhance GABAergic neurotransmission. Barbiturates directly activate GABA-A receptors at high doses and potentiate GABA at lower doses. The combined effect can cause excessive and potentially dangerous CNS depression.",
    recommendation:
      "Do not combine valerian with barbiturates. This combination may cause life-threatening respiratory depression, especially in higher doses. Seek medical guidance for alternative sleep aids if on barbiturate therapy.",
    evidence: "theoretical",
    sources: [
      "Spinella M. The importance of pharmacological synergy in psychoactive herbal medicines. Altern Med Rev. 2002;7(2):130-7.",
      "Hendriks H, et al. Central nervous depressant activity of valerenic acid in the mouse. Planta Med. 1985;51(1):28-31.",
    ],
  },

  // ── Kava Interactions ─────────────────────────────────────────────────
  {
    substanceA: "Kava",
    substanceAType: "natural_remedy",
    substanceB: "Hepatotoxic Drugs (Acetaminophen, Statins, Methotrexate)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Kava has been associated with severe liver toxicity. Combining kava with other liver-metabolized or hepatotoxic drugs significantly increases the risk of liver damage, which can lead to liver failure requiring transplantation.",
    mechanism:
      "Kavalactones are metabolized by CYP enzymes in the liver (primarily CYP2E1 and CYP3A4). Kava can deplete glutathione stores and inhibit several CYP enzymes, reducing the liver capacity to metabolize other drugs and increasing the accumulation of hepatotoxic metabolites.",
    recommendation:
      "Avoid kava entirely if taking any hepatotoxic medications. Do not use kava if you have a history of liver disease. Monitor liver function tests if kava use is suspected. Seek immediate medical attention for symptoms of liver injury (jaundice, dark urine, fatigue, abdominal pain).",
    evidence: "established",
    sources: [
      "Teschke R, et al. Kava hepatotoxicity: a clinical review. Ann Hepatol. 2010;9(3):251-65.",
      "FDA Consumer Advisory: Kava-Containing Dietary Supplements May Be Associated With Severe Liver Injury, 2002",
      "Clouatre DL. Kava kava: examining new reports of toxicity. Toxicol Lett. 2004;150(1):85-96.",
    ],
  },
  {
    substanceA: "Kava",
    substanceAType: "natural_remedy",
    substanceB: "Levodopa (Parkinson's Disease)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Kava may reduce the effectiveness of levodopa in treating Parkinson's disease. A case report documented worsening of Parkinsonian symptoms when kava was initiated.",
    mechanism:
      "Kavalactones appear to have dopamine antagonist properties, which can counteract the dopaminergic effects of levodopa. This may reduce the therapeutic benefit of levodopa for controlling Parkinson's disease symptoms.",
    recommendation:
      "Patients with Parkinson's disease should avoid kava. If Parkinsonian symptoms worsen while using any herbal supplement, discontinue immediately and consult your neurologist.",
    evidence: "case_report",
    sources: [
      "Schelosky L, et al. Kava and dopamine antagonism. J Neurol Neurosurg Psychiatry. 1995;58(5):639-40.",
    ],
  },

  // ── Echinacea Interactions ────────────────────────────────────────────
  {
    substanceA: "Echinacea",
    substanceAType: "natural_remedy",
    substanceB:
      "Immunosuppressants (Cyclosporine, Tacrolimus, Corticosteroids)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Echinacea may counteract the effects of immunosuppressive medications by stimulating immune system activity. This can lead to transplant rejection or worsening of autoimmune conditions.",
    mechanism:
      "Echinacea contains polysaccharides, alkamides, and glycoproteins that stimulate immune cell activity, including macrophages, natural killer cells, and T-lymphocytes. This immunostimulatory effect directly opposes the intended immunosuppressive action of these medications.",
    recommendation:
      "Avoid echinacea if you are taking immunosuppressant medications or have an autoimmune disease (lupus, rheumatoid arthritis, multiple sclerosis). Transplant patients must not use echinacea. Discuss immune-modulating supplements with your healthcare team.",
    evidence: "theoretical",
    sources: [
      "Lee AN, Werth VP. Activation of autoimmunity following use of immunostimulatory herbal supplements. Arch Dermatol. 2004;140(6):723-7.",
      "NIH NCCIH: Echinacea Fact Sheet",
      "Block KI, Mead MN. Immune system effects of echinacea, ginseng, and astragalus. Integr Cancer Ther. 2003;2(3):247-67.",
    ],
  },

  // ── Ginseng Interactions ──────────────────────────────────────────────
  {
    substanceA: "Ginseng (Panax)",
    substanceAType: "natural_remedy",
    substanceB: "Diabetes Medications (Insulin, Metformin, Sulfonylureas)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Ginseng may enhance the blood sugar-lowering effects of diabetes medications, increasing the risk of hypoglycemia. Both American and Asian ginseng have demonstrated hypoglycemic properties.",
    mechanism:
      "Ginsenosides in Panax ginseng increase insulin secretion from pancreatic beta cells, enhance insulin sensitivity, and modulate glucose uptake in peripheral tissues. These effects are additive with diabetes medications.",
    recommendation:
      "Monitor blood glucose levels carefully when using ginseng with diabetes medications. Be alert for symptoms of hypoglycemia. Consider reducing ginseng dose or adjusting diabetes medication under medical supervision. Keep a glucose source readily available.",
    evidence: "established",
    sources: [
      "Vuksan V, et al. American ginseng (Panax quinquefolius L) reduces postprandial glycemia in nondiabetic subjects and subjects with type 2 diabetes mellitus. Arch Intern Med. 2000;160(7):1009-13.",
      "Shishtar E, et al. The effect of ginseng (Panax spp.) on glycemic control: a systematic review. PLoS One. 2014;9(9):e107391.",
    ],
  },
  {
    substanceA: "Ginseng (Panax)",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Ginseng may reduce the effectiveness of warfarin, decreasing its anticoagulant effect and increasing the risk of thromboembolic events.",
    mechanism:
      "Components of ginseng may induce CYP enzymes responsible for warfarin metabolism and have antiplatelet properties that paradoxically may affect overall coagulation balance. Some ginsenosides may also have procoagulant properties.",
    recommendation:
      "Monitor INR closely if using ginseng while on warfarin. Be consistent with ginseng use to maintain stable anticoagulation levels. Report any changes in supplement use to your healthcare provider.",
    evidence: "case_report",
    sources: [
      "Jiang X, et al. Effect of St John's Wort and ginseng on the pharmacokinetics and pharmacodynamics of warfarin. Br J Clin Pharmacol. 2004;57(5):592-9.",
      "Yuan CS, et al. Brief communication: American ginseng reduces warfarin's effect in healthy patients. Ann Intern Med. 2004;141(1):23-7.",
    ],
  },
  {
    substanceA: "Ginseng (Panax)",
    substanceAType: "natural_remedy",
    substanceB: "MAOIs (Phenelzine, Tranylcypromine)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Combined use of ginseng with monoamine oxidase inhibitors (MAOIs) may cause headache, tremor, mania, and insomnia. A case of manic-like symptoms was reported in a patient taking phenelzine and ginseng.",
    mechanism:
      "Ginseng may have mild monoamine oxidase inhibitory properties and can increase monoamine neurotransmitter levels. Combined with prescription MAOIs, this may lead to excessive stimulation of monoaminergic pathways.",
    recommendation:
      "Avoid ginseng while taking MAOIs. If symptoms of excessive CNS stimulation occur (headache, insomnia, tremor, irritability), discontinue ginseng and consult your healthcare provider.",
    evidence: "case_report",
    sources: [
      "Shader RI, Greenblatt DJ. Phenelzine and the dream machine-ramblings and reflections. J Clin Psychopharmacol. 1985;5(2):65-7.",
      "Jones BD, Runikis AM. Interaction of ginseng with phenelzine. J Clin Psychopharmacol. 1987;7(3):201-2.",
    ],
  },

  // ── Fish Oil / Omega-3 Interactions ───────────────────────────────────
  {
    substanceA: "Fish Oil (Omega-3 Fatty Acids)",
    substanceAType: "natural_remedy",
    substanceB: "Anticoagulants (Warfarin, Heparin)",
    substanceBType: "pharmaceutical",
    severity: "mild",
    description:
      "High-dose fish oil supplements may have mild antiplatelet effects that could slightly increase the risk of bleeding when combined with anticoagulants. However, at typical supplemental doses (1-3g/day), this risk appears to be minimal.",
    mechanism:
      "EPA and DHA in fish oil can reduce thromboxane A2 production and decrease platelet aggregation at high doses. They may also modestly affect vitamin K-dependent clotting factor synthesis.",
    recommendation:
      "At standard supplemental doses (up to 3g/day), fish oil is generally considered safe with anticoagulants. At higher doses (>3g/day), monitor for increased bleeding tendency. Inform your healthcare provider about fish oil supplementation and monitor INR as usual.",
    evidence: "established",
    sources: [
      "Bays HE. Safety considerations with omega-3 fatty acid therapy. Am J Cardiol. 2007;99(6A):35C-43C.",
      "Harris WS. Expert opinion: omega-3 fatty acids and bleeding-cause for concern? Am J Cardiol. 2007;99(6A):44C-46C.",
      "NIH Office of Dietary Supplements: Omega-3 Fatty Acids Fact Sheet",
    ],
  },
  {
    substanceA: "Fish Oil (Omega-3 Fatty Acids)",
    substanceAType: "natural_remedy",
    substanceB: "Blood Pressure Medications (ACE Inhibitors, ARBs)",
    substanceBType: "pharmaceutical",
    severity: "mild",
    description:
      "Fish oil may have a mild additive blood pressure-lowering effect when combined with antihypertensive medications. While generally beneficial, this could occasionally cause blood pressure to drop too low.",
    mechanism:
      "Omega-3 fatty acids may reduce blood pressure through improved endothelial function, reduced vascular resistance, and modulation of the renin-angiotensin-aldosterone system. These effects are additive with antihypertensive medications.",
    recommendation:
      "Monitor blood pressure regularly when combining fish oil with antihypertensive medications. Report symptoms of low blood pressure (dizziness, lightheadedness, fainting) to your healthcare provider. Dose adjustments of blood pressure medication may be needed.",
    evidence: "established",
    sources: [
      "Miller PE, et al. Long-chain omega-3 fatty acids eicosapentaenoic acid and docosahexaenoic acid and blood pressure: a meta-analysis. Am J Hypertens. 2014;27(7):885-96.",
    ],
  },

  // ── Melatonin Interactions ────────────────────────────────────────────
  {
    substanceA: "Melatonin",
    substanceAType: "natural_remedy",
    substanceB:
      "Blood Pressure Medications (Beta-Blockers, Calcium Channel Blockers)",
    substanceBType: "pharmaceutical",
    severity: "mild",
    description:
      "Beta-blockers suppress natural melatonin production, which may explain sleep disturbances commonly seen with these medications. Exogenous melatonin supplementation may help, but can also interact with the blood pressure-lowering effects of these drugs.",
    mechanism:
      "Beta-blockers inhibit adrenergic stimulation of the pineal gland, reducing endogenous melatonin synthesis. Exogenous melatonin may affect blood pressure regulation through vasodilation and has been shown to have mild hypotensive effects.",
    recommendation:
      "Monitor blood pressure when adding melatonin to beta-blocker therapy. Start with low doses of melatonin (0.5-1mg). Melatonin may actually help improve sleep quality in patients experiencing beta-blocker-related insomnia.",
    evidence: "established",
    sources: [
      "Scheer FAJL, et al. Daily nighttime melatonin reduces blood pressure in male patients with essential hypertension. Hypertension. 2004;43(2):192-7.",
      "Stoschitzky K, et al. Influence of beta-blockers on melatonin release. Eur J Clin Pharmacol. 1999;55(2):111-5.",
    ],
  },
  {
    substanceA: "Melatonin",
    substanceAType: "natural_remedy",
    substanceB: "Sedatives and Sleep Medications (Zolpidem, Zopiclone)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Combining melatonin with prescription sleep medications may cause excessive sedation, impaired cognitive function, and increased risk of falls, especially in elderly patients.",
    mechanism:
      "Melatonin promotes sleep by activating MT1 and MT2 receptors in the suprachiasmatic nucleus. Combined with sedative-hypnotics that enhance GABAergic transmission, the overall sedative effect is amplified, leading to excessive drowsiness.",
    recommendation:
      "Consult your healthcare provider before combining melatonin with prescription sleep aids. If used together, start with the lowest effective dose of each. Avoid driving or operating machinery. Use extra caution in elderly patients.",
    evidence: "theoretical",
    sources: [
      "Herxheimer A, Petrie KJ. Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev. 2002;(2):CD001520.",
      "NIH NCCIH: Melatonin: What You Need To Know",
    ],
  },
  {
    substanceA: "Melatonin",
    substanceAType: "natural_remedy",
    substanceB: "Immunosuppressants",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Melatonin has immunostimulatory properties that may counteract the effects of immunosuppressive medications, potentially leading to transplant rejection or worsening of conditions requiring immunosuppression.",
    mechanism:
      "Melatonin enhances immune function by stimulating production of interleukin-2, interferon-gamma, and natural killer cell activity. It also promotes T-helper cell differentiation. These immunostimulatory effects oppose the action of immunosuppressive drugs.",
    recommendation:
      "Avoid melatonin if taking immunosuppressant medications or after organ transplantation. Patients with autoimmune diseases should consult their healthcare provider before using melatonin.",
    evidence: "theoretical",
    sources: [
      "Carrillo-Vico A, et al. Melatonin: buffering the immune system. Int J Mol Sci. 2013;14(4):8638-83.",
      "Miller SC, et al. The role of melatonin in immuno-enhancement. Int J Exp Pathol. 2006;87(2):81-7.",
    ],
  },

  // ── Calcium Interactions ──────────────────────────────────────────────
  {
    substanceA: "Calcium Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Levothyroxine (Thyroid Medication)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Calcium supplements significantly reduce the absorption of levothyroxine, leading to subtherapeutic thyroid hormone levels and worsening of hypothyroid symptoms.",
    mechanism:
      "Calcium ions form insoluble complexes with levothyroxine in the gastrointestinal tract, preventing its absorption. This chelation effect can reduce levothyroxine bioavailability by 20-25%.",
    recommendation:
      "Separate the administration of calcium supplements and levothyroxine by at least 4 hours. Take levothyroxine on an empty stomach first thing in the morning, and calcium supplements later in the day. Monitor TSH levels periodically.",
    evidence: "established",
    sources: [
      "Singh N, et al. Effect of calcium carbonate on the absorption of levothyroxine. JAMA. 2000;283(21):2822-5.",
      "Mazokopakis EE, et al. Effects of 12 months treatment with L-selenomethionine on serum anti-TPO levels. Thyroid. 2007;17(7):609-12.",
    ],
  },
  {
    substanceA: "Calcium Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Bisphosphonates (Alendronate, Risedronate)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Calcium significantly reduces the absorption of bisphosphonate medications used to treat osteoporosis. Bisphosphonates have very poor oral bioavailability to begin with, and calcium chelation makes this worse.",
    mechanism:
      "Calcium forms insoluble chelation complexes with bisphosphonates in the gastrointestinal tract. Since bisphosphonates already have only 1-3% oral bioavailability, any further reduction in absorption can render the medication ineffective.",
    recommendation:
      "Take bisphosphonates on an empty stomach with plain water at least 30-60 minutes before any food, supplements, or other medications including calcium. Never take calcium supplements at the same time as bisphosphonates.",
    evidence: "established",
    sources: [
      "Gertz BJ, et al. Studies of the oral bioavailability of alendronate. Clin Pharmacol Ther. 1995;58(3):288-98.",
      "Drugs.com: Alendronate Drug Interactions",
    ],
  },
  {
    substanceA: "Calcium Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Tetracycline Antibiotics",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Calcium substantially reduces the absorption of tetracycline antibiotics (tetracycline, doxycycline, minocycline), potentially leading to treatment failure of bacterial infections.",
    mechanism:
      "Divalent cations like calcium form chelation complexes with tetracycline antibiotics in the gastrointestinal tract, creating insoluble compounds that cannot be absorbed. This can reduce antibiotic absorption by 50-90%.",
    recommendation:
      "Separate calcium supplements from tetracycline antibiotics by at least 2 hours (take tetracycline 1 hour before or 2 hours after calcium). Dairy products are also high in calcium and should similarly be separated from tetracycline use.",
    evidence: "established",
    sources: [
      "Leyden JJ. Absorption of minocycline hydrochloride and tetracycline hydrochloride. J Am Acad Dermatol. 1985;12(2 Pt 1):308-12.",
      "Jung H, et al. Influence of calcium on the bioavailability of doxycycline. Biopharm Drug Dispos. 1997;18(5):415-24.",
    ],
  },

  // ── Iron Supplement Interactions ──────────────────────────────────────
  {
    substanceA: "Iron Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Fluoroquinolone Antibiotics (Ciprofloxacin, Levofloxacin)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Iron supplements markedly reduce the absorption of fluoroquinolone antibiotics, potentially leading to treatment failure of serious bacterial infections.",
    mechanism:
      "Iron ions form chelation complexes with fluoroquinolone antibiotics through their metal-binding ketone and carboxylate groups. This chelation reduces antibiotic absorption by up to 75%, resulting in subtherapeutic blood levels.",
    recommendation:
      "Separate iron supplements from fluoroquinolone antibiotics by at least 2 hours before or 6 hours after the antibiotic dose. Complete the full course of antibiotics as prescribed and discuss timing with your pharmacist.",
    evidence: "established",
    sources: [
      "Polk RE. Drug-drug interactions with ciprofloxacin and other fluoroquinolones. Am J Med. 1989;87(5A):76S-81S.",
      "Kara M, et al. Clinical significance of the interaction between ciprofloxacin and ferrous sulfate. Ann Pharmacother. 1991;25(11):1193-5.",
    ],
  },
  {
    substanceA: "Iron Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Levothyroxine (Thyroid Medication)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Iron supplements reduce the absorption of levothyroxine, leading to subtherapeutic thyroid hormone levels and persistent hypothyroid symptoms despite adequate dosing.",
    mechanism:
      "Iron forms insoluble complexes with levothyroxine in the gastrointestinal tract through chelation. This effect is pH-dependent and is more pronounced in an acidic environment, as found in the fasting stomach.",
    recommendation:
      "Separate iron supplements from levothyroxine by at least 4 hours. Take levothyroxine first thing in the morning on an empty stomach, and iron supplements in the afternoon or evening. Monitor TSH levels when starting or stopping iron supplements.",
    evidence: "established",
    sources: [
      "Campbell NR, et al. Ferrous sulfate reduces thyroxine efficacy in patients with hypothyroidism. Ann Intern Med. 1992;117(12):1010-3.",
    ],
  },

  // ── Magnesium Interactions ────────────────────────────────────────────
  {
    substanceA: "Magnesium Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Fluoroquinolone Antibiotics (Ciprofloxacin, Levofloxacin)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Magnesium supplements substantially reduce the absorption of fluoroquinolone antibiotics, which can lead to inadequate blood levels and treatment failure.",
    mechanism:
      "Magnesium ions chelate with fluoroquinolone antibiotics in the gastrointestinal tract, forming poorly absorbed complexes. This can reduce antibiotic bioavailability by 50% or more.",
    recommendation:
      "Take fluoroquinolone antibiotics at least 2 hours before or 6 hours after magnesium supplements. Do not take them at the same time. This applies to all forms of magnesium supplements including magnesium oxide, citrate, and glycinate.",
    evidence: "established",
    sources: [
      "Shiba K, et al. Interactions of ciprofloxacin with antacids and some metals. Chemotherapy. 1992;40(Suppl 3):78-84.",
      "Nix DE, et al. Effects of aluminum and magnesium antacids and ranitidine on the absorption of ciprofloxacin. Clin Pharmacol Ther. 1989;46(6):700-5.",
    ],
  },
  {
    substanceA: "Magnesium Supplements",
    substanceAType: "natural_remedy",
    substanceB: "Bisphosphonates (Alendronate, Risedronate)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Magnesium can reduce the absorption of bisphosphonates used to treat osteoporosis, potentially rendering the medication ineffective for bone density preservation.",
    mechanism:
      "Magnesium forms chelation complexes with bisphosphonates in the gastrointestinal tract. Given that bisphosphonates already have extremely low oral bioavailability (1-3%), any further reduction can eliminate their therapeutic effect.",
    recommendation:
      "Take bisphosphonates on an empty stomach with plain water at least 30-60 minutes before any food, beverages, or supplements including magnesium. Never take magnesium supplements at the same time as bisphosphonates.",
    evidence: "established",
    sources: [
      "Gertz BJ, et al. Studies of the oral bioavailability of alendronate. Clin Pharmacol Ther. 1995;58(3):288-98.",
    ],
  },

  // ── Green Tea Extract Interactions ────────────────────────────────────
  {
    substanceA: "Green Tea Extract",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Green tea contains vitamin K, which can counteract the anticoagulant effect of warfarin. Large or inconsistent consumption of green tea can destabilize INR levels.",
    mechanism:
      "Green tea leaves contain vitamin K1 (phylloquinone), which promotes the synthesis of clotting factors that warfarin is designed to inhibit. The vitamin K content varies between products and preparations, making consistent anticoagulation difficult.",
    recommendation:
      "If consuming green tea while on warfarin, maintain consistent daily intake rather than varying amounts. Avoid concentrated green tea extract supplements. Inform your healthcare provider about green tea consumption and monitor INR regularly.",
    evidence: "case_report",
    sources: [
      "Taylor JR, Wilt VM. Probable antagonism of warfarin by green tea. Ann Pharmacother. 1999;33(4):426-8.",
      "Booth SL, et al. Dietary vitamin K1 and stability of oral anticoagulation. Thromb Haemost. 2004;92(5):1018-24.",
    ],
  },
  {
    substanceA: "Green Tea Extract",
    substanceAType: "natural_remedy",
    substanceB: "Nadolol (Beta-Blocker)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Green tea can reduce the absorption and blood levels of nadolol, a beta-blocker used for high blood pressure and heart conditions, potentially reducing its therapeutic effectiveness.",
    mechanism:
      "Catechins in green tea, particularly EGCG, inhibit organic anion transporting polypeptide (OATP) transporters in the intestine. Nadolol relies on these transporters for absorption. Green tea consumption can reduce nadolol bioavailability by approximately 85%.",
    recommendation:
      "Avoid consuming large amounts of green tea or green tea extract while taking nadolol. If green tea consumption is desired, separate it from nadolol dosing by several hours and maintain consistent intake. Monitor blood pressure and heart rate.",
    evidence: "established",
    sources: [
      "Misaka S, et al. Green tea ingestion greatly reduces plasma concentrations of nadolol in healthy subjects. Clin Pharmacol Ther. 2014;95(4):432-8.",
    ],
  },

  // ── Cranberry Interactions ────────────────────────────────────────────
  {
    substanceA: "Cranberry (Juice/Supplements)",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Cranberry juice and supplements may enhance the effect of warfarin, increasing INR and the risk of bleeding. Several case reports have documented clinically significant INR elevations with concurrent use.",
    mechanism:
      "Cranberry flavonoids may inhibit CYP2C9, the primary enzyme responsible for warfarin metabolism. Additionally, cranberry contains salicylic acid, which has antiplatelet properties that may contribute to the increased bleeding risk.",
    recommendation:
      "Limit cranberry juice intake to small amounts (no more than 8 oz/day) while on warfarin. Avoid concentrated cranberry supplements. Monitor INR more frequently when changing cranberry consumption patterns.",
    evidence: "case_report",
    sources: [
      "Suvarna R, et al. Possible interaction between warfarin and cranberry juice. BMJ. 2003;327(7429):1454.",
      "Aston JL, et al. Interaction between warfarin and cranberry juice. Pharmacotherapy. 2006;26(9):1314-9.",
    ],
  },

  // ── Grapefruit Interactions ───────────────────────────────────────────
  {
    substanceA: "Grapefruit/Grapefruit Juice",
    substanceAType: "natural_remedy",
    substanceB: "Statins (Simvastatin, Atorvastatin, Lovastatin)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Grapefruit juice can dramatically increase blood levels of certain statin medications, greatly increasing the risk of severe muscle damage (rhabdomyolysis) and kidney injury.",
    mechanism:
      "Furanocoumarins in grapefruit irreversibly inhibit CYP3A4 enzymes in the intestinal wall. This eliminates first-pass metabolism of statins like simvastatin, increasing bioavailability by up to 1500%. The effect of a single glass of grapefruit juice can last 24-72 hours.",
    recommendation:
      "Avoid grapefruit and grapefruit juice entirely while taking simvastatin, lovastatin, or atorvastatin. Pravastatin, rosuvastatin, and fluvastatin are less affected and may be safer alternatives. Report any unexplained muscle pain, tenderness, or weakness immediately.",
    evidence: "established",
    sources: [
      "Bailey DG, et al. Grapefruit-medication interactions: Forbidden fruit or avoidable consequences? CMAJ. 2013;185(4):309-16.",
      "Lilja JJ, et al. Grapefruit juice-simvastatin interaction: effect on serum concentrations of simvastatin, simvastatin acid and HMG-CoA reductase inhibitors. Clin Pharmacol Ther. 1998;64(5):477-83.",
      "FDA: Grapefruit Juice and Some Drugs Don't Mix",
    ],
  },
  {
    substanceA: "Grapefruit/Grapefruit Juice",
    substanceAType: "natural_remedy",
    substanceB: "Calcium Channel Blockers (Felodipine, Nifedipine, Verapamil)",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Grapefruit juice can substantially increase blood levels of calcium channel blockers, potentially causing dangerous drops in blood pressure, dizziness, flushing, and peripheral edema.",
    mechanism:
      "Furanocoumarins in grapefruit irreversibly inhibit intestinal CYP3A4, reducing first-pass metabolism of calcium channel blockers. Felodipine bioavailability can increase by 200-300% with grapefruit juice consumption.",
    recommendation:
      "Avoid grapefruit and grapefruit juice while taking calcium channel blockers, especially felodipine and nifedipine. Monitor blood pressure closely. Switch to orange juice or other citrus that does not contain furanocoumarins.",
    evidence: "established",
    sources: [
      "Bailey DG, et al. Interaction of citrus juices with felodipine and nifedipine. Lancet. 1991;337(8736):268-9.",
      "Dresser GK, et al. Grapefruit juice--felodipine interaction in the elderly. Clin Pharmacol Ther. 2000;68(1):28-34.",
    ],
  },

  // ── Coenzyme Q10 Interactions ─────────────────────────────────────────
  {
    substanceA: "Coenzyme Q10 (CoQ10)",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "CoQ10 may reduce the effectiveness of warfarin due to its structural similarity to vitamin K. Several case reports document decreased INR values in patients who started CoQ10 supplementation while on warfarin.",
    mechanism:
      "CoQ10 (ubiquinone) is structurally similar to vitamin K2 (menaquinone). It may promote vitamin K-dependent clotting factor synthesis, counteracting the anticoagulant mechanism of warfarin. CoQ10 may also induce CYP enzymes that metabolize warfarin.",
    recommendation:
      "If using CoQ10 while on warfarin, maintain consistent daily dosing and monitor INR frequently, especially when starting, stopping, or changing the dose. Inform your anticoagulation clinic about CoQ10 use.",
    evidence: "case_report",
    sources: [
      "Spigset O. Reduced effect of warfarin caused by ubidecarenone. Lancet. 1994;344(8933):1372-3.",
      "Heck AM, et al. Potential interactions between alternative therapies and warfarin. Am J Health Syst Pharm. 2000;57(13):1221-7.",
    ],
  },

  // ── Vitamin E Interactions ────────────────────────────────────────────
  {
    substanceA: "Vitamin E (High Dose)",
    substanceAType: "natural_remedy",
    substanceB: "Anticoagulants/Antiplatelet Drugs",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "High-dose vitamin E (>400 IU/day) may increase the risk of bleeding when combined with anticoagulant or antiplatelet medications. The risk is dose-dependent and more significant at very high supplemental doses.",
    mechanism:
      "Vitamin E inhibits platelet adhesion and aggregation by interfering with vitamin K-dependent clotting factor activation and inhibiting protein kinase C activity in platelets. At high doses, these antiplatelet effects become clinically significant.",
    recommendation:
      "Avoid high-dose vitamin E supplements (>400 IU/day) while on anticoagulant or antiplatelet therapy. Standard dietary intake and low-dose supplements (up to 200 IU/day) are generally considered safe. Inform your healthcare provider about vitamin E supplementation.",
    evidence: "established",
    sources: [
      "Corrigan JJ Jr. The effect of vitamin E on warfarin-induced vitamin K deficiency. Ann N Y Acad Sci. 1982;393:361-8.",
      "Booth SL, et al. Effect of vitamin E supplementation on vitamin K status in adults with normal coagulation status. Am J Clin Nutr. 2004;80(1):143-8.",
    ],
  },

  // ── Licorice Root Interactions ────────────────────────────────────────
  {
    substanceA: "Licorice Root (Glycyrrhiza)",
    substanceAType: "natural_remedy",
    substanceB: "Digoxin",
    substanceBType: "pharmaceutical",
    severity: "severe",
    description:
      "Licorice root can cause potassium depletion (hypokalemia), which increases sensitivity to digoxin and significantly raises the risk of digoxin toxicity, including fatal cardiac arrhythmias.",
    mechanism:
      "Glycyrrhizin in licorice inhibits 11-beta-hydroxysteroid dehydrogenase type 2, causing cortisol to activate mineralocorticoid receptors. This leads to sodium retention and potassium excretion. Hypokalemia increases myocardial sensitivity to digoxin, predisposing to arrhythmias.",
    recommendation:
      "Avoid licorice root supplements or large amounts of licorice-containing products while taking digoxin. Monitor potassium levels regularly. Deglycyrrhizinated licorice (DGL) does not cause hypokalemia and is a safer alternative.",
    evidence: "established",
    sources: [
      "Isbrucker RA, Burdock GA. Risk and safety assessment on the consumption of Licorice root. Regul Toxicol Pharmacol. 2006;46(3):167-92.",
      "NIH NCCIH: Licorice Root Fact Sheet",
    ],
  },
  {
    substanceA: "Licorice Root (Glycyrrhiza)",
    substanceAType: "natural_remedy",
    substanceB: "Diuretics (Thiazides, Loop Diuretics)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Licorice root combined with potassium-wasting diuretics can cause severe hypokalemia, leading to muscle weakness, cardiac arrhythmias, and in extreme cases, cardiac arrest.",
    mechanism:
      "Both licorice and potassium-wasting diuretics promote potassium excretion through different mechanisms. Licorice causes mineralocorticoid excess, while diuretics block potassium reabsorption in the kidney. The combined effect produces dangerously additive potassium depletion.",
    recommendation:
      "Avoid licorice root supplements while taking diuretics. Monitor potassium levels closely. Watch for symptoms of hypokalemia: muscle weakness, cramps, fatigue, constipation, and irregular heartbeat. Use DGL as a safer alternative.",
    evidence: "established",
    sources: [
      "Farese RV Jr, et al. Licorice-induced hypermineralocorticoidism. N Engl J Med. 1991;325(17):1223-7.",
      "Omar HR, et al. Licorice abuse: time to send a warning message. Ther Adv Endocrinol Metab. 2012;3(4):125-38.",
    ],
  },

  // ── Goldenseal Interactions ───────────────────────────────────────────
  {
    substanceA: "Goldenseal",
    substanceAType: "natural_remedy",
    substanceB: "CYP3A4-Metabolized Drugs (Many Medications)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Goldenseal inhibits CYP3A4 and CYP2D6 enzymes, potentially increasing blood levels of many medications metabolized by these pathways, including some antidepressants, antipsychotics, and cardiovascular drugs.",
    mechanism:
      "Berberine and hydrastine, the primary alkaloids in goldenseal, are potent inhibitors of CYP3A4 and CYP2D6 enzymes. Inhibition of these major drug-metabolizing enzymes can increase plasma concentrations of substrate medications.",
    recommendation:
      "Consult your healthcare provider before using goldenseal if you take any prescription medications. Provide a complete list of all supplements to your pharmacist for interaction screening. Be especially cautious with medications that have a narrow therapeutic index.",
    evidence: "established",
    sources: [
      "Gurley BJ, et al. In vivo assessment of botanical supplementation on human cytochrome P450 phenotypes. Clin Pharmacol Ther. 2005;77(5):415-26.",
      "Gurley BJ, et al. Clinical assessment of effects of botanical supplementation on cytochrome P450 phenotypes. Clin Pharmacol Ther. 2008;83(1):61-9.",
    ],
  },

  // ── Saw Palmetto Interactions ─────────────────────────────────────────
  {
    substanceA: "Saw Palmetto",
    substanceAType: "natural_remedy",
    substanceB: "Anticoagulants/Antiplatelet Drugs",
    substanceBType: "pharmaceutical",
    severity: "mild",
    description:
      "Saw palmetto may have mild antiplatelet properties that could slightly increase bleeding risk when combined with anticoagulant or antiplatelet medications.",
    mechanism:
      "Fatty acids in saw palmetto may inhibit cyclooxygenase, potentially reducing thromboxane production and platelet aggregation. This antiplatelet effect is mild but may be additive with anticoagulant medications.",
    recommendation:
      "Inform your healthcare provider if you use saw palmetto while on anticoagulant therapy. Monitor for signs of increased bleeding. Discontinue saw palmetto at least 2 weeks before any scheduled surgery.",
    evidence: "theoretical",
    sources: [
      "Agbabiaka TB, et al. Serenoa repens (saw palmetto): a systematic review of adverse events. Drug Saf. 2009;32(8):637-47.",
      "NIH NCCIH: Saw Palmetto Fact Sheet",
    ],
  },

  // ── Milk Thistle Interactions ─────────────────────────────────────────
  {
    substanceA: "Milk Thistle (Silymarin)",
    substanceAType: "natural_remedy",
    substanceB: "Metformin",
    substanceBType: "pharmaceutical",
    severity: "mild",
    description:
      "Milk thistle may enhance the blood sugar-lowering effect of metformin, potentially increasing the risk of hypoglycemia. Studies suggest silymarin can improve insulin sensitivity and glycemic control.",
    mechanism:
      "Silymarin and its active constituent silibinin have been shown to enhance insulin sensitivity, reduce hepatic glucose output, and possess antioxidant properties that protect pancreatic beta cells. These effects are additive with metformin's mechanisms.",
    recommendation:
      "Monitor blood glucose levels closely when combining milk thistle with metformin. Watch for symptoms of hypoglycemia. The interaction may actually be beneficial in some cases but should be managed under medical supervision.",
    evidence: "theoretical",
    sources: [
      "Huseini HF, et al. The efficacy of Silybum marianum (L.) Gaertn. in type 2 diabetes. Phytother Res. 2006;20(12):1036-9.",
      "Voroneanu L, et al. Silymarin in Type 2 Diabetes Mellitus: A Systematic Review. J Diabetes Res. 2016;2016:5147468.",
    ],
  },

  // ── Evening Primrose Oil Interactions ─────────────────────────────────
  {
    substanceA: "Evening Primrose Oil",
    substanceAType: "natural_remedy",
    substanceB: "Phenothiazines (Chlorpromazine) and Anticonvulsants",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Evening primrose oil may lower the seizure threshold, potentially reducing the effectiveness of anticonvulsant medications and increasing seizure risk in patients taking phenothiazine antipsychotics.",
    mechanism:
      "Gamma-linolenic acid (GLA) in evening primrose oil is a precursor to prostaglandin E1. Prostaglandins can modulate neuronal excitability, and in some individuals, this may lower the seizure threshold, particularly when combined with drugs that also lower it.",
    recommendation:
      "Avoid evening primrose oil if you have a seizure disorder or take anticonvulsant medications. Patients on phenothiazine medications should also avoid it. Consult your neurologist before using any GLA-containing supplements.",
    evidence: "case_report",
    sources: [
      "Holman CP, Bell AF. A trial of evening primrose oil in the treatment of chronic schizophrenia. J Orthomolec Psychiatry. 1983;12:302-304.",
      "NIH MedlinePlus: Evening Primrose Oil",
    ],
  },

  // ── Black Cohosh Interactions ─────────────────────────────────────────
  {
    substanceA: "Black Cohosh",
    substanceAType: "natural_remedy",
    substanceB: "Hepatotoxic Drugs (Statins, Acetaminophen)",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Black cohosh has been associated with cases of liver injury. Combining it with other hepatotoxic medications may increase the risk of liver damage.",
    mechanism:
      "While the exact hepatotoxic mechanism of black cohosh is not fully understood, it may involve reactive metabolites formed during hepatic metabolism. The addition of other hepatotoxic agents may overwhelm liver detoxification capacity and increase susceptibility to injury.",
    recommendation:
      "Avoid black cohosh if you have liver disease or take hepatotoxic medications. Monitor for symptoms of liver injury: jaundice, dark urine, nausea, fatigue, upper right abdominal pain. Discontinue immediately if liver symptoms develop.",
    evidence: "case_report",
    sources: [
      "Mahady GB, et al. United States Pharmacopeia review of the black cohosh case reports of hepatotoxicity. Menopause. 2008;15(4 Pt 1):628-38.",
      "NIH NCCIH: Black Cohosh Fact Sheet",
    ],
  },

  // ── Chamomile Interactions ────────────────────────────────────────────
  {
    substanceA: "Chamomile",
    substanceAType: "natural_remedy",
    substanceB: "Warfarin",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "Chamomile may increase the anticoagulant effect of warfarin, raising the risk of bleeding. Cases of internal bleeding have been reported in patients using chamomile tea or supplements alongside warfarin.",
    mechanism:
      "Chamomile contains coumarin compounds that may have additive anticoagulant effects with warfarin. Chamomile may also inhibit CYP3A4 and CYP1A2, potentially reducing warfarin metabolism and increasing its plasma levels.",
    recommendation:
      "Use chamomile cautiously while on warfarin. Avoid large amounts of chamomile tea or concentrated supplements. Monitor INR closely and report any signs of unusual bleeding to your healthcare provider.",
    evidence: "case_report",
    sources: [
      "Segal R, Pilote L. Warfarin interaction with Matricaria chamomilla. CMAJ. 2006;174(9):1281-2.",
      "Heck AM, et al. Potential interactions between alternative therapies and warfarin. Am J Health Syst Pharm. 2000;57(13):1221-7.",
    ],
  },

  // ── Vitamin D Interactions ────────────────────────────────────────────
  {
    substanceA: "Vitamin D (High Dose)",
    substanceAType: "natural_remedy",
    substanceB: "Thiazide Diuretics",
    substanceBType: "pharmaceutical",
    severity: "moderate",
    description:
      "High-dose vitamin D combined with thiazide diuretics can cause hypercalcemia (dangerously high blood calcium levels), leading to kidney stones, cardiac arrhythmias, confusion, and renal impairment.",
    mechanism:
      "Vitamin D increases intestinal calcium absorption and bone calcium resorption. Thiazide diuretics reduce renal calcium excretion. Together, they can cause excessive calcium accumulation in the blood, especially in elderly patients or those with impaired kidney function.",
    recommendation:
      "Monitor serum calcium levels when taking vitamin D supplements with thiazide diuretics. Avoid very high dose vitamin D supplementation (>4000 IU/day) without medical supervision. Report symptoms of hypercalcemia: increased thirst, frequent urination, nausea, constipation, confusion.",
    evidence: "established",
    sources: [
      "Grieff M, Bushinsky DA. Diuretics, hypercalcemia and vitamin D. J Steroid Biochem Mol Biol. 2010;121(1-2):258-61.",
      "NIH Office of Dietary Supplements: Vitamin D Fact Sheet",
    ],
  },
];

/**
 * Seeds the DrugInteraction table with known drug-supplement interactions.
 * Uses upsert to avoid duplicates when re-seeding.
 */
export async function seedInteractions(
  prisma: import("@prisma/client").PrismaClient,
): Promise<void> {
  console.warn("\nSeeding drug interactions...");
  console.warn(`Total interactions to seed: ${drugInteractions.length}`);

  let created = 0;
  let skipped = 0;

  for (const interaction of drugInteractions) {
    try {
      await prisma.drugInteraction.upsert({
        where: {
          substanceA_substanceB: {
            substanceA: interaction.substanceA,
            substanceB: interaction.substanceB,
          },
        },
        update: {
          severity: interaction.severity,
          description: interaction.description,
          mechanism: interaction.mechanism,
          recommendation: interaction.recommendation,
          evidence: interaction.evidence,
          sources: interaction.sources,
          substanceAType: interaction.substanceAType,
          substanceBType: interaction.substanceBType,
        },
        create: {
          substanceA: interaction.substanceA,
          substanceAType: interaction.substanceAType,
          substanceB: interaction.substanceB,
          substanceBType: interaction.substanceBType,
          severity: interaction.severity,
          description: interaction.description,
          mechanism: interaction.mechanism,
          recommendation: interaction.recommendation,
          evidence: interaction.evidence,
          sources: interaction.sources,
        },
      });
      created++;
    } catch (error) {
      console.warn(
        `  Skipped interaction: ${interaction.substanceA} + ${interaction.substanceB}`,
        error,
      );
      skipped++;
    }
  }

  console.warn(
    `Drug interactions seeded: ${created} created/updated, ${skipped} skipped.`,
  );
}
