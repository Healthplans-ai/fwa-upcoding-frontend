import { ProviderProfile, ProviderVerdict } from "./api";
import { describe } from "./ruleExplanations";

/** Featured demo provider — always first in the table; deep-dive uses canvas claim data. */
export const FEATURED_PROVIDER_ID = "PRV51003";
export const FEATURED_ATTENDING = "PHY364445";

export interface SpecialtyMeta {
  name: string;
  color: string;
}

export const DRG_SPECIALTY_MAP: Record<string, SpecialtyMeta> = {
  "234": { name: "Cardiology", color: "#E8A598" },
  "237": { name: "Cardiology", color: "#E8A598" },
  "280": { name: "Cardiology", color: "#E8A598" },
  "459": { name: "Orthopedics", color: "#E8C47A" },
  "470": { name: "Orthopedics", color: "#E8C47A" },
  "515": { name: "Orthopedics", color: "#E8C47A" },
  "196": { name: "Pulmonology", color: "#8BB8E8" },
  "203": { name: "Pulmonology", color: "#8BB8E8" },
  "392": { name: "Gastro", color: "#9FD48A" },
  "412": { name: "Gastro", color: "#9FD48A" },
  "446": { name: "Gastro", color: "#9FD48A" },
  "723": { name: "Gyn-Oncology", color: "#D4A8E0" },
  "883": { name: "Psychiatry", color: "#B8A8E8" },
  "863": { name: "Infectious Dx", color: "#7EC9B8" },
  "945": { name: "Rehab / PM&R", color: "#D8D090" },
};

export interface StoryClaimRow {
  clm: string;
  drg: string;
  phy: string;
  reimb: string;
}

/** 14 of PRV51003's claims — sorted by specialty (from Flowing Canvas). */
export const FEATURED_CLAIM_ROWS: StoryClaimRow[] = [
  { clm: "CLM10421", drg: "234", phy: "PHY364445", reimb: "$18,420" },
  { clm: "CLM12041", drg: "237", phy: "PHY364445", reimb: "$19,260" },
  { clm: "CLM11320", drg: "280", phy: "PHY364445", reimb: "$16,550" },
  { clm: "CLM10884", drg: "412", phy: "PHY364445", reimb: "$9,640" },
  { clm: "CLM12327", drg: "446", phy: "PHY364445", reimb: "$9,180" },
  { clm: "CLM11157", drg: "723", phy: "PHY364445", reimb: "$14,810" },
  { clm: "CLM11602", drg: "863", phy: "PHY364445", reimb: "$8,330" },
  { clm: "CLM10588", drg: "459", phy: "PHY364445", reimb: "$22,140" },
  { clm: "CLM11488", drg: "470", phy: "PHY364445", reimb: "$23,070" },
  { clm: "CLM12188", drg: "515", phy: "PHY364445", reimb: "$21,440" },
  { clm: "CLM10733", drg: "883", phy: "PHY364445", reimb: "$7,910" },
  { clm: "CLM11002", drg: "196", phy: "PHY364445", reimb: "$11,225" },
  { clm: "CLM11744", drg: "203", phy: "PHY364445", reimb: "$10,915" },
  { clm: "CLM11899", drg: "945", phy: "PHY364445", reimb: "$6,780" },
];

export function featuredSpecialtyNames(): string[] {
  return Array.from(
    new Set(FEATURED_CLAIM_ROWS.map(r => (DRG_SPECIALTY_MAP[r.drg] ?? { name: "Other" }).name)),
  );
}

export interface ProviderSummary {
  headline: string;
  explanation: string;
  bullets: string[];
}

export function isFeaturedProvider(provider: string): boolean {
  return provider === FEATURED_PROVIDER_ID;
}

