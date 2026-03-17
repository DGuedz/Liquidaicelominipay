import { useEffect, useId, useMemo, useState } from "react";

type LogoVariant = "full" | "horizontal" | "icon" | "wordmark";
type LogoTheme = "dark" | "light" | "auto";
type ResolvedTheme = "dark" | "light";
type LogoBackground = "transparent" | "light" | "dark" | "auto";
type ResolvedBackground = "transparent" | "light" | "dark";

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  background?: LogoBackground;
  size?: number;
  className?: string;
  animate?: boolean;
}

interface LogoColors {
  text: string;
  sub: string;
  greenStart: string;
  greenEnd: string;
  goldStart: string;
  goldEnd: string;
  ring: string;
}

const NEURAL_NODES = [
  { x: 76, y: 152, t: 0.41 },
  { x: 124, y: 152, t: 0.44 },
  { x: 82, y: 134, t: 0.47 },
  { x: 118, y: 134, t: 0.5 },
  { x: 100, y: 158, t: 0.43 },
];

function getAutoTheme(): ResolvedTheme {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (root.classList.contains("dark")) return "dark";
    if (root.classList.contains("light")) return "light";
    return "light";
  }

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function resolveTheme(theme: LogoTheme): ResolvedTheme {
  if (theme === "light" || theme === "dark") return theme;
  return getAutoTheme();
}

function useResolvedTheme(theme: LogoTheme): ResolvedTheme {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      setResolvedTheme(theme);
      return;
    }

    const updateTheme = () => setResolvedTheme(getAutoTheme());
    updateTheme();

    const root = typeof document !== "undefined" ? document.documentElement : null;
    const observer = root ? new MutationObserver(updateTheme) : null;
    observer?.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });

    const media =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: light)")
        : null;

    const onMediaChange = () => updateTheme();
    if (media && typeof media.addEventListener === "function") {
      media.addEventListener("change", onMediaChange);
    } else if (media) {
      media.addListener(onMediaChange);
    }

    return () => {
      observer?.disconnect();
      if (media && typeof media.removeEventListener === "function") {
        media.removeEventListener("change", onMediaChange);
      } else if (media) {
        media.removeListener(onMediaChange);
      }
    };
  }, [theme]);

  return resolvedTheme;
}

function colors(theme: ResolvedTheme): LogoColors {
  if (theme === "light") {
    return {
      text: "#0A0E1A",
      sub: "#16A34A",
      greenStart: "#35D07F",
      greenEnd: "#1A8A4A",
      goldStart: "#FCFF52",
      goldEnd: "#F0C030",
      ring: "#35D07F",
    };
  }

  return {
    text: "#FFFFFF",
    sub: "#35D07F",
    greenStart: "#35D07F",
    greenEnd: "#1A8A4A",
    goldStart: "#FCFF52",
    goldEnd: "#F0C030",
    ring: "#35D07F",
  };
}

function idSafe(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveBackground(background: LogoBackground, theme: ResolvedTheme): ResolvedBackground {
  if (background === "auto") return theme;
  return background;
}

function backgroundFill(mode: ResolvedBackground) {
  if (mode === "dark") return "#0F1829";
  if (mode === "light") return "#E8FBF0";
  return "none";
}

function reservoirFill(mode: ResolvedBackground) {
  if (mode === "dark") return "#0B1520";
  if (mode === "light") return "#EAFBF1";
  return "rgba(53,208,127,0.06)";
}

interface IconMarkProps {
  size: number;
  theme: LogoTheme;
  background: LogoBackground;
  animate: boolean;
  className: string;
}

export function LiquidLogo({
  variant = "full",
  theme = "auto",
  background = "transparent",
  size,
  className = "",
  animate = false,
}: LogoProps) {
  const defaultSize =
    variant === "wordmark" ? 120 : variant === "horizontal" ? 210 : variant === "icon" ? 48 : 120;
  const finalSize = size ?? defaultSize;

  if (variant === "full") {
    return (
      <FullMark
        size={finalSize}
        theme={theme}
        background={background}
        className={className}
        animate={animate}
      />
    );
  }

  if (variant === "wordmark") {
    return <WordMark size={finalSize} theme={theme} className={className} />;
  }

  if (variant === "horizontal") {
    return <HorizontalMark size={finalSize} theme={theme} background={background} className={className} animate={animate} />;
  }

  return <IconMark size={finalSize} theme={theme} background={background} animate={animate} className={className} />;
}

function FullMark({
  size,
  theme,
  background,
  className,
  animate,
}: {
  size: number;
  theme: LogoTheme;
  background: LogoBackground;
  className: string;
  animate: boolean;
}) {
  const iconSize = Math.max(24, Math.round(size * 0.72));
  const wordSize = Math.max(80, Math.round(size * 0.92));

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: Math.max(4, Math.round(size * 0.04)),
      }}
    >
      <IconMark size={iconSize} theme={theme} background={background} animate={animate} className="" />
      <WordMark size={wordSize} theme={theme} className="" />
    </div>
  );
}

