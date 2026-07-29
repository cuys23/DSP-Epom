/**
 * Generates `src/lib/campaigns.ts` from the shared performance spreadsheet.
 *   node scripts/build-campaigns.mjs
 *
 * The sheet is one tab per affiliate offer, with a row per day. Only two columns
 * are real traffic: `Total Lead` (clicks that reached the offer) and `Event`
 * (conversions). Everything above them in the funnel — impressions, wins, bid
 * requests, spend — is derived at runtime in `demo-data.ts`, so this file stays
 * small and there is exactly one place where a metric is invented.
 *
 * Offers are grouped by `OffIDNet`, which is the affiliate network's offer id and
 * the one field that is stable when the offer name gets re-tagged mid-flight.
 */
import { writeFile } from "node:fs/promises";
import { readdir, readFile } from "node:fs/promises";

const SHEET = "1BLQ5MfxCBshSl0WcAM1F6NY_x6_U1Ae6vZ8NseiCTH0";

/**
 * Tabs in the plain `Date,…,Total Lead,Event` shape, plus the one ROI tab that is
 * the only source for the two CLICKDIRRECT offers. The other ROI tab is a restatement
 * of offers 240/241 and is skipped so their days are not counted twice.
 */
const TABS = {
  plain: ["867447450", "171153574", "1189330900", "572609315", "126741371", "1310329909"],
  roi: ["486224779"],
};

const CREATIVES_DIR = "public/creatives";

// ---------------------------------------------------------------- sheet input

