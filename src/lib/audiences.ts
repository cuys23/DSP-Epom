/**
 * Audiences the account targets with.
 *
 * An audience is a reusable targeting set; a campaign points at one. The roster
 * is therefore derived from the campaign roster rather than invented separately —
 * one audience per product line — so "Linked Campaigns" on `/audience` and the
 * Audience filter on `/traffic-funnel` can never drift from `campaigns.ts`.
 */

import { CAMPAIGNS } from "./campaigns";

/** The targeting an audience was set up with, as the edit page renders it. */
export interface AudienceTargeting {
  /** Ticked under Targeting → Device. */
  deviceTypes: string[];
  /** Ticked under Targeting → Connection. */
  connectionTypes: string[];
  /** Picked under Advanced settings → Stores. */
  storeCategories: string[];
}

export interface Audience extends AudienceTargeting {
  id: string;
  name: string;
  /** Campaign ids that target this audience — empty for an unused audience. */
  campaignIds: string[];
  /** dd.mm.yyyy */
  created: string;
  edited: string;
  status: "Active" | "Archived";
}

/** dd.mm.yyyy, `days` before an ISO date — audiences are built before the flight. */
function before(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10).split("-").reverse().join(".");
}

/** Deterministic uuid-shaped id, so audience links stay stable across builds. */
function id(seed: string): string {
  let h = 0x9e3779b9;
  const hex = (n: number) => {
    let out = "";
    for (let i = 0; i < n; i++) {
      h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
      h ^= h >>> 13;
      out += ((h >>> 0) % 16).toString(16);
    }
    return out;
  };
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

const PRODUCTS = [...new Set(CAMPAIGNS.map((c) => c.product))];

/** What a product line targets unless it says otherwise. */
const DEFAULT_TARGETING: AudienceTargeting = {
  // The weight-loss offers are in-app iOS buys and never leave the handset.
  deviceTypes: ["Mobile", "Tablet"],
  connectionTypes: [],
  storeCategories: ["Health & Fitness"],
};

/** Product lines whose targeting differs from the default. */
const TARGETING: Record<string, Partial<AudienceTargeting>> = {
  britbox: {
    // A TV streaming service also buys the living-room screen, takes traffic on
    // any connection, and sits in the store's Entertainment shelf.
    deviceTypes: [...DEFAULT_TARGETING.deviceTypes, "Connected TV"],
    connectionTypes: ["Any"],
    storeCategories: ["Entertainment"],
  },
};

export const AUDIENCES: Audience[] = PRODUCTS.map((product) => {
  const used = CAMPAIGNS.filter((c) => c.product === product);
  const first = used.reduce((a, b) => (a.from < b.from ? a : b));
  const last = used.reduce((a, b) => (a.from > b.from ? a : b));
  return {
    id: id(`audience:${product}`),
    name: first.productLabel,
    campaignIds: used.map((c) => c.id),
    ...DEFAULT_TARGETING,
    ...TARGETING[product],
    created: before(first.from, 2),
    edited: before(last.from, 1),
    // The account is dormant — every campaign has ended, so nothing is live.
    status: "Archived" as const,
  };
});

const BY_ID = new Map(CAMPAIGNS.map((c) => [c.id, c]));

/** "Linked Campaigns" cell — the live table prints "-" when nothing links. */
export function linkedCampaignNames(a: Audience): string {
  const names = a.campaignIds.map((cid) => BY_ID.get(cid)?.name).filter(Boolean);
  return names.length ? names.join(", ") : "-";
}

/** Summary-rail links on `/audience/edit`, in the order the roster lists them. */
export function linkedCampaigns(id: string): { id: string; name: string }[] {
  const audience = AUDIENCES.find((a) => a.id === id);
  if (!audience) return [];
  return audience.campaignIds
    .map((cid) => BY_ID.get(cid))
    .filter((c) => c !== undefined)
    .map((c) => ({ id: c.id, name: c.name }));
}

/** The audience a campaign targets. Every campaign has one. */
export function audienceOfCampaign(campaignId: string): Audience | undefined {
  return AUDIENCES.find((a) => a.campaignIds.includes(campaignId));
}
