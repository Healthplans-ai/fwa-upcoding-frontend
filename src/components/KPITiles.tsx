import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  BadgeAlert, BarChart3, DollarSign, FileWarning, ShieldX,
} from "lucide-react";
import { useEffect } from "react";

import { Analytics } from "../lib/api";

interface Props { analytics: Analytics | null; }

export default function KPITiles({ analytics }: Props) {
  const tiles = [
    {
      label: "Flagged providers",
      value: analytics?.flagged_providers ?? 0,
      format: "int" as const,
      icon: FileWarning,
      ring: "from-rose-300 via-rose-200 to-rose-100",
      accent: "text-rose-600",
    },
    {
      label: "Fraud rate",
      value: (analytics?.fraud_rate ?? 0) * 100,
      format: "percent" as const,
      icon: BarChart3,
      ring: "from-amber-300 via-amber-200 to-amber-100",
      accent: "text-amber-600",
    },
    {
      label: "$ exposure",
      value: analytics?.exposure_usd ?? 0,
      format: "money" as const,
      icon: DollarSign,
      ring: "from-hp-deep via-hp-sky to-hp-light",
      accent: "text-hp-deep",
    },
    {
      label: "Total providers",
      value: analytics?.total_providers ?? 0,
      format: "int" as const,
      icon: BadgeAlert,
      ring: "from-hp-sky via-hp-light to-hp-bg",
      accent: "text-hp-deep",
    },
    {
      label: "Pend SIU",
      value: analytics?.by_verdict?.PEND_SIU ?? 0,
      format: "int" as const,
      icon: ShieldX,
      ring: "from-hp-text via-hp-deep to-hp-sky",
      accent: "text-hp-text",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="group relative card p-5 overflow-hidden hover:-translate-y-0.5 transition-transform"
        >
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${t.ring}`} />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
            <t.icon className="w-full h-full" strokeWidth={1.5} />
          </div>
          <div className="relative">
            <div className={`inline-flex w-10 h-10 rounded-2xl bg-hp-light grid place-items-center ${t.accent}`}>
              <t.icon className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <div className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-hp-text leading-none"
                 style={{ letterSpacing: "-0.04em" }}>
              <AnimatedNumber value={t.value} format={t.format} />
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-wider text-hp-text/55 font-bold">
              {t.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedNumber(
  { value, format }: { value: number; format: "int" | "percent" | "money" },
) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 22 });
  const display = useTransform(spring, (v) => {
    if (format === "percent") return v.toFixed(1) + "%";
    if (format === "money") {
      if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(2) + "M";
      if (v >= 1_000) return "$" + (v / 1_000).toFixed(0) + "K";
      return "$" + Math.round(v).toLocaleString();
    }
    return Math.round(v).toLocaleString();
  });
  useEffect(() => { mv.set(value); }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}