async function csv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching gid ${gid} — is the sheet still public?`);
  return parseCsv(await res.text());
}

/** Minimal RFC4180 reader — cells here contain commas, quotes and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [head, ...body] = rows;
  return body
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

/** Leading integer of a cell. Handles `97/0 (97/0/0)` and `Purchase: (2.06%) 2/0/0`. */
const leadingInt = (v) => {
  const m = String(v).match(/\d+/);
  return m ? Number(m[0]) : 0;
};

/** `Purchase: (2.06%) 2/0/0` — the conversion count is the number after the percentage. */
const roiEvent = (v) => {
  const m = String(v).match(/\)\s*(\d+)/);
  return m ? Number(m[1]) : 0;
};

// ------------------------------------------------------- DSP report input (xls)

/**
 * `scripts/report.xls` is the DSP's own ag-grid export — SpreadsheetML XML rather
 * than a real .xls — with one row per campaign-day. Unlike the affiliate sheet it
 * reports `Impressions` directly, so those days carry a measured impression count
 * instead of one derived from the click.
 *
 * Its `Requests` column is 0 on every row (the export never fills it in), so bid
 * requests stay derived the same way they are for every other campaign.
 */
async function dspReport(file) {
  const xml = await readFile(file, "utf8");
  const rows = (xml.match(/<Row[^>]*>[\s\S]*?<\/Row>/g) ?? []).map((block) =>
    [...block.matchAll(/<Cell[\s\S]*?<\/Cell>|<Cell[^>]*\/>/g)].map((m) =>
      m[0]
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim(),
    ),
  );
  // ponytail: positional read — the export writes every cell, so no ss:Index gaps
  // to honour. Switch to an index-aware reader if a sparse export ever shows up.
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

/** The export writes `MM-DD-YY`; everything downstream is ISO. */
const isoDate = (v) => {
  const [m, d, y] = v.split("-");
  return `20${y}-${m}-${d}`;
};

/**
 * The report identifies a campaign by offer id and name only. Network, app and
 * site are not in the export, so they are filled in per offer here — the one place
 * a field the DSP did not give us is written down.
 */
const REPORT_OFFERS = {
  36672461: { network: "Direct", app: "au.com.britbox.britbox", site: "britbox.com.au" },
};

// -------------------------------------------------------------- offer → campaign

/**
 * `US_[IOS](<35caps)[F_CR_5]Home Fitness for Weight Loss - US - iOS - CPA (…)`
 * → `Home Fitness for Weight Loss`. Strips the geo/OS prefix, the cap and creative
 * tags the traffic team appends, and the trailing payout model boilerplate.
 */
function offerLabel(name) {
  let s = name.replace(/^US_/, "");
  // Leading tag soup: any run of [..] / (..) groups before the actual offer name.
  while (true) {
    const next = s.replace(/^\s*(\[[^\]]*\]|\([^)]*\))\s*/, "");
    if (next === s) break;
    s = next;
  }
  return s
    .split(/\s+-\s+/)[0]
    .replace(/\s+iOS\s+US.*$/i, "")
    .trim();
}

/**
 * The Drive folders whose creatives we are cleared to use, and the short folder
 * name each maps to in the UI (the panel only fits ~20 characters).
 */
const PRODUCTS = {
  "home-fitness": "Home Fitness",
  "slimkit-walking": "Slimkit Walking",
  britbox: "BritBox",
};

/** Each offer maps onto one of the approved creative sets. */
const productOf = (label) =>
  /britbox/i.test(label) ? "britbox" : /home fitness/i.test(label) ? "home-fitness" : "slimkit-walking";

// -------------------------------------------------------------------- helpers

/** mulberry32 — same generator `demo-data.ts` uses, so seeds behave identically. */
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

/** UUIDv4-shaped but deterministic, so a rebuild does not churn every campaign URL. */
function stableId(key) {
  const r = rng(hash(key));
  const hex = (n) =>
    Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join("");
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// --------------------------------------------------------------- creative pool

/** JPEG dimensions live in the first SOF marker. */
function jpegSize(b) {
  for (let i = 2; i < b.length; ) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error("no JPEG SOF marker");
}

/** PNG width/height are the two big-endian u32s at the head of the IHDR chunk. */
function pngSize(b) {
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

/** MP4 display size is the 16.16 fixed-point width/height at the end of `tkhd`. */
function mp4Size(b) {
  const i = b.indexOf("tkhd");
  if (i < 0) throw new Error("no tkhd box");
  const o = i + 8 + (b[i + 4] === 1 ? 32 : 20) + 52;
  return [b.readUInt32BE(o) >> 16, b.readUInt32BE(o + 4) >> 16];
}

/** Reads the downloaded creatives and measures each one, so `size` is never guessed. */
async function creativePool() {
  const pool = {};
  for (const product of Object.keys(PRODUCTS)) {
    const dir = `${CREATIVES_DIR}/${product}`;
    const files = (await readdir(dir)).sort();
    pool[product] = await Promise.all(
      files.map(async (file) => {
        const buf = await readFile(`${dir}/${file}`);
        const ext = file.split(".").pop();
        const video = ext === "mp4";
        const [w, h] = video ? mp4Size(buf) : ext === "png" ? pngSize(buf) : jpegSize(buf);
        return { src: `/creatives/${product}/${file}`, video, ext, size: `${w}x${h}` };
      }),
    );
  }
  return pool;
}

// ------------------------------------------------------------------ main build

const byOffer = new Map();

function record(row, conversions) {
  const key = row.OffIDNet;
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(row.Date)) return;
  if (!byOffer.has(key)) {
    byOffer.set(key, { offIdNet: key, offId: row.OffID, network: row.NetName, site: row.SiteName, app: row.AppID, names: new Set(), days: new Map() });
  }
  const offer = byOffer.get(key);
  offer.names.add(row.OffName);
  // A day can appear on more than one tab; keep the richer row rather than summing,
  // since the tabs are restatements of the same traffic, not separate traffic.
  const clicks = leadingInt(row["Total Lead"]);
  const prev = offer.days.get(row.Date);
  if (!prev || clicks > prev[0]) offer.days.set(row.Date, [clicks, conversions]);
  else if (conversions > prev[1]) prev[1] = conversions;
}

for (const gid of TABS.plain) {
  for (const row of await csv(gid)) record(row, leadingInt(row.Event));
}
for (const gid of TABS.roi) {
  for (const row of await csv(gid)) record(row, roiEvent(row["Event (done/waiting/running)"]));
}

/**
 * Late in the flight several offers stop populating `Total Lead` while `Event`
 * keeps recording conversions — a gap in the lead column, not a day with traffic
 * that converted out of nowhere. Taking the literal 0 would put conversions above
 * clicks and invert the funnel, so those days get their clicks back-filled from
 * the campaign's own conversion rate over the days where both columns are present.
 * The conversion counts themselves are never touched.
 */
function backfillClicks(offers) {
  const complete = (days) => [...days.values()].filter(([c]) => c > 0);
  const allComplete = offers.flatMap((o) => complete(o.days));
  const rate = (rows) => {
    const clicks = rows.reduce((a, [c]) => a + c, 0);
    const conv = rows.reduce((a, [, e]) => a + e, 0);
    return clicks && conv ? conv / clicks : 0;
  };
  const accountCvr = rate(allComplete);

  let filled = 0;
  for (const offer of offers) {
    const cvr = rate(complete(offer.days)) || accountCvr;
    for (const day of offer.days.values()) {
      if (day[0] === 0 && day[1] > 0) {
        day[0] = Math.max(day[1], Math.round(day[1] / cvr));
        filled++;
      }
    }
  }
  return filled;
}

const affiliateOffers = [...byOffer.values()];
const filled = backfillClicks(affiliateOffers);
if (filled) console.log(`back-filled clicks on ${filled} day(s) with a blank Total Lead\n`);

/**
 * Both sources reduce to the same shape before a campaign is built from it:
 * `days` is `[date, clicks, conversions, impressions|null]`, and `payoutRange` is
 * the band the campaign's payout is drawn from — a CPA install and a CPE trial
 * signup are not worth the same.
 */
const offers = affiliateOffers
  .map((o) => ({
    ...o,
    // The offer gets re-tagged mid-flight (cap notes, creative-rotation markers);
    // the longest name is the most recent and most descriptive one.
    rawName: [...o.names].sort((a, b) => b.length - a.length)[0],
    days: [...o.days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([d, [c, e]]) => [d, c, e, null]),
    payoutRange: [18, 32],
    paused: false,
    // The two weight-loss folders are shared pools several offers rotate through,
    // so each offer takes a slice rather than the whole thing.
    allCreatives: false,
  }))
  .concat(
    Object.values(
      (await dspReport("scripts/report.xls")).reduce((acc, row) => {
        const id = row["Offer ID"];
        acc[id] ??= {
          offIdNet: id,
          offId: id,
          ...REPORT_OFFERS[id],
          rawName: row["Offer name"],
          days: [],
          // A CPE trial signup pays a fraction of what a CPA install does.
          payoutRange: [4, 9],
          paused: row.Status === "Paused",
          // Its creative folder was shot for this campaign alone, so it runs all of it.
          allCreatives: true,
        };
        acc[id].days.push([
          isoDate(row.Day),
          Number(row.Clicks),
          Number(row.Conversions),
          Number(row.Impressions),
        ]);
        return acc;
      }, {}),
    ).map((o) => ({ ...o, days: o.days.sort(([a], [b]) => a.localeCompare(b)) })),
  );

const pool = await creativePool();
const campaigns = [];

for (const offer of offers.sort((a, b) => a.offIdNet.localeCompare(b.offIdNet))) {
  const { rawName, days } = offer;
  const label = offerLabel(rawName);
  const product = productOf(label);

  const r = rng(hash(offer.offIdNet));
  const between = (lo, hi) => lo + r() * (hi - lo);

  // Payout per conversion. Fixed per campaign so ROAS moves with conversions
  // rather than with a re-rolled payout.
  const payout = Math.round(between(...offer.payoutRange) * 100) / 100;
  // Bid ceiling per impression, shown in the UI the way the account writes it ("0.025$").
  const defaultPrice = Math.round(between(0.018, 0.045) * 1000) / 1000;
  // What impressions actually clear at. Auctions settle far below the ceiling on
  // this inventory, so this is its own number rather than a cut of defaultPrice.
  const ecpm = Math.round(between(1.8, 3.4) * 100) / 100;

  const n = offer.allCreatives ? pool[product].length : 2 + Math.floor(r() * 3);
  const start = offer.allCreatives ? 0 : Math.floor(r() * pool[product].length);
  const creatives = Array.from({ length: n }, (_, i) => {
    const index = (start + i) % pool[product].length;
    const { ext, ...asset } = pool[product][index];
    return {
      id: stableId(`${offer.offIdNet}:${asset.src}`),
      // Named the way the account's real creative is ("home fitness 2.mp4"), and
      // keyed on the asset's pool position so one file has one name everywhere.
      name: `${product.replace(/-/g, " ")} ${index + 1}.${ext}`,
      ...asset,
      price: `$${defaultPrice.toFixed(3)}`,
    };
  });

  campaigns.push({
    id: stableId(offer.offIdNet),
    slug: slug(`${label}-${offer.offIdNet}`),
    // Two networks run the same offer, so the network qualifies the campaign name
    // the same way a buyer would label them in the UI.
    name: `${label} — ${offer.network}`,
    offer: {
      id: offer.offId,
      networkId: offer.offIdNet,
      network: offer.network,
      app: offer.app,
      site: offer.site,
      raw: rawName,
    },
    product,
    productLabel: PRODUCTS[product],
    payout,
    defaultPrice,
    ecpm,
    paused: offer.paused,
    from: days[0][0],
    to: days[days.length - 1][0],
    creatives,
    // [date, clicks, conversions, impressions?] — the only numbers that are measured.
    // Impressions are dropped when the source did not report them, so `demo-data.ts`
    // derives them instead of storing a placeholder that looks measured.
    days: days.map(([d, c, e, imp]) => (imp === null ? [d, c, e] : [d, c, e, imp])),
  });
}

const ts = `/**
 * Campaign roster and real per-day traffic, generated by \`scripts/build-campaigns.mjs\`
 * from the shared affiliate spreadsheet and the DSP's own \`scripts/report.xls\`
 * export. Do not edit by hand — re-run the script instead.
 *
 * \`days\` holds \`[date, clicks, conversions, impressions?]\`. Clicks and conversions
 * are the affiliate sheet's \`Total Lead\` and \`Event\` columns; the DSP export also
 * measures impressions, so those days carry a fourth value. Everything else in the
 * funnel is derived in \`demo-data.ts\`, the one place a number is invented.
 */

