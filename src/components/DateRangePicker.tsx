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

export function DateRangePicker({
  value,
  activeRange,
  onChange,
  className = "w-[220px]",
}: {
  /** dd.mm.yyyy - dd.mm.yyyy, printed into the read-only input. */
  value: string;
  /** Preset the popup highlights. */
  activeRange: string;
  /** Fires with the chosen preset. Without it the picker is display-only. */
  onChange?: (range: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={pickerRef} className={cn("relative", className)}>
      <input
        type="text"
        readOnly
        value={value}
        placeholder="Select date"
        onClick={() => setOpen((v) => !v)}
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
        <div className="absolute right-0 top-[42px] z-[1000] w-[216px] rounded bg-epom-surface px-3 pb-2 pt-3 shadow-epom-dropdown">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => {
                onChange?.(range);
                setOpen(false);
              }}
              className={cn(
                "mb-1 flex h-9 w-full items-center rounded px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                range === activeRange && "bg-epom-primary-16 font-semibold",
              )}
            >
              {range}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
