"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

const STATUS_OPTIONS = ["Active, Inactive", "Active", "Inactive", "Archived"];
const BUDGET_OPTIONS = ["All", "Delivering", "Scheduled", "Paused", "No current budget"];

export function CampaignFilters() {
  const [open, setOpen] = useState<"status" | "budget" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
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

  return (
    <div ref={barRef} className="mb-4 rounded bg-epom-surface p-4">
      <div className="flex h-9 items-start gap-3">
        <div className="flex w-[714px] gap-3">
          <div className="relative w-[230px]">
            <input
              type="text"
              readOnly
              placeholder="Search"
              className="h-9 w-full rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] leading-5 text-epom-text focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute right-2 top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>

          <FilterSelect
            label="Status:"
            value="Active, Inactive"
            options={STATUS_OPTIONS}
            open={open === "status"}
            onToggle={() => setOpen(open === "status" ? null : "status")}
            onPick={() => setOpen(null)}
          />
          <FilterSelect
            label="Budget:"
            value="All"
            options={BUDGET_OPTIONS}
            open={open === "budget"}
            onToggle={() => setOpen(open === "budget" ? null : "budget")}
            onPick={() => setOpen(null)}
          />
        </div>

        <button
          type="button"
          aria-label="More filters"
          className="flex h-8 w-8 items-center justify-center text-epom-primary"
        >
          <MaterialIcon name="filter_list" className="block text-[20px] leading-8" />
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  open,
  onToggle,
  onPick,
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onPick: () => void;
}) {
  return (
    <div className="relative w-[230px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center border py-[6px] pl-[11px] pr-9 text-left text-[14px] leading-[21px]",
          // Open: purple border and square bottom corners so it joins the panel.
          open ? "rounded-t-[3px] border-epom-primary" : "rounded border-epom-border",
        )}
      >
        <span className="mr-2 text-epom-muted">{label}</span>
        <span className="text-epom-text">{value}</span>
      </button>
      <MaterialIcon
        name="arrow_drop_down"
        className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
      />

      {open && (
        <div className="absolute left-0 top-9 z-[999] max-h-[190px] w-[230px] overflow-y-auto rounded-b border-x border-b border-epom-primary bg-epom-surface">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={onPick}
              className={cn(
                "block h-[34px] w-full px-3 pb-[7px] pt-[6px] text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                o === value && "bg-epom-primary-16 font-semibold",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