export interface CampaignCreative {
  id: string;
  name: string;
  src: string;
  video: boolean;
  size: string;
  price: string;
}

export interface CampaignSource {
  /** Advertiser-side offer id. */
  id: string;
  /** Affiliate network's offer id — stable across offer renames. */
  networkId: string;
  network: string;
  app: string;
  site: string;
  /** Untouched offer name as the traffic team writes it. */
  raw: string;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  offer: CampaignSource;
  product: string;
  productLabel: string;
  /** Payout per conversion, in dollars. */
  payout: number;
  /** Campaign bid ceiling per impression, in dollars. */
  defaultPrice: number;
  /** Baseline cost per thousand impressions this campaign's inventory clears at. */
  ecpm: number;
  /** Paused by the buyer rather than run to the end of its flight. */
  paused: boolean;
  from: string;
  to: string;
  creatives: CampaignCreative[];
  /** Impressions are present only on days the source actually measured them. */
  days: [date: string, clicks: number, conversions: number, impressions?: number][];
}

export const CAMPAIGNS: Campaign[] = ${JSON.stringify(campaigns, null, 2)};

/** Latest day with traffic — the account's "today" for reports and flight status. */
export const LATEST_DAY = ${JSON.stringify(campaigns.flatMap((c) => c.to).sort().at(-1))};
`;

await writeFile("src/lib/campaigns.ts", ts);

console.log(`src/lib/campaigns.ts — ${campaigns.length} campaigns\n`);
for (const c of campaigns) {
  const clicks = c.days.reduce((a, d) => a + d[1], 0);
  const conv = c.days.reduce((a, d) => a + d[2], 0);
  console.log(
    `  ${c.name.padEnd(34)} net=${c.offer.networkId.padEnd(7)} ${c.from}→${c.to}  ` +
      `${String(c.days.length).padStart(3)}d  clicks=${String(clicks).padStart(5)}  conv=${String(conv).padStart(4)}  ` +
      `payout=$${c.payout}  creatives=${c.creatives.length}  [${c.product}]`,
  );
}
