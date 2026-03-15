/**
 * LiquidAI Premium SVG Icon Library
 * 24×24 viewBox · strokeWidth 1.5 · currentColor · rounded linecaps
 * Fintech aesthetic — Revolut / Apple Finance inspired
 */

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
};

const STROKE = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// ─── Navigation ───────────────────────────────────────────────────────────────

/** Home / Dashboard */
export function HomeIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <path d="M3 12v9h18V12" />
    </svg>
  );
}

/** Analytics / Chart */
export function AnalyticsIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M3 20h18" />
      <path d="M5 20V12" />
      <path d="M9 20V8" />
      <path d="M13 20V15" />
      <path d="M17 20V5" />
      <path d="M3 9l5-4 4 3 5-5" />
      <circle cx="3" cy="9" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="4" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** AI Agent / Bot */
export function AgentIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M9 8V6a3 3 0 116 0v2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 17v1.5" />
      <path d="M8 21h8" />
    </svg>
  );
}

/** Savings / Goals / Piggy */
export function SavingsIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M19 12.5A7 7 0 1 0 7 17.5l-.5 2.5h9l-.5-2.5" />
      <path d="M20 9.5l1.5-1a1 1 0 0 1 1.5.87V12a1 1 0 0 1-1.5.87L20 12" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 8v1" />
    </svg>
  );
}

/** User / Profile */
export function ProfileIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// ─── Wallet / Finance ─────────────────────────────────────────────────────────

/** Wallet */
export function WalletIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M20 8H5a2 2 0 0 1 0-4h14a1 1 0 0 1 1 1v2Z" />
      <path d="M20 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Yield / Trending Up — curved chart with arrow */
export function YieldIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M3 17 C6 17 7 13 10 11 C13 9 14 7 17 6" />
      <path d="M17 6l3 0 0 3" />
      <path d="M3 20h18" />
    </svg>
  );
}

/** Inflation Shield — shield with down arrow inside */
export function InflationShieldIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3L4 7v5c0 5 4 8.5 8 10 4-1.5 8-5 8-10V7l-8-4Z" />
      <path d="M12 9v4" />
      <path d="M10 11l2 2 2-2" />
    </svg>
  );
}

/** Swap / Exchange / Mento V3 */
export function SwapIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M7 4l-4 4 4 4" />
      <path d="M3 8h13a4 4 0 0 1 0 8H9" />
      <path d="M17 20l4-4-4-4" />
    </svg>
  );
}

/** Layers / Pools / DeFi Network */
export function PoolsIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
      <path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
    </svg>
  );
}

/** Bridge / Cross-chain / Daimo */
export function BridgeIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M2 20h20" />
      <path d="M5 20V12a7 7 0 0 1 14 0v8" />
      <path d="M9 20v-6" />
      <path d="M15 20v-6" />
      <circle cx="5" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="11" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Loop / Morpho Looping */
export function LoopIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M17 3l4 4-4 4" />
      <path d="M21 7H9a4 4 0 0 0 0 8h3" />
      <path d="M7 21l-4-4 4-4" />
      <path d="M3 17h12a4 4 0 0 0 0-8h-3" />
    </svg>
  );
}

/** Credit Card — premium fintech style */
export function CardIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <path d="M2 11h20" />
      <rect x="5" y="14" width="5" height="3" rx="1" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}

/** Globe / Global / Off-ramp */
export function GlobalIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3C9.5 7 9.5 17 12 21" />
      <path d="M12 3c2.5 4 2.5 14 0 18" />
    </svg>
  );
}

/** Bank / Lending / Institutional */
export function BankIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 10V21" />
      <path d="M19 10V21" />
      <path d="M9 10v11" />
      <path d="M15 10v11" />
      <path d="M3 10L12 3l9 7" />
    </svg>
  );
}

/** Trophy / Hackathon */
export function TrophyIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4H4v4a4 4 0 0 0 3 3.87" />
      <path d="M17 4h3v4a4 4 0 0 1-3 3.87" />
      <path d="M7 4h10v7a5 5 0 0 1-10 0V4Z" />
    </svg>
  );
}

/** Fire / Aggressive Risk */
export function FlameIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 2C7 8 5 12 8 16c1 1.5 2.5 2 4 2s3-.5 4-2c3-4 1-8-4-14Z" />
      <path d="M12 21c-2.5 0-4-1.5-4-4 0-1.5 1-3 2-4 .5 1.5 1.5 2.5 2 4 .5-1.5 1-2.5 2-4 1 1 2 2.5 2 4 0 2.5-1.5 4-4 4Z" />
    </svg>
  );
}

/** Lightning / Balanced / Speed */
export function LightningIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M13 2L4 14h8l-1 8 9-12h-8l1-8Z" />
    </svg>
  );
}

