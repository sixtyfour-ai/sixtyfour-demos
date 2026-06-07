"use client";

import { type CategoryId } from "../lib/demos";

interface CategoryPreviewProps {
  category: CategoryId;
}

/**
 * Inline animated SVG previews per category — the visual flair on the
 * demo cards. Five distinct templates so cards in the same category share
 * a "family resemblance" without requiring bespoke art per demo.
 *
 * All previews use the blue accent and animate with pure SMIL/CSS so they
 * stay snappy without JS. Hover state is handled by the parent card.
 */
export function CategoryPreview({ category }: CategoryPreviewProps) {
  switch (category) {
    case "sales-gtm":
      return <SalesPreview />;
    case "talent":
      return <TalentPreview />;
    case "compliance":
      return <CompliancePreview />;
    case "security":
      return <SecurityPreview />;
    case "entity-intel":
      return <EntityIntelPreview />;
    default:
      return null;
  }
}

const COMMON_CLASS =
  "h-32 w-full rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 transition-colors group-hover:border-blue-400/30";

function SalesPreview() {
  // A score gauge filling up. Two muted bars and one accent bar.
  return (
    <div className={COMMON_CLASS}>
      <svg viewBox="0 0 240 96" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sg-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <text x="0" y="14" fill="#71717a" fontSize="10" fontFamily="monospace">
          fit_score
        </text>
        <rect x="0" y="20" width="240" height="6" rx="3" fill="#27272a" />
        <rect x="0" y="20" width="0" height="6" rx="3" fill="url(#sg-grad)">
          <animate attributeName="width" from="0" to="204" dur="2s" fill="freeze" />
        </rect>
        <text x="0" y="48" fill="#52525b" fontSize="10" fontFamily="monospace">
          revenue · employees · funding
        </text>
        <rect x="0" y="54" width="240" height="4" rx="2" fill="#27272a" />
        <rect x="0" y="54" width="160" height="4" rx="2" fill="#3f3f46" />
        <rect x="0" y="68" width="240" height="4" rx="2" fill="#27272a" />
        <rect x="0" y="68" width="120" height="4" rx="2" fill="#3f3f46" />
        <rect x="0" y="82" width="240" height="4" rx="2" fill="#27272a" />
        <rect x="0" y="82" width="80" height="4" rx="2" fill="#3f3f46" />
      </svg>
    </div>
  );
}

function TalentPreview() {
  // Three person cards with shimmer.
  return (
    <div className={COMMON_CLASS}>
      <svg viewBox="0 0 240 96" className="h-full w-full" aria-hidden>
        {[0, 84, 168].map((x, i) => (
          <g key={x} transform={`translate(${x}, 0)`}>
            <rect width="64" height="96" rx="6" fill="#18181b" />
            <circle cx="32" cy="28" r="10" fill="#27272a" />
            <rect x="14" y="48" width="36" height="3" rx="1.5" fill="#27272a" />
            <rect x="14" y="58" width="28" height="3" rx="1.5" fill="#27272a" />
            <rect x="14" y="68" width="32" height="3" rx="1.5" fill="#27272a" />
            <rect x="14" y="78" width="20" height="3" rx="1.5" fill="#3f3f46">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CompliancePreview() {
  // Document with checkmarks and a flag.
  return (
    <div className={COMMON_CLASS}>
      <svg viewBox="0 0 240 96" className="h-full w-full" aria-hidden>
        <rect x="0" y="0" width="200" height="96" rx="6" fill="#18181b" />
        {[12, 28, 44, 60, 76].map((y, i) => (
          <g key={y}>
            <circle cx="14" cy={y + 6} r="3" fill="#3f3f46" />
            <rect x="24" y={y + 4} width="100" height="3" rx="1.5" fill="#27272a" />
            <rect x="24" y={y + 10} width={60 + i * 8} height="3" rx="1.5" fill="#27272a" />
          </g>
        ))}
        <rect
          x="210"
          y="12"
          width="30"
          height="20"
          rx="3"
          fill="#2563EB"
          opacity="0.15"
          stroke="#2563EB"
          strokeOpacity="0.5"
        />
        <text x="225" y="26" fill="#2563EB" fontSize="10" textAnchor="middle" fontFamily="monospace">
          !
        </text>
      </svg>
    </div>
  );
}

function SecurityPreview() {
  // Network graph radiating from a central node.
  return (
    <div className={COMMON_CLASS}>
      <svg viewBox="0 0 240 96" className="h-full w-full" aria-hidden>
        {[
          [40, 18],
          [40, 78],
          [200, 22],
          [200, 74],
          [80, 12],
          [200, 48],
        ].map(([x, y], i) => (
          <line
            key={i}
            x1="120"
            y1="48"
            x2={x}
            y2={y}
            stroke="#3f3f46"
            strokeWidth="1"
            strokeDasharray="2 3"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.3;1;0.3"
              dur="3s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
        <circle cx="120" cy="48" r="6" fill="#2563EB" />
        {[
          [40, 18],
          [40, 78],
          [200, 22],
          [200, 74],
          [80, 12],
          [200, 48],
        ].map(([x, y], i) => (
          <circle key={`n-${i}`} cx={x} cy={y} r="3.5" fill="#27272a" stroke="#52525b" />
        ))}
      </svg>
    </div>
  );
}

function EntityIntelPreview() {
  // Org chart with branches.
  return (
    <div className={COMMON_CLASS}>
      <svg viewBox="0 0 240 96" className="h-full w-full" aria-hidden>
        <rect x="100" y="6" width="40" height="16" rx="3" fill="#27272a" stroke="#52525b" />
        <line x1="120" y1="22" x2="120" y2="38" stroke="#3f3f46" />
        <line x1="40" y1="38" x2="200" y2="38" stroke="#3f3f46" />
        {[40, 100, 160].map((x) => (
          <line key={x} x1={x + 20} y1="38" x2={x + 20} y2="50" stroke="#3f3f46" />
        ))}
        {[40, 100, 160].map((x, i) => (
          <rect
            key={x}
            x={x}
            y="50"
            width="40"
            height="16"
            rx="3"
            fill="#18181b"
            stroke={i === 1 ? "#2563EB" : "#3f3f46"}
            strokeOpacity={i === 1 ? "0.6" : "1"}
          />
        ))}
        <line x1="60" y1="66" x2="60" y2="78" stroke="#3f3f46" />
        <line x1="180" y1="66" x2="180" y2="78" stroke="#3f3f46" />
        <rect x="40" y="78" width="40" height="12" rx="2" fill="#18181b" stroke="#27272a" />
        <rect x="160" y="78" width="40" height="12" rx="2" fill="#18181b" stroke="#27272a" />
      </svg>
    </div>
  );
}
