import { LineChart } from "@/components/LineChart";
import { REPORT_DAYS, REPORT_FROM, REPORT_TO } from "@/lib/campaign-stats";
import { CELL, SERIES, dayMetrics, sumMetrics } from "@/lib/demo-data";

/** dd.mm.yyyy, matching the date-range fields elsewhere in the app. */
const dotted = (iso: string) => iso.split("-").reverse().join(".");

/**
 * The dashboard chart card: account-wide impressions over the current reporting
 * week, with the headline totals underneath. Every figure reduces the same
 * per-day metrics the Analytics report uses, so the two always agree.
 */
export function ChartCard() {
  const metrics = REPORT_DAYS.map((d) => dayMetrics(d));
  const total = sumMetrics(metrics);

  const summary = [
    { label: "Impressions", value: CELL.Impressions(total) },
    { label: "Clicks", value: CELL.Clicks(total) },
    { label: "CTR", value: CELL.CTR(total) },
    { label: "Spend", value: CELL.Spend(total) },
    { label: "eCPM", value: CELL.eCPM(total) },
    { label: "Conversions", value: CELL["Action 0"](total) },
  ];

  return (
    <div className="mb-4 min-h-[500px] rounded-[3px] bg-epom-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[16px] font-bold leading-6 text-epom-text">Impressions</div>
        <div className="text-[12px] leading-[18px] text-epom-muted">
          {dotted(REPORT_FROM)} - {dotted(REPORT_TO)}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <LineChart
          labels={REPORT_DAYS}
          values={metrics.map((m) => SERIES.Impressions(m))}
          height={350}
        />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-epom-border pt-6 sm:grid-cols-3 lg:grid-cols-6">
        {summary.map((s) => (
          <div key={s.label}>
            <dt className="text-[12px] leading-[18px] text-epom-muted">{s.label}</dt>
            <dd className="mt-1 text-[16px] font-bold leading-6 text-epom-text">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
