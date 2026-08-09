/**
 * Moves the generated data between `src/lib/*.ts` and Supabase.
 *   node scripts/supabase.mjs push      seed the database from the TS files
 *   node scripts/supabase.mjs pull      rewrite the TS files from the database
 *   node scripts/supabase.mjs selftest  round-trip the row mapping, no network
 *
 * Supabase is the source of truth; the app never talks to it. `pull` rewrites only
 * the array literals in place, so the interfaces and comments above them stay put
 * and the build stays fully static. Run `supabase/schema.sql` once first.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env.local` (writes go
 * through RLS as the service role; the anon key can only read).
 */
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const CAMPAIGNS_TS = "src/lib/campaigns.ts";
const ASSETS_TS = "src/lib/creative-assets-data.ts";

// ------------------------------------------------------------- the TS literals

/** The JSON array a generated `export const NAME: T[] = [ … ];` holds. */
function readLiteral(file, name) {
  const src = readFileSync(file, "utf8");
  const start = src.indexOf("= [", src.indexOf(`export const ${name}`));
  const end = src.indexOf("\n];", start);
  if (start < 0 || end < 0) throw new Error(`${file}: no array literal for ${name}`);
  return JSON.parse(src.slice(start + 2, end + 2));
}

/** Replaces that literal, leaving every other byte of the file alone. */
function writeLiteral(file, name, value) {
  const src = readFileSync(file, "utf8");
  const start = src.indexOf("= [", src.indexOf(`export const ${name}`)) + 2;
  const end = src.indexOf("\n];", start) + 2;
  writeFileSync(file, src.slice(0, start) + JSON.stringify(value, null, 2) + src.slice(end));
}

// ------------------------------------------------------------ rows ↔ TS shapes

/** Undefined optionals are dropped so the rewritten literal matches the original. */
const omitUndefined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const campaignRows = (campaigns) => ({
  campaigns: campaigns.map((c, ordinal) => ({
    id: c.id,
    ordinal,
    slug: c.slug,
    name: c.name,
    product: c.product,
    product_label: c.productLabel,
    payout: c.payout,
    default_price: c.defaultPrice,
    ecpm: c.ecpm,
    paused: c.paused,
    synthetic: c.synthetic ?? false,
    starts_on: c.from,
    ends_on: c.to,
    offer_id: c.offer.id,
    offer_network_id: c.offer.networkId,
    offer_network: c.offer.network,
    offer_app: c.offer.app,
    offer_site: c.offer.site,
    offer_raw: c.offer.raw,
  })),
  campaign_days: campaigns.flatMap((c) =>
    c.days.map(([day, clicks, conversions, impressions]) => ({
      campaign_id: c.id,
      day,
      clicks,
      conversions,
      impressions: impressions ?? null,
    })),
  ),
  campaign_creatives: campaigns.flatMap((c) =>
    c.creatives.map((cr, ordinal) => ({ ...cr, campaign_id: c.id, ordinal })),
  ),
});

function campaignsFromRows({ campaigns, campaign_days, campaign_creatives }) {
  const days = new Map(campaigns.map((c) => [c.id, []]));
  const creatives = new Map(campaigns.map((c) => [c.id, []]));
  for (const d of campaign_days) {
    // A day carries its impressions only when the source measured them.
    const row = [d.day, d.clicks, d.conversions];
    if (d.impressions !== null) row.push(d.impressions);
    days.get(d.campaign_id).push(row);
  }
  for (const cr of campaign_creatives) {
    creatives.get(cr.campaign_id).push({
      id: cr.id,
      name: cr.name,
      src: cr.src,
      video: cr.video,
      size: cr.size,
      price: cr.price,
    });
  }
  return campaigns.map((c) =>
    omitUndefined({
      id: c.id,
      slug: c.slug,
      name: c.name,
      offer: {
        id: c.offer_id,
        networkId: c.offer_network_id,
        network: c.offer_network,
        app: c.offer_app,
        site: c.offer_site,
        raw: c.offer_raw,
      },
      product: c.product,
      productLabel: c.product_label,
      payout: Number(c.payout),
      defaultPrice: Number(c.default_price),
      ecpm: Number(c.ecpm),
      paused: c.paused,
      from: c.starts_on,
      to: c.ends_on,
      // The key is absent on real campaigns rather than false — as generated.
      synthetic: c.synthetic || undefined,
      creatives: creatives.get(c.id),
      days: days.get(c.id),
    }),
  );
}

