/**
 * Invariant check for the campaign analytics data.
 *   node scripts/check-demo-data.mjs
 * Compiles the derived-data modules with the project's tsc, then asserts that the
 * spreadsheet's real counters survive intact, that the funnel derived above them
 * is internally consistent, that Total re-derives ratios instead of summing them,
 * and that the billing ledger and traffic funnel stay tied to the same numbers.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const out = mkdtempSync(join(tmpdir(), "demo-"));
execFileSync(
  "npx",
  [
    "tsc",
    "src/lib/demo-data.ts",
    "src/lib/transactions.ts",
    "src/lib/funnel.ts",
    "src/lib/audiences.ts",
    "--outDir",
    out,
    "--module",
    "esnext",
    "--target",
    "es2022",
    "--moduleResolution",
    "bundler",
    "--typeRoots",
    out,
  ],
  { stdio: "inherit" },
);

// Bundler resolution emits an extensionless specifier, which Node's ESM loader
// will not resolve. The bundler adds the extension in the app; here we do it.
for (const f of ["demo-data", "transactions", "funnel", "audiences"]) {
  const p = join(out, `${f}.js`);
  writeFileSync(
    p,
    readFileSync(p, "utf8").replace(
      /"\.\/(campaigns|demo-data|funnel|audiences|transactions)"/g,
      '"./$1.js"',
    ),
  );
}

const { dayMetrics, sumMetrics, CELL, SERIES } = await import(join(out, "demo-data.js"));
const { CAMPAIGNS, LATEST_DAY } = await import(join(out, "campaigns.js"));
const ledger = await import(join(out, "transactions.js"));
const { campaignFunnel, campaignTotals, survivors } = await import(join(out, "funnel.js"));
const { AUDIENCES, audienceOfCampaign } = await import(join(out, "audiences.js"));

assert.ok(CAMPAIGNS.length > 0, "campaigns.ts has campaigns — did build-campaigns.mjs run?");

/**
 * Ceilings that keep the account looking like a real mid-size media buy. The
 * busiest campaign day currently peaks near 89k impressions and $182, so these
 * sit just above that — tight enough to catch a derivation that runs away.
 */
const MAX_IMPRESSIONS_PER_DAY = 120_000;
const MAX_SPEND_PER_DAY = 250;

let checkedDays = 0;

for (const c of CAMPAIGNS) {
  const rows = c.days.map(([d]) => dayMetrics(d, c.id));
  const total = sumMetrics(rows);

  assert.deepEqual(
    dayMetrics(c.days[0][0], c.id),
    dayMetrics(c.days[0][0], c.id),
    `${c.name}: same campaign and date must give the same day`,
  );

  for (const [i, m] of rows.entries()) {
    const [date, clicks, conversions] = c.days[i];
    const at = `${c.name} ${date}`;
    checkedDays++;

    // The two counters that came from the spreadsheet must pass through untouched.
    assert.equal(m.clicks, clicks, `${at}: clicks match the sheet`);
    assert.equal(m.actions, conversions, `${at}: conversions match the sheet's Event column`);

    assert.ok(m.bidResponses <= m.bidRequests, `${at}: responses <= requests`);
    assert.ok(m.wins <= m.bidResponses, `${at}: wins <= responses`);
    assert.ok(m.impressions <= m.wins, `${at}: impressions <= wins`);
    assert.ok(m.clicks <= m.impressions, `${at}: clicks <= impressions`);
    assert.ok(m.actions <= m.clicks, `${at}: conversions <= clicks`);
    assert.ok(m.spend > 0, `${at}: spend > 0`);
    assert.ok(m.q1 >= m.mid && m.mid >= m.q3 && m.q3 >= m.complete, `${at}: quartiles decrease`);
    assert.ok(m.q1 <= m.impressions, `${at}: quartiles <= impressions`);

    // Numbers stay plausible — an invented funnel is easy to blow up by accident.
    assert.ok(
      m.impressions <= MAX_IMPRESSIONS_PER_DAY,
      `${at}: impressions stay believable (${m.impressions})`,
    );
    assert.ok(m.spend <= MAX_SPEND_PER_DAY, `${at}: spend stays believable ($${m.spend})`);

    const ctr = (m.clicks / m.impressions) * 100;
    assert.ok(ctr > 0.15 && ctr < 0.6, `${at}: CTR in a believable band (${ctr.toFixed(2)}%)`);
  }

  // Conversions are real, so a campaign the sheet never recorded an event for
  // legitimately has no revenue. Any campaign that did convert should have
  // returned more than it cost.
  if (total.actions > 0) {
    assert.ok(
      total.revenue > total.spend,
      `${c.name}: campaign-level ROAS > 1 ($${total.revenue} vs $${total.spend})`,
    );
  } else {
    assert.equal(CELL.ROAS(total), "0.00", `${c.name}: no conversions means no return`);
  }

  // A day outside the campaign's flight has no traffic at all.
  assert.deepEqual(dayMetrics("2020-01-01", c.id), dayMetrics("2020-01-01", "nope"));
}

