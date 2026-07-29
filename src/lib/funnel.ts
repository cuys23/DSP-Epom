/**
 * Traffic Funnel — where a campaign's inbound bid requests are lost.
 *
 * Nothing here is a new number. The top of the funnel is the campaign's own
 * `bidRequests` and the bottom is its `impressions`, both from `demo-data.ts`,
 * so the funnel always agrees with what Analytics reports for the same campaign.
 * Only the *split* of the drop-off across targeting stages is invented, and it is
 * seeded per campaign so a campaign always funnels the same way.
 *
 * Stage names follow the live report (help.dsp.epom.com/docs/traffic-funnel) and
 * the audience targeting fields on `/audience/edit`: geo, device, retargeting
 * lists, SSP endpoints and content categories. The retargeting stage is the one
 * the selected audience owns — that is the whole link between the two pages.
 */

import { CAMPAIGNS } from "./campaigns";
import { dayMetrics, sumMetrics, type DayMetrics } from "./demo-data";

export interface FunnelStage {
  label: string;
  /** Requests that reached this stage. */
  entered: number;
  /** How many of them it dropped. */
  rejected: number;
  /** Which side of the auction the stage sits on. */
  phase: "targeting" | "auction";
}

/**
 * Pre-auction targeting checks, in the order the bidder applies them, with the
 * share of the total drop-off each one is responsible for. Geo runs first and
 * discards the most, which is why the live report leads with it.
 */
const TARGETING_STAGES: [label: string, weight: number][] = [
  ["Geo location allowlist", 0.46],
  ["Device type and OS targeting", 0.22],
  ["Device IFA retargeting settings", 0.14],
  ["SSP endpoint allowlist", 0.11],
  ["Content category allowlist", 0.07],
];

const BY_ID = new Map(CAMPAIGNS.map((c) => [c.id, c]));

/** Every metric the campaign booked over its whole flight. */
export function campaignTotals(campaignId: string): DayMetrics {
  const campaign = BY_ID.get(campaignId);
  if (!campaign) return sumMetrics([]);
  return sumMetrics(campaign.days.map(([d]) => dayMetrics(d, campaignId)));
}

/**
 * The funnel for one campaign. Stages are exact: each rejection count is the
 * difference between two real counters, and the targeting stages sum to
 * `bidRequests - bidResponses` with the last one absorbing the rounding.
 */
export function campaignFunnel(campaignId: string): FunnelStage[] {
  const t = campaignTotals(campaignId);
  if (!t.bidRequests) return [];

  const stages: FunnelStage[] = [];
  const dropped = t.bidRequests - t.bidResponses;
  let entered = t.bidRequests;
  let assigned = 0;

  TARGETING_STAGES.forEach(([label, weight], i) => {
    const last = i === TARGETING_STAGES.length - 1;
    const rejected = last ? dropped - assigned : Math.round(dropped * weight);
    assigned += rejected;
    stages.push({ label, entered, rejected, phase: "targeting" });
    entered -= rejected;
  });

  // `entered` is now exactly bidResponses — the requests the bidder answered.
  stages.push({
    label: "Auction lost",
    entered,
    rejected: t.bidResponses - t.wins,
    phase: "auction",
  });
  stages.push({
    label: "Impression not registered",
    entered: t.wins,
    rejected: t.wins - t.impressions,
    phase: "auction",
  });

  return stages;
}

/** Requests still standing after every stage — the campaign's impressions. */
export const survivors = (stages: FunnelStage[]) =>
  stages.length ? stages[stages.length - 1].entered - stages[stages.length - 1].rejected : 0;
