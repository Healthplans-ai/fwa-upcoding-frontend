import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";

import { ProviderProfile, ProviderVerdict, Verdict } from "../lib/api";
import { FEATURED_PROVIDER_ID } from "../lib/providerStoryData";
import SeverityBadge from "./SeverityBadge";

interface Props {
  verdicts: ProviderVerdict[];
  profiles: ProviderProfile[];
  onSelect: (provider: string) => void;
}

const VERDICT_ORDER: Record<Verdict, number> = {
  AUTO_FLAG: 0, PEND_SIU: 1, MANUAL_REVIEW: 2, PASS: 3,
};

export default function ProvidersTable({ verdicts, profiles, onSelect }: Props) {
  const [filter, setFilter] = useState<"ALL" | Verdict>("ALL");
  const [query, setQuery] = useState("");

  const byProvider = useMemo(() => {
    const m = new Map<string, ProviderProfile>();
    profiles.forEach(p => m.set(p.provider, p));
    return m;
  }, [profiles]);

  const rows = useMemo(() => {
    const filtered = verdicts.filter(v => {
      if (filter !== "ALL" && v.verdict !== filter) return false;
      if (query && !v.provider.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (a.provider === FEATURED_PROVIDER_ID) return -1;
      if (b.provider === FEATURED_PROVIDER_ID) return 1;
      const va = VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict];
      if (va !== 0) return va;
      return b.hits.length - a.hits.length;
    });
    return filtered;
  }, [verdicts, filter, query]);

  const tabs: Array<{ id: "ALL" | Verdict; label: string; count: number }> = [
    { id: "ALL", label: "All", count: verdicts.length },
    { id: "AUTO_FLAG", label: "Auto-flag", count: verdicts.filter(v => v.verdict === "AUTO_FLAG").length },
    { id: "PEND_SIU", label: "Pend SIU", count: verdicts.filter(v => v.verdict === "PEND_SIU").length },
    { id: "MANUAL_REVIEW", label: "Manual review", count: verdicts.filter(v => v.verdict === "MANUAL_REVIEW").length },
    { id: "PASS", label: "Pass", count: verdicts.filter(v => v.verdict === "PASS").length },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-hp-text/10 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                ${filter === t.id
                  ? "bg-hp-text text-hp-sky"
                  : "bg-hp-light text-hp-deep hover:bg-hp-sky/40"}`}>
              {t.label}
              <span className="ml-1.5 opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hp-text/40" />
          <input
            type="text"
            placeholder="Search provider…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-full border border-hp-text/15 bg-white text-sm
                       focus:outline-none focus:border-hp-deep w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-hp-light/40 text-[11px] uppercase tracking-wider text-hp-text/60 font-bold">
            <tr>
              <th className="text-left px-4 py-2.5">Provider</th>
              <th className="text-left px-4 py-2.5">Verdict</th>
              <th className="text-right px-4 py-2.5">IP claims</th>
              <th className="text-right px-4 py-2.5">Total IP reimb.</th>
              <th className="text-right px-4 py-2.5">Unique DRGs</th>
              <th className="text-right px-4 py-2.5">High-sev DRG rate</th>
              <th className="text-left  px-4 py-2.5">Rules</th>
              <th className="text-right px-4 py-2.5"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map(v => {
              const p = byProvider.get(v.provider);
              return (
                <tr key={v.provider}
                    className="border-t border-hp-text/5 hover:bg-hp-light/30 cursor-pointer transition-colors"
                    onClick={() => onSelect(v.provider)}>
                  <td className="px-4 py-2.5 font-mono font-bold">{v.provider}</td>
                  <td className="px-4 py-2.5"><SeverityBadge level={v.verdict} /></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtNum(p?.ip_claim_count)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtMoney(p?.ip_total_reimbursement)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtNum(p?.ip_unique_drg_codes)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtPct(p?.ip_high_severity_drg_rate)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {v.hits.slice(0, 6).map((h, i) => (
                        <span key={i} className="pill bg-white border-hp-text/10 text-hp-text/80 font-mono">
                          {h.rule_id}
                        </span>
                      ))}
                      {v.hits.length > 6 && (
                        <span className="text-[10px] text-hp-text/50">
                          +{v.hits.length - 6}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-hp-text/40">
                    <ChevronRight className="w-4 h-4 inline" />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-hp-text/50">
                No providers match the current filter.
              </td></tr>
            )}
          </tbody>
        </table>
        {rows.length > 200 && (
          <div className="px-4 py-2 text-xs text-hp-text/50 bg-hp-light/30">
            Showing first 200 of {rows.length}. Download the Excel report for the full list.
          </div>
        )}
      </div>
    </div>
  );
}

function fmtNum(v: unknown): string {
  if (v == null || v === "") return "—";
  return Math.round(Number(v) || 0).toLocaleString();
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
  const n = Number(v) || 0;
  return (n * 100).toFixed(1) + "%";
}
