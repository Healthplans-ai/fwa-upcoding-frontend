// Thin client for the Upcoding V1 backend.
//
// The backend is the FastAPI service in ../backend.  In dev the Vite proxy
// (vite.config.ts) forwards /api/* to http://localhost:8000; in production
// set VITE_API_BASE_URL to the deployed origin.

export type Verdict = "PASS" | "MANUAL_REVIEW" | "PEND_SIU" | "AUTO_FLAG";
export type Severity = "LOW" | "MED" | "HIGH" | "CRITICAL" | "NONE";

export interface RuleHit {
  rule_id: string;
  severity: Severity;
  reason: string;
  surface: "claim" | "provider";
  evidence: Record<string, unknown>;
}

export interface ProviderVerdict {
  provider: string;
  verdict: Verdict;
  max_severity: Severity;
  hits: RuleHit[];
  claim_hits: Record<string, RuleHit[]>;
}

export interface ProviderProfile {
  provider: string;
  ip_claim_count?: number;
  ip_total_reimbursement?: number;
  ip_avg_reimbursement?: number;
  ip_max_reimbursement?: number;
  ip_avg_los?: number;
  ip_max_los?: number;
  ip_avg_icd_count?: number;
  ip_avg_procedure_count?: number;
  ip_unique_drg_codes?: number;
  ip_avg_drg_severity?: number;
  ip_max_drg_severity?: number;
  ip_high_severity_drg_rate?: number;
  ip_avg_chronic_conds?: number;
  ip_unique_icd_codes?: number;
  ip_unique_physicians?: number;
  op_claim_count?: number;
  op_total_reimbursement?: number;
  peer_ip_reimb_z?: number;
  peer_drg_severity_z?: number;
  peer_los_z?: number;
  peer_icd_count_z?: number;
  label?: number | null;
  [k: string]: unknown;
}

export interface Analytics {
  total_providers: number;
  flagged_providers: number;
  fraud_rate: number;
  exposure_usd: number;
  by_verdict: Partial<Record<Verdict, number>>;
  by_rule:    Record<string, number>;
  peer_baselines: Record<string, { mean: number; std: number; p25: number; p50: number; p75: number }>;
  detected_shape: string;
  profile_count: number;
  claim_count: number;
}

export interface UploadResult {
  ok: true;
  run_id: string;
  filename: string;
  analytics: Analytics;
  verdicts: ProviderVerdict[];
  profiles: ProviderProfile[];
}

export interface RuleSpec {
  id: string;
  name: string;
  description?: string;
  surface?: "claim" | "provider";
  severity: Severity;
  action: Verdict;
  reason_code?: string;
}

const BASE = "";

export async function getRules(): Promise<RuleSpec[]> {
  const r = await fetch(`${BASE}/api/rules`);
  if (!r.ok) throw new Error(`getRules ${r.status}`);
  const j = await r.json();
  return j.rules as RuleSpec[];
}

export async function getHealth() {
  const r = await fetch(`${BASE}/api/health`);
  if (!r.ok) throw new Error(`getHealth ${r.status}`);
  return r.json();
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${BASE}/api/v1/upload`, { method: "POST", body: fd });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`upload ${r.status}: ${t}`);
  }
  return r.json();
}

export function providersDownloadUrl(run_id: string) {
  return `${BASE}/api/v1/results/${run_id}/providers`;
}
export function claimsDownloadUrl(run_id: string) {
  return `${BASE}/api/v1/results/${run_id}/claims`;
}
export function flaggedDownloadUrl(run_id: string) {
  return `${BASE}/api/v1/results/${run_id}/flagged`;
}
export function cleanDownloadUrl(run_id: string) {
  return `${BASE}/api/v1/results/${run_id}/clean`;
}
