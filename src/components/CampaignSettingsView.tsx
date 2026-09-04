"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { FilterSelect } from "@/components/CampaignFilters";
import { LineChart } from "@/components/LineChart";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BTN_OUTLINED } from "@/components/form/Dialog";
import { CreativePreview } from "@/components/CreativePreview";
import { DateRangePicker } from "@/components/DateRangePicker";
import { CELL, SERIES, dayMetrics } from "@/lib/demo-data";
import { CAMPAIGNS } from "@/lib/campaigns";
import { audienceOfCampaign } from "@/lib/audiences";
import { campaignMediaType, creativeTypeIcon } from "@/lib/creative-type";
import {
  CREATIVE_DOT,
  DEFAULT_RANGE,
  STATS,
  rangeDays,
  rangeLabel,
  type CreativeStatus,
} from "@/lib/campaign-stats";

const TIME_ZONES = "UTC+00:00 London, GBR; Reykjavik, ISL; Dakar, SEN";

interface Info {
  label: string;
  value: string;
}

interface CampaignView {
  id: string;
  name: string;
  type: string;
  typeIcon: string;
  basic: Info[];
  bidPrice: Info[];
  audience: { name: string; id: string };
  budget: {
    status: string;
    tone: "success" | "cancelled";
    flight: Info[];
    limits: (Info & { suffix?: string })[];
    evenPacing: string;
    impToBidAuto: string;
  };
  trafficSource: string;
  riskTolerance: string;
  creatives: {
    id: string;
    name: string;
    src: string;
    video: boolean;
    size: string;
    price: string;
    status: CreativeStatus;
  }[];
}

const int = (n: number) => n.toLocaleString("en-US");

/** Every campaign that has run, in the shape this page renders. */
const VIEWS = new Map<string, CampaignView>(
  CAMPAIGNS.map((c) => {
    const s = STATS.get(c.id)!;
    const a = audienceOfCampaign(c.id)!;
    const media = campaignMediaType(c.creatives);
    return [
      c.id,
      {
        id: c.id,
        name: c.name,
        type: media,
        typeIcon: creativeTypeIcon(media),
        basic: [
          { label: "Name:", value: c.name },
          { label: "Folder:", value: c.productLabel },
        ],
        bidPrice: [
          { label: "Pricing Model:", value: "CPM" },
          { label: "Default Price:", value: `${c.defaultPrice}$` },
        ],
        // The real audience from the roster, so the link lands on the page it names.
        audience: { name: a.name, id: a.id },
        budget: {
          status: s.status,
          tone: "cancelled",
          flight: [
            { label: "Flight dates:", value: s.flight },
            { label: "Time Zones:", value: TIME_ZONES },
          ],
          limits: [
            { label: "Type:", value: "Daily" },
            { label: "Spend limit:", value: `$${s.spendLimit}`, suffix: " per day" },
            { label: "Imp limit:", value: int(s.impressionLimit), suffix: " per day" },
          ],
          evenPacing: "Off",
          impToBidAuto: "On",
        },
        trafficSource: c.offer.site,
        riskTolerance: "High",
        creatives: c.creatives.map((k) => ({
          id: k.id,
          name: k.name,
          src: k.src,
          video: k.video,
          size: k.size,
          price: k.price,
          status: "paused" as const,
        })),
      },
    ];
  }),
);

const METRICS = ["Impressions", "Clicks", "Spend", "CTR", "eCPM", "eCPC", "Wins", "Win Rate"];

