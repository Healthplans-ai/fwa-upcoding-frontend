import { FraudType } from "../lib/api";

interface Props {
  type: FraudType | string;
  size?: "sm" | "md";
}

// Upcoding = purple; Unbundling = teal. Distinct from the severity colours
// (rose/amber/sky) so a row can show both a verdict and a fraud-type at once.
const STYLE: Record<string, string> = {
  upcoding:   "bg-violet-100 text-violet-700 border-violet-200",
  unbundling: "bg-teal-100 text-teal-700 border-teal-200",
};

const LABEL: Record<string, string> = {
  upcoding:   "Upcoding",
  unbundling: "Unbundling",
};

export default function FraudTypeBadge({ type, size = "md" }: Props) {
  const key = String(type || "").toLowerCase();
  const klass = STYLE[key] || "bg-slate-100 text-slate-600 border-slate-200";
  const label = LABEL[key] || type;
  return (
    <span className={`pill ${klass} ${size === "sm" ? "text-[10px] py-0" : ""}`}>
      {label}
    </span>
  );
}
