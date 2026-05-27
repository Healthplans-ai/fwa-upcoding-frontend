import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, ShieldX, ScanSearch, Activity } from "lucide-react";

import { ProviderProfile, ProviderVerdict, RuleHit } from "../lib/api";
import { describe } from "../lib/ruleExplanations";
import SeverityBadge from "./SeverityBadge";

interface Props {
  verdict: ProviderVerdict;
  profile: ProviderProfile | null;
  onClose: () => void;
}

export default function ProviderDetail({ verdict, profile, onClose }: Props) {
  const verdictTone = useMemo(() => {
    switch (verdict.verdict) {
      case "AUTO_FLAG":     return { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    icon: ShieldX };
      case "PEND_SIU":      return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: AlertTriangle };
      case "MANUAL_REVIEW": return { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     icon: ScanSearch };
      default:              return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Activity };
    }
  }, [verdict.verdict]);
  const Icon = verdictTone.icon;

  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed top-0 right-0 bottom-0 w-full md:w-[640px] z-30
                 bg-hp-bg shadow-raised border-l border-hp-text/10 overflow-y-auto"
    >
      <div className="sticky top-0 z-10 bg-hp-bg border-b border-hp-text/10 px-6 py-4 flex items-center gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-hp-text/55 font-bold">Provider</div>
          <div className="text-xl font-extrabold font-mono">{verdict.provider}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SeverityBadge level={verdict.verdict} />
          <button onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-hp-light transition-colors"
            aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Verdict banner */}
        <div className={`card ${verdictTone.bg} ${verdictTone.border} border p-5 flex gap-4 items-start`}>
          <div className={`w-12 h-12 rounded-2xl bg-white grid place-items-center ${verdictTone.text}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className={`font-extrabold text-lg ${verdictTone.text}`}>
              {humanVerdict(verdict.verdict)}
            </div>
            <div className="text-sm text-hp-text/75 mt-1">
              {verdict.hits.length} rule{verdict.hits.length === 1 ? "" : "s"} fired ·{" "}
              {Object.keys(verdict.claim_hits || {}).length} claim-level hit
              {Object.keys(verdict.claim_hits || {}).length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Profile snapshot */}
        {profile && (
          <section>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-hp-text/60 mb-2">
              Provider profile snapshot
            </h3>
            <div className="card p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Kv k="IP claim count"            v={fmtNum(profile.ip_claim_count)} />
              <Kv k="Total IP reimb."           v={fmtMoney(profile.ip_total_reimbursement)} />
              <Kv k="Unique DRG codes"          v={fmtNum(profile.ip_unique_drg_codes)} />
              <Kv k="High-severity DRG rate"    v={fmtPct(profile.ip_high_severity_drg_rate)} />
              <Kv k="Avg DRG severity"          v={fmtNum(profile.ip_avg_drg_severity)} />
              <Kv k="Avg LOS (days)"            v={fmtFloat(profile.ip_avg_los)} />
              <Kv k="Avg procedure count"       v={fmtFloat(profile.ip_avg_procedure_count)} />
              <Kv k="Avg chronic conditions"    v={fmtFloat(profile.ip_avg_chronic_conds)} />
              <Kv k="Peer DRG-severity z"       v={fmtFloat(profile.peer_drg_severity_z, 2)} />
              <Kv k="Peer IP-reimb z"           v={fmtFloat(profile.peer_ip_reimb_z, 2)} />
            </div>
          </section>
        )}

        {/* Why this is fraud — rule-by-rule */}
        <section>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-hp-text/60 mb-2">
            Why this provider is flagged
          </h3>
          <p className="text-sm text-hp-text/75 mb-4">
            Each rule below was triggered by a specific threshold or peer comparison.
            The evidence is the exact values the engine used to make the decision.
          </p>

          {verdict.hits.length === 0 && (
            <div className="card p-6 text-center text-emerald-700 bg-emerald-50 border border-emerald-200">
              <Activity className="w-6 h-6 mx-auto mb-2" />
              No rules fired — provider passes V1 with no upcoding indicators.
            </div>
          )}

          <div className="space-y-3">
            {verdict.hits.map((h, i) => <RuleHitCard key={i} hit={h} />)}
          </div>
        </section>

        {/* Claim-level hits, if any */}
        {Object.keys(verdict.claim_hits || {}).length > 0 && (
          <section>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-hp-text/60 mb-2">
              Claim-level evidence
            </h3>
            <div className="card divide-y divide-hp-text/5">
              {Object.entries(verdict.claim_hits).slice(0, 20).map(([cid, hits]) => (
                <div key={cid} className="p-3 flex items-center gap-3">
                  <div className="font-mono text-sm font-bold flex-shrink-0">{cid}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {hits.map((h, i) => (
                      <span key={i} className="pill bg-amber-100 border-amber-200 text-amber-800 font-mono">
                        {h.rule_id} · {h.reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(verdict.claim_hits).length > 20 && (
                <div className="px-4 py-2 text-xs text-hp-text/50">
                  +{Object.keys(verdict.claim_hits).length - 20} more — see the claims Excel report.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </motion.aside>
  );
}

function RuleHitCard({ hit }: { hit: RuleHit }) {
  const exp = describe(hit.rule_id);
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="pill bg-hp-text text-hp-sky border-hp-text font-mono text-xs">
          {hit.rule_id}
        </span>
        <SeverityBadge level={hit.severity} size="sm" />
        <span className="pill bg-hp-light border-hp-sky/40 text-hp-deep">
          {hit.surface}
        </span>
        <span className="font-mono text-xs text-hp-text/55 ml-auto">{hit.reason}</span>
      </div>
      <h4 className="font-extrabold text-base mb-1">{exp.title}</h4>
      <p className="text-sm text-hp-text/75 mb-3">{exp.summary}</p>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-hp-text/55 font-bold mb-1">
          Why it&rsquo;s upcoding
        </div>
        <p className="text-sm text-hp-text/85">{exp.why_fraud}</p>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-hp-text/55 font-bold mb-1">
          Evidence
        </div>
        <div className="rounded-xl bg-hp-light/50 border border-hp-sky/30 p-3
                        text-xs font-mono whitespace-pre-wrap break-all">
          {formatEvidence(hit.evidence)}
        </div>
      </div>

      <div className="mt-3 text-xs text-hp-text/65">
        <span className="font-bold">Action.</span> {exp.action}
      </div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-hp-text/5 last:border-0 py-1">
      <span className="text-hp-text/60">{k}</span>
      <span className="font-bold tabular-nums">{v}</span>
    </div>
  );
}

function formatEvidence(ev: Record<string, unknown>): string {
  return Object.entries(ev || {})
    .map(([k, v]) => `${k}: ${pretty(v)}`)
    .join("\n");
}
function pretty(v: unknown): string {
  if (typeof v === "number") {
    if (Number.isInteger(v)) return v.toLocaleString();
    return (Math.round(v * 1000) / 1000).toString();
  }
  if (Array.isArray(v))      return "[" + v.map(pretty).join(", ") + "]";
  if (v && typeof v === "object") return JSON.stringify(v);
  return String(v);
}
function humanVerdict(v: string): string {
  switch (v) {
    case "AUTO_FLAG":     return "Auto-flagged — routed to SIU";
    case "PEND_SIU":      return "Pending SIU review";
    case "MANUAL_REVIEW": return "Manual review queue";
    case "PASS":          return "Pass — no rules fired";
    default:              return v;
  }
}

function fmtNum(v: unknown): string {
  if (v == null || v === "") return "—";
  return Math.round(Number(v) || 0).toLocaleString();
}
function fmtFloat(v: unknown, places = 2): string {
  if (v == null || v === "") return "—";
  return (Number(v) || 0).toFixed(places);
}
function fmtMoney(v: unknown): string {
  if (v == null || v === "") return "—";
  const n = Number(v) || 0;
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}
function fmtPct(v: unknown): string {
  if (v == null || v === "") return "—";
  return ((Number(v) || 0) * 100).toFixed(1) + "%";
}