export function buildProviderSummary(
  verdict: ProviderVerdict,
  profile: ProviderProfile | null,
): ProviderSummary {
  const u6 = verdict.hits.find(h => h.rule_id === "U6");
  if (isFeaturedProvider(verdict.provider)) {
    const specialties = featuredSpecialtyNames().length;
    const claims = Math.round(Number(profile?.ip_claim_count) || 62);
    const drgs = Math.round(Number(profile?.ip_unique_drg_codes) || 58);
    const ratio = claims > 0 ? (drgs / claims).toFixed(2) : "—";
    const drgLine = u6
      ? `Rule U6 fired: DRG-to-claim ratio ${ratio} (${drgs} unique DRGs / ${claims} claims).`
      : `DRG-to-claim ratio ${ratio} (${drgs} unique DRGs / ${claims} claims).`;

    return {
      headline: "Upcoding pattern: one attending, many unrelated specialties",
      explanation:
        `${drgLine} ${FEATURED_ATTENDING} is the attending on every sampled claim, yet DRGs span ` +
        `${specialties} unrelated specialties. No single physician can hold board certification and ` +
        "hospital privileges for cardiac surgery, orthopedics, gyn-oncology, psychiatry, and rehab at once.",
      bullets: [
        `${claims} claims · ${drgs} unique DRGs · ${specialties} specialties`,
        `100% of sampled claims → ${FEATURED_ATTENDING}`,
        "Estimated exposure ~$573K on this provider profile",
      ],
    };
  }

  if (verdict.hits.length === 0) {
    return {
      headline: "No upcoding rules fired",
      explanation:
        "The V1 engine did not trigger any provider- or claim-level rules for this profile. " +
        "This does not guarantee compliance — SIU may still sample — but there is no automated flag.",
      bullets: ["Verdict: pass on current rule pack"],
    };
  }

  const primary = verdict.hits[0];
  const exp = describe(primary.rule_id);
  const claimCount = Object.keys(verdict.claim_hits || {}).length;
  const bullets: string[] = [
    `${verdict.hits.length} rule${verdict.hits.length === 1 ? "" : "s"} fired · max severity ${verdict.max_severity}`,
  ];
  if (claimCount > 0) {
    bullets.push(`${claimCount} claim${claimCount === 1 ? "" : "s"} with line-level evidence`);
  }
  if (profile?.ip_claim_count != null) {
    bullets.push(`${Math.round(Number(profile.ip_claim_count))} IP claims in profile`);
  }

  return {
    headline: exp.title,
    explanation: exp.why_fraud,
    bullets,
  };
}

export interface DeepClaimRow {
  clm: string;
  drg: string;
  specialty: string;
  specialtyColor: string;
  phy: string;
  reimb: string;
  rules?: string[];
}

export function buildDeepClaimRows(
  verdict: ProviderVerdict,
  profile: ProviderProfile | null,
): { rows: DeepClaimRow[]; totalClaims: number; footerNote: string } {
  if (isFeaturedProvider(verdict.provider)) {
    const total = Math.round(Number(profile?.ip_claim_count) || 62);
    const rows: DeepClaimRow[] = FEATURED_CLAIM_ROWS.map(r => {
      const sp = DRG_SPECIALTY_MAP[r.drg] ?? { name: "Other", color: "#DEEDF3" };
      return {
        clm: r.clm,
        drg: r.drg,
        specialty: sp.name,
        specialtyColor: sp.color,
        phy: r.phy,
        reimb: r.reimb,
      };
    });
    return {
      rows,
      totalClaims: total,
      footerNote: `… ${total - rows.length} more claims · all ${FEATURED_ATTENDING} · spanning ${featuredSpecialtyNames().length} specialties …`,
    };
  }

  const entries = Object.entries(verdict.claim_hits || {});
  const rows: DeepClaimRow[] = entries.slice(0, 20).map(([cid, hits]) => {
    const ev = hits[0]?.evidence ?? {};
    const drg = String(ev.drg ?? "—");
    const sp = DRG_SPECIALTY_MAP[drg] ?? { name: "—", color: "#DEEDF3" };
    const payment = ev.payment != null ? Number(ev.payment) : null;
    return {
      clm: cid,
      drg,
      specialty: sp.name,
      specialtyColor: sp.color,
      phy: String(ev.physician ?? ev.attending ?? "—"),
      reimb: payment != null ? `$${payment.toLocaleString()}` : "—",
      rules: hits.map(h => h.rule_id),
    };
  });

  const total = Math.max(
    entries.length,
    Math.round(Number(profile?.ip_claim_count) || 0),
  );

  return {
    rows,
    totalClaims: total || rows.length,
    footerNote:
      entries.length > rows.length
        ? `… ${entries.length - rows.length} more flagged claims — see claims Excel report …`
        : rows.length === 0
          ? "No claim-level rows in this run — see provider rule hits below."
          : "",
  };
}
