/**
 * The Highcharts spline the live pages draw, rebuilt as plain SVG — one series,
 * markers on every point. With an all-zero series the axis centres on 0, which
 * is exactly what the live charts show.
 *
 * The two charts differ in how the x axis is laid out: the Analytics report
 * centres each point in its own column, the campaign page spreads the points
 * from edge to edge.
 */

/** Average advance of 12px "Open Sans", measured off the live axis labels. */
const CHAR_W = 6.26;
/** Line box of a 12px label, from `getBBox()` on the live axis. */
const LABEL_H = 16.5;
/** Glyph height inside that box — what tilted labels actually collide on. */
const GLYPH_H = 12.6;
/** Highcharts' default `xAxis.labels.padding`. */
const LABEL_PADDING = 5;
/** Space the live chart keeps under the axis for one row of upright labels. */
const AXIS_BOTTOM = 58;

export function LineChart({
  labels,
  values,
  width = 1088,
  height = 400,
  spread = "columns",
}: {
  labels: string[];
  values: number[];
  width?: number;
  height?: number;
  spread?: "columns" | "edges";
}) {
  const left = 31;
  const top = 10;
  const plotW = width - left - 10;
  const max = Math.max(...values, 0);
  const n = Math.max(values.length, 1);

  /**
   * `xAxis.labels.autoRotation` — once a label no longer fits its slot Highcharts
   * tilts the whole row to -45° rather than dropping any of it, and gives the
   * axis back the extra room the diagonal needs. Measured on the live chart: an
   * upright row reserves 58px, a tilted row of ISO dates reserves 101px.
   */
  const slot = plotW / n;
  const labelW = labels.reduce((a, l) => Math.max(a, l.length), 0) * CHAR_W;
  const tilted = slot < labelW + LABEL_PADDING;
  const bottom = tilted
    ? AXIS_BOTTOM + Math.round((labelW + LABEL_H) * Math.SQRT1_2 - LABEL_H) + 4
    : AXIS_BOTTOM;

  /**
   * Tilting buys a lot of room but not unlimited: past roughly 46 days the
   * diagonals start touching too, and Highcharts falls back to `xAxis.labels.step`.
   * The live report caps its range before that, so this only guards the wider
   * windows this clone lets you ask for.
   */
  const step = tilted ? Math.max(1, Math.ceil((GLYPH_H * Math.SQRT2) / slot)) : 1;

  const plotH = height - top - bottom;
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
  // A tilted label hangs off its tick by this much; upright ones sit centred.
  const labelX = (i: number) => x(i) + (tilted ? 4 * Math.SQRT1_2 : 0);

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
          {i % step === 0 && (
            <text
              x={labelX(i)}
              y={baseline + 24}
              textAnchor={tilted ? "end" : "middle"}
              transform={tilted ? `rotate(-45 ${labelX(i)} ${baseline + 24})` : undefined}
              fontSize="12"
              fill="#74777f"
            >
              {label}
            </text>
          )}
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
