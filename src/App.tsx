import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, BookOpen, FileSpreadsheet, Layers, ArrowRight, Download,
} from "lucide-react";

import {
  Analytics, ProviderProfile, ProviderVerdict, RuleSpec, UploadResult,
  getRules, providersDownloadUrl, claimsDownloadUrl, getHealth,
} from "./lib/api";
import UploadFlow from "./components/UploadFlow";
import KPITiles from "./components/KPITiles";
import ProvidersTable from "./components/ProvidersTable";
import ProviderDetail from "./components/ProviderDetail";
import RulesPanel from "./components/RulesPanel";
import RuleBarChart from "./components/RuleBarChart";
import Logo, { Sparkle } from "./components/Logo";

type Tab = "upload" | "dashboard" | "rules";

export default function App() {
  const [tab, setTab] = useState<Tab>("upload");
  const [run, setRun] = useState<UploadResult | null>(null);
  const [rules, setRules] = useState<RuleSpec[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    getRules().then(setRules).catch(() => {});
    getHealth().then(() => setHealthy(true)).catch(() => setHealthy(false));
  }, []);

  const verdictByProvider = useMemo(() => {
    const m = new Map<string, ProviderVerdict>();
    run?.verdicts?.forEach(v => m.set(v.provider, v));
    return m;
  }, [run]);
  const profileByProvider = useMemo(() => {
    const m = new Map<string, ProviderProfile>();
    run?.profiles?.forEach(p => m.set(p.provider, p));
    return m;
  }, [run]);

  function onUploaded(r: UploadResult) {
    setRun(r);
    setTab("dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header tab={tab} setTab={setTab} run={run} healthy={healthy} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {tab === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <UploadFlow onUploaded={onUploaded} />
            </motion.div>
          )}
          {tab === "dashboard" && (
            <motion.div key="dash" initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-6">
              {!run && <EmptyDashboard setTab={setTab} />}
              {run && <Dashboard run={run} onSelect={setSelected} />}
            </motion.div>
          )}
          {tab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <RulesHero />
              <RulesPanel rules={rules} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {selected && (
          <ProviderDetail
            key={selected}
            verdict={
              verdictByProvider.get(selected) ?? {
                provider: selected,
                verdict: "PASS",
                max_severity: "NONE",
                fraud_types: [],
                hits: [],
                claim_hits: {},
              }
            }
            profile={profileByProvider.get(selected) ?? null}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({
  tab, setTab, run, healthy,
}: {
  tab: Tab; setTab: (t: Tab) => void; run: UploadResult | null; healthy: boolean | null;
}) {
  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "upload",    label: "Upload",     icon: FileSpreadsheet },
    { id: "dashboard", label: "Dashboard",  icon: Layers },
    { id: "rules",     label: "Rule library", icon: BookOpen },
  ];
  return (
    <header className="sticky top-0 z-20 bg-hp-bg/80 backdrop-blur border-b border-hp-text/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Logo size="lg" animated />
          <span className="text-hp-text/40">·</span>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-wider text-hp-text/55 font-bold">
              FWA Intelligence
            </div>
            <div className="text-sm font-extrabold">Upcoding Detection · V1</div>
          </div>
        </div>
        <nav className="ml-auto flex items-center gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2
                  ${active ? "bg-hp-text text-hp-sky" : "text-hp-text hover:bg-hp-light"}`}>
                <Icon className="w-4 h-4" /> {t.label}
                {t.id === "dashboard" && run &&
                  <span className="ml-1 text-[10px] bg-hp-mint text-hp-text px-1.5 rounded-full">
                    {run.verdicts.length}
                  </span>}
              </button>
            );
          })}
        </nav>
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <span className={`relative inline-block w-2 h-2 rounded-full
            ${healthy === false ? "bg-rose-500" : healthy === true ? "bg-hp-mint live-dot" : "bg-slate-400"}`} />
          <span className="text-xs text-hp-text/65">
            {healthy === false ? "API offline" : healthy === true ? "API live" : "checking…"}
          </span>
        </div>
      </div>
    </header>
  );
}

function Dashboard({
  run, onSelect,
}: {
  run: UploadResult; onSelect: (p: string) => void;
}) {
  const a = run.analytics;
  return (
    <>
      <Hero analytics={a} run={run} />

      <KPITiles analytics={a} />

      <RuleBarChart analytics={a} />

      <div>
        <div className="mb-3">
          <span className="hp-eyebrow">Providers</span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Provider <span className="hp-underline">verdicts</span>
          </h2>
          <p className="text-sm text-hp-text/65 mt-1">
            Click a row for a quick <strong>why flagged</strong> summary, then open the
            case file for claim-level evidence and rule hits.
          </p>
        </div>
        <ProvidersTable
          verdicts={run.verdicts}
          profiles={run.profiles}
          onSelect={onSelect}
        />
      </div>
    </>
  );
}

function Hero({ analytics, run }: { analytics: Analytics; run: UploadResult }) {
  return (
    <div className="card-dark p-8 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 text-hp-mint/30">
        <Sparkle size={140} className="drift-twinkle" />
      </div>
      <div className="relative max-w-3xl">
        <span className="hp-eyebrow text-hp-mint">
          Run · <span className="font-mono">{run.run_id}</span>
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-hp-bg">
          <span className="text-white">
            {analytics.flagged_providers.toLocaleString()} provider
            {analytics.flagged_providers === 1 ? "" : "s"}
          </span>{" "}
          <span className="hp-underline text-white">flagged</span>
        </h1>
        <p className="mt-3 text-hp-bg/80 max-w-prose">
          Across{" "}
          <span className="text-white font-semibold tabular-nums">
            {analytics.total_providers.toLocaleString()}
          </span>{" "}
          provider profiles —{" "}
          {(analytics.fraud_rate * 100).toFixed(1)}% fraud rate, an estimated
          {" "}${(analytics.exposure_usd / 1_000_000).toFixed(2)}M in exposure.
          Detected input shape:{" "}
          <span className="font-mono text-hp-mint">{analytics.detected_shape}</span>.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <a className="btn-mint" href={providersDownloadUrl(run.run_id)} download>
            <Download className="w-4 h-4" /> Provider report (.xlsx)
          </a>
          <a className="btn-ghost text-hp-bg border-hp-bg" href={claimsDownloadUrl(run.run_id)} download
             style={{ color: "#FBFCFA" }}>
            <Download className="w-4 h-4" /> Claim report (.xlsx)
          </a>
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div className="card-light p-12 text-center">
      <Activity className="w-10 h-10 mx-auto text-hp-deep mb-4" />
      <h3 className="text-2xl font-extrabold mb-2">No run loaded yet</h3>
      <p className="text-hp-text/75 max-w-md mx-auto mb-6">
        Upload a provider CSV to see the dashboard. The engine runs A1–A3 and U1–U10
        rules and ranks providers by severity.
      </p>
      <button className="btn-primary" onClick={() => setTab("upload")}>
        Go to upload <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RulesHero() {
  return (
    <div className="mb-6">
      <span className="hp-eyebrow">Rule library</span>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
        How the V1 engine detects <span className="hp-underline">upcoding</span>
      </h2>
      <p className="mt-3 text-hp-text/70 max-w-2xl">
        V1 is deterministic — 13 rules across two surfaces (CPT/HCPCS and DRG).
        Each rule below shows what the engine checks, why the pattern is upcoding,
        and the downstream action. No ML — that&rsquo;s V2.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hp-text/10 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-hp-text/55">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span>· FWA Intelligence</span>
        </div>
        <span>Confidential — internal design preview</span>
      </div>
    </footer>
  );
}
