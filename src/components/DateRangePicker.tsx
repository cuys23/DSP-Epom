"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

/** `epom-daterange` preset list — identical on every page that embeds the picker. */
export const DATE_RANGES = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "Last month",
  "Custom range",
];

const CUSTOM = "Custom range";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** dd.mm.yyyy - dd.mm.yyyy → the two ISO days it spans. */
const parseLabel = (label: string) =>
  label.split(" - ").map((part) => {
    const [d, m, y] = part.split(".");
    return `${y}-${m}-${d}`;
  });

/**
 * Every cell the month grid prints: whole weeks (Sunday-first) covering the
 * month, so leading/trailing days of the neighbouring months fill the edges.
 */
function monthCells(year: number, month: number): string[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = first.getUTCDay();
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = Math.ceil((lead + length) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => {
    const d = new Date(first);
    d.setUTCDate(1 - lead + i);
    return iso(d);
  });
}

export function DateRangePicker({
  value,
  activeRange,
  onChange,
  className = "w-[220px]",
}: {
  /** dd.mm.yyyy - dd.mm.yyyy, printed into the read-only input. */
  value: string;
  /** Preset the popup highlights, or `from|to` ISO days for a custom range. */
  activeRange: string;
  /** Fires with the chosen preset, or `from|to` ISO days once a custom range is applied. */
  onChange?: (range: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  /** Custom range picked but not yet applied: `[from, to]`, `to` empty mid-pick. */
  const [draft, setDraft] = useState<[string, string] | null>(null);
  /** Year/month of the left-hand calendar. */
  const [view, setView] = useState<[number, number]>([0, 0]);
  const pickerRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setDraft(null);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const startCustom = () => {
    const [from, to] = parseLabel(value);
    const d = new Date(`${from}T00:00:00Z`);
    setView([d.getUTCFullYear(), d.getUTCMonth()]);
    setDraft([from, to]);
  };

  const pickDay = (day: string) => {
    // First click opens a new range, the second closes it — order-insensitive.
    setDraft((d) => (!d || d[1] ? [day, ""] : day < d[0] ? [day, d[0]] : [d[0], day]));
  };

  const shiftView = (months: number) =>
    setView(([y, m]) => [y + Math.floor((m + months) / 12), (((m + months) % 12) + 12) % 12]);

  const custom = draft !== null;
  const [from, to] = draft ?? ["", ""];

  return (
    <div ref={pickerRef} className={cn("relative", className)}>
      <input
        type="text"
        readOnly
        value={value}
        placeholder="Select date"
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "h-9 w-full cursor-pointer rounded border bg-epom-surface py-2 pl-3 pr-12 text-[14px] leading-5 text-epom-text transition-[border-color,box-shadow] duration-150 ease-in-out focus:outline-none",
          open ? "border-epom-primary" : "border-epom-border",
        )}
      />
      <MaterialIcon
        name="event"
        filled
        className="pointer-events-none absolute right-3 top-2 block h-5 w-5 text-[20px] leading-5 text-epom-primary"
      />

      {open && (
        <div
          className={cn(
            "absolute right-0 top-[42px] z-[1000] flex rounded bg-epom-surface shadow-epom-dropdown",
            custom ? "w-[768px]" : "w-[216px]",
          )}
        >
          {custom && (
            <div className="w-[552px] shrink-0">
              <div className="flex">
                {[0, 1].map((offset) => (
                  <Month
                    key={offset}
                    year={view[0] + Math.floor((view[1] + offset) / 12)}
                    month={(view[1] + offset) % 12}
                    from={from}
                    to={to}
                    onPick={pickDay}
                    onPrev={offset === 0 ? () => shiftView(-1) : undefined}
                    onNext={offset === 1 ? () => shiftView(1) : undefined}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 px-3 pb-3">
                <button
                  type="button"
                  onClick={close}
                  className="h-9 w-24 rounded border border-epom-primary px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!to}
                  onClick={() => {
                    onChange?.(`${from}|${to}`);
                    close();
                  }}
                  className="h-9 w-24 rounded bg-epom-primary px-4 py-[7.5px] text-center text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover active:shadow-none disabled:cursor-not-allowed disabled:bg-epom-primary-16 disabled:text-[rgba(26,28,30,0.3)] disabled:shadow-none"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          <div className="w-[216px] shrink-0 px-3 pb-2 pt-3">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => {
                  if (range === CUSTOM) {
                    startCustom();
                    return;
                  }
                  onChange?.(range);
                  close();
                }}
                className={cn(
                  "mb-1 flex h-9 w-full items-center rounded px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                  (range === CUSTOM
                    ? custom || activeRange.includes("|")
                    : range === activeRange) && "bg-epom-primary-16 font-semibold",
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Month({
  year,
  month,
  from,
  to,
  onPick,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  /** Selected range so far — `to` is empty while the second day is still being picked. */
  from: string;
  to: string;
  onPick: (day: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const cells = monthCells(year, month);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <div className="w-[276px] px-3 pb-1">
      <table className="mx-auto w-[252px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="h-16 w-9">
              {onPrev && <Arrow name="chevron_left" onClick={onPrev} label="Previous month" />}
            </th>
            <th colSpan={5} className="h-16 text-center text-[14px] font-bold leading-[21px] text-epom-text">
              {MONTHS[month]} {year}
            </th>
            <th className="h-16 w-9">
              {onNext && <Arrow name="chevron_right" onClick={onNext} label="Next month" />}
            </th>
          </tr>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} className="h-9 w-9 text-[14px] font-normal text-epom-text">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((day) => {
                const off = new Date(`${day}T00:00:00Z`).getUTCMonth() !== month;
                const edge = !off && (day === from || day === to);
                const inRange = !off && !!to && day > from && day < to;
                return (
                  <td
                    key={day}
                    className={cn(
                      "h-9 w-9 p-0",
                      (edge || inRange) && "bg-epom-primary-12",
                      day === from && "rounded-l-[24px]",
                      day === to && "rounded-r-[24px]",
                    )}
                  >
                    <button
                      type="button"
                      disabled={off}
                      onClick={() => onPick(day)}
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[12px] transition-colors",
                        off
                          ? "cursor-default text-[rgba(26,28,30,0.3)]"
                          : "text-epom-text hover:bg-epom-primary-8",
                        edge && "bg-epom-primary text-white hover:bg-epom-primary",
                      )}
                    >
                      {Number(day.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Arrow({ name, onClick, label }: { name: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="mx-auto flex h-5 w-5 items-center justify-center rounded text-epom-muted transition-colors hover:bg-epom-primary-8"
    >
      <MaterialIcon name={name} className="block text-[16px] leading-4" />
    </button>
  );
}