const assetRows = (folders, assets) => ({
  creative_folders: folders.map((f, ordinal) => ({ id: f.id, ordinal, name: f.name })),
  creative_assets: assets.map((a, ordinal) => ({
    id: a.id,
    ordinal,
    name: a.name,
    folder_id: a.folderId,
    preview_url: a.previewUrl,
    dimensions: a.dimensions,
    width: a.width ?? null,
    height: a.height ?? null,
    file_size_kb: a.fileSizeKb,
    type: a.type,
    created_on: a.createdAt,
  })),
});

const foldersFromRows = (rows) => rows.map((f) => ({ id: f.id, name: f.name }));

const assetsFromRows = (rows) =>
  rows.map((a) =>
    omitUndefined({
      id: a.id,
      name: a.name,
      folderId: a.folder_id,
      previewUrl: a.preview_url,
      dimensions: a.dimensions,
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      fileSizeKb: a.file_size_kb,
      type: a.type,
      createdAt: a.created_on,
    }),
  );

// ------------------------------------------------------------------- PostgREST

function credentials() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fine when the vars are already exported.
  }
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  return {
    rest: `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  };
}

async function call(method, path, body) {
  const { rest, headers } = credentials();
  const res = await fetch(`${rest}/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} — ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Ordered read of a whole table. */
async function select(table, order = "ordinal") {
  const rows = await call("GET", `${table}?select=*&order=${order}&limit=5000`);
  // PostgREST caps a page silently; a full page means rows were left behind.
  assert.notEqual(rows.length, 5000, `${table}: hit the page cap — add paging`);
  assert.ok(rows.length, `${table} is empty — did you run supabase/schema.sql and db:push?`);
  return rows;
}

const insert = (table, rows) => (rows.length ? call("POST", table, rows) : null);

// ---------------------------------------------------------------- the commands

async function push() {
  const campaigns = campaignRows(readLiteral(CAMPAIGNS_TS, "CAMPAIGNS"));
  const assets = assetRows(
    readLiteral(ASSETS_TS, "DEFAULT_FOLDERS"),
    readLiteral(ASSETS_TS, "INITIAL_ASSETS"),
  );

  // Days, creatives and assets cascade off their parents, so two deletes clear it all.
  await call("DELETE", "campaigns?id=not.is.null");
  await call("DELETE", "creative_folders?id=not.is.null");

  for (const [table, rows] of [...Object.entries(campaigns), ...Object.entries(assets)]) {
    await insert(table, rows);
    console.log(`  ${table.padEnd(19)} ${rows.length}`);
  }
}

async function pull() {
  const [campaigns, campaign_days, campaign_creatives, folders, assets] = await Promise.all([
    select("campaigns"),
    select("campaign_days", "campaign_id,day"),
    select("campaign_creatives"),
    select("creative_folders"),
    select("creative_assets"),
  ]);

  const roster = campaignsFromRows({ campaigns, campaign_days, campaign_creatives });
  writeLiteral(CAMPAIGNS_TS, "CAMPAIGNS", roster);
  writeLiteral(ASSETS_TS, "DEFAULT_FOLDERS", foldersFromRows(folders));
  writeLiteral(ASSETS_TS, "INITIAL_ASSETS", assetsFromRows(assets));

  console.log(`  ${CAMPAIGNS_TS} — ${roster.length} campaigns, ${campaign_days.length} days`);
  console.log(`  ${ASSETS_TS} — ${folders.length} folders, ${assets.length} assets`);
}

/** The mapping is the only place data can be lost; round-trip it without a network. */
function selftest() {
  const campaigns = readLiteral(CAMPAIGNS_TS, "CAMPAIGNS");
  assert.deepEqual(campaignsFromRows(campaignRows(campaigns)), campaigns, "campaign round-trip");

  const folders = readLiteral(ASSETS_TS, "DEFAULT_FOLDERS");
  const assets = readLiteral(ASSETS_TS, "INITIAL_ASSETS");
  const rows = assetRows(folders, assets);
  assert.deepEqual(foldersFromRows(rows.creative_folders), folders, "folder round-trip");
  assert.deepEqual(assetsFromRows(rows.creative_assets), assets, "asset round-trip");

  console.log(`  ok — ${campaigns.length} campaigns, ${folders.length} folders, ${assets.length} assets`);
}

const command = { push, pull, selftest }[process.argv[2]];
if (!command) throw new Error("usage: node scripts/supabase.mjs push|pull|selftest");
console.log(`${process.argv[2]}…`);
await command();
