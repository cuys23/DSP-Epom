/**
 * Per-day analytics for the account's campaigns.
 *
 * The counters in `campaigns.ts` are real: `clicks` (the affiliate sheet's `Total
 * Lead`), `actions` (its `Event` column), and — on campaigns that came from the
 * DSP's own export — `impressions`. Everything else is derived here: the rest of
 * the funnel above the click, the money, and the video quartiles, deterministically
 * per campaign and date, so the same day always yields the same numbers and totals
 * stay consistent with the rows that produced them.
 *
 * Only counters are stored. Every rate, cost and ratio is recomputed from them,
 * which is what makes the Total row correct rather than a sum of percentages.
 */

import { CAMPAIGNS, type Campaign } from "./campaigns";

export interface DayMetrics {
  bidRequests: number;
  bidResponses: number;
  wins: number;
  impressions: number;
  clicks: number;
  actions: number;
  spend: number;
  revenue: number;
  segmentsMarkup: number;
  pixalate: number;
  skip: number;
  q1: number;
  mid: number;
  q3: number;
  complete: number;
}

/** mulberry32 — small deterministic PRNG so a campaign/date always yields the same day. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

const ZERO: DayMetrics = {
  bidRequests: 0,
  bidResponses: 0,
  wins: 0,
  impressions: 0,
  clicks: 0,
  actions: 0,
  spend: 0,
  revenue: 0,
  segmentsMarkup: 0,
  pixalate: 0,
  skip: 0,
  q1: 0,
  mid: 0,
  q3: 0,
  complete: 0,
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Rebuilds a day's funnel from its real counters.
 *
 * The click is the anchor: impressions come from dividing it by a plausible CTR,
 * then the RTB funnel is walked back up through wins and bid responses. Doing it
 * in this direction keeps every stage strictly larger than the one below it, so
 * the funnel can never invert no matter what the sheet contains.
 *
 * A day that reported its own impressions uses that number instead. The derived
 * one is still drawn so the rest of the day's draws land the same either way, and
 * a campaign's numbers do not shift when a measured column arrives.
 */
function derive(
  campaign: Campaign,
  date: string,
  clicks: number,
  actions: number,
  measured?: number,
): DayMetrics {
  const r = rng(hash(`${campaign.id}:${date}`));
  const between = (lo: number, hi: number) => lo + r() * (hi - lo);

  const derived = Math.round(clicks / between(0.0022, 0.0045));
  const impressions = measured ?? derived;
  const wins = Math.round(impressions / between(0.9, 0.98));
  const bidResponses = Math.round(wins / between(0.07, 0.14));
  const bidRequests = Math.round(bidResponses / between(0.58, 0.76));

  // Impressions clear around the campaign's baseline eCPM, moving with the day's
  // competition. The campaign's `defaultPrice` is only the ceiling it bids up to.
  const spend = round2((impressions / 1000) * campaign.ecpm * between(0.85, 1.25));
  const revenue = round2(actions * campaign.payout);

  return {
    bidRequests,
    bidResponses,
    wins,
    impressions,
    clicks,
    actions,
    spend,
    revenue,
    segmentsMarkup: round2(spend * between(0.01, 0.03)),
    // Pixalate post-bid verification is not enabled on this account.
    pixalate: 0,
    skip: Math.round(impressions * between(0.05, 0.12)),
    q1: Math.round(impressions * between(0.72, 0.85)),
    mid: Math.round(impressions * between(0.55, 0.71)),
    q3: Math.round(impressions * between(0.4, 0.54)),
    complete: Math.round(impressions * between(0.25, 0.39)),
  };
}

const BY_ID = new Map(CAMPAIGNS.map((c) => [c.id, c]));

/** date → the day's real counters, per campaign. Built once; the source is static. */
const DAYS = new Map(
  CAMPAIGNS.map((c) => [
    c.id,
    new Map(c.days.map(([d, clicks, actions, impressions]) => [d, [clicks, actions, impressions]])),
  ]),
);

export function sumMetrics(days: DayMetrics[]): DayMetrics {
  const out = { ...ZERO };
  for (const k of Object.keys(ZERO) as (keyof DayMetrics)[]) {
    out[k] = round2(days.reduce((a, d) => a + d[k], 0));
  }
  return out;
}

/**
 * Metrics for one date. With a campaign id, that campaign alone — all zeros on a
 * day outside its flight. Without one, the account total across every campaign.
 */
export function dayMetrics(date: string, campaignId?: string): DayMetrics {
  if (campaignId === undefined) {
    return sumMetrics(CAMPAIGNS.map((c) => dayMetrics(date, c.id)));
  }
  const campaign = BY_ID.get(campaignId);
  const day = DAYS.get(campaignId)?.get(date);
  if (!campaign || !day) return { ...ZERO };
  return derive(campaign, date, day[0]!, day[1]!, day[2]);
}

