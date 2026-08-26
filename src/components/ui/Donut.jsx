// src/components/ui/Donut.jsx
import { useMountTween } from './RingGauge';

/**
 * @typedef {Object} DonutSegment
 * @property {number} pct    slice size as a percentage (0–100)
 * @property {string} color  slice color (use theme.palette.series[i])
 */

/**
 * @typedef {Object} DonutProps
 * @property {DonutSegment[]} segments
 * @property {number} [size=160]
 * @property {number} [thickness=20]
 * @property {number} [gap=4]        px gap between slices
 * @property {string} [bg]           background track color
 * @property {boolean} [animate=true]
 * @property {React.ReactNode} [children] centered content (e.g. total)
 */

/**
 * Portfolio composition donut. Pure SVG. Segments reveal on mount.
 * Keep `segments` order aligned with the legend so colors match.
 * @param {DonutProps} props
 */
export default function Donut({
  segments,
  size = 160,
  thickness = 20,
  gap = 4,
  bg = 'var(--c-line)',
  animate = true,
  children,
}) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const progress = useMountTween(1, animate, 80); // 0 → 1 reveal
  let acc = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = circ * (s.pct / 100);
          const shown = Math.max(len * progress - gap, 0.5);
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${shown} ${circ}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dasharray .9s cubic-bezier(.22,.7,.3,1)' }}
            />
          );
        })}
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
