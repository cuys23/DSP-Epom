"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BTN_OUTLINED, BTN_OUTLINED_GREY } from "@/components/form/Dialog";
import { CAMPAIGNS } from "@/lib/campaigns";
import { AUDIENCES, audienceOfCampaign } from "@/lib/audiences";
import { campaignFunnel, campaignTotals, survivors, type FunnelStage } from "@/lib/funnel";
import { BALANCE_TOO_LOW } from "@/lib/transactions";

const int = (n: number) => n.toLocaleString("en-US");
const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(2) : "0.00");

/**
 * The funnel takes six filters; the live page shows Campaign and Audience and
 * keeps the other four hidden until they are added. Only those two are named in
 * the saved DOM — the remaining four are the count, with plausible labels.
 *
 * Options come from the account's own data, so picking a Campaign narrows the
 * Creative list to that campaign's creatives and pins the Audience to the one
 * the campaign actually targets.
 */
const FILTERS: { label: string; required?: boolean }[] = [
  { label: "Campaign", required: true },
  { label: "Audience", required: true },
  { label: "Creative" },
  { label: "Country" },
  { label: "Device Type" },
  { label: "Traffic Source" },
];

const REQUIRED = FILTERS.filter((f) => f.required).map((f) => f.label);

/** US iOS inventory is all these offers buy — see the offer names in `campaigns.ts`. */
const COUNTRIES = ["United States"];
const DEVICE_TYPES = ["Mobile"];

export function TrafficFunnelView() {
  // Campaign and Audience are on screen from the start; the rest are added.
  const [shown, setShown] = useState(REQUIRED);
  const [values, setValues] = useState<Record<string, string>>({ Campaign: CAMPAIGNS[0].name });
  const [gathering, setGathering] = useState(false);
  /** Campaign the funnel on screen was gathered for, or null before Apply. */
  const [report, setReport] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  // The app-level warning only fires while the account cannot fund a bid.
  const [notice, setNotice] = useState(BALANCE_TOO_LOW);
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

  const campaign = CAMPAIGNS.find((c) => c.name === values.Campaign);

  // Picking a campaign fixes which audience it runs against and which creatives
  // exist, so those two lists are never free-form.
  const optionsFor = (label: string): string[] => {
    switch (label) {
      case "Campaign":
        return CAMPAIGNS.map((c) => c.name);
      case "Audience":
        return campaign
          ? [audienceOfCampaign(campaign.id)?.name].filter((n): n is string => !!n)
          : AUDIENCES.map((a) => a.name);
      case "Creative":
        return campaign?.creatives.map((cr) => cr.name) ?? [];
      case "Country":
        return COUNTRIES;
      case "Device Type":
        return DEVICE_TYPES;
      case "Traffic Source":
        return campaign ? [campaign.offer.network] : [];
      default:
        return [];
    }
  };

  const ready = REQUIRED.every((r) => values[r]);
  const hidden = FILTERS.filter((f) => !shown.includes(f.label));
  const reported = report ? CAMPAIGNS.find((c) => c.id === report) : undefined;

  return (
    <AppShell activeHref="/traffic-funnel" breadcrumbs={[{ label: "Traffic Funnel" }]}>
      <div className="flex min-h-full flex-col">
        <div className="mb-4 flex h-9 items-center">
          <h1 className="whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
            Traffic Funnel
          </h1>
        </div>

        <div ref={barRef} className="rounded bg-epom-surface p-4">
          <div className="relative w-[172px]">
            <button
              type="button"
              data-qa="addFilterBtn"
              disabled={hidden.length === 0}
              onClick={() => setOpen(open === "add" ? null : "add")}
              aria-expanded={open === "add"}
              className={cn(
                BTN_OUTLINED,
                "flex w-full items-center pr-2 text-left",
                hidden.length === 0 && "cursor-not-allowed border-epom-border text-epom-border",
              )}
            >
              Add Filter
              <MaterialIcon name="arrow_drop_down" className="ml-auto block text-[20px] leading-5" />
            </button>

            {open === "add" && hidden.length > 0 && (
              <div className="absolute left-0 top-10 z-[999] w-full rounded bg-epom-surface py-1 shadow-epom-dropdown">
                {hidden.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => {
                      setShown((s) => [...s, f.label]);
                      setOpen(null);
                    }}
                    className="block h-[34px] w-full px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            {FILTERS.filter((f) => shown.includes(f.label)).map((f) => (
              <div key={f.label} className="w-[312px]">
                <label className="mb-1 flex items-center text-[12px] font-semibold leading-[18px] text-epom-muted">
                  {f.label}
                  {f.required && (
                    <span className="-mt-0.5 ml-1 text-[12px] font-semibold text-epom-primary">*</span>
                  )}
                </label>
                <Select
                  value={values[f.label]}
                  options={optionsFor(f.label)}
                  open={open === f.label}
                  onToggle={() => setOpen(open === f.label ? null : f.label)}
                  onPick={(o) => {
                    setValues((v) =>
                      // A different campaign invalidates everything scoped to it.
                      f.label === "Campaign"
                        ? { Campaign: o }
                        : { ...v, [f.label]: o },
                    );
                    setOpen(null);
                  }}
                />
              </div>
            ))}

            <button
              type="button"
              data-qa="applyFilters"
              disabled={!ready}
              onClick={() => {
                setReport(campaign?.id ?? null);
                setGathering(true);
              }}
              className={BTN_OUTLINED_GREY}
            >
              Apply Filters and Start
            </button>
          </div>
        </div>

        <div className="mt-4 flex h-9 items-center">
          <span className={cn("text-[14px] leading-[21px]", gathering ? "text-epom-success" : "text-epom-error")}>
            {gathering ? "Data is gathering" : "Data is not gathering"}
          </span>

          <div className="ml-auto flex justify-end">
            <button
              type="button"
              data-qa="startButton"
              disabled={!report || gathering}
              onClick={() => setGathering(true)}
              className={BTN_OUTLINED_GREY}
            >
              Start
            </button>
            <button
              type="button"
              data-qa="restartData"
              onClick={() => {
                setGathering(false);
                setReport(null);
              }}
              className={cn(BTN_OUTLINED_GREY, "ml-4 flex items-center justify-center gap-1")}
            >
              <MaterialIcon name="restart_alt" filled className="block text-[20px] leading-5" />
              Reset data
            </button>
          </div>
        </div>

        {reported ? (
          <Funnel campaignId={reported.id} audience={values.Audience} />
        ) : (
          <div className="flex w-full flex-1 items-center justify-center">
            <span className="text-[16px] font-bold text-epom-text">No Data</span>
          </div>
        )}
      </div>

      {notice && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[396px]">
          <div className="mt-2 flex flex-nowrap gap-4 rounded bg-epom-toast p-4 text-[14px] leading-[21px] text-epom-toast-fg">
            <MaterialIcon name="warning" filled className="block shrink-0 text-[20px] leading-5 text-[#ffefd5]" />
            <span className="w-full max-w-[296px] break-words">
              Your Balance is too low to bid! Please deposit funds
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setNotice(false)}
              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center"
            >
              <MaterialIcon name="close" className="block text-[20px] leading-5" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/**
 * The report itself: one bar per stage, each as wide as the share of the original
 * bid requests still standing when it runs. Colours are the live theme's
 * `--trafficFunnel-*` variables.
 */
function Funnel({ campaignId, audience }: { campaignId: string; audience?: string }) {
  const stages = campaignFunnel(campaignId);
  const totals = campaignTotals(campaignId);
  const top = totals.bidRequests;
  const left = survivors(stages);

  return (
    <div className="mt-4 rounded bg-epom-surface p-6">
      <div className="mb-6 flex flex-wrap gap-x-10 gap-y-3">
        <Summary label="Bid requests" value={int(top)} />
        <Summary label="Passed targeting" value={int(totals.bidResponses)} />
        <Summary label="Auctions won" value={int(totals.wins)} />
        <Summary label="Impressions" value={int(left)} />
        <Summary label="Requests reaching an impression" value={`${pct(left, top)}%`} />
      </div>

      <ul>
        {stages.map((s) => (
          <Stage key={s.label} stage={s} top={top} audience={audience} />
        ))}
      </ul>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] font-semibold leading-[18px] text-epom-muted">{label}</div>
      <div className="text-[20px] font-bold leading-6 text-epom-text">{value}</div>
    </div>
  );
}