export function CampaignSettingsView() {
  const id = String(useParams().id ?? "");
  // Unknown ids fall back to the newest campaign rather than 404ing.
  const CAMPAIGN = VIEWS.get(id) ?? [...VIEWS.values()][0];

  // Nothing on this account is in flight any more.
  const [on, setOn] = useState(false);
  /** Creative ids the user has switched off / archived on this page. */
  const [creativesOff, setCreativesOff] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [audience, setAudience] = useState<string | undefined>(undefined);
  const [metric, setMetric] = useState("Impressions");
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [open, setOpen] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const visibleCreatives = CAMPAIGN.creatives.filter((k) => !archived.includes(k.id));

  const days = rangeDays(range);
  // Kept as metrics rather than plain numbers, so the chart's hover box can print
  // the same formatted value the report table would.
  const daily = days.map((d) => dayMetrics(d, CAMPAIGN.id));
  const series = daily.map((m) => SERIES[metric](m));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!pageRef.current?.contains(e.target as Node)) setOpen(null);
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
    <AppShell
      activeHref="/campaigns"
      breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: CAMPAIGN.name }]}
    >
      <div ref={pageRef}>
        <div className="flex h-9 items-center">
          <h1 className="flex items-center text-[20px] font-bold leading-6 text-epom-text">
            {CAMPAIGN.name}
            <a
              href="https://help.dsp.epom.com/docs/basic-settings"
              target="_blank"
              rel="noreferrer"
              title="Learn about Basic Info"
              aria-label="Learn about Basic Info"
              className="ml-2 flex h-5 w-5 text-epom-primary transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
            >
              <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
            </a>
          </h1>
        </div>

        <div className="mt-4 flex items-center gap-11 rounded bg-epom-surface px-6 py-4">
          <div className="flex gap-2 text-[12px] leading-[18px] text-epom-muted">
            Type:
            <span className="flex font-semibold capitalize text-epom-text">
              <MaterialIcon name={CAMPAIGN.typeIcon} className="mr-1 block text-[18px] leading-[18px]" />
              {CAMPAIGN.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-normal leading-[18px] text-epom-muted">Status:</span>
            <Toggle on={on} onToggle={() => setOn((v) => !v)} />
          </div>
        </div>

        {/* Two columns above 1400px, stacked below — matches the live breakpoint. */}
        <div className="mt-4 flex flex-col justify-between gap-4 min-[1400px]:flex-row">
          <div className="flex flex-1 flex-col">
            <Box>
              <BoxHeading step="basic" campaignId={CAMPAIGN.id}>Basic info</BoxHeading>
              <h4 className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">
                Basic settings
              </h4>
              {CAMPAIGN.basic.map((o) => (
                <Info key={o.label} {...o} />
              ))}
              <h4 className="mb-4 mt-8 text-[14px] font-bold leading-[21px] text-epom-text">
                Bid Price
              </h4>
              {CAMPAIGN.bidPrice.map((o) => (
                <Info key={o.label} {...o} />
              ))}
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="audience" campaignId={CAMPAIGN.id}>Audience</BoxHeading>
              <div className="mt-4">
                <a
                  href={`/audience/edit/${CAMPAIGN.audience.id}`}
                  className="mb-1 inline-block text-[14px] font-semibold leading-[21px] text-epom-primary underline hover:text-epom-primary-hover"
                >
                  {CAMPAIGN.audience.name}
                </a>
              </div>

              <div className="mt-6">
                <h3 className="mb-6 text-[16px] font-bold leading-6 text-epom-text">
                  Check audience traffic funnel
                </h3>
                <div className="flex items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-[12px] font-semibold leading-[18px] text-epom-muted">
                      Audience
                    </label>
                    <FilterSelect
                      label=""
                      value={audience ?? "Select Audience"}
                      options={[CAMPAIGN.audience.name]}
                      className="w-full"
                      open={open === "audience"}
                      onToggle={() => setOpen(open === "audience" ? null : "audience")}
                      onPick={(o) => {
                        setAudience(o);
                        setOpen(null);
                      }}
                    />
                  </div>
                  <a
                    href={`/traffic-funnel?campaign_id=${CAMPAIGN.id}`}
                    className={cn("shrink-0", !audience && "pointer-events-none")}
                  >
                    <button
                      type="button"
                      disabled={!audience}
                      className={cn(
                        BTN_OUTLINED,
                        "disabled:cursor-not-allowed disabled:border-epom-border disabled:text-epom-border",
                      )}
                    >
                      Open Traffic Funnel
                    </button>
                  </a>
                </div>
              </div>
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="budgets" campaignId={CAMPAIGN.id}>Budgets</BoxHeading>
              <div className="mt-4">
                <StatusDot label={CAMPAIGN.budget.status} tone={CAMPAIGN.budget.tone} />
              </div>

              <h4 className="mt-8 text-[14px] font-bold leading-[21px] text-epom-text">
                Flight dates
              </h4>
              {CAMPAIGN.budget.flight.map((o) => (
                <Info key={o.label} {...o} />
              ))}

              <h4 className="mt-8 text-[14px] font-bold leading-[21px] text-epom-text">Limits</h4>
              {CAMPAIGN.budget.limits.map((o) => (
                <Info key={o.label} label={o.label} value={o.value} suffix={o.suffix} bold={!!o.suffix} />
              ))}

              <div className="mt-4 flex flex-wrap items-center gap-1 leading-[21px]">
                <span className="text-epom-muted">Even Pacing:</span>
                <StatusDot label={CAMPAIGN.budget.evenPacing} tone="cancelled" size="md" />
              </div>
              <Info
                label="Impression-to-Bid rate Auto Adjust Enabled:"
                value={CAMPAIGN.budget.impToBidAuto}
              />
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="pricingOptimization" campaignId={CAMPAIGN.id}>Bidding Strategy</BoxHeading>
              <div className="text-[12px] leading-[18px] text-epom-muted">
                Bidding strategy is not configured.
              </div>
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="trafficSources" campaignId={CAMPAIGN.id}>Traffic source</BoxHeading>
              <div className="mt-2">
                <StatusDot label="Included" tone="success" />
                <div className="mt-2 text-[14px] leading-[21px] text-epom-text">
                  {CAMPAIGN.trafficSource}
                </div>
              </div>
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="pricingOptimization" campaignId={CAMPAIGN.id}>Optimizations</BoxHeading>
              <div className="mt-4 flex flex-col gap-8">
                <div>
                  <h4 className="mb-3 text-[14px] font-bold leading-[21px] text-epom-text">
                    Risk tolerance level
                  </h4>
                  <div className="flex flex-col gap-3">
                    <Info label="Risk tolerance level:" value={CAMPAIGN.riskTolerance} />
                  </div>
                </div>
              </div>
            </Box>
          </div>

          <div className="flex w-full flex-1 flex-col min-[1400px]:min-w-[560px]">
            <Box className="mb-4">
              <div className="flex justify-between">
                <h3 className="text-[16px] font-bold leading-6 text-epom-text">Creatives</h3>
                <a
                  href={`/campaigns/${CAMPAIGN.id}/creatives/video`}
                  className="ml-4 flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-epom-primary hover:text-epom-primary-hover"
                >
                  <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
                  Add new Creative
                </a>
              </div>

              <div className="mt-3 block overflow-auto">
                <table className="w-max min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap bg-[#e1e2ec] p-0 align-middle" />
                      <th className="w-12 whitespace-nowrap bg-[#e1e2ec] px-4 py-2 text-left align-middle">
                        <button
                          type="button"
                          title="Filter creatives"
                          aria-label="Filter creatives"
                          className="flex text-epom-primary"
                        >
                          <MaterialIcon name="filter_list" className="block text-[20px] leading-5" />
                        </button>
                      </th>
                      {["Name", "Preview", "Size", "Price", "Status"].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text"
                        >
                          {h}
                        </th>
                      ))}
                      <th className="bg-[#e1e2ec] px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCreatives.map((k) => (
                      <tr key={k.id} className="group text-epom-text">
                        <td className="p-0" />
                        <td className="px-4 py-4 align-middle transition-colors group-hover:bg-[#fafafa]">
                          <span className="flex">
                            <i
                              title={k.status.replace("_", " ")}
                              className={cn("block h-4 w-4 rounded-full", CREATIVE_DOT[k.status])}
                            />
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[12px] leading-[18px] transition-colors group-hover:bg-[#fafafa]">
                          <a
                            href={`/campaigns/${CAMPAIGN.id}/creatives/video/${k.id}`}
                            className="font-semibold text-epom-primary underline hover:text-epom-primary-hover"
                          >
                            {k.name}
                          </a>
                        </td>
                        <td className="px-4 py-4 transition-colors group-hover:bg-[#fafafa]">
                          <button
                            type="button"
                            title="Preview"
                            aria-label="Preview"
                            onClick={() => setPreview(k.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-epom-muted transition-colors hover:bg-[#fafafa] hover:text-epom-primary"
                          >
                            <MaterialIcon
                              name="remove_red_eye"
                              className="block text-[20px] leading-5"
                            />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-[12px] leading-[18px] transition-colors group-hover:bg-[#fafafa]">
                          {k.size}
                        </td>
                        <td className="px-4 py-4 text-[12px] leading-[18px] transition-colors group-hover:bg-[#fafafa]">
                          {k.price}
                        </td>
                        <td className="px-4 py-4 transition-colors group-hover:bg-[#fafafa]">
                          <Toggle
                            on={!creativesOff.includes(k.id)}
                            onToggle={() =>
                              setCreativesOff((off) =>
                                off.includes(k.id) ? off.filter((x) => x !== k.id) : [...off, k.id],
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-4 text-right transition-colors group-hover:bg-[#fafafa]">
                          <button
                            type="button"
                            title="Archive"
                            aria-label="Archive"
                            onClick={() => setArchived((a) => [...a, k.id])}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-epom-muted transition-colors hover:bg-[#fafafa] hover:text-epom-primary"
                          >
                            <MaterialIcon name="archive" className="block text-[20px] leading-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visibleCreatives.length === 0 && (
                  <div className="py-8 text-center text-[12px] leading-[18px] text-epom-muted">
                    No available data to show.
                  </div>
                )}
              </div>
            </Box>

            <div className="rounded bg-epom-surface">
              <div className="flex items-center justify-between px-6 pt-6">
                <h1 className="flex items-center text-[16px] font-bold leading-6 text-epom-text">
                  Analytics
                  <a
                    href={`/analytics?cid=${CAMPAIGN.id}`}
                    className="ml-1.5 flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-epom-primary hover:text-epom-primary-hover"
                  >
                    <MaterialIcon name="open_in_new" filled className="block text-[16px] leading-4" />
                    Open
                  </a>
                </h1>

                <DateRangePicker
                  value={rangeLabel(days)}
                  activeRange={range}
                  onChange={setRange}
                  className="w-[240px]"
                />
              </div>

              <div className="mt-4 border-t border-epom-border p-4">
                <div className="flex justify-end">
                  <FilterSelect
                    label="Metric:"
                    value={metric}
                    options={METRICS}
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
                    labels={days}
                    values={series}
                    formatted={daily.map((m) => CELL[metric](m))}
                    seriesName={metric}
                    width={480}
                    spread="edges"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <CreativePreview
          creative={CAMPAIGN.creatives.find((k) => k.id === preview)!}
          onClose={() => setPreview(null)}
        />
      )}
    </AppShell>
  );
}

/** `.form-box` — 24px padding card. */
function Box({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded bg-epom-surface p-6", className)}>{children}</div>
  );
}

/**
 * `.headline-3.headline-with-edit` — title on the left, the Edit link on the
 * right. Each Edit opens the wizard on the step that owns that section.
 */
function BoxHeading({
  children,
  step,
  campaignId,
  spaced = true,
}: {
  children: React.ReactNode;
  /** `?step=` value the Edit link jumps to. */
  step: string;
  campaignId: string;
  spaced?: boolean;
}) {
  return (
    <h3
      className={cn(
        "flex justify-between text-[16px] font-bold leading-6 text-epom-text",
        spaced && "mb-6",
      )}
    >
      {children}
      <Link
        href={`/campaigns/edit/${campaignId}?step=${step}`}
        className="ml-1.5 flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-epom-primary hover:text-epom-primary-hover"
      >
        <MaterialIcon name="edit" className="block text-[16px] leading-4" />
        Edit
      </Link>
    </h3>
  );
}

function Info({
  label,
  value,
  suffix,
  bold,
}: {
  label: string;
  value: string;
  suffix?: string;
  bold?: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 break-words leading-[21px]">
      <span className="text-epom-muted">{label}</span>
      <span className="text-epom-text">
        <span className={cn(bold && "font-semibold")}>{value}</span>
        {suffix}
      </span>
    </div>
  );
}

/** `epom-status-dot` — 10px filled circle plus a caption, tinted by state. */
function StatusDot({
  label,
  tone,
  size = "sm",
}: {
  label: string;
  tone: "success" | "cancelled";
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex items-center whitespace-nowrap font-normal",
        size === "sm" ? "text-[12px] leading-[18px]" : "text-[14px] leading-[21px]",
        tone === "success" ? "text-epom-success" : "text-epom-muted",
      )}
    >
      <MaterialIcon name="circle" filled className="mr-1 block text-[10px] leading-none" />
      {label}
    </div>
  );
}

/** `mat-slide-toggle` with the On/Off caption. */
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <label className="flex cursor-pointer items-center">
      <input type="checkbox" role="switch" checked={on} onChange={onToggle} className="sr-only" />
      <span
        className={cn(
          "relative mr-2 h-5 w-9 rounded-full transition-colors",
          on ? "bg-epom-primary" : "bg-epom-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 block h-4 w-4 rounded-full bg-white transition-transform",
            on ? "translate-x-[17px]" : "translate-x-1",
          )}
        />
      </span>
      <span className="min-w-4 text-[12px] text-epom-text">{on ? "On" : "Off"}</span>
    </label>
  );
}