// The account view is the sum of its campaigns, not a separately invented series.
const perCampaign = sumMetrics(CAMPAIGNS.map((c) => dayMetrics(LATEST_DAY, c.id)));
assert.deepEqual(dayMetrics(LATEST_DAY), perCampaign, "account total == sum of campaigns");

// Ratios in Total are recomputed from the totals, not summed across rows.
const busiest = CAMPAIGNS.reduce((a, b) => (a.days.length > b.days.length ? a : b));
const rows = busiest.days.map(([d]) => dayMetrics(d, busiest.id));
const total = sumMetrics(rows);
assert.equal(CELL.CTR(total), `${((total.clicks / total.impressions) * 100).toFixed(2)}%`);
const summedCtr = rows.reduce((a, m) => a + (m.clicks / m.impressions) * 100, 0);
assert.ok(Math.abs(parseFloat(CELL.CTR(total)) - summedCtr) > 1, "Total CTR is not a sum of CTRs");

// Counters in Total are sums.
assert.equal(
  CELL.Impressions(total),
  rows.reduce((a, m) => a + m.impressions, 0).toLocaleString("en-US"),
);

const labels = Object.keys(CELL);
assert.equal(labels.length, 26, "26 metric columns");
assert.deepEqual(Object.keys(SERIES), labels, "CELL and SERIES cover the same columns");
for (const l of labels) {
  assert.equal(typeof CELL[l](total), "string", `${l} formats to text`);
  assert.ok(Number.isFinite(SERIES[l](total)), `${l} series value is finite`);
}

// A campaign with no traffic on a date must still render the way the saved page does.
const zero = dayMetrics("2020-01-01", CAMPAIGNS[0].id);
assert.equal(CELL["Bid Rate"](zero), "0.00%");
assert.equal(CELL.ROAS(zero), "-");
assert.equal(CELL["CPA Action 0"](zero), "-");
assert.equal(CELL["Imp-to-Bid"](zero), "0");

// ---------------------------------------------------------------- audiences
// Every campaign runs against exactly one audience, and the "Linked Campaigns"
// column is that mapping read the other way round.
for (const c of CAMPAIGNS) {
  const a = audienceOfCampaign(c.id);
  assert.ok(a, `${c.name}: has an audience`);
  assert.equal(
    AUDIENCES.filter((x) => x.campaignIds.includes(c.id)).length,
    1,
    `${c.name}: linked to exactly one audience`,
  );
}
assert.ok(
  AUDIENCES.some((a) => a.campaignIds.length === 0),
  "the untouched `Test` audience is still there",
);

// ------------------------------------------------------------ traffic funnel
for (const c of CAMPAIGNS) {
  const stages = campaignFunnel(c.id);
  const t = campaignTotals(c.id);
  assert.ok(stages.length > 0, `${c.name}: funnel has stages`);

  // The funnel is a partition of real counters — it may not invent or lose one.
  assert.equal(stages[0].entered, t.bidRequests, `${c.name}: funnel starts at bid requests`);
  assert.equal(survivors(stages), t.impressions, `${c.name}: funnel ends at impressions`);

  const targeting = stages.filter((s) => s.phase === "targeting");
  assert.equal(
    targeting.reduce((a, s) => a + s.rejected, 0),
    t.bidRequests - t.bidResponses,
    `${c.name}: targeting rejections account for the whole pre-bid drop`,
  );
  assert.equal(
    targeting[targeting.length - 1].entered - targeting[targeting.length - 1].rejected,
    t.bidResponses,
    `${c.name}: last targeting stage hands over exactly the bid responses`,
  );

  for (const [i, s] of stages.entries()) {
    assert.ok(s.rejected >= 0, `${c.name}/${s.label}: cannot reject a negative count`);
    assert.ok(s.rejected <= s.entered, `${c.name}/${s.label}: cannot reject more than entered`);
    if (i > 0) {
      const prev = stages[i - 1];
      assert.equal(
        s.entered,
        prev.entered - prev.rejected,
        `${c.name}/${s.label}: stage picks up where the previous one left off`,
      );
    }
  }
}

