"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SortLabel, type Sort } from "@/components/SortLabel";
import {
  ACCOUNT_BALANCE_CENTS,
  REPORT_RANGE,
  TRANSACTIONS,
  USED_PAYMENT_METHODS,
  asRangeDate,
  formatAt,
  money,
  type Transaction,
} from "@/lib/transactions";

/** `app-deposit` payment switchers, in the order the live form renders them. */
const PAYMENT_METHODS = [
  {
    id: "stripe",
    label: "Credit Card",
    icons: [
      { src: "/images/visa.svg", alt: "Visa" },
      { src: "/images/mastercard.svg", alt: "Mastercard" },
    ],
  },
  { id: "paypal", label: "PayPal", icons: [{ src: "/images/paypal.svg", alt: "PayPal" }] },
  {
    id: "wiretransfer",
    label: "Wire transfer",
    icons: [{ src: "/images/wire-transfer.svg", alt: "Wire transfer" }],
  },
] as const;

type MethodId = (typeof PAYMENT_METHODS)[number]["id"];

/** Stripe rejects deposits below this, and the form blocks them client-side first. */
const MIN_AMOUNT = 100;

const TRANSACTION_TYPES = ["Credit", "Debit"];

const COLUMNS: { label: string; sortKey?: string }[] = [
  { label: "ID" },
  { label: "Date", sortKey: "date" },
  { label: "Description", sortKey: "description" },
  { label: "Type" },
  { label: "Amount", sortKey: "amount" },
  { label: "Balance" },
  { label: "Payment Method" },
  { label: "Status" },
  { label: "Invoice" },
];

/** "Last 30 days" of the account's own billing — the window the page opens on. */
const DEFAULT_RANGE = REPORT_RANGE.map(asRangeDate).join(" - ");

interface Filters {
  search: string;
  types: string[];
  methods: string[];
}

const NO_FILTERS: Filters = { search: "", types: [], methods: [] };

const inRange = (t: Transaction) => {
  const day = t.at.slice(0, 10);
  return day >= REPORT_RANGE[0] && day <= REPORT_RANGE[1];
};

function apply(f: Filters, sort: Sort | null): Transaction[] {
  const q = f.search.trim().toLowerCase();
  const rows = TRANSACTIONS.filter(
    (t) =>
      inRange(t) &&
      (!q ||
        t.description.toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        (t.method?.toLowerCase().includes(q) ?? false)) &&
      (f.types.length === 0 || f.types.includes(t.type)) &&
      (f.methods.length === 0 || (t.method !== null && f.methods.includes(t.method))),
  );
  if (!sort) return rows;
  // Amount sorts on the signed value, so credits and debits separate cleanly.
  const key = (t: Transaction) =>
    sort.key === "amount" ? t.amount : sort.key === "date" ? t.at : t.description;
  return [...rows].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (sort.asc ? 1 : -1));
}

