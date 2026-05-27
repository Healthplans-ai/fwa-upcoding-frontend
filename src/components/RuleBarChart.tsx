import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Analytics } from "../lib/api";

// CPT-surface rules: amber.  DRG-surface rules: rose / orange.  Each rule
// inherits a tint from its severity, not its position in the list.
const SEV_COLOR: Record<string, string> = {
  U1: "#ED7D31", U2: "#ED7D31", U3: "#ED7D31",            // CPT — HIGH
  U4: "#BF8F00", U5: "#BF8F00",                            // CPT — MED
  U6: "#C00000", U7: "#ED7D31", U8: "#ED7D31",             // DRG — CRITICAL/HIGH
  U9: "#BF8F00", U10: "#ED7D31", U11: "#BF8F00", U12: "#BF8F00",
};

export default function RuleBarChart({ analytics }: { analytics: Analytics | null }) {
  if (!analytics) return null;
  const order = ["U1","U2","U3","U4","U5","U6","U7","U8","U9","U10","U11","U12"];
  const data = order
    .map(rid => ({ rule: rid, count: analytics.by_rule[rid] || 0 }))
    .filter(d => d.count > 0);
  if (data.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="mb-3">
        <span className="hp-eyebrow">Rule firings</span>
        <h3 className="text-xl font-extrabold tracking-tight">Hits per rule</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="rule" tick={{ fontFamily: "JetBrains Mono", fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: "rgba(162,207,225,0.25)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={SEV_COLOR[d.rule] || "#1C5577"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