function IconMark({ size, theme, background, animate, className }: IconMarkProps) {
  const [hovered, setHovered] = useState(false);
  const resolvedTheme = useResolvedTheme(theme);
  const resolvedBackground = useMemo(
    () => resolveBackground(background, resolvedTheme),
    [background, resolvedTheme],
  );
  const c = colors(resolvedTheme);
  const uid = idSafe(useId());
  const id = `liquid-icon-${resolvedTheme}-${resolvedBackground}-${size}-${uid}`;
  const live = animate || hovered;

  const ringOpacity = live ? 0.6 : 0.35;
  const innerRingOpacity = live ? 0.25 : 0.12;
  const glowOpacity = live ? 0.28 : 0.18;
  const shineOpacity = live ? 0.5 : 0.38;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role="img"
      aria-label="LiquidAI logo"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.greenStart} />
          <stop offset="100%" stopColor={c.greenEnd} />
        </linearGradient>

        <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.goldStart} />
          <stop offset="100%" stopColor={c.goldEnd} />
        </linearGradient>

        <radialGradient id={`${id}-glow`} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor={c.greenStart} stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor={resolvedBackground === "transparent" ? c.greenStart : backgroundFill(resolvedBackground)} stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-dropglow`}>
          <feGaussianBlur stdDeviation={hovered ? "6" : "4"} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse">
          <circle cx="100" cy="100" r="67" />
        </clipPath>
      </defs>

      {/* Outer area stays transparent; contrast is handled inside the circle only */}

      {/* Layer 1: background glow */}
      <circle cx="100" cy="100" r="90" fill={`url(#${id}-glow)`} />

      {/* Layer 2: orbital rings */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="1.5"
        strokeDasharray="5 3.5"
        opacity={ringOpacity}
        style={{ transition: "opacity 0.4s ease" }}
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke={c.ring}
        strokeWidth="0.8"
        opacity={innerRingOpacity}
        style={{ transition: "opacity 0.4s ease" }}
      />

      {/* Layer 3: inner reservoir (sem fundo escuro) */}
      <circle
        cx="100"
        cy="100"
        r="68"
        fill={reservoirFill(resolvedBackground)}
      />

      {/* Layer 4: waves */}
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M28,122 Q55,108 82,122 Q109,136 136,122 Q163,108 172,118 L172,180 L28,180 Z"
          fill={c.greenStart}
          opacity="0.1"
        >
          {live && (
            <animate
              attributeName="d"
              values="M28,122 Q55,108 82,122 Q109,136 136,122 Q163,108 172,118 L172,180 L28,180 Z;M28,110 Q55,96 82,110 Q109,124 136,110 Q163,96 172,106 L172,180 L28,180 Z;M28,122 Q55,108 82,122 Q109,136 136,122 Q163,108 172,118 L172,180 L28,180 Z"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        <path
          d="M28,132 Q60,118 92,132 Q124,146 156,132 L172,140 L172,180 L28,180 Z"
          fill={c.greenStart}
          opacity="0.06"
        >
          {live && (
            <animate
              attributeName="d"
              values="M28,132 Q60,118 92,132 Q124,146 156,132 L172,140 L172,180 L28,180 Z;M28,120 Q60,106 92,120 Q124,134 156,120 L172,128 L172,180 L28,180 Z;M28,132 Q60,118 92,132 Q124,146 156,132 L172,140 L172,180 L28,180 Z"
              dur="3.8s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Layer 5: drop */}
      <path
        d="M100,34 C100,34 73,62 71,84 C69,109 81,126 100,126 C119,126 131,109 129,84 C127,62 100,34 100,34 Z"
        fill={`url(#${id}-g)`}
        filter={`url(#${id}-dropglow)`}
      >
        {live && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,18; 0,18; 0,0"
            keyTimes="0; 0.38; 0.42; 1"
            dur="3.2s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.6,0,0.8,1; 0,0,1,1; 0,0.6,0.4,1"
          />
        )}
      </path>
      <path
        d="M100,50 C100,50 83,72 82,86 C81,100 87,113 97,118"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={shineOpacity}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Layer 6: AI node + impact */}
      <circle cx="100" cy="142" r="5" fill={`url(#${id}-gold)`}>
        {live && (
          <animate
            attributeName="r"
            values="5;5;8;5"
            keyTimes="0;0.38;0.44;1"
            dur="3.2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle cx="100" cy="142" r="5" fill="none" stroke={c.goldStart} strokeWidth="1.5">
        {live ? (
          <>
            <animate
              attributeName="r"
              values="5;5;34;34"
              keyTimes="0;0.38;0.62;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.75;0;0"
              keyTimes="0;0.38;0.64;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </>
        ) : (
          <animate attributeName="opacity" values="0" dur="0s" fill="freeze" />
        )}
      </circle>

      <circle cx="100" cy="142" r="11" fill="none" stroke={c.goldStart} strokeWidth="1" opacity={live ? 0 : 0.35}>
        {live && (
          <>
            <animate
              attributeName="r"
              values="11;11;24;11"
              keyTimes="0;0.40;0.58;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.3;0;0.3"
              keyTimes="0;0.40;0.64;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>

      {/* Layer 7: neural cascade */}
      {NEURAL_NODES.map((n, i) => {
        const end = Math.min(n.t + 0.14, 0.98).toFixed(2);
        const kt = `0;${n.t};${end};1`;

        return (
          <g key={`${n.x}-${n.y}-${i}`}>
            <line
              x1="100"
              y1="142"
              x2={n.x}
              y2={n.y}
              stroke={c.greenStart}
              strokeWidth={hovered ? "1.4" : "0.8"}
              opacity={hovered ? "0.6" : "0.32"}
              style={{ transition: "all 0.3s ease" }}
            >
              {live && (
                <>
                  <animate attributeName="strokeWidth" values="0.8;0.8;3;0.8" keyTimes={kt} dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.32;0.32;1;0.32" keyTimes={kt} dur="3.2s" repeatCount="indefinite" />
                </>
              )}
            </line>

            <circle cx={n.x} cy={n.y} r="2.5" fill={c.greenStart} opacity={hovered ? "0.9" : "0.65"} style={{ transition: "all 0.3s ease" }}>
              {live && (
                <>
                  <animate attributeName="fill" values={`${c.greenStart};${c.greenStart};${c.goldStart};${c.greenStart}`} keyTimes={kt} dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.5;2.5;3.6;2.5" keyTimes={kt} dur="3.2s" repeatCount="indefinite" />
                </>
              )}
            </circle>
          </g>
        );
      })}

      {/* Layer 8: Celo orbit */}
      <ellipse
        cx="100"
        cy="88"
        rx="52"
        ry="13"
        fill="none"
        stroke={c.greenStart}
        strokeWidth="0.8"
        opacity="0.22"
        transform="rotate(-18, 100, 88)"
      >
        {live && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="-18 100 88"
            to="342 100 88"
            dur="5s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      <circle cx="143" cy="72" r="4" fill={c.greenStart} opacity="0.6" filter={`url(#${id}-blur)`} />
    </svg>
  );
}

function WordMark({ size, theme, className }: { size: number; theme: LogoTheme; className: string }) {
  const resolvedTheme = useResolvedTheme(theme);
  const c = colors(resolvedTheme);
  const uid = idSafe(useId());
  const id = `liquid-word-${resolvedTheme}-${size}-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 80"
      width={size}
      height={(size * 80) / 300}
      className={className}
      style={{ display: "block" }}
      role="img"
      aria-label="LiquidAI wordmark"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.greenStart} />
          <stop offset="100%" stopColor={c.greenEnd} />
        </linearGradient>
      </defs>

      <text
        x="150"
        y="56"
        textAnchor="middle"
        fontSize="48"
        fontFamily="'SF Pro Display', 'Inter', 'Helvetica Neue', sans-serif"
        fontWeight="700"
        letterSpacing="-1.5"
      >
        <tspan fill={c.text}>Liquid</tspan>
        <tspan fill={`url(#${id}-g)`}>AI</tspan>
      </text>
    </svg>
  );
}

function HorizontalMark({
  size,
  theme,
  background,
  className,
  animate,
}: {
  size: number;
  theme: LogoTheme;
  background: LogoBackground;
  className: string;
  animate: boolean;
}) {
  const resolvedTheme = useResolvedTheme(theme);
  const resolvedBackground = useMemo(
    () => resolveBackground(background, resolvedTheme),
    [background, resolvedTheme],
  );
  const c = colors(resolvedTheme);
  const uid = idSafe(useId());
  const id = `liquid-horizontal-${resolvedTheme}-${resolvedBackground}-${size}-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 100"
      width={size}
      height={(size * 100) / 420}
      className={className}
      style={{ display: "block" }}
      role="img"
      aria-label="LiquidAI horizontal logo"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.greenStart} />
          <stop offset="100%" stopColor={c.greenEnd} />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.goldStart} />
          <stop offset="100%" stopColor={c.goldEnd} />
        </linearGradient>
      </defs>

      {resolvedBackground !== "transparent" && (
        <rect x="0" y="0" width="100" height="100" fill={backgroundFill(resolvedBackground)} rx="24" />
      )}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill={resolvedBackground === "transparent" ? "none" : reservoirFill(resolvedBackground)}
        stroke={`url(#${id}-g)`}
        strokeWidth="1.5"
      />
      <circle cx="50" cy="50" r="50" fill="none" stroke={`url(#${id}-g)`} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35">
        {animate && <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />}
      </circle>
      <path d="M50,18 C50,18 33,37 32,50 C31,64 38,74 50,74 C62,74 69,64 68,50 C67,37 50,18 50,18 Z" fill={`url(#${id}-g)`} />
      <path d="M50,26 C50,26 40,40 39,50 C38,59 42,67 49,70" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <circle cx="50" cy="78" r="3" fill={`url(#${id}-gold)`} />
      <circle cx="50" cy="78" r="7" fill="none" stroke={c.goldStart} strokeWidth="0.6" opacity="0.35">
        {animate && (
          <>
            <animate attributeName="r" values="7;7;12;7" keyTimes="0;0.4;0.62;1" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0.35;0;0.35" keyTimes="0;0.4;0.62;1" dur="3.2s" repeatCount="indefinite" />
          </>
        )}
      </circle>
      <ellipse cx="50" cy="48" rx="34" ry="9" fill="none" stroke={c.greenStart} strokeWidth="0.6" opacity="0.2" transform="rotate(-20, 50, 48)" />
      <circle cx="77" cy="37" r="2.5" fill={c.greenStart} opacity="0.5" />

      <text x="115" y="60" fontSize="48" fontFamily="'Inter', 'Helvetica Neue', sans-serif" fontWeight="700" letterSpacing="-1.5">
        <tspan fill={c.text}>Liquid</tspan>
        <tspan fill={`url(#${id}-g)`}>AI</tspan>
      </text>
      <text x="118" y="82" fill={c.sub} fontSize="11" fontFamily="'SF Mono', 'Fira Mono', 'Courier New', monospace" letterSpacing="3.5" opacity="0.8">
        TREASURY OS · CELO
      </text>
    </svg>
  );
}
