import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "dark" | "light" | "mint";
  animated?: boolean;
}

const HEIGHT: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-5", md: "h-6", lg: "h-8", xl: "h-12",
};

/**
 * healthplans.ai wordmark — text-based render so this app does not require
 * the proprietary PNG to live alongside the duplicate-detection front-end.
 * Same visual hierarchy: bold "healthplans" + thin ".ai" suffix.
 */
export default function Logo({
  className = "", size = "md", tone = "dark", animated = false,
}: LogoProps) {
  const color =
    tone === "light" ? "text-hp-bg"
    : tone === "mint" ? "text-hp-mint"
    : "text-hp-text";

  const Img = (
    <span className={`inline-flex items-baseline font-display font-extrabold tracking-tight ${HEIGHT[size]} ${color} ${className}`}
          style={{ letterSpacing: "-0.04em" }}>
      <span className="text-[1.05em]">healthplans</span>
      <span className="text-[0.7em] opacity-70 font-medium">.ai</span>
    </span>
  );

  if (!animated) return Img;
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-block"
    >
      {Img}
    </motion.span>
  );
}

export function Sparkle({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64" width={size} height={size}
      className={className} style={{ display: "block" }}
      aria-hidden="true"
    >
      <path
        d="M32 4 C 33.5 18, 38 26, 60 32 C 38 38, 33.5 46, 32 60 C 30.5 46, 26 38, 4 32 C 26 26, 30.5 18, 32 4 Z"
        fill="currentColor"
      />
    </svg>
  );
}
