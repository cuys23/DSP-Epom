"use client";

import { useEffect, useRef, useState } from "react";
import { LineChart } from "@/components/LineChart";
import { FilterSelect } from "@/components/CampaignFilters";
import { rangeLabel } from "@/lib/campaign-stats";
import { CELL, SERIES, dayMetrics, sumMetrics } from "@/lib/demo-data";

/**
 * Metrics the live dashboard's `Metric:` dropdown offers. `eCPC` is documented as
 * CPC-only and every campaign on this account is bought on CPM, so it is left out
 * rather than offered as a column that could never differ from a divide-by-zero.
 */
const METRICS = ["Impressions", "Clicks", "Conversions", "eCPM", "Spend"];

/** Dropdown label → the `CELL` / `SERIES` key behind it. */
const COLUMN: Record<string, string> = { Conversions: "Action 0" };
const columnOf = (metric: string) => COLUMN[metric] ?? metric;

/**
 * The dashboard chart card: one account-wide series over the selected date range,
 * with the headline totals underneath. Every figure reduces the same per-day
 * metrics the Analytics report uses, so the two always agree.
 */
export function ChartCard({ days }: { days: string[] }) {
  const [metric, setMetric] = useState(METRICS[0]);
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!selectRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const metrics = days.map((d) => dayMetrics(d));
  const total = sumMetrics(metrics);
  const column = columnOf(metric);

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
        <div className="text-[16px] font-bold leading-6 text-epom-text">{metric}</div>
        <div className="text-[12px] leading-[18px] text-epom-muted">{rangeLabel(days)}</div>
      </div>

      {/* Right-aligned, the way the live card pulls its Metric dropdown. */}
      <div ref={selectRef} className="mt-4 flex justify-end">
        <FilterSelect
          label="Metric:"
          value={metric}
          options={METRICS}
          className="w-[240px]"
          open={open}
          onToggle={() => setOpen((v) => !v)}
          onPick={(o) => {
            setMetric(o);
            setOpen(false);
          }}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <LineChart
          labels={days}
          values={metrics.map((m) => SERIES[column](m))}
          formatted={metrics.map((m) => CELL[column](m))}
          seriesName={metric}
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