const int = (n: number) => n.toLocaleString("en-US");
const money = (n: number) => `$${n.toFixed(2)}`;
const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(2)}%` : "0.00%");
const ratio = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(2) : "0");
const div = (n: number, d: number, f: (v: number) => string) => (d ? f(n / d) : "-");

/**
 * Column label → cell text. Ratios are always recomputed from the counters, so
 * the Total row is correct rather than a sum of percentages.
 */
export const CELL: Record<string, (m: DayMetrics) => string> = {
  "Bid Requests": (m) => int(m.bidRequests),
  "Bid Responses": (m) => int(m.bidResponses),
  // The report has no per-bid price to average when the rows are days rather than
  // one campaign, so the live column prints this literal on every row.
  "Bid Price": () => "n/a",
  "Bid Rate": (m) => pct(m.bidResponses, m.bidRequests),
  Wins: (m) => int(m.wins),
  "Win Rate": (m) => pct(m.wins, m.bidResponses),
  Impressions: (m) => int(m.impressions),
  // A day with no impressions still prints a zero cost, not the "-" the cost-per-
  // action columns use — that is how the live report separates "nothing was spent"
  // from "the denominator makes this undefined".
  eCPM: (m) => money(m.impressions ? (m.spend * 1000) / m.impressions : 0),
  "Imp-to-Bid": (m) => ratio(m.impressions, m.bidRequests),
  Clicks: (m) => int(m.clicks),
  CTR: (m) => pct(m.clicks, m.impressions),
  CCR: (m) => pct(m.actions, m.clicks),
  "Click-to-Bid": (m) => ratio(m.clicks, m.bidRequests),
  eCPC: (m) => (m.clicks ? m.spend / m.clicks : 0).toFixed(2),
  Spend: (m) => money(m.spend),
  "Segments Markup": (m) => money(m.segmentsMarkup),
  "Pixalate Postbid Markup": (m) => int(m.pixalate),
  "Action 0": (m) => int(m.actions),
  /** What the chart's `Metric:` dropdown calls the `Action 0` column. */
  Conversions: (m) => int(m.actions),
  "CPA Action 0": (m) => div(m.spend, m.actions, money),
  "ICR Action 0": (m) => pct(m.actions, m.impressions),
  ROAS: (m) => div(m.revenue, m.spend, (v) => v.toFixed(2)),
  ROI: (m) => (m.spend ? `${(((m.revenue - m.spend) / m.spend) * 100).toFixed(2)}%` : "-"),
  Skip: (m) => int(m.skip),
  "First Quartile": (m) => int(m.q1),
  Midpoint: (m) => int(m.mid),
  "Third Quartile": (m) => int(m.q3),
  "Video 100%": (m) => int(m.complete),
};

/** Numeric series behind a metric, for the chart. */
export const SERIES: Record<string, (m: DayMetrics) => number> = {
  "Bid Requests": (m) => m.bidRequests,
  "Bid Responses": (m) => m.bidResponses,
  // Never charted — the live dropdown does not offer it — but every column carries
  // a series so the two maps stay the same shape.
  "Bid Price": () => 0,
  "Bid Rate": (m) => (m.bidRequests ? (m.bidResponses / m.bidRequests) * 100 : 0),
  Wins: (m) => m.wins,
  "Win Rate": (m) => (m.bidResponses ? (m.wins / m.bidResponses) * 100 : 0),
  Impressions: (m) => m.impressions,
  eCPM: (m) => (m.impressions ? (m.spend * 1000) / m.impressions : 0),
  "Imp-to-Bid": (m) => (m.bidRequests ? (m.impressions / m.bidRequests) * 100 : 0),
  Clicks: (m) => m.clicks,
  CTR: (m) => (m.impressions ? (m.clicks / m.impressions) * 100 : 0),
  CCR: (m) => (m.clicks ? (m.actions / m.clicks) * 100 : 0),
  "Click-to-Bid": (m) => (m.bidRequests ? (m.clicks / m.bidRequests) * 100 : 0),
  eCPC: (m) => (m.clicks ? m.spend / m.clicks : 0),
  Spend: (m) => m.spend,
  "Segments Markup": (m) => m.segmentsMarkup,
  "Pixalate Postbid Markup": (m) => m.pixalate,
  "Action 0": (m) => m.actions,
  Conversions: (m) => m.actions,
  "CPA Action 0": (m) => (m.actions ? m.spend / m.actions : 0),
  "ICR Action 0": (m) => (m.impressions ? (m.actions / m.impressions) * 100 : 0),
  ROAS: (m) => (m.spend ? m.revenue / m.spend : 0),
  ROI: (m) => (m.spend ? ((m.revenue - m.spend) / m.spend) * 100 : 0),
  Skip: (m) => m.skip,
  "First Quartile": (m) => m.q1,
  Midpoint: (m) => m.mid,
  "Third Quartile": (m) => m.q3,
  "Video 100%": (m) => m.complete,
};

/**
 * The six metrics the live `Metric:` dropdown offers above a chart, in its order.
 * It is a fixed shortlist, not the report's column set — the table carries far
 * more columns than the chart will plot.
 */
export const CHART_METRICS = ["Impressions", "Clicks", "Conversions", "Spend", "eCPM", "eCPC"];
