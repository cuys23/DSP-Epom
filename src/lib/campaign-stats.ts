/**
 * Roll-ups the campaign list and settings pages both need: flight status, the
 * budget caps the campaign was set up with, and the last-week performance the
 * table columns report.
 *
 * Nothing here is a new number — it all reduces the per-day metrics from
 * `demo-data.ts`, so a cell in the list always agrees with the report behind it.
 */

import { CAMPAIGNS, LATEST_DAY, type Campaign } from "./campaigns";
import { dayMetrics, sumMetrics, CELL, type DayMetrics } from "./demo-data";

/** The account's reporting window: the last seven days that have any traffic. */
export const REPORT_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(`${LATEST_DAY}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (6 - i));
  return d.toISOString().slice(0, 10);
});

export const REPORT_FROM = REPORT_DAYS[0];
export const REPORT_TO = REPORT_DAYS[REPORT_DAYS.length - 1];

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

/** Caps are round numbers a buyer would type, set above the campaign's busiest day. */
const ceilTo = (n: number, step: number) => Math.ceil(n / step) * step;

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
  state: "delivering" | "stopped";
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

  const peakSpend = Math.max(...daily.map((m) => m.spend));
  const peakImpressions = Math.max(...daily.map((m) => m.impressions));

  const delivering = campaign.to >= LATEST_DAY;

  return {
    campaign,
    total,
    lastWeek,
    hasRecentTraffic,
    // The live table prints a dash rather than a zero when the window has no traffic.
    ecpm: hasRecentTraffic ? `${CELL.eCPM(lastWeek)} / $${CELL.eCPC(lastWeek)}` : "-",
    winRate: hasRecentTraffic ? CELL["Win Rate"](lastWeek) : "-",
    spendLimit: ceilTo(peakSpend, 50),
    impressionLimit: ceilTo(peakImpressions, 5_000),
    state: delivering ? "delivering" : "stopped",
    status: delivering ? "Delivering" : `Stopped (ended ${shortDate(campaign.to)})`,
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
