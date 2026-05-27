import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "dark" | "light" | "mint";
  animated?: boolean;
}

const HEIGHT: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-5", md: "h-6", lg: "h-8", xl: "h-10",
};

const LOGO_SRC = "/Picture3.svg";

export default function Logo({
  className = "", size = "md", tone = "dark", animated = false,
}: LogoProps) {
  const Img = (
    <img
      src={LOGO_SRC}
      alt="healthplans.ai"
      className={`${HEIGHT[size]} w-auto object-contain object-left ${className} ${
        tone === "light" ? "brightness-0 invert" : tone === "mint" ? "brightness-0 invert hue-rotate-90" : ""
      }`}
      draggable={false}
    />
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
