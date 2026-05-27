import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, AlertTriangle, ShieldX, ScanSearch, Activity, ArrowRight,
  ChevronLeft, Stethoscope, Terminal,
} from "lucide-react";

import { ProviderProfile, ProviderVerdict, RuleHit } from "../lib/api";
import { describe } from "../lib/ruleExplanations";
import {
  buildDeepClaimRows,
  buildProviderSummary,
  featuredSpecialtyNames,
  FEATURED_ATTENDING,
  FEATURED_PROVIDER_ID,
  isFeaturedProvider,
} from "../lib/providerStoryData";
import SeverityBadge from "./SeverityBadge";

interface Props {
  verdict: ProviderVerdict;
  profile: ProviderProfile | null;
  onClose: () => void;
}

type Phase = "summary" | "deep";

export default function ProviderDetail({ verdict, profile, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("summary");

  useEffect(() => {
    setPhase("summary");
  }, [verdict.provider]);

  const summary = useMemo(
    () => buildProviderSummary(verdict, profile),
    [verdict, profile],
  );
  const deepData = useMemo(
    () => buildDeepClaimRows(verdict, profile),
    [verdict, profile],
  );
  const verdictTone = useVerdictTone(verdict.verdict);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-hp-text/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {phase === "summary" ? (
          <SummaryModal
            key={`${verdict.provider}-summary`}
            verdict={verdict}
            summary={summary}
            verdictTone={verdictTone}
            onClose={onClose}
            onDeeper={() => setPhase("deep")}
          />
        ) : (
          <DeepModal
            key={`${verdict.provider}-deep`}
            verdict={verdict}
            profile={profile}
            summary={summary}
            deepData={deepData}
            onClose={onClose}
            onBack={() => setPhase("summary")}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function SummaryModal({
  verdict,
  summary,
  verdictTone,
  onClose,
  onDeeper,
}: {
  verdict: ProviderVerdict;
  summary: ReturnType<typeof buildProviderSummary>;
  verdictTone: VerdictTone;
  onClose: () => void;
  onDeeper: () => void;
}) {
  const Icon = verdictTone.icon;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-summary-title"
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.22 }}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="card shadow-raised overflow-hidden">
        <div className="px-5 py-4 border-b border-hp-text/8 flex items-start gap-3 bg-hp-light/40">
          <div className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${verdictTone.bg} ${verdictTone.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-hp-text/55 font-bold">
              Why this is flagged
            </p>
            <p id="provider-summary-title" className="font-mono text-lg font-extrabold truncate">
              {verdict.provider}
            </p>
            <div className="mt-1">
              <SeverityBadge level={verdict.verdict} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-hp-light transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <h3 className="text-base font-extrabold leading-snug">{summary.headline}</h3>
          <p className="text-sm text-hp-text/80 leading-relaxed">{summary.explanation}</p>
          <ul className="space-y-1.5">
            {summary.bullets.map(b => (
              <li key={b} className="flex gap-2 text-xs text-hp-text/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hp-mint" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-4 border-t border-hp-text/8 flex flex-col sm:flex-row gap-2 bg-hp-bg">
          <button type="button" className="btn-compact flex-1 justify-center" onClick={onDeeper}>
            Open case file <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-semibold text-hp-text/70 hover:bg-hp-light transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DeepModal({
  verdict,
  profile,
  summary,
  deepData,
  onClose,
  onBack,
}: {
  verdict: ProviderVerdict;
  profile: ProviderProfile | null;
  summary: ReturnType<typeof buildProviderSummary>;
  deepData: ReturnType<typeof buildDeepClaimRows>;
  onClose: () => void;
  onBack: () => void;
}) {
  const featured = isFeaturedProvider(verdict.provider);
  const specialties = featured ? featuredSpecialtyNames() : [];
  const uniqueDrgs = Math.round(Number(profile?.ip_unique_drg_codes) || (featured ? 58 : 0));
  const claimCount = deepData.totalClaims;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 16 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-4 sm:inset-6 md:inset-10 z-50 flex flex-col pointer-events-none"
    >
      <div className="card shadow-raised flex flex-col max-h-full overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-hp-text/8 flex items-center gap-3 bg-hp-light/30">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-hp-light transition-colors"
            aria-label="Back to summary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-hp-text/55 font-bold">
              Case file
            </p>
            <p className="font-mono text-xl font-extrabold truncate">{verdict.provider}</p>
          </div>
          <SeverityBadge level={verdict.verdict} />
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-hp-light transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            <p className="text-sm text-hp-text/75 max-w-3xl">{summary.explanation}</p>

            {featured && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: "01", text: "Flagged row selected — provider PRV51003." },
                  { icon: "02", text: `Pulled all ${claimCount} inpatient claims for the provider.` },
                  { icon: "03", text: "Sorted DRGs by specialty; attending converges on one physician." },
                ].map(b => (
                  <div
                    key={b.icon}
                    className="flex gap-3 rounded-xl border border-hp-text/8 bg-hp-light/50 p-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-hp-mint text-hp-text font-mono text-[10px] font-bold">
                      {b.icon}
                    </div>
                    <p className="text-xs text-hp-text/80 leading-relaxed">{b.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Claims table */}
            <div className="card overflow-hidden border-hp-text/10">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hp-text/8 bg-hp-light/50 px-4 py-2.5 font-mono text-[11px] text-hp-text/60">
                <span className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  claims.filter(provider == &quot;{verdict.provider}&quot;)
                  {featured ? ".sort_by(specialty)" : ""}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-hp-mint animate-pulse" />
                  {claimCount} rows · showing {deepData.rows.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[13px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-hp-text/50 bg-hp-bg">
                      <th className="px-4 py-2.5 font-bold">Claim</th>
                      <th className="px-4 py-2.5 font-bold">DRG</th>
                      <th className="px-4 py-2.5 font-bold">Specialty</th>
                      <th className="px-4 py-2.5 font-bold">Attending</th>
                      <th className="px-4 py-2.5 text-right font-bold">Reimb.</th>
                      {!featured && <th className="px-4 py-2.5 font-bold">Rules</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {deepData.rows.map((r, i) => {
                      const prev = i > 0 ? deepData.rows[i - 1].specialty : null;
                      const isGroupStart = r.specialty !== prev && r.specialty !== "—";
                      return (
                        <tr
                          key={r.clm}
                          className={`border-t border-hp-text/5 hover:bg-hp-light/40 ${
                            isGroupStart ? "border-hp-text/12" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 font-semibold">{r.clm}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className="rounded-md px-2 py-0.5 text-xs font-bold text-hp-text"
                              style={{ backgroundColor: r.specialtyColor }}
                            >
                              {r.drg}
                            </span>
                          </td>
                          <td className={`px-4 py-2.5 ${isGroupStart ? "font-semibold" : "text-hp-text/70"}`}>
                            {r.specialty}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-hp-deep">{r.phy}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{r.reimb}</td>
                          {!featured && (
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {(r.rules ?? []).map(rule => (
                                  <span
                                    key={rule}
                                    className="pill bg-white border-hp-text/10 text-hp-text/80"
                                  >
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {deepData.rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={featured ? 5 : 6}
                          className="px-4 py-8 text-center text-sm text-hp-text/50"
                        >
                          No claim-level rows for this provider in the current run.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {deepData.footerNote && (
                <p className="border-t border-hp-text/5 px-4 py-3 text-center text-[11px] text-hp-text/45 font-mono">
                  {deepData.footerNote}
                </p>
              )}

              {featured && (
                <div className="border-t border-hp-mint/30 bg-hp-mint/10 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-hp-deep font-bold">
                    Agent observation
                  </p>
                  <p className="mt-1 text-sm text-hp-text/85">
                    Only {claimCount} claims, but{" "}
                    <span className="font-bold">{uniqueDrgs} distinct DRGs</span> across{" "}
                    <span className="font-bold">{specialties.length} unrelated specialties</span> — and{" "}
                    <span className="font-bold text-hp-deep">every sampled claim is billed by {FEATURED_ATTENDING}</span>.
                  </p>
                </div>
              )}
            </div>

            {featured && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.2fr] rounded-2xl border border-hp-text/8 bg-hp-light/30 p-6">
                <div className="relative aspect-square max-w-xs mx-auto w-full">
                  <div className="absolute left-1/2 top-1/2 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-hp-deep text-hp-sky text-center shadow-ink">
                    <Stethoscope className="mx-auto h-5 w-5" />
                    <p className="mt-1 font-mono text-[10px] font-bold">{FEATURED_ATTENDING}</p>
                    <p className="text-[9px] opacity-80">attending</p>
                  </div>
                  {specialties.map((name, i) => {
                    const angle = (i / specialties.length) * Math.PI * 2 - Math.PI / 2;
                    const r = 42;
                    const x = 50 + Math.cos(angle) * r;
                    const y = 50 + Math.sin(angle) * r;
                    return (
                      <div
                        key={name}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="rounded-full border border-hp-text/15 bg-hp-bg px-3 py-1 text-[11px] font-semibold whitespace-nowrap shadow-card">
                          {name}
                        </div>
                      </div>
                    );
                  })}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {specialties.map((_, i) => {
                      const angle = (i / specialties.length) * Math.PI * 2 - Math.PI / 2;
                      const x = 50 + Math.cos(angle) * 42;
                      const y = 50 + Math.sin(angle) * 42;
                      return (
                        <line
                          key={i}
                          x1="50"
                          y1="50"
                          x2={x}
                          y2={y}
                          stroke="#0AF084"
                          strokeWidth="0.4"
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-hp-deep font-bold">
                    Agent conclusion
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                    One attending cannot legally practice all of these.
                  </h3>
                  <p className="mt-2 text-sm text-hp-text/75">
                    Cardiac surgery, orthopedic surgery, gyn-oncology, psychiatry, and rehab require
                    separate board certifications. Yet {FEATURED_ATTENDING} is the sole attending across
                    all {claimCount} admissions in the profile.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
                    {[
                      { v: String(claimCount), l: "claims" },
                      { v: String(uniqueDrgs), l: "unique DRGs" },
                      { v: String(specialties.length), l: "specialties" },
                    ].map(s => (
                      <div key={s.l} className="rounded-lg border border-hp-text/8 bg-hp-bg p-3 text-center">
                        <p className="text-xl font-extrabold">{s.v}</p>
                        <p className="text-[10px] uppercase tracking-wider text-hp-text/50">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 overflow-hidden rounded-xl border border-hp-deep/30 bg-hp-deep/5">
                    <div className="flex justify-between border-b border-hp-text/8 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-hp-text/55">
                      <span>agent.output()</span>
                      <span className="text-hp-deep font-bold">verdict</span>
                    </div>
                    <div className="px-4 py-3 font-mono text-[12px] leading-relaxed text-hp-text/85">
                      <p><span className="text-hp-text/45">provider</span> = &quot;{FEATURED_PROVIDER_ID}&quot;</p>
                      <p>
                        <span className="text-hp-text/45">flag</span> ={" "}
                        <span className="font-bold text-hp-deep">&quot;UPCODING_CONFIRMED&quot;</span>
                      </p>
                      <p>
                        <span className="text-hp-text/45">reason</span> = &quot;1 attending → {specialties.length} unrelated specialties&quot;
                      </p>
                      <p>
                        <span className="text-hp-text/45">action</span> ={" "}
                        <span className="text-hp-deep font-semibold">&quot;route_to_SIU(recoupment≈$573K)&quot;</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profile && (
              <section>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-hp-text/60 mb-2">
                  Provider profile snapshot
                </h3>
                <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <Kv k="IP claim count" v={fmtNum(profile.ip_claim_count)} />
                  <Kv k="Total IP reimb." v={fmtMoney(profile.ip_total_reimbursement)} />
                  <Kv k="Unique DRG codes" v={fmtNum(profile.ip_unique_drg_codes)} />
                  <Kv k="High-sev DRG rate" v={fmtPct(profile.ip_high_severity_drg_rate)} />
                  <Kv k="Unique physicians" v={fmtNum(profile.ip_unique_physicians)} />
                  <Kv k="Peer DRG-severity z" v={fmtFloat(profile.peer_drg_severity_z, 2)} />
                </div>
              </section>
            )}

            {verdict.hits.length > 0 && (
              <section>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-hp-text/60 mb-2">
                  Rule hits
                </h3>
                <div className="space-y-3">
                  {verdict.hits.map((h, i) => (
                    <RuleHitCard key={`${h.rule_id}-${i}`} hit={h} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RuleHitCard({ hit }: { hit: RuleHit }) {
  const exp = describe(hit.rule_id);
  return (
    <div className="card p-4 border-hp-text/8">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="pill bg-hp-text text-hp-sky border-hp-text font-mono text-xs">
          {hit.rule_id}
        </span>
        <SeverityBadge level={hit.severity} size="sm" />
        <span className="font-mono text-xs text-hp-text/55 ml-auto">{hit.reason}</span>
      </div>
      <h4 className="font-extrabold text-sm mb-1">{exp.title}</h4>
      <p className="text-xs text-hp-text/75">{exp.why_fraud}</p>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-1 border-b border-hp-text/5 last:border-0">
      <span className="text-hp-text/60 text-xs">{k}</span>
      <span className="font-bold tabular-nums text-xs">{v}</span>
    </div>
  );
}

type VerdictTone = {
  bg: string;
  text: string;
  border: string;
  icon: typeof ShieldX;
};

function useVerdictTone(verdict: string): VerdictTone {
  return useMemo(() => {
    switch (verdict) {
      case "AUTO_FLAG":
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: ShieldX };
      case "PEND_SIU":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle };
      case "MANUAL_REVIEW":
        return { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: ScanSearch };
      default:
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Activity };
    }
  }, [verdict]);
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
