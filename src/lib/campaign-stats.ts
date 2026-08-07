/**
 * Roll-ups the campaign list and settings pages both need: flight status, the
 * budget caps the campaign was set up with, and the last-week performance the
 * table columns report.
 *
 * Nothing here is a new number — it all reduces the per-day metrics from
 * `demo-data.ts`, so a cell in the list always agrees with the report behind it.
 */

import { CAMPAIGNS, type Campaign } from "./campaigns";
import { dayMetrics, sumMetrics, CELL, type DayMetrics } from "./demo-data";

/** ISO day `n` days after `iso` (negative walks back). */
const shiftDay = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/**
 * The calendar date every date-range preset is measured from. The account's own
 * traffic stops earlier than this, so "Today" and "Last 7 days" legitimately come
 * back empty — the campaigns are paused, not reporting.
 *
 * ponytail: read once when the module loads, so a statically prerendered page
 * bakes its build date. Move it behind a mount effect, or mark the page
 * `force-dynamic`, if the clone ever has to stay correct past midnight.
 */
export const TODAY = new Date().toISOString().slice(0, 10);

/** The account's reporting window: the seven days ending today. */
export const REPORT_DAYS = Array.from({ length: 7 }, (_, i) => shiftDay(TODAY, i - 6));

export const REPORT_FROM = REPORT_DAYS[0];
export const REPORT_TO = REPORT_DAYS[REPORT_DAYS.length - 1];

/** Every ISO day from `from` to `to`, inclusive. */
const span = (from: string, to: string) => {
  const out: string[] = [];
  for (let d = from; d <= to; d = shiftDay(d, 1)) out.push(d);
  return out;
};

/** The preset every date-range field in the app opens on. */
export const DEFAULT_RANGE = "Today";

/**
 * The days a date-range preset covers, measured back from `TODAY`. A custom range
 * arrives as the `from|to` ISO pair the picker's calendar applied; anything else
 * falls through to the default week.
 */
export function rangeDays(preset: string): string[] {
  if (preset.includes("|")) {
    const [from, to] = preset.split("|");
    return span(from, to);
  }

  const [year, month] = TODAY.split("-").map(Number);
  const firstOf = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}-01`;

  switch (preset) {
    case "Today":
      return [TODAY];
    case "Yesterday":
      return [shiftDay(TODAY, -1)];
    case "Last 30 days":
      return span(shiftDay(TODAY, -29), TODAY);
    case "This month":
      return span(firstOf(year, month), TODAY);
    case "Last month": {
      const start = month === 1 ? firstOf(year - 1, 12) : firstOf(year, month - 1);
      return span(start, shiftDay(firstOf(year, month), -1));
    }
    default:
      return REPORT_DAYS;
  }
}

/** dd.mm.yyyy - dd.mm.yyyy, the format every date-range field in the app prints. */
export const rangeLabel = (days: string[]) =>
  `${longDate(days[0])} - ${longDate(days[days.length - 1])}`;

/** dd/mm/yy — the format the campaigns table prints creation dates in. */
const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

/** dd.mm.yyyy — the format the flight-dates field prints. */
const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

/** Impression caps are round numbers a buyer would type, set above the busiest day. */
const ceilTo = (n: number, step: number) => Math.ceil(n / step) * step;

/**
 * Daily spend caps a buyer would actually type, in the band this account runs at.
 * Which one a campaign got is not in either source, so it is drawn from its id —
 * deterministic, so a campaign keeps the same cap across renders and rebuilds.
 */
const SPEND_CAPS = [10, 15, 20, 25, 30, 35, 40, 50, 60, 75];
const spendCap = (id: string) =>
  SPEND_CAPS[Math.abs([...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % SPEND_CAPS.length];

export interface CampaignStats {
  campaign: Campaign;
  /** Every day of the flight. */
  total: DayMetrics;
  /** The account's current reporting week — empty for a campaign that already ended. */
  lastWeek: DayMetrics;
  hasRecentTraffic: boolean;
  /** `eCPM / eCPC` column, over the last week. */
  ecpm: string;
  /** `Win rate` column, over the last week. */
  winRate: string;
  spendLimit: number;
  impressionLimit: number;
  /** Nothing is delivering — a campaign has either been paused or run out its flight. */
  state: "paused" | "stopped";
  status: string;
  created: string;
  flight: string;
}

export function campaignStats(campaign: Campaign): CampaignStats {
  const daily = campaign.days.map(([d]) => dayMetrics(d, campaign.id));
  const total = sumMetrics(daily);

  const week = REPORT_DAYS.map((d) => dayMetrics(d, campaign.id));
  const lastWeek = sumMetrics(week);
  const hasRecentTraffic = lastWeek.impressions > 0;

  const peakImpressions = Math.max(...daily.map((m) => m.impressions));

  return {
    campaign,
    total,
    lastWeek,
    hasRecentTraffic,
    // The live table prints a dash rather than a zero when the window has no traffic.
    ecpm: hasRecentTraffic ? `${CELL.eCPM(lastWeek)} / $${CELL.eCPC(lastWeek)}` : "-",
    winRate: hasRecentTraffic ? CELL["Win Rate"](lastWeek) : "-",
    spendLimit: spendCap(campaign.id),
    impressionLimit: ceilTo(peakImpressions, 5_000),
    state: campaign.paused ? "paused" : "stopped",
    status: campaign.paused
      ? `Paused (${shortDate(campaign.to)})`
      : `Stopped (ended ${shortDate(campaign.to)})`,
    created: shortDate(campaign.from),
    flight: `${longDate(campaign.from)} 00:00 – ${longDate(campaign.to)} 23:59`,
  };
}

/** Every campaign's stats, keyed by id — the pages only ever need this lookup. */
export const STATS = new Map(CAMPAIGNS.map((c) => [c.id, campaignStats(c)]));

export type CreativeStatus = "pending_approval" | "active" | "paused";

/** Round status dot next to a creative, shared by the list and settings tables. */
export const CREATIVE_DOT: Record<CreativeStatus, string> = {
  pending_approval: "bg-[#987100]",
  active: "bg-[#006d3e]",
  paused: "bg-epom-muted",
};
