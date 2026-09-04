"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { FilterSelect } from "@/components/CampaignFilters";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BTN_OUTLINED, BTN_PRIMARY, Dialog } from "@/components/form/Dialog";
import { SortLabel, type Sort } from "@/components/SortLabel";
import { LineChart } from "@/components/LineChart";
import { CELL, CHART_METRICS, SERIES, dayMetrics, sumMetrics } from "@/lib/demo-data";
import { DEFAULT_RANGE, rangeDays } from "@/lib/campaign-stats";

/**
 * Every metric column of the report, in the order the live table lays them out,
 * with the value the live account returns. The account has no traffic yet, so
 * each row and the total repeat these.
 *
 * This is the whole set its Table configuration dialog offers — the report has no
 * bid-request counter, so no Bid Requests, Bid Rate, Wins or Imp-to-Bid column.
 */
const COLUMNS: { label: string; title?: string; value: string }[] = [
  { label: "Bid Responses", value: "0" },
  { label: "Bid Price", value: "n/a" },
  { label: "Impressions", value: "0" },
  { label: "Win Rate", value: "0.00%" },
  { label: "eCPM", title: "cost per mille", value: "$0.00" },
  { label: "Clicks", value: "0" },
  { label: "eCPC", title: "cost per click", value: "0.00" },
  { label: "Click-to-Bid", title: "click-to-bid", value: "0" },
  { label: "CTR", title: "click-through rate", value: "0.00%" },
  { label: "CCR", title: "click-through rate", value: "0.00%" },
  { label: "Spend", value: "$0.00" },
  { label: "Segments Markup", title: "Segments Markup", value: "$0.00" },
  { label: "Pixalate Postbid Markup", title: "Pixalate Postbid Markup", value: "0" },
  { label: "Action 0", value: "0" },
  { label: "CPA Action 0", title: "cost per action", value: "-" },
  { label: "ICR Action 0", title: "impression to conversion rate", value: "0.00%" },
  { label: "ROAS", value: "-" },
  { label: "ROI", value: "-" },
  { label: "Skip", value: "0" },
  { label: "First Quartile", value: "0" },
  { label: "Midpoint", value: "0" },
  { label: "Third Quartile", value: "0" },
  { label: "Video 100%", value: "0" },
];
const DIMENSIONS = [
  "Date",
  "Hour",
  "Campaign",
  "Creative",
  "Country",
  "Region",
  "City",
  "Domain / App",
  "Operation System",
  "Browser",
  "Device Type",
  "Traffic Source",
];

const TIMEZONES = [
  "UTC+00:00 London, GBR; Reykjavik, ISL; Dakar, SEN",
  "UTC-05:00 New York, USA; Toronto, CAN; Lima, PER",
  "UTC-08:00 Los Angeles, USA; Vancouver, CAN",
  "UTC+01:00 Berlin, DEU; Paris, FRA; Madrid, ESP",
  "UTC+03:00 Kyiv, UKR; Moscow, RUS; Nairobi, KEN",
  "UTC+07:00 Bangkok, THA; Hanoi, VNM; Jakarta, IDN",
  "UTC+08:00 Singapore, SGP; Hong Kong, HKG; Beijing, CHN",
];

const PAGE_SIZES = ["10", "25", "50", "100"];

const iso = (d: Date) => d.toISOString().slice(0, 10);
/** dd.mm.yyyy — the format the live date range input renders. */
const pretty = (s: string) => s.split("-").reverse().join(".");

/** Every day from `from` to `to`, inclusive. */
function daysBetween(from: string, to: string) {
  const out: string[] = [];
  const end = new Date(`${to}T00:00:00Z`);
  for (const d = new Date(`${from}T00:00:00Z`); d <= end && out.length < 400; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(iso(d));
  }
  return out;
}

interface Report {
  from: string;
  to: string;
  groupBy: string;
  filters: { dimension: string; value: string }[];
}

/** Opens on the account's "today", like every other date field in the app. */
const INITIAL_DAYS = rangeDays(DEFAULT_RANGE);
const INITIAL_REPORT: Report = {
  from: INITIAL_DAYS[0],
  to: INITIAL_DAYS[INITIAL_DAYS.length - 1],
  groupBy: "Date",
  filters: [],
};

