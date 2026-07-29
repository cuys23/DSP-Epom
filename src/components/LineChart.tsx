/**
 * The Highcharts spline the live pages draw, rebuilt as plain SVG — one series,
 * markers on every point. With an all-zero series the axis centres on 0, which
 * is exactly what the live charts show.
 *
 * The two charts differ in how the x axis is laid out: the Analytics report
 * centres each point in its own column, the campaign page spreads the points
 * from edge to edge and tilts the labels.
 */
export function LineChart({
  labels,
  values,
  width = 1088,
  height = 400,
  bottom = 58,
  spread = "columns",
  tiltLabels = false,
}: {
  labels: string[];
  values: number[];
  width?: number;
  height?: number;
  /** Space under the plot for ticks and labels. */
  bottom?: number;
  spread?: "columns" | "edges";
  tiltLabels?: boolean;
}) {
  const left = 31;
  const top = 10;
  const plotW = width - left - 10;
  const plotH = height - top - bottom;
  const max = Math.max(...values, 0);
  const n = Math.max(values.length, 1);

  const x = (i: number) =>
    spread === "edges"
      ? left + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2)
      : left + ((i + 0.5) * plotW) / n;
  const y = (v: number) => (max <= 0 ? top + plotH / 2 : top + plotH - (v / max) * plotH);
  const axis = "#c4c6d0";
  const baseline = top + plotH;
  // All-zero series: Highcharts centres a single "0" tick. Otherwise 5 ticks.
  const ticks = max <= 0 ? [0] : [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);
  const tickLabel = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `${Math.round(v * 100) / 100}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Analytics chart"
    >
      {Array.from({ length: n + 1 }, (_, i) => left + (i * plotW) / n).map((gx) => (
        <path
          key={gx}
          d={`M ${gx + 0.5} ${top} L ${gx + 0.5} ${baseline}`}
          stroke="#e6e6e6"
          fill="none"
        />
      ))}
      {ticks.map((t) => (
        <g key={t}>
          <path d={`M ${left} ${y(t) + 0.5} L ${left + plotW} ${y(t) + 0.5}`} stroke={axis} fill="none" />
          {/* Right-aligned just outside the plot so "9.7k" isn't clipped. */}
          <text x={left - 3} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#74777f">
            {tickLabel(t)}
          </text>
        </g>
      ))}
      <path d={`M ${left} ${baseline + 0.5} L ${left + plotW} ${baseline + 0.5}`} stroke={axis} fill="none" />

      {labels.map((label, i) => (
        <g key={label}>
          <path
            d={`M ${x(i) + 0.5} ${baseline} L ${x(i) + 0.5} ${baseline + 10}`}
            stroke={axis}
            fill="none"
          />
          <text
            x={x(i) + (tiltLabels ? 34 : 0)}
            y={baseline + 24}
            textAnchor={tiltLabels ? "end" : "middle"}
            transform={tiltLabels ? `rotate(-45 ${x(i) + 34} ${baseline + 24})` : undefined}
            fontSize="12"
            fill="#74777f"
          >
            {label}
          </text>
        </g>
      ))}

      <path
        d={values.map((v, i) => `${i ? "L" : "M"} ${x(i)} ${y(v)}`).join(" ")}
        fill="none"
        stroke="#6f79dd"
        strokeWidth="2"
      />
      {values.map((v, i) => (
        <circle key={labels[i]} cx={x(i)} cy={y(v)} r="4" fill="#6f79dd" stroke="#ffffff" />
      ))}
    </svg>
  );
}