// -------------------------------------------------------------- billing ledger
const { TRANSACTIONS, ACCOUNT_BALANCE_CENTS, USED_PAYMENT_METHODS, REPORT_RANGE } = ledger;
const oldestFirst = [...TRANSACTIONS].reverse();

assert.ok(TRANSACTIONS.length > 0, "the account has a transaction history");
assert.equal(TRANSACTIONS[0].balance, ACCOUNT_BALANCE_CENTS, "closing balance is the newest row");

let running = 0;
let previousAt = "";
for (const t of oldestFirst) {
  running += t.amount;
  assert.equal(t.balance, running, `#${t.id}: Balance column is the running total`);
  assert.ok(t.balance >= 0, `#${t.id}: the account never goes overdrawn`);
  assert.ok(t.at >= previousAt, `#${t.id}: ledger is in chronological order`);
  previousAt = t.at;

  if (t.type === "Credit") {
    assert.ok(t.amount > 0 && t.method && t.invoice, `#${t.id}: a deposit has a method and invoice`);
  } else {
    assert.ok(t.amount < 0 && t.method === null && t.invoice === null, `#${t.id}: spend has neither`);
  }
}

// Debits are the campaigns' own spend — not a separately invented series.
const debited = -oldestFirst.filter((t) => t.type === "Debit").reduce((a, t) => a + t.amount, 0);
const spendDays = [...new Set(CAMPAIGNS.flatMap((c) => c.days.map(([d]) => d)))];
const accountSpend = spendDays.reduce((a, d) => a + Math.round(dayMetrics(d).spend * 100), 0);
assert.equal(debited, accountSpend, "billing debits == the account's campaign spend");
assert.equal(
  ACCOUNT_BALANCE_CENTS,
  oldestFirst.filter((t) => t.type === "Credit").reduce((a, t) => a + t.amount, 0) - debited,
  "balance == deposits - spend",
);

// The payment-method filter only offers methods that appear in the history.
assert.deepEqual(
  [...USED_PAYMENT_METHODS].sort(),
  [...new Set(TRANSACTIONS.map((t) => t.method).filter(Boolean))].sort(),
  "payment method filter is built from the ledger",
);
assert.ok(
  TRANSACTIONS.some((t) => t.at.slice(0, 10) >= REPORT_RANGE[0] && t.at.slice(0, 10) <= REPORT_RANGE[1]),
  "the default date range actually contains transactions",
);

console.log(`campaign data OK — ${CAMPAIGNS.length} campaigns, ${checkedDays} days`);
console.log(
  `ledger OK — ${TRANSACTIONS.length} rows, spend $${(debited / 100).toFixed(2)}, ` +
    `balance $${(ACCOUNT_BALANCE_CENTS / 100).toFixed(2)}, via ${USED_PAYMENT_METHODS.join(" / ")}`,
);
console.log(`audiences OK — ${AUDIENCES.length} audiences\n`);
console.table(
  CAMPAIGNS.map((c) => {
    const t = sumMetrics(c.days.map(([d]) => dayMetrics(d, c.id)));
    return {
      campaign: c.name,
      flight: `${c.from} → ${c.to}`,
      days: c.days.length,
      impressions: CELL.Impressions(t),
      clicks: CELL.Clicks(t),
      CTR: CELL.CTR(t),
      spend: CELL.Spend(t),
      eCPM: CELL.eCPM(t),
      conv: CELL["Action 0"](t),
      CPA: CELL["CPA Action 0"](t),
      ROAS: CELL.ROAS(t),
    };
  }),
);
