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
import { CELL, CHART_METRICS, SERIES, dayMetrics } from "@/lib/demo-data";
import { CAMPAIGNS } from "@/lib/campaigns";
import { VALUE_ICONS, audienceOfCampaign } from "@/lib/audiences";
import { SSP_ENDPOINTS } from "@/lib/campaign-data";
import type { SspEndpoint } from "@/types/campaign";
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

/**
 * The SSP endpoint a campaign buys through, with the volume/format/pricing labels
 * the live card prints beside it.
 *
 * ponytail: which endpoint a campaign runs on is the one field of this card the
 * affiliate sheet does not carry — it reports the publisher site, not the DSP
 * endpoint — so it is drawn from the scraped roster, fixed per campaign by its
 * network offer id. Swap in the real mapping if the account ever exports one.
 */
function endpointOf(key: string): SspEndpoint {
  let h = 7;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) | 0;
  return SSP_ENDPOINTS[Math.abs(h) % SSP_ENDPOINTS.length];
}

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
  audience: {
    name: string;
    id: string;
    /** Sub-heading → the rows under it, each an "Included" list. */
    targeting: { heading: string; rows: { label: string; values: string[]; included?: boolean }[] }[];
  };
  budget: {
    status: string;
    tone: "success" | "cancelled";
    flight: Info[];
    limits: (Info & { suffix?: string })[];
    evenPacing: string;
    impToBidAuto: string;
  };
  trafficSource: SspEndpoint;
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
          // The live card prints the bare number here; the "0.025$" spelling is the
          // campaigns list's, not this one's.
          { label: "Default Price:", value: String(c.defaultPrice) },
        ],
        // The real audience from the roster, so the link lands on the page it names.
        audience: {
          name: a.name,
          id: a.id,
          // The live card prints the audience's own dimensions rather than its
          // name, and drops a row the audience left empty.
          targeting: [
            {
              heading: "Device",
              rows: [
                { label: "Operation System:", values: a.os, included: true },
                { label: "Browser:", values: a.browsers, included: true },
              ].filter((r) => r.values.length),
            },
            {
              heading: "Stores",
              // The live card leaves the store row without the Included dot the
              // device rows carry.
              rows: [{ label: "Stores:", values: a.stores }],
            },
          ].filter((g) => g.rows.length),
        },
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
        trafficSource: endpointOf(c.offer.networkId),
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

export function CampaignSettingsView() {
  const id = String(useParams().id ?? "");
  // Unknown ids fall back to the newest campaign rather than 404ing.
  const CAMPAIGN = VIEWS.get(id) ?? [...VIEWS.values()][0];

  // Nothing on this account is in flight any more.
  const [on, setOn] = useState(false);
  /** Creative ids the user has switched off / archived on this page. */
  const [creativesOff, setCreativesOff] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-normal leading-[18px] text-epom-muted">Status:</span>
            <Toggle on={on} onToggle={() => setOn((v) => !v)} />
          </div>
        </div>

        {/* Two columns above 1400px, stacked below — matches the live breakpoint. */}
        <div className="mt-4 flex flex-col justify-between gap-4 min-[1400px]:flex-row">
          <div className="flex flex-1 flex-col">
            <Box>
              <BoxHeading step="basic" campaignId={CAMPAIGN.id}>General</BoxHeading>
              <h4 className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">
                Basic Info
              </h4>
              {CAMPAIGN.basic.map((o) => (
                <Info key={o.label} {...o} />
              ))}
              <h4 className="mb-4 mt-8 text-[14px] font-bold leading-[21px] text-epom-text">
                Ad Format
              </h4>
              <div className="flex items-center text-[14px] leading-[21px] text-epom-text">
                <MaterialIcon
                  name={CAMPAIGN.typeIcon}
                  className="mr-2 block text-[16px] leading-4"
                />
                {CAMPAIGN.type}
              </div>
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="audience" campaignId={CAMPAIGN.id}>Audience</BoxHeading>
              {CAMPAIGN.audience.targeting.map((group) => (
                <div key={group.heading} className="mt-6">
                  <h4 className="text-[12px] font-semibold leading-[18px] text-epom-text">
                    {group.heading}
                  </h4>
                  {group.rows.map((row) => (
                    <div key={row.label} className="mt-2">
                      <div className="text-[12px] leading-[18px] text-epom-muted">{row.label}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {row.included && <StatusDot label="Included" tone="success" />}
                        {row.values.map((v, i) => (
                          <span
                            key={v}
                            className="flex items-center gap-1 text-[12px] leading-[18px] text-epom-text"
                          >
                            {VALUE_ICONS[v] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={VALUE_ICONS[v]} alt="" className="h-4 w-4 object-contain" />
                            )}
                            {v}
                            {i < row.values.length - 1 && ";"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <a href={`/traffic-funnel?campaign_id=${CAMPAIGN.id}`} className="mt-6 inline-block">
                <button type="button" className={cn(BTN_OUTLINED, "flex items-center gap-2")}>
                  Open Traffic Funnel
                  <MaterialIcon name="open_in_new" className="block text-[16px] leading-4" />
                </button>
              </a>
            </Box>

            <Box className="mt-4">
              <BoxHeading spaced={false} step="pricingOptimization" campaignId={CAMPAIGN.id}>
                Price &amp; Optimization
              </BoxHeading>
              <h4 className="mb-4 mt-4 text-[14px] font-bold leading-[21px] text-epom-text">
                Pricing
              </h4>
              {CAMPAIGN.bidPrice.map((o) => (
                <Info key={o.label} {...o} />
              ))}
              <h4 className="mb-3 mt-8 text-[14px] font-bold leading-[21px] text-epom-text">
                Risk tolerance level
              </h4>
              <Info label="Risk tolerance level:" value={CAMPAIGN.riskTolerance} />
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
              <BoxHeading spaced={false} step="trafficSources" campaignId={CAMPAIGN.id}>Traffic source</BoxHeading>
              <div className="mt-2">
                <StatusDot label="Included" tone="success" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[14px] leading-[21px] text-epom-text">
                    {CAMPAIGN.trafficSource.name}
                  </span>
                  {CAMPAIGN.trafficSource.labels.map((l) => (
                    <span
                      key={l.text}
                      className="rounded-full px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-white"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.text}
                    </span>
                  ))}
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
