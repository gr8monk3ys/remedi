# Remedi

Remedi maps pharmaceuticals to natural remedies and warns about interactions
between the things a person takes. Because a wrong answer here is a health
risk, the language below draws hard lines around what the product does and
does not claim to know.

## Language

### Substances

**Pharmaceutical**:
A drug record, either curated by us or imported from an FDA label.
_Avoid_: medication, drug (when you mean the record rather than the thing a person takes)

**Natural Remedy**:
A non-pharmaceutical substance — herb, vitamin, mineral, food, compound — that
someone might take for a health reason.
_Avoid_: supplement, alternative, natural alternative

**Substance**:
Either a Pharmaceutical or a Natural Remedy, when the distinction does not
matter. The unit an interaction is recorded against.

**Substance Identity**:
What a Pharmaceutical record _is_, as opposed to what it is called. A record's
name is brand-first when it comes from an FDA label — the same molecule arrives
as "COUMADIN" from OpenFDA and "Warfarin" from the curated seed — so identity
is carried by the generic name, the active ingredients, and where available the
RxNorm and UNII identifiers. Safety rules are matched against identity; matching
them against the display name alone lets a brand name evade them.
_Avoid_: drug name, generic (when you mean the identity rather than the string)

### Matching

**Remedy Mapping**:
A scored link from one Pharmaceutical to one Natural Remedy, carrying the
Similarity Score, the overlapping ingredients, and the Replacement Type.
_Avoid_: match, recommendation, suggestion

**Similarity Score**:
How strongly a Natural Remedy overlaps a Pharmaceutical, from 0 to 1. Below the
display floor a Remedy Mapping is not shown at all.

**Replacement Type**:
What a Remedy Mapping is allowed to claim: **Alternative** (may stand in for
the drug), **Complementary** (may be taken alongside), or **Supportive**
(neither — offers general support only).
_Avoid_: category, strength, tier

**Forced Supportive**:
A Remedy Mapping demoted to Supportive regardless of its Similarity Score,
because the Pharmaceutical is one where suggesting a substitute is unsafe —
anticoagulants, chemotherapy, antiretrovirals, immunosuppressants.

**Evidence Level**:
How well-supported a Natural Remedy's claimed benefits are. Feeds the
Similarity Score.

### Interactions

**Drug Interaction**:
A recorded interaction between two Substances, with a severity and a
description. Records are directionless: the pair is the unit, not the order.
_Avoid_: conflict, contraindication (which is one severity, not the concept)

**Medication Cabinet**:
The set of Substances a signed-in person has told us they currently take.
_Avoid_: medication list, profile, stack

**Interaction Outcome**:
The result of asking about interactions. Either **known** — we got an answer,
and an empty answer means we genuinely found none — or **unknown**, meaning we
could not get an answer at all. The distinction is load-bearing: only a known,
empty outcome may be presented to someone as "no known interactions".
_Avoid_: result, response, interaction state

**Unknown Reason**:
Why an Interaction Outcome is unknown: **unauthenticated**, **plan-required**,
**rate-limited**, or **unavailable**. It says what the person can do about it,
never whether interactions exist.
_Avoid_: error, failure code
