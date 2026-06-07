// src/components/ui/Sparkline.jsx
import { useState, useEffect, useId } from 'react';

/**
 * @typedef {Object} SparklineProps
 * @property {number[]} data        series values
 * @property {string} [color]       line + fill color
 * @property {number} [height=70]   px height (width is fluid, 100%)
 * @property {number} [fill=0.28]   top opacity of the area gradient (0 = no fill)
 * @property {number} [strokeW=2.25]
 * @property {boolean} [grid=false] faint horizontal gridlines
 * @property {boolean} [animate=true] draw-on line + fade-in fill
 */

/**
 * Lightweight area sparkline with an animated draw-on line and a highlighted
 * final point. Pure SVG, no charting dependency. Renders responsively via a
 * fixed viewBox + preserveAspectRatio="none".
 * @param {SparklineProps} props
 */
export default function Sparkline({
  data,
  color = '#7C6AF7',
  height = 70,
  fill = 0.28,
  strokeW = 2.25,
  grid = false,
  animate = true,
}) {
  const w = 600;
  const h = height;
  const pad = 5;
  const reactId = useId();
  const gid = `spark-${reactId.replace(/[:]/g, '')}`;

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [drawn, setDrawn] = useState(!animate || reduce);
  useEffect(() => {
    if (!animate || reduce) return;
    const t = setTimeout(() => setDrawn(true), 90);
    return () => clearTimeout(t);
  }, [animate, reduce]);

  if (!data || data.length < 2) return <svg width="100%" height={h} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((val, i) => [
    (i / (data.length - 1)) * w,
    h - pad - ((val - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fill} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {grid &&
        [0.33, 0.66].map((g, i) => (
          <line key={i} x1="0" y1={h * g} x2={w} y2={h * g} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
        ))}

      {fill > 0 && (
        <path d={area} fill={`url(#${gid})`} style={{ opacity: drawn ? 1 : 0, transition: 'opacity 1s ease .25s' }} />
      )}

      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={drawn ? 0 : 100}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,.7,.3,1)' }}
      />

      <circle
        cx={last[0]}
        cy={last[1]}
        r={strokeW + 2}
        fill={color}
        vectorEffect="non-scaling-stroke"
        style={{ opacity: drawn ? 1 : 0, transition: 'opacity .4s ease .9s' }}
      />
    </svg>
  );
}