export function BillingView() {
  const [method, setMethod] = useState<MethodId>("stripe");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort | null>(null);
  // The live page only refetches when "Get transactions" is pressed, so the
  // filter controls stay pending until then.
  const [applied, setApplied] = useState<Filters>(NO_FILTERS);

  const tooLow = amount !== "" && Number(amount) < MIN_AMOUNT;
  const canPay = amount !== "" && !tooLow;
  const filtered = search !== "" || types.length > 0 || methods.length > 0;
  const rows = useMemo(() => apply(applied, sort), [applied, sort]);

  const resetFilters = () => {
    setSearch("");
    setTypes([]);
    setMethods([]);
    setApplied(NO_FILTERS);
  };

  return (
    <AppShell breadcrumbs={[{ label: "Billing" }]} activeHref="/billing">
      <div className="mb-4 flex h-9 items-center">
        <h1 className="flex items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
          Billing
          <a
            href="https://help.dsp.epom.com/docs/billing"
            target="_blank"
            rel="noreferrer"
            aria-label="Billing help"
            className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
          >
            <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
          </a>
        </h1>
      </div>

      {/* Add funds */}
      <div className="mb-4 rounded-lg bg-epom-surface p-6">
        <div className="mb-2 text-[12px] font-semibold leading-[18px] text-epom-muted">
          Payment Method
        </div>
        <div className="flex flex-wrap items-center gap-3 pb-8">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={cn(
                "relative flex h-9 min-w-[224px] cursor-pointer items-center rounded border py-[7px] pl-9 pr-3 text-[14px] leading-[21px] text-epom-text transition-colors duration-[120ms] ease-linear",
                method === m.id
                  ? "border-epom-primary bg-[rgba(0,91,192,0.08)]"
                  : "border-epom-border hover:bg-[rgba(26,28,30,0.04)]",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="sr-only"
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
              />
              {/* The live radio is drawn with ::before/::after on the label. */}
              <span
                className={cn(
                  "absolute left-[9px] top-[9px] h-4 w-4 rounded-full border",
                  method === m.id ? "border-2 border-epom-primary" : "border-epom-muted",
                )}
              />
              {method === m.id && (
                <span className="absolute left-[13px] top-[13px] h-2 w-2 rounded-full bg-epom-primary" />
              )}

              {m.icons.map((icon) => (
                <Image
                  key={icon.src}
                  src={icon.src}
                  alt={icon.alt}
                  width={30}
                  height={18}
                  className="mr-1 h-[18px] w-[30px]"
                />
              ))}
              <span className="ml-1">{m.label}</span>
            </label>
          ))}
        </div>

        {method === "wiretransfer" ? (
          <p className="text-[14px] leading-[21px] text-epom-text">
            Please contact your account manager for details regarding the Wire transfer.
          </p>
        ) : (
          <>
            <div className="mb-7 flex items-center gap-2">
              <span className="text-[14px] font-semibold leading-[21px] text-epom-text">
                Balance:
              </span>
              <span className="text-[14px] font-semibold leading-[21px] text-epom-success">
                {money(ACCOUNT_BALANCE_CENTS)}
              </span>
            </div>

            <div className="flex w-[396px] flex-col-reverse">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                // The live field is `appOnlyDecimalNumbers` — digits and one dot.
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={`Min. ${MIN_AMOUNT}`}
                className={cn(
                  "h-9 rounded border px-3 py-2 text-[14px] leading-5 text-epom-text placeholder:text-epom-muted focus:outline-none",
                  tooLow
                    ? "border-epom-error"
                    : "border-epom-border hover:bg-[rgba(26,28,30,0.04)] focus:border-epom-primary focus:hover:bg-transparent",
                )}
              />
              <label className="mb-1 text-[12px] font-semibold leading-[18px] text-epom-muted">
                Amount
                <span
                  className={cn(
                    "ml-1 font-semibold",
                    tooLow ? "text-epom-error" : "text-epom-primary",
                  )}
                >
                  *
                </span>
              </label>
            </div>

            {tooLow && (
              <p className="mt-1 text-[12px] leading-[18px] text-epom-error">
                Amount should not be lower than {MIN_AMOUNT}
              </p>
            )}
            {method === "paypal" && canPay && (
              <p className="mt-1 text-[12px] leading-4 text-epom-muted">
                Processing Fee &asymp; 0
              </p>
            )}

            {method === "paypal" && canPay ? (
              // ponytail: wordmark as text — the live button is a PayPal SDK iframe
              // whose raster logo can't be re-hosted. Swap in the brand SVG if licensed.
              <button
                type="button"
                className="mt-[15px] h-9 w-[396px] rounded bg-[#009cde] text-[16px] font-bold italic leading-[21px] text-white transition-opacity hover:opacity-90"
              >
                PayPal
              </button>
            ) : (
              method === "stripe" && (
                <button
                  type="button"
                  disabled={!canPay}
                  className={cn(
                    "mt-9 h-9 w-[396px] rounded text-[14px] font-semibold leading-[21px]",
                    canPay
                      ? "bg-epom-primary text-white shadow-epom-button hover:bg-epom-primary-hover"
                      : "cursor-not-allowed bg-[rgba(26,28,30,0.12)] text-[rgba(26,28,30,0.3)]",
                  )}
                >
                  Proceed Payment
                </button>
              )
            )}
          </>
        )}
      </div>

      {/* Transaction history */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[16px] font-bold leading-6 text-epom-text">Transaction history</div>
        <DateRangePicker value={DEFAULT_RANGE} activeRange="Last 30 days" />
      </div>

      <div className="flex items-start justify-between gap-2.5 rounded bg-epom-surface p-4">
        <div className="flex w-full flex-wrap items-center gap-3">
          <div className="relative w-[224px] shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded border border-epom-border px-3 py-2 text-[14px] leading-5 text-epom-text placeholder:text-epom-muted focus:border-epom-primary focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>

          <MultiSelect
            placeholder="Select type"
            options={TRANSACTION_TYPES}
            value={types}
            onChange={setTypes}
          />
          <MultiSelect
            placeholder="Select payment method"
            options={USED_PAYMENT_METHODS}
            value={methods}
            onChange={setMethods}
          />

          {filtered && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-9 items-center gap-1.5 text-[14px] leading-[21px] text-epom-primary"
            >
              <MaterialIcon name="refresh" className="block text-[16px] leading-4" />
              Reset Filter
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setApplied({ search, types, methods })}
          className="h-9 shrink-0 rounded bg-epom-primary px-4 text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
        >
          Get transactions
        </button>
      </div>

      <div className="mt-4">
        <div
          className={cn(
            "overflow-x-auto border border-epom-border bg-epom-surface",
            // `.table-flex.no-data` squares off its bottom so the empty panel joins it.
            rows.length === 0 ? "rounded-t-[3px]" : "rounded-[3px]",
          )}
        >
          <table className="w-full">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.label}
                    className="bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text"
                  >
                    {c.sortKey ? (
                      <SortLabel
                        label={c.label}
                        sortKey={c.sortKey}
                        sort={sort}
                        setSort={setSort}
                      />
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="group align-top">
                  <Cell>{t.id}</Cell>
                  <Cell className="whitespace-nowrap">{formatAt(t.at)}</Cell>
                  <Cell>{t.description}</Cell>
                  <Cell>{t.type}</Cell>
                  <Cell
                    className={cn(
                      "whitespace-nowrap font-semibold",
                      t.type === "Credit" ? "text-epom-success" : "text-epom-text",
                    )}
                  >
                    {t.amount > 0 ? `+${money(t.amount)}` : `-${money(-t.amount)}`}
                  </Cell>
                  <Cell className="whitespace-nowrap">{money(t.balance)}</Cell>
                  <Cell className="whitespace-nowrap">{t.method ?? "-"}</Cell>
                  <Cell>
                    <span className="flex items-center whitespace-nowrap text-epom-success">
                      <MaterialIcon
                        name="circle"
                        filled
                        className="mr-1 block text-[10px] leading-none"
                      />
                      {t.status}
                    </span>
                  </Cell>
                  <Cell>
                    {t.invoice ? (
                      <button
                        type="button"
                        title={`Download ${t.invoice}`}
                        aria-label={`Download ${t.invoice}`}
                        className="flex text-epom-primary transition-colors hover:text-epom-primary-hover"
                      >
                        <MaterialIcon name="download" className="block text-[20px] leading-5" />
                      </button>
                    ) : (
                      "-"
                    )}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex h-[66px] items-center justify-center rounded-[3px] bg-epom-surface text-[12px] leading-[21px] text-epom-muted">
            No available data to show.
          </div>
        )}
      </div>
    </AppShell>
  );
}

