/**
 * Billing ledger for the account.
 *
 * Every debit is a day's real campaign spend straight out of `demo-data.ts`, so
 * the transaction history adds up to exactly what Analytics reports. Credits are
 * the deposits that had to happen for those debits to clear: the ledger is walked
 * forward day by day, and whenever the balance cannot cover the day ahead the
 * advertiser tops up with a round amount. Nothing is charged that the account
 * could not pay for, and the closing balance is what the top bar shows.
 *
 * Money is kept in integer cents here — a running balance built out of floats
 * drifts by a cent or two over ninety days and the Balance column stops adding up.
 */

import { CAMPAIGNS } from "./campaigns";
import { dayMetrics } from "./demo-data";

export type TransactionType = "Credit" | "Debit";

export interface Transaction {
  id: number;
  /** UTC — the account's timezone badge reads UTC+00:00. */
  at: string;
  description: string;
  type: TransactionType;
  /** Signed cents: credits positive, debits negative. */
  amount: number;
  /** Account balance in cents after this row cleared. */
  balance: number;
  /** Null on debits — the live table prints "-" there. */
  method: string | null;
  status: "Completed";
  invoice: string | null;
}

/** Round top-ups a media buyer actually wires, smallest first. */
const DEPOSIT_STEPS = [1000_00, 2000_00, 5000_00];

/** How far ahead a top-up is sized to cover. */
const RUNWAY_DAYS = 14;

/** What the account keeps on hand once the flights have ended. */
const WORKING_BALANCE = 2000_00;

/** Every date the account booked spend on, oldest first. */
const SPEND_DAYS: [date: string, cents: number][] = [
  ...new Set(CAMPAIGNS.flatMap((c) => c.days.map(([d]) => d))),
]
  .sort()
  .map((date) => [date, Math.round(dayMetrics(date).spend * 100)] as [string, number])
  .filter(([, cents]) => cents > 0);

/** Every third top-up goes through PayPal; the rest by card, or by wire when large. */
const methodFor = (amount: number, index: number) =>
  index % 3 === 2 ? "PayPal" : amount >= 5000_00 ? "Wire transfer" : "Credit Card";

function build(): Transaction[] {
  const rows: Transaction[] = [];
  let balance = 0;
  let id = 100_001;
  let deposits = 0;

  SPEND_DAYS.forEach(([date, cents], i) => {
    if (balance < cents) {
      // Cover the coming fortnight, not just today — nobody tops up daily.
      const runway = SPEND_DAYS.slice(i, i + RUNWAY_DAYS).reduce((a, [, c]) => a + c, 0);
      let amount = 0;
      while (balance + amount < runway) {
        const short = runway - balance - amount;
        amount += DEPOSIT_STEPS.find((s) => s >= short) ?? DEPOSIT_STEPS[DEPOSIT_STEPS.length - 1];
      }
      const method = methodFor(amount, deposits);
      balance += amount;
      deposits++;
      rows.push({
        id: id++,
        at: `${date}T09:12:00Z`,
        description: `Funds deposit via ${method}`,
        type: "Credit",
        amount,
        balance,
        method,
        status: "Completed",
        invoice: `INV-${date.slice(0, 4)}-${String(deposits).padStart(4, "0")}`,
      });
    }

    balance -= cents;
    rows.push({
      id: id++,
      // Spend settles at the end of the day it was booked.
      at: `${date}T23:59:00Z`,
      description: "Campaigns daily spending",
      type: "Debit",
      amount: -cents,
      balance,
      method: null,
      status: "Completed",
      invoice: null,
    });
  });

  /**
   * The flights are over but the account is still funded — the buyer topped up
   * again the morning after the last one ended, so the top bar reads a working
   * balance rather than the few hundred the last campaign happened to leave.
   */
  const last = SPEND_DAYS[SPEND_DAYS.length - 1][0];
  const next = new Date(`${last}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const amount = DEPOSIT_STEPS.find((step) => balance + step >= WORKING_BALANCE);
  if (amount) {
    const method = methodFor(amount, deposits);
    balance += amount;
    deposits++;
    rows.push({
      id: id++,
      at: `${next.toISOString().slice(0, 10)}T09:12:00Z`,
      description: `Funds deposit via ${method}`,
      type: "Credit",
      amount,
      balance,
      method,
      status: "Completed",
      invoice: `INV-${next.getUTCFullYear()}-${String(deposits).padStart(4, "0")}`,
    });
  }

  // Newest first, the way the live table loads.
  return rows.reverse();
}

export const TRANSACTIONS: Transaction[] = build();

/** Closing balance in cents — what the top bar and the deposit form show. */
export const ACCOUNT_BALANCE_CENTS = TRANSACTIONS.length ? TRANSACTIONS[0].balance : 0;

/**
 * Under the minimum deposit the bidder stops competing and the app raises its
 * "Balance is too low to bid" toast. The saved pages were captured at $0, which
 * is why every one of them carries that warning.
 */
export const BALANCE_TOO_LOW = ACCOUNT_BALANCE_CENTS < 100_00;

/** Payment methods the filter offers: the ones this account has actually used. */
export const USED_PAYMENT_METHODS = [
  ...new Set(TRANSACTIONS.map((t) => t.method).filter((m): m is string => m !== null)),
];

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** dd.mm.yyyy HH:mm, straight off the stored UTC instant. */
export function formatAt(at: string): string {
  const [date, time] = at.split("T");
  return `${date.split("-").reverse().join(".")} ${time.slice(0, 5)}`;
}

/** dd.mm.yyyy — the format the date-range input prints. */
export const asRangeDate = (iso: string) => iso.split("-").reverse().join(".");

/** The account's last 30 days of billing, the window the page opens on. */
export const REPORT_RANGE: [from: string, to: string] = (() => {
  const last = SPEND_DAYS[SPEND_DAYS.length - 1][0];
  const from = new Date(`${last}T00:00:00Z`);
  from.setUTCDate(from.getUTCDate() - 29);
  return [from.toISOString().slice(0, 10), last];
})();
