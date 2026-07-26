"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

const RANGES = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "Last month",
  "Custom range",
];
const ACTIVE_RANGE = "Last 7 days";

export function PageHeader() {
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
    <div className="mb-4 flex items-center justify-between">
      <h1 className="flex items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
        Dashboard
        <a
          href="https://help.dsp.epom.com/docs/dashboard"
          target="_blank"
          rel="noreferrer"
          aria-label="Dashboard help"
          className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
        >
          <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
        </a>
      </h1>

      <div ref={pickerRef} className="relative">
        <input
          type="text"
          readOnly
          value="20.07.2026 - 26.07.2026"
          placeholder="Select date"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "h-9 w-[220px] cursor-pointer rounded border bg-epom-surface py-2 pl-3 pr-12 text-[14px] leading-5 text-epom-text transition-[border-color,box-shadow] duration-150 ease-in-out focus:outline-none",
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
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "mb-1 flex h-9 w-full items-center rounded px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                  range === ACTIVE_RANGE && "bg-epom-primary-16 font-semibold",
                )}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
