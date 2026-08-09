"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";
import { formatFlight, type CampaignBudget } from "@/lib/records";

const STATUSES = ["Delivering", "Scheduled", "Paused", "Ended"] as const;
type Status = (typeof STATUSES)[number];

/** `epom-status-dot` — the live app tints Ended black and the live states green. */
const DOT_TONE: Record<Status, string> = {
  Delivering: "text-epom-primary",
  Scheduled: "text-epom-primary",
  Paused: "text-epom-muted",
  Ended: "text-epom-text",
};

export function CampaignBudgetsStep({
  status,
  budget: pending,
  onChange,
}: {
  /** The campaign's own budget state, so the card matches the overview page. */
  status: string;
  /** Pending values — the wizard's footer Save is what commits them. */
  budget: CampaignBudget;
  onChange: (budget: CampaignBudget) => void;
}) {
  const [selected, setSelected] = useState<Status[]>([...STATUSES]);
  const [open, setOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // The trigger label and the empty-state copy both read off the checked set, so
  // they stay in the order the panel lists them rather than click order.
  const checked = STATUSES.filter((s) => selected.includes(s));
  // This account has exactly one budget per campaign.
  const visible = selected.includes(status as Status) ? [status as Status] : [];

  return (
    <>
      <div className="flex h-[68px] items-center justify-between rounded bg-epom-surface px-6 py-4">
        <div ref={filterRef} className="relative w-[364px]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex h-9 w-full items-center rounded border border-epom-border pb-[7px] pl-[11px] pr-[11px] pt-[6px] text-left text-[14px] leading-[21px]"
          >
            <span className="mr-2 shrink-0 text-epom-muted">Status:</span>
            <span className="flex-1 overflow-hidden text-epom-text">{checked.join(", ")}</span>
            <MaterialIcon
              name={open ? "arrow_drop_up" : "arrow_drop_down"}
              className="ml-2 block shrink-0 text-[20px] leading-5 text-epom-muted"
            />
          </button>

          {open && (
            <div className="absolute left-0 top-10 z-20 w-full rounded border-t border-epom-primary bg-epom-surface p-1 shadow-[-1px_0_20px_rgba(24,28,34,0.05),0_1px_5px_rgba(0,0,0,0.15)]">
              <ul>
                {STATUSES.map((status) => {
                  const on = selected.includes(status);
                  return (
                    <li key={status} className="mb-0.5 h-9">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected((prev) =>
                            on ? prev.filter((s) => s !== status) : [...prev, status],
                          )
                        }
                        className={cn(
                          "flex h-9 w-full items-center rounded px-3 pb-2 pt-[7px] text-left text-[14px] leading-[21px] text-epom-text",
                          on ? "bg-epom-primary-12 font-semibold" : "font-normal",
                        )}
                      >
                        <span
                          className={cn(
                            "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border",
                            on ? "border-epom-primary bg-epom-primary" : "border-epom-muted",
                          )}
                        >
                          {on && (
                            <MaterialIcon
                              name="check"
                              className="block text-[14px] leading-[14px] text-white"
                            />
                          )}
                        </span>
                        {status}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 min-w-24 items-center gap-1 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
        >
          <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
          Create new Budget
        </button>
      </div>

      {visible.length > 0 ? (
        visible.map((s) => (
          <BudgetCard key={s} status={s} pending={pending} onChange={onChange} />
        ))
      ) : (
        <div className="mt-4 flex min-h-[160px] flex-col items-center justify-center gap-1 rounded bg-epom-surface p-6">
          <span className="text-[12px] leading-[18px] text-epom-muted">
            No {checked.join(", ").toLowerCase()} budget.
          </span>
          <span className="text-[12px] leading-[18px] text-epom-muted">
            Try a different status filter to see more.
          </span>
          <button
            type="button"
            onClick={() => setSelected([...STATUSES])}
            className="mt-2 flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-epom-primary"
          >
            <MaterialIcon name="restart_alt" className="block text-[16px] leading-4" />
            Reset Filter
          </button>
        </div>
      )}
    </>
  );
}

function BudgetCard({
  status,
  pending,
  onChange,
}: {
  status: Status;
  pending: CampaignBudget;
  onChange: (budget: CampaignBudget) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded bg-epom-surface">
      <div className="p-4">
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold leading-[21px] text-epom-text">Budget</span>
            <span className="flex items-center text-[12px] leading-[18px] text-epom-text">
              <MaterialIcon
                name="circle"
                filled
                className={cn("mr-1 block text-[10px] leading-[10px]", DOT_TONE[status])}
              />
              {status}
            </span>
          </div>
          {/* 24.5px, not 20: on the live site this is an inline box, so its line
              box — not the glyph — sets the header row's height. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="View Budget"
            title="View Budget"
            className="flex h-[24.5px] items-center"
          >
            <MaterialIcon
              name="visibility"
              className={cn(
                "block text-[20px] leading-5 transition-colors hover:text-epom-text",
                open ? "text-epom-text" : "text-epom-muted",
              )}
            />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Column label="Start date" values={[formatFlight(pending.startsAt)]} />
          <Column label="End date" values={[formatFlight(pending.endsAt)]} />
          <div>
            <div className="mb-1 text-[12px] leading-[18px] text-epom-muted">
              Spend limit / Impressions limit
            </div>
            {/* budget-limit-value — the number is semibold, the unit is not. */}
            <div className="text-[12px] leading-[18px] text-epom-text">
              <span className="font-semibold">${pending.spendLimit.toLocaleString("en-US")}</span>{" "}
              daily
            </div>
            <div className="text-[12px] leading-[18px] text-epom-text">
              <span className="font-semibold">
                {pending.impressionLimit.toLocaleString("en-US")}
              </span>{" "}
              daily Impressions
            </div>
          </div>
          <Column label="Even pacing" values={[pending.evenPacing ? "On" : "-"]} />
        </div>
      </div>

      {open && (
        <BudgetEditPanel
          budget={pending}
          onApply={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * `.budget-edit-inline` — the detail form the eye button expands underneath the
 * card. Every field of the budget is editable here and OK commits the lot; the
 * live site locks this form because its budget has already ended.
 */
function BudgetEditPanel({
  budget,
  onApply,
  onClose,
}: {
  budget: CampaignBudget;
  onApply: (budget: CampaignBudget) => void;
  onClose: () => void;
}) {
  const [startDate, startTime] = budget.startsAt.split("T");
  const [endDate, endTime] = budget.endsAt.split("T");
  const [draft, setDraft] = useState({
    startDate,
    startTime,
    endDate,
    endTime,
    spend: String(budget.spendLimit),
    impressions: String(budget.impressionLimit),
    evenPacing: budget.evenPacing,
  });
  const [error, setError] = useState<string | null>(null);

  // Every field is a draft string so a half-typed or emptied one stays typeable —
  // parsing on each keystroke turns "" into NaN. The panel unmounts when it
  // closes, so reopening always re-seeds from the saved values.
  const edit = (patch: Partial<typeof draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  const onOk = () => {
    const spendLimit = Number(draft.spend);
    const impressionLimit = Number(draft.impressions);
    if (draft.spend.trim() === "" || !Number.isFinite(spendLimit) || spendLimit < 0) {
      return setError("Daily spend limit must be a number of 0 or more.");
    }
    if (
      draft.impressions.trim() === "" ||
      !Number.isFinite(impressionLimit) ||
      impressionLimit < 0
    ) {
      return setError("Daily impressions limit must be a number of 0 or more.");
    }
    if (!draft.startDate || !draft.startTime || !draft.endDate || !draft.endTime) {
      return setError("Enter a start and end date with times.");
    }

    if (`${draft.endDate}T${draft.endTime}` <= `${draft.startDate}T${draft.startTime}`) {
      return setError("The end date must be after the start date.");
    }

    // OK only applies the edit; the wizard's Save is what writes it to the database.
    onApply({
      startsAt: `${draft.startDate}T${draft.startTime}`,
      endsAt: `${draft.endDate}T${draft.endTime}`,
      spendLimit,
      impressionLimit,
      evenPacing: draft.evenPacing,
    });
    onClose();
  };

  return (
    <div className="border-t border-epom-border p-4">
      <div className="max-w-[720px]">
        <h4 className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">Flight Dates</h4>

        <div className="flex gap-4">
          <DateTimeField
            label="Start date"
            date={draft.startDate}
            time={draft.startTime}
            onDateChange={(startDate) => edit({ startDate })}
            onTimeChange={(startTime) => edit({ startTime })}
          />
          <DateTimeField
            label="End date (planned)"
            date={draft.endDate}
            time={draft.endTime}
            onDateChange={(endDate) => edit({ endDate })}
            onTimeChange={(endTime) => edit({ endTime })}
          />
        </div>

        {/* 22px, not 21: the asterisk's glyph box is taller than the label text. */}
        <h4 className="mb-3 mt-6 h-[22px] text-[14px] font-bold leading-[21px] text-epom-text">
          Limits <span className="text-epom-primary">*</span>
        </h4>
        <h4 className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">Daily</h4>

        <div className="flex gap-4">
          <LimitField
            label="Daily spend limit"
            value={draft.spend}
            onChange={(spend) => edit({ spend })}
          />
          <LimitField
            label="Daily impressions limit"
            value={draft.impressions}
            onChange={(impressions) => edit({ impressions })}
          />
        </div>

        <label className="mt-6 flex w-fit cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            role="switch"
            checked={draft.evenPacing}
            onChange={(e) => edit({ evenPacing: e.target.checked })}
            className="sr-only"
          />
          <span
            className={cn(
              "relative flex h-5 w-9 items-center rounded-full transition-colors",
              draft.evenPacing ? "bg-epom-primary" : "bg-epom-border",
            )}
          >
            <span
              className={cn(
                "block h-4 w-4 rounded-full bg-white transition-transform",
                draft.evenPacing ? "translate-x-[17px]" : "translate-x-0.5",
              )}
            />
          </span>
          <span className="text-[14px] leading-[21px] text-epom-text">Even Pacing</span>
          <span
            title="Spreads the daily budget evenly across the day instead of spending it as fast as inventory allows."
            className="flex"
          >
            <MaterialIcon name="info" className="block text-[16px] leading-4 text-epom-muted" />
          </span>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {error && <span className="text-[12px] leading-[18px] text-epom-error">{error}</span>}
        <button
          type="button"
          onClick={onOk}
          className="h-9 min-w-24 rounded border border-epom-muted px-4 py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-text transition-colors hover:bg-black/[0.08]"
        >
          OK
        </button>
      </div>
    </div>
  );
}

/** An editable date + time pair, 172px each with an 8px gap. */
function DateTimeField({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  // The native picker glyph is hidden so the Material icon stays the only one.
  const field =
    "h-9 w-[172px] rounded border border-epom-border bg-epom-surface px-3 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-0";
  return (
    <div className="flex w-[352px] gap-2">
      <div className="flex-1">
        <div className="mb-1 text-[12px] font-semibold leading-[18px] text-epom-muted">{label}</div>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label={label}
            className={field}
          />
          <MaterialIcon
            name="event"
            className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
          />
        </div>
      </div>
      <div className="flex-1 self-end">
        <div className="relative">
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${label} time`}
            className={field}
          />
          <MaterialIcon
            name="schedule"
            className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
          />
        </div>
      </div>
    </div>
  );
}

/** The one thing this panel lets you change. */
function LimitField({
  label,
  value,
  onChange,
}: {
  label: string;
  /** A raw draft string — validated and parsed when OK is pressed. */
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-[352px]">
      <div className="mb-1 text-[12px] font-semibold leading-[18px] text-epom-muted">{label}</div>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded border border-epom-border bg-epom-surface px-3 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
      />
    </div>
  );
}

function Column({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="mb-1 text-[12px] leading-[18px] text-epom-muted">{label}</div>
      {values.map((v) => (
        <div key={v} className="text-[12px] leading-[18px] text-epom-text">
          {v}
        </div>
      ))}
    </div>
  );
}