/** Shield / Conservative / Protection */
export function ShieldIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3L4 7v5c0 5 4 8.5 8 10 4-1.5 8-5 8-10V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ─── Transaction Categories ───────────────────────────────────────────────────

/** Pharmacy / Medical */
export function PharmacyIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
      <path d="M3 9h18" />
    </svg>
  );
}

/** Grocery / Shopping Bag */
export function GroceryIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M6 2l-2 5h16L18 2" />
      <path d="M4 7l1.5 12a2 2 0 0 0 2 1.5h9a2 2 0 0 0 2-1.5L20 7" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/** Phone Topup / Recharge */
export function PhoneTopupIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="7" y="2" width="10" height="18" rx="2" />
      <path d="M11 6h2" />
      <path d="M14 15l-2-2-2 2" />
      <path d="M12 17V13" />
    </svg>
  );
}

/** Yield Capture / Sparkles — premium version */
export function YieldCaptureIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M18.36 18.36l1.42 1.42" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M4.22 19.78l1.42-1.42" />
      <path d="M18.36 5.64l1.42-1.42" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/** Deposit / Incoming Arrow */
export function DepositIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <path d="M12 3v10" />
      <path d="M8 9l4 4 4-4" />
    </svg>
  );
}

// ─── Savings Goal Icons ───────────────────────────────────────────────────────

/** Emergency Fund */
export function EmergencyFundIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3L4 7v5c0 5 4 8.5 8 10 4-1.5 8-5 8-10V7l-8-4Z" />
      <path d="M12 8v4" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Travel / Plane */
export function TravelIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M17.8 5.2a3.3 3.3 0 0 1 1 4.6L9 20l-4.5-1.5 2-4 4 1 5.5-8.3L14 5l3.8.2Z" />
      <path d="M3 22h18" />
    </svg>
  );
}

/** Smartphone */
export function SmartphoneIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 18h4" />
      <path d="M10 6h4" />
    </svg>
  );
}

/** House / Home Goal */
export function HouseIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

/** Education / Book */
export function EducationIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3L2 8l10 5 10-5-10-5Z" />
      <path d="M6 10.6V17a6 6 0 0 0 12 0v-6.4" />
      <path d="M22 8v6" />
    </svg>
  );
}

// ─── Protocol / Partner Icons ─────────────────────────────────────────────────

/** Rain / Rainfall — Rain Cards */
export function RainIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M20 16.5A5.5 5.5 0 0 0 9.5 11a4 4 0 1 0 0 8H19a3 3 0 0 0 1-5.5Z" />
      <path d="M8 20v2" />
      <path d="M12 19v3" />
      <path d="M16 20v2" />
    </svg>
  );
}

/** Verification / KYC / Striga */
export function KycIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 3L4 7v5c0 5 4 8.5 8 10 4-1.5 8-5 8-10V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/** PIX / QR transfer */
export function PixIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3" />
      <path d="M14 21h7" />
      <path d="M21 14v7" />
    </svg>
  );
}

/** Leaf / Nature / Mento */
export function LeafIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 3-8 7-10a7 7 0 0 1 8 7c0 4-3 7-8 10Z" />
      <path d="M11 20c-1.5-2-2.5-5-2.5-7" />
    </svg>
  );
}

/** Network / Ecosystem / Nodes */
export function NetworkIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5v4l-5 5" />
      <path d="M12 11.5l5 5" />
      <path d="M7 19h10" />
    </svg>
  );
}

/** World / Off-ramp global */
export function WorldPayIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3C9.5 6.5 9.5 17.5 12 21" />
      <path d="M12 3c2.5 3.5 2.5 14.5 0 18" />
      <path d="M18 7l2-2" />
      <path d="M20 5l-2 0 0 2" />
    </svg>
  );
}

/** Bolt / Speed / JIT Engine */
export function JITIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M13 2L4 14h8l-1 8 9-12h-8l1-8Z" />
      <circle cx="4" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Briefcase / Deposit / Work */
export function BriefcaseIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <path d="M2 14h20" />
    </svg>
  );
}

/** AI Brain Circuit */
export function BrainIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5V8a3 3 0 0 0 0 6v.5A4.5 4.5 0 0 0 9.5 19H12" />
      <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5V8a3 3 0 0 1 0 6v.5A4.5 4.5 0 0 1 14.5 19H12" />
      <path d="M12 2v17" />
      <path d="M8 8h8" />
      <path d="M8 14h8" />
    </svg>
  );
}

/** Percent / APY / Rate */
export function ApyIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="7.5" cy="7.5" r="3.5" />
      <circle cx="16.5" cy="16.5" r="3.5" />
      <path d="M4 20L20 4" />
    </svg>
  );
}

/** Credit / Layers stack */
export function CreditEngineIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

/** Route / Stable Routing path */
export function RouteIcon({ className, style, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...STROKE} className={className} style={style}>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M5 7c0 4 4 6 6 6s6 2 6 6" />
    </svg>
  );
}
