"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

const STATUS_OPTIONS = ["Active, Inactive", "Active", "Inactive", "Archived"];
const BUDGET_OPTIONS = ["All", "Delivering", "Scheduled", "Paused", "No current budget"];

export interface CampaignFilterValue {
  search: string;
  status: string;
  budget: string;
}

export const CAMPAIGN_FILTER_DEFAULTS: CampaignFilterValue = {
  search: "",
  status: STATUS_OPTIONS[0],
  budget: BUDGET_OPTIONS[0],
};

export function CampaignFilters({
  value,
  onChange,
}: {
  value: CampaignFilterValue;
  onChange: (v: CampaignFilterValue) => void;
}) {
  const [open, setOpen] = useState<"status" | "budget" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // One listener for both menus — close on outside click or Escape.
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
        <div className="flex max-w-[714px] flex-wrap gap-3">
          <div className="relative w-[230px]">
            <input
              type="text"
              value={value.search}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
              placeholder="Search"
              className="h-9 w-full rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute right-2 top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>

          <FilterSelect
            label="Status:"
            value={value.status}
            options={STATUS_OPTIONS}
            open={open === "status"}
            onToggle={() => setOpen(open === "status" ? null : "status")}
            onPick={(o) => {
              onChange({ ...value, status: o });
              setOpen(null);
            }}
          />
          <FilterSelect
            label="Budget:"
            value={value.budget}
            options={BUDGET_OPTIONS}
            open={open === "budget"}
            onToggle={() => setOpen(open === "budget" ? null : "budget")}
            onPick={(o) => {
              onChange({ ...value, budget: o });
              setOpen(null);
            }}
          />
        </div>

        <button
          type="button"
          title="Show advanced filters"
          aria-label="Show advanced filters"
          className="flex h-8 w-8 items-center justify-center text-epom-primary"
        >
          <MaterialIcon name="filter_list" className="block text-[20px] leading-8" />
        </button>
      </div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  open,
  onToggle,
  onPick,
  className = "w-[230px]",
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onPick: (option: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
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
        <span className="mr-2 shrink-0 whitespace-nowrap text-epom-muted">{label}</span>
        <span className="truncate text-epom-text">{value}</span>
      </button>
      <MaterialIcon
        name="arrow_drop_down"
        className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
      />

      {open && (
        <div className="absolute left-0 top-9 z-[999] max-h-[190px] w-full overflow-y-auto rounded-b border-x border-b border-epom-primary bg-epom-surface">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onPick(o)}
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