export function AnalyticsView() {
  // Pending controls; the table and chart only follow them after "Get Report".
  const [draft, setDraft] = useState(INITIAL_REPORT);
  const [report, setReport] = useState(INITIAL_REPORT);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [chartOpen, setChartOpen] = useState(true);
  const [metric, setMetric] = useState("Impressions");
  const [columns, setColumns] = useState(COLUMNS.map((c) => c.label));
  const [configOpen, setConfigOpen] = useState(false);
  const [sort, setSort] = useState<Sort | null>(null);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  // `?cid=` scopes the report to one campaign, the way the campaign page links here.
  const campaignId = useSearchParams().get("cid") ?? undefined;
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!headRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Only the Date breakdown has rows; the report API this clone mirrors does not
  // return the other dimensions.
  const rows = useMemo(
    () => (report.groupBy === "Date" ? daysBetween(report.from, report.to) : []),
    [report],
  );

  const visible = COLUMNS.filter((c) => columns.includes(c.label));

  const metrics = useMemo(
    () => Object.fromEntries(rows.map((d) => [d, dayMetrics(d, campaignId)])),
    [rows, campaignId],
  );
  const totals = useMemo(() => sumMetrics(Object.values(metrics)), [metrics]);
  const cellOf = (label: string, row: string) => CELL[label](metrics[row]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.asc ? 1 : -1;
    if (sort.key === "dimension") return [...rows].sort((a, b) => a.localeCompare(b) * dir);
    const value = SERIES[sort.key];
    return [...rows].sort((a, b) => (value(metrics[a]) - value(metrics[b])) * dir);
  }, [rows, sort, metrics]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const shown = sorted.slice((current - 1) * pageSize, current * pageSize);

  const addFilter = (dimension: string, value = "") =>
    setDraft((d) => ({ ...d, filters: [...d.filters, { dimension, value }] }));

  const exportCsv = () => {
    const head = [report.groupBy, ...visible.map((c) => c.label)];
    const body = sorted.map((r) => [r, ...visible.map((c) => cellOf(c.label, r))]);
    const csv = [head, ...body].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${report.from}_${report.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell activeHref="/analytics" breadcrumbs={[{ label: "Analytics" }]}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="flex h-9 items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
          Analytics
          <a
            href="https://help.dsp.epom.com/docs/analytics"
            target="_blank"
            rel="noreferrer"
            title="Learn about Analytics"
            aria-label="Learn about Analytics"
            className="ml-2 flex h-5 w-5 text-epom-primary transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
          >
            <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
          </a>
        </h1>

        <DateRange
          from={draft.from}
          to={draft.to}
          onChange={(from, to) => setDraft((d) => ({ ...d, from, to }))}
        />
      </div>

      <div ref={headRef} className="rounded bg-epom-surface p-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex flex-1 flex-wrap gap-3">
            <FilterSelect
              label="Group by:"
              value={draft.groupBy}
              options={DIMENSIONS}
              // Live sizes this one to its content (min 96, max 720) — only
              // Time offset below is pinned to a fixed width.
              className="w-auto min-w-24 max-w-[720px]"
              open={open === "groupBy"}
              onToggle={() => setOpen(open === "groupBy" ? null : "groupBy")}
              onPick={(o) => {
                setDraft((d) => ({ ...d, groupBy: o }));
                setOpen(null);
              }}
            />
            <FilterSelect
              label="Time offset:"
              value={timezone}
              options={TIMEZONES}
              className="w-[364px]"
              open={open === "timezone"}
              onToggle={() => setOpen(open === "timezone" ? null : "timezone")}
              onPick={(o) => {
                setTimezone(o);
                setOpen(null);
              }}
            />
          </div>

          <div className="flex items-start gap-3">
            <button type="button" onClick={() => setChartOpen((v) => !v)} className={BTN_OUTLINED}>
              {chartOpen ? "↑ Hide Chart" : "↓ Show Chart"}
            </button>
            <button type="button" onClick={exportCsv} className={BTN_OUTLINED}>
              Export to CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setReport(draft);
                setPage(1);
              }}
              className={BTN_PRIMARY}
            >
              Get Report
            </button>
          </div>
        </div>

        <div className="relative mt-4 w-[200px]">
          <button
            type="button"
            onClick={() => setOpen(open === "dimension" ? null : "dimension")}
            aria-expanded={open === "dimension"}
            className={cn(BTN_OUTLINED, "flex w-full items-center pr-2 text-left")}
          >
            Add Dimension Filter
            <MaterialIcon name="arrow_drop_down" className="ml-auto block text-[20px] leading-5" />
          </button>

          {open === "dimension" && (
            <div className="absolute left-0 top-10 z-[999] max-h-[240px] w-full overflow-y-auto rounded bg-epom-surface py-1 shadow-epom-dropdown">
              {DIMENSIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    addFilter(d);
                    setOpen(null);
                  }}
                  className="block h-[34px] w-full px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8"
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {draft.filters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            {draft.filters.map((f, i) => (
              <div key={`${f.dimension}-${i}`} className="w-[260px]">
                <label className="mb-2 block text-[12px] font-semibold leading-[18px] text-epom-muted">
                  {f.dimension}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={f.value}
                    placeholder={`Filter by ${f.dimension}`}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        filters: d.filters.map((x, j) =>
                          j === i ? { ...x, value: e.target.value } : x,
                        ),
                      }))
                    }
                    className="h-9 w-full rounded border border-epom-border py-2 pl-3 pr-9 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${f.dimension} filter`}
                    onClick={() =>
                      setDraft((d) => ({ ...d, filters: d.filters.filter((_, j) => j !== i) }))
                    }
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center text-epom-muted transition-colors hover:text-epom-primary"
                  >
                    <MaterialIcon name="close" className="block text-[16px] leading-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, filters: [] }))}
              className={BTN_OUTLINED}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {chartOpen && (
        <div className="mt-4 min-h-[438px] rounded-[3px] bg-epom-surface p-6">
          <div className="flex justify-end">
            <FilterSelect
              label="Metric:"
              value={metric}
              options={CHART_METRICS}
              className="w-[240px]"
              open={open === "metric"}
              onToggle={() => setOpen(open === "metric" ? null : "metric")}
              onPick={(o) => {
                setMetric(o);
                setOpen(null);
              }}
            />
          </div>
          <div className="mt-4">
            <LineChart
              labels={rows}
              values={rows.map((d) => SERIES[metric](metrics[d]))}
              formatted={rows.map((d) => CELL[metric](metrics[d]))}
              seriesName={metric}
            />
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-clip">
        <div className="block overflow-x-auto rounded-[3px] border border-epom-border bg-epom-surface">
          <table className="w-full max-w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-[2] w-[280px] min-w-[280px] max-w-[280px] bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text">
                  <span className="flex items-center justify-start">
                    <button
                      type="button"
                      title="Table configuration"
                      aria-label="Table configuration"
                      onClick={() => setConfigOpen(true)}
                      className="relative top-[2px] mr-1 flex text-epom-primary"
                    >
                      <MaterialIcon name="settings" className="block text-[16px] leading-4" />
                    </button>
                    <SortLabel
                      label={report.groupBy}
                      sortKey="dimension"
                      sort={sort}
                      setSort={setSort}
                    />
                  </span>
                </th>
                {/* 1px sticky rule that separates the frozen dimension column. */}
                <th className="sticky left-[280px] w-px bg-epom-border p-0 pl-px" />
                {visible.map((c) => (
                  <th
                    key={c.label}
                    title={c.title}
                    className="whitespace-nowrap bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text"
                  >
                    <SortLabel label={c.label} sortKey={c.label} sort={sort} setSort={setSort} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {shown.map((row) => (
                <tr key={row} className="group">
                  <td className="sticky left-0 z-[2] w-[280px] min-w-[280px] max-w-[280px] whitespace-nowrap border-t border-epom-border bg-epom-surface px-4 py-4 text-left text-[12px] leading-[18px] text-epom-text transition-colors group-hover:bg-[#fafafa]">
                    <div className="flex flex-row-reverse items-center justify-between">
                      <span className="flex">
                        <button
                          type="button"
                          title={`Filter by ${report.groupBy}`}
                          aria-label={`Filter by ${report.groupBy}`}
                          onClick={() => addFilter(report.groupBy, row)}
                          className="relative bottom-px flex text-epom-muted transition-colors hover:text-epom-primary"
                        >
                          <MaterialIcon name="filter_list" className="block text-[20px] leading-5" />
                        </button>
                      </span>
                      {row}
                    </div>
                  </td>
                  <td className="sticky left-[280px] w-px bg-epom-border p-0 pl-px" />
                  {visible.map((c) => (
                    <td
                      key={c.label}
                      className="whitespace-nowrap border-t border-epom-border px-4 py-4 text-[12px] leading-[18px] text-epom-text transition-colors group-hover:bg-[#fafafa]"
                    >
                      <div>{cellOf(c.label, row)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {shown.length > 0 && (
              <tbody>
                <tr>
                  <td className="sticky left-0 z-[2] w-[280px] min-w-[280px] max-w-[280px] border-t border-epom-border bg-epom-surface px-4 py-4 text-left text-[12px] font-semibold leading-[18.5px] text-epom-text">
                    Total
                  </td>
                  <td className="sticky left-[280px] w-px bg-epom-border p-0 pl-px" />
                  {visible.map((c) => (
                    <td
                      key={c.label}
                      className="whitespace-nowrap border-t border-epom-border px-4 py-4 text-[12px] font-semibold leading-[18.5px] text-epom-text"
                    >
                      <span>{CELL[c.label](totals)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            )}
          </table>

          {shown.length === 0 && (
            <div className="border-t border-epom-border py-8 text-center text-[12px] leading-[18px] text-epom-muted">
              No available data to show.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between pr-4">
          <div className="flex items-start gap-2">
            <span className="flex h-9 items-center whitespace-nowrap text-[12px] leading-[18px] text-epom-muted">
              {sorted.length} {sorted.length === 1 ? "item" : "items"}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === "size" ? null : "size")}
                aria-expanded={open === "size"}
                className="flex h-9 items-center gap-1 rounded border border-epom-primary px-2 py-[7.5px] text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
              >
                {pageSize}
                <MaterialIcon name="arrow_drop_down" className="block text-[20px] leading-5" />
              </button>

              {open === "size" && (
                <div className="absolute bottom-10 left-0 z-[999] w-[72px] rounded bg-epom-surface py-1 shadow-epom-dropdown">
                  {PAGE_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setPageSize(Number(s));
                        setPage(1);
                        setOpen(null);
                      }}
                      className={cn(
                        "block h-[34px] w-full px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                        Number(s) === pageSize && "bg-epom-primary-16 font-semibold",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pageCount > 1 && (
            <nav className="flex items-center gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-8 min-w-8 rounded px-2 text-[12px] leading-[18px] transition-colors hover:bg-epom-primary-8",
                    p === current
                      ? "bg-epom-primary-16 font-semibold text-epom-primary"
                      : "text-epom-text",
                  )}
                >
                  {p}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      {configOpen && (
        <ColumnsDialog
          value={columns}
          onCancel={() => setConfigOpen(false)}
          onApply={(v) => {
            setColumns(v);
            setConfigOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

/** Read-only range field that opens two native date inputs. */
function DateRange({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative w-[220px]">
      <input
        type="text"
        readOnly
        onClick={() => setOpen((v) => !v)}
        placeholder="Select date"
        value={`${pretty(from)} - ${pretty(to)}`}
        className="h-9 w-full cursor-pointer rounded border border-epom-border bg-epom-surface py-2 pl-3 pr-12 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
      />
      <MaterialIcon
        name="event"
        filled
        className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-primary"
      />

      {open && (
        <div className="absolute right-0 top-10 z-[999] flex gap-3 rounded bg-epom-surface p-4 shadow-epom-dropdown">
          <label className="text-[12px] font-semibold leading-[18px] text-epom-muted">
            From
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => onChange(e.target.value, to)}
              className="mt-1 block h-9 rounded border border-epom-border px-3 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
            />
          </label>
          <label className="text-[12px] font-semibold leading-[18px] text-epom-muted">
            To
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => onChange(from, e.target.value)}
              className="mt-1 block h-9 rounded border border-epom-border px-3 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function ColumnsDialog({
  value,
  onCancel,
  onApply,
}: {
  value: string[];
  onCancel: () => void;
  onApply: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <Dialog title="Table configuration" width="w-[560px]" onCancel={onCancel} onApply={() => onApply(draft)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {COLUMNS.map((c) => (
          <label
            key={c.label}
            className="flex h-9 cursor-pointer items-center gap-2 rounded px-2 text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-black/[0.04]"
          >
            <input
              type="checkbox"
              checked={draft.includes(c.label)}
              onChange={() =>
                setDraft((d) =>
                  d.includes(c.label) ? d.filter((x) => x !== c.label) : [...d, c.label],
                )
              }
              className="h-4 w-4 accent-epom-primary"
            />
            {c.label}
          </label>
        ))}
      </div>
    </Dialog>
  );
}
