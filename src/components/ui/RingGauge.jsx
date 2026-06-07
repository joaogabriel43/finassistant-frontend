// src/components/ui/RingGauge.jsx
import { useState, useEffect } from 'react';

/**
 * Animates a numeric value from `from` → `value` once on mount (or whenever
 * `value` changes). Honours prefers-reduced-motion by snapping instantly.
 * @param {number} value  target value
 * @param {boolean} [animate=true]
 * @param {number} [delay=60] ms before the tween kicks off
 * @returns {number} the current (animated) value to render
 */
export function useMountTween(value, animate = true, delay = 60) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [v, setV] = useState(animate && !reduce ? 0 : value);
  useEffect(() => {
    if (!animate || reduce) { setV(value); return; }
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, animate, reduce, delay]);
  return v;
}

/**
 * @typedef {Object} RingGaugeProps
 * @property {number} value       progress 0–100
 * @property {number} [size=130]  px diameter
 * @property {number} [stroke=11] ring thickness in px
 * @property {string} [color]     progress color (default theme primary)
 * @property {string} [track]     unfilled track color
 * @property {boolean} [animate=true]
 * @property {React.ReactNode} [children] centered content (e.g. the number)
 */

/**
 * Full-circle progress gauge. Used for the Score de Saúde (0–100).
 * Pure SVG, no dependencies. Color comes from props so the theme stays
 * the source of truth (pass theme.palette.primary.main).
 * @param {RingGaugeProps} props
 */
export default function RingGauge({
  value,
  size = 130,
  stroke = 11,
  color = '#7C6AF7',
  track = 'rgba(255,255,255,0.07)',
  animate = true,
  children,
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = useMountTween(value, animate);
  const offset = circ * (1 - Math.max(0, Math.min(100, v)) / 100);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .95s cubic-bezier(.22,.7,.3,1)' }}
        />
      </svg>
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
    </div>
  );
}