/** `.table > tbody > tr > td` — 12/18, 8px 16px, row-hover tint. */
function Cell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <td
      className={cn(
        "max-w-[600px] break-words px-4 py-2 text-[12px] font-normal leading-[18px] text-epom-text transition-colors duration-[120ms] ease-linear group-hover:bg-[rgba(26,28,30,0.04)]",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** `custom-select` with checkbox options — the transaction filters are multi-select. */
function MultiSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (option: string) =>
    onChange(
      value.includes(option) ? value.filter((v) => v !== option) : [...value, option],
    );

  return (
    <div ref={ref} className="relative w-[224px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded border py-[6px] pl-[11px] pr-9 text-left text-[14px] leading-[21px]",
          open ? "border-epom-primary" : "border-epom-border hover:bg-[rgba(26,28,30,0.04)]",
          value.length > 0 ? "text-epom-text" : "text-epom-muted",
        )}
      >
        {/* The live select joins selections with a comma and two spaces. */}
        {value.length > 0 ? value.join(",  ") : placeholder}
      </button>
      <MaterialIcon
        name={open ? "arrow_drop_up" : "arrow_drop_down"}
        className="pointer-events-none absolute right-3 top-[7px] block text-[20px] leading-5 text-epom-muted"
      />

      {open && (
        <div className="absolute left-0 top-9 z-[999] max-h-[190px] w-full overflow-y-auto rounded-b border-x border-b border-epom-primary bg-epom-surface">
          {options.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center text-[14px] font-bold leading-[21px] text-epom-text">
              No data
            </div>
          ) : (
            options.map((o) => {
              const checked = value.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className={cn(
                    "flex h-[34px] w-full items-center gap-2 px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                    checked && "bg-epom-primary-12 font-semibold",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border",
                      checked
                        ? "border-epom-primary bg-epom-primary text-white"
                        : "border-epom-muted",
                    )}
                  >
                    {checked && (
                      <MaterialIcon name="check" className="block text-[14px] leading-[14px]" />
                    )}
                  </span>
                  {o}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