function Stage({
  stage,
  top,
  audience,
}: {
  stage: FunnelStage;
  top: number;
  audience?: string;
}) {
  const passed = stage.entered - stage.rejected;
  return (
    <li className="mb-4 last:mb-0">
      <div className="mb-1 flex items-baseline gap-2 text-[12px] leading-[18px]">
        <span className="font-semibold text-epom-text">{stage.label}</span>
        {/* The retargeting check is the audience's own — name it so the link is visible. */}
        {stage.label.startsWith("Device IFA") && audience && (
          <span className="text-epom-muted">audience: {audience}</span>
        )}
        <span className="ml-auto whitespace-nowrap text-epom-muted">
          {int(stage.entered)} in
        </span>
        <span className="w-[132px] whitespace-nowrap text-right text-epom-funnel-drop">
          −{int(stage.rejected)} ({pct(stage.rejected, stage.entered)}%)
        </span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-[2px] bg-epom-funnel-track">
        <div
          className={cn(
            "h-full rounded-[2px]",
            stage.phase === "targeting" ? "bg-epom-funnel" : "bg-epom-funnel/70",
          )}
          style={{ width: `${Math.max((passed / top) * 100, 0.4)}%` }}
        />
      </div>
    </li>
  );
}

/** `custom-select` — 36px box showing the picked value or the muted placeholder. */
function Select({
  value,
  options,
  open,
  onToggle,
  onPick,
}: {
  value?: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onPick: (option: string) => void;
}) {
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        data-qa="selectTitle"
        className={cn(
          "flex h-9 w-full items-center border py-[6px] pl-[11px] pr-9 text-left text-[14px] leading-[21px]",
          open ? "rounded-t-[3px] border-epom-primary" : "rounded border-epom-border",
        )}
      >
        <span className={cn("truncate", value ? "text-epom-text" : "text-epom-muted")}>
          {value ?? "Select option"}
        </span>
      </button>
      <MaterialIcon
        name="arrow_drop_down"
        className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
      />

      {open && (
        <div className="absolute left-0 top-9 z-[999] max-h-[190px] w-full overflow-y-auto rounded-b border-x border-b border-epom-primary bg-epom-surface">
          {options.length === 0 ? (
            <div className="py-4 text-center text-[12px] leading-[18px] text-epom-muted">
              No available data to show.
            </div>
          ) : (
            options.map((o) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
