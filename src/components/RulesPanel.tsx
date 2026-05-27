import { RuleSpec } from "../lib/api";
import { describe } from "../lib/ruleExplanations";
import SeverityBadge from "./SeverityBadge";

interface Props { rules: RuleSpec[]; }

export default function RulesPanel({ rules }: Props) {
  if (!rules.length) {
    return (
      <div className="card p-8 text-center text-hp-text/55">
        Rule library not loaded.
      </div>
    );
  }

  const CPT_IDS = new Set(["U1", "U2", "U3", "U4", "U5"]);
  const grouped = {
    cpt: rules.filter(r => CPT_IDS.has(r.id)),
    drg: rules.filter(r => !CPT_IDS.has(r.id)),
  };

  return (
    <div className="space-y-8">
      <Section title="CPT / HCPCS upcoding" subtitle="U1–U5 · procedure-code surface" items={grouped.cpt} />
      <Section title="DRG upcoding"         subtitle="U6–U12 · severity-tier surface" items={grouped.drg} />
    </div>
  );
}

function Section({ title, subtitle, items }: { title: string; subtitle: string; items: RuleSpec[] }) {
  return (
    <section>
      <div className="mb-3">
        <span className="hp-eyebrow">{subtitle}</span>
        <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(r => {
          const exp = describe(r.id);
          return (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="pill bg-hp-text text-hp-sky border-hp-text font-mono text-xs">{r.id}</span>
                <SeverityBadge level={r.severity} size="sm" />
                <SeverityBadge level={r.action as any} size="sm" />
                {r.surface && (
                  <span className="pill bg-hp-light border-hp-sky/40 text-hp-deep">{r.surface}</span>
                )}
              </div>
              <h4 className="font-extrabold mb-1">{r.name}</h4>
              <p className="text-sm text-hp-text/75 mb-2">{exp.summary}</p>
              <details className="text-sm">
                <summary className="cursor-pointer text-hp-deep font-bold hover:text-hp-text">
                  Why it&rsquo;s upcoding
                </summary>
                <p className="mt-2 text-hp-text/80">{exp.why_fraud}</p>
                <p className="mt-2 text-hp-text/65"><span className="font-bold">Action.</span> {exp.action}</p>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}
