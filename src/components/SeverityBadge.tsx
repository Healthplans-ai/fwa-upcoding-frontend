import { Severity, Verdict } from "../lib/api";

interface Props {
  level: Severity | Verdict | string;
  size?: "sm" | "md";
}

const STYLE: Record<string, string> = {
  CRITICAL:      "bg-rose-100 text-rose-700 border-rose-200",
  AUTO_FLAG:     "bg-rose-100 text-rose-700 border-rose-200",
  HIGH:          "bg-amber-100 text-amber-700 border-amber-200",
  PEND_SIU:      "bg-amber-100 text-amber-700 border-amber-200",
  MED:           "bg-yellow-100 text-yellow-800 border-yellow-200",
  MEDIUM:        "bg-yellow-100 text-yellow-800 border-yellow-200",
  MANUAL_REVIEW: "bg-sky-100 text-sky-800 border-sky-200",
  LOW:           "bg-slate-100 text-slate-700 border-slate-200",
  PASS:          "bg-emerald-100 text-emerald-700 border-emerald-200",
  NONE:          "bg-slate-100 text-slate-500 border-slate-200",
};

const LABEL: Record<string, string> = {
  AUTO_FLAG:     "Auto-flag",
  PEND_SIU:      "Pend SIU",
  MANUAL_REVIEW: "Manual review",
  PASS:          "Pass",
  CRITICAL:      "Critical",
  HIGH:          "High",
  MED:           "Medium",
  MEDIUM:        "Medium",
  LOW:           "Low",
  NONE:          "—",
};

export default function SeverityBadge({ level, size = "md" }: Props) {
  const key = String(level || "").toUpperCase();
  const klass = STYLE[key] || STYLE.NONE;
  const label = LABEL[key] || level;
  return (
    <span className={`pill ${klass} ${size === "sm" ? "text-[10px] py-0" : ""}`}>
      {label}
    </span>
  );
}
