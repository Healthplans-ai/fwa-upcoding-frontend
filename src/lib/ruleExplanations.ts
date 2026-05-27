// Human-readable "why this is upcoding" copy for each rule.
//
// Every entry below corresponds to a published, industry-recognised upcoding
// pattern — OIG Work Plan, CMS PEPPER, CMS Two-Midnight Rule, NCCI edits,
// ICD-10-CM Official Guidelines, RAC/CERT focus areas. The detail panel
// renders these verbatim so investigators see consistent context regardless
// of which provider tripped the rule.

export interface RuleExplanation {
  title: string;
  summary: string;
  why_fraud: string;
  action: string;
  industry_reference?: string;
}

export const RULE_EXPLANATIONS: Record<string, RuleExplanation> = {
  U1: {
    title: "E&M High-Level Distribution Skew",
    summary: "Provider's share of top-level Evaluation & Management codes " +
             "(99205, 99215, 99245, 99223, 99233, 99285) is more than 2σ above the peer baseline.",
    why_fraud:
      "A normal primary-care provider's E&M distribution is centered on 99213 (mid-level) — the most " +
      "common ambulatory code in U.S. practice. A provider whose top-tier share sits multiple sigma above " +
      "peers is either practicing in a setting where every encounter is genuinely high-complexity (rare " +
      "and verifiable in chart audit) or systematically upcoding. This is the single most-cited upcoding " +
      "pattern in OIG Work Plans since 2012 and the basis of dozens of published DOJ settlements.",
    action: "PEND_SIU. SIU pulls a sample of top-tier claims for chart review.",
    industry_reference: "OIG Work Plan — E&M level distribution audit (recurring since 2012)",
  },
  U2: {
    title: "Modifier -25 Overuse",
    summary: "Modifier -25 (separate, significant E/M same day as a procedure) attached to more than 25% " +
             "of E&M claims paired with a same-day procedure. Industry-legitimate use sits under 10%.",
    why_fraud:
      "Modifier -25 unbundles an E&M from a same-day procedure — paying both lines instead of having the " +
      "E&M considered inherent to the procedure. The OIG's 2005 Special Advisory Bulletin found that ~35% " +
      "of modifier-25 claims didn't meet the 'significant, separately identifiable' standard. Providers " +
      "attaching -25 to a quarter or more of qualifying E&M lines are nearly certainly capturing payment " +
      "for routine pre/post-procedure work that should have been bundled.",
    action: "PEND_SIU. SIU pulls the encounter note and verifies the E&M was separately identifiable.",
    industry_reference: "OIG Special Advisory Bulletin (2005); CERT focus area",
  },
  U3: {
    title: "Modifier -59 / NCCI-Bypass Overuse",
    summary: "Provider's rate of modifier -59 or its X{ESPU} successors (XE, XS, XP, XU) is more than 2σ " +
             "above the peer baseline.",
    why_fraud:
      "Modifier -59 (and the X{ESPU} modifiers introduced in 2015) override NCCI Procedure-to-Procedure " +
      "bundling edits and force two otherwise-bundled CPT codes to adjudicate as separate services. They " +
      "are the canonical unbundling vehicle. OIG audits show that legitimate -59 use is rare; providers " +
      "applying it across a significant share of their procedure claims are billing each component of a " +
      "comprehensive procedure as its own line.",
    action: "PEND_SIU. Investigator confirms whether the NCCI pair was actually distinct services.",
    industry_reference: "OIG Modifier-59 audits (2005-present); NCCI bypass",
  },
  U4: {
    title: "Procedure Stacking / Unbundling (claim-level)",
    summary: "A single claim populates 5+ distinct procedure codes spanning at least 3 different CPT families.",
    why_fraud:
      "A typical encounter completes 1–2 procedures. Stacking 5+ procedure codes across multiple CPT " +
      "families on a single date is structurally implausible for one encounter: each line is plausible " +
      "alone but the combination is not. This is the classic unbundling pattern — the components of a " +
      "comprehensive packaged procedure billed as separate lines to capture payment on each.",
    action: "MANUAL_REVIEW. Coding team typically denies the lower-value lines and re-prices.",
    industry_reference: "NCCI PTP edits; CMS unbundling guidance",
  },
  U5: {
    title: "Avg Procedure Count Peer-Outlier",
    summary: "Average populated procedure-code slots per claim is more than 2σ above the peer mean.",
    why_fraud:
      "A normal inpatient claim populates 1–2 procedure-code slots. A provider whose mean is 4+ suggests " +
      "either unbundling (billing the components of a packaged procedure separately) or fabricated " +
      "procedures. MED severity reflects that some legitimate complex-case providers — Level-1 trauma, " +
      "transplant — do stack procedures; SIU adjudicates the case mix.",
    action: "MANUAL_REVIEW. Coding team determines whether unbundling, fabrication, or legitimate case mix.",
    industry_reference: "PEPPER target areas — unbundling indicator",
  },
  U6: {
    title: "DRG Diversity / DRG Shopping",
    summary: "Distinct-DRG count is in the top 1% of peers AND the distinct-DRG-to-claim ratio exceeds 0.7 " +
             "(provider uses a different DRG for nearly every admission).",
    why_fraud:
      "Real hospitals have a stable DRG profile — a cardiology-heavy facility sees a few dozen DRGs and " +
      "not the entire CMS catalog. A provider using a unique DRG for nearly every claim is testing many " +
      "classifications to find the highest-paying one. CMS PEPPER ships this exact metric to every short-" +
      "term acute-care hospital quarterly as a compliance-target area.",
    action: "PEND_SIU. A drg-to-claim ratio ≥ 0.9 raises the hit severity to CRITICAL for ranking, but V1 never auto-blocks — it still routes to SIU.",
    industry_reference: "CMS PEPPER — unique-DRG analysis",
  },
  U7: {
    title: "CC/MCC Capture Rate Outlier",
    summary: "Provider's share of top-quartile-severity DRGs (proxy for the 'with CC/MCC' triplet variant) " +
             "is more than 2σ above the all-provider mean.",
    why_fraud:
      "Severity classification should be driven by patient acuity, not provider preference. CMS PEPPER " +
      "publishes the CC/MCC capture rate per hospital because the OIG has identified consistent peer-" +
      "anomalous capture as the strongest single indicator of DRG severity inflation. The rule cross-" +
      "references chronic-condition counts — if patient acuity is normal but the high-severity rate is " +
      "+3σ, the divergence is on the coding side, not the patient side.",
    action: "PEND_SIU. Investigator compares against same-specialty peers and patient acuity.",
    industry_reference: "CMS PEPPER — CC/MCC capture rate target; OIG Work Plan",
  },
  U8: {
    title: "Short-Stay High-Severity DRG (claim-level)",
    summary: "Inpatient claim has top-quartile DRG severity AND length-of-stay ≤ 1 day.",
    why_fraud:
      "DRG severity is supposed to track resource utilization — sicker patients stay longer and the DRG " +
      "payment reflects that. A 0–1 day stay paying a high-severity DRG amount violates the CMS Two-" +
      "Midnight Rule (the admission should have been outpatient observation, which pays substantially " +
      "less) and is the canonical severity-inflation signature: documentation supports the higher DRG on " +
      "paper but the actual care provided was minimal. This is the #1 RAC audit finding by claim count.",
    action: "PEND_SIU. SIU pulls the discharge summary and progress notes.",
    industry_reference: "CMS Two-Midnight Rule (Aug 2013); RAC #1 finding",
  },
  U9: {
    title: "DRG–ICD Support Mismatch (claim-level)",
    summary: "Top-quartile DRG severity with 2 or fewer populated secondary ICD codes on the claim.",
    why_fraud:
      "High-severity DRGs in the CMS MS-DRG system almost always require CC (Complication or Comorbidity) " +
      "or MCC (Major CC) secondary diagnoses to justify their tier. A top-severity DRG with only a " +
      "principal diagnosis and nothing in the secondary slots is structurally inconsistent — either the " +
      "coder forgot to populate the supporting ICDs (a coding error needing correction) or the severity " +
      "was assigned without clinical support (upcoding).",
    action: "MANUAL_REVIEW. Coding team either down-codes the DRG or returns the claim for amendment.",
    industry_reference: "ICD-10-CM Official Guidelines — CC/MCC documentation",
  },
  U10: {
    title: "Targeted High-Risk DRG Overcoding",
    summary: "Provider's rate of OIG/RAC watchlist DRGs (sepsis 870–872, respiratory failure 189–191, " +
             "pneumonia w/ MCC 193, heart-failure w/ MCC 291, renal-failure w/ MCC 682) is more than 2σ " +
             "above peer baseline.",
    why_fraud:
      "A specific set of DRGs has been repeatedly cited in OIG Work Plans, RAC findings, and DOJ DRG-" +
      "upcoding settlements as the highest-frequency upcoding targets. They share a structure: a " +
      "high-paying severity tier (with MCC) sitting one step above a much cheaper variant (without CC), " +
      "with subjective documentation thresholds in between. Providers consistently coding into the " +
      "expensive tier of these specific DRGs are following the OIG's published fraud taxonomy.",
    action: "PEND_SIU. SIU compares the chart against the DRG-tier definitions for the cited claims.",
    industry_reference: "OIG Work Plan; RAC focus areas; DOJ DRG-upcoding settlements",
  },
  U11: {
    title: "Symptom-Code Principal Diagnosis with High DRG",
    summary: "Principal/admit diagnosis is a symptom code (ICD-10 R00–R99 or ICD-9 780–799) AND the claim " +
             "sits in a top-quartile-severity DRG.",
    why_fraud:
      "ICD-10-CM Official Coding Guidelines I.B.18 explicitly prohibit using a symptom code as the " +
      "principal diagnosis when a definitive diagnosis is available. Mapping a symptom-only admission " +
      "(chest pain, syncope, abdominal pain) to a high-paying DRG is a documented severity-shift pattern: " +
      "the claim pays at the high-tier rate while the documentation skirts the requirement for a " +
      "specific underlying diagnosis.",
    action: "MANUAL_REVIEW. Coding team either pulls a confirmed diagnosis from the chart or re-prices.",
    industry_reference: "ICD-10-CM Official Guidelines I.B.18 — signs and symptoms",
  },
  U12: {
    title: "Same Admit Diagnosis → Multiple DRGs",
    summary: "Provider has 10+ inpatient claims for one shared admit diagnosis but routes them across 5+ " +
             "distinct DRGs.",
    why_fraud:
      "Same admission diagnosis means substantially the same admission setting. Mapping one admit-ICD " +
      "into 5+ DRGs across many claims means the provider's coders are choosing severity tiers per claim " +
      "rather than letting the clinical record determine the DRG. A spread of 2–3 DRGs is normal " +
      "(reflecting genuine acuity variation); 5+ is the behavioural fingerprint of DRG shopping.",
    action: "MANUAL_REVIEW. Coding compliance investigates the coding methodology.",
    industry_reference: "Coding consistency — admission-to-DRG mapping",
  },
};

export function describe(rule_id: string): RuleExplanation {
  return RULE_EXPLANATIONS[rule_id] || {
    title: rule_id,
    summary: "No description available.",
    why_fraud: "—",
    action: "—",
  };
}
