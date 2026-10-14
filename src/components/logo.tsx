import type { CSSProperties } from "react";

/** Stiphantube app icon: gold rounded square with a white play arrow + download arrow. */
export function StiphantubeLogo({ size = 48, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      style={style}
      aria-label="Stiphantube"
    >
      <defs>
        <linearGradient id="st-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="42%" stopColor="#f8cd3f" />
          <stop offset="100%" stopColor="#d99a06" />
        </linearGradient>
        <linearGradient id="st-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#st-gold)" />
      <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#st-gloss)" />
      {/* play triangle */}
      <path d="M36 26 L72 48 L36 70 Z" fill="#ffffff" />
      {/* download arrow overlapping bottom */}
      <g fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M48 40 V62" />
        <path d="M38 53 L48 63 L58 53" fill="#ffffff" stroke="none" />
      </g>
      <rect x="4" y="4" width="88" height="88" rx="24" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return <span className={`gold-text font-extrabold ${className ?? ""}`}>Stiphantube</span>;
}
