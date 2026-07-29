"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { FilterSelect } from "@/components/CampaignFilters";
import { MaterialIcon } from "@/components/MaterialIcon";
import { SortLabel, type Sort } from "@/components/SortLabel";
import { AUDIENCES, linkedCampaignNames, type Audience } from "@/lib/audiences";

const STATUS_OPTIONS = ["Active", "Archived"];
const PAGE_SIZES = ["10", "25", "50", "100"];

const today = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replaceAll("/", ".");

export function AudienceListView() {
  const [rows, setRows] = useState(AUDIENCES);
  const [search, setSearch] = useState("");
  // The account is dormant, so every audience it has is archived — opening on
  // "Active" would show an empty table on a page that has rows.
  const [status, setStatus] = useState("Archived");
  // Unsorted until a header is clicked — the live table loads with no sort arrow.
  const [sort, setSort] = useState<Sort | null>(null);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<"status" | "size" | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter(
      (r) => r.status === status && (!q || r.name.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    // Dates are dd.mm.yyyy — reverse to yyyymmdd so a string compare sorts them.
    const key = (r: Audience) =>
      sort.key === "name" ? r.name.toLowerCase() : r.created.split(".").reverse().join("");
    return list.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (sort.asc ? 1 : -1));
  }, [rows, search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  const update = (id: string, patch: Partial<Audience>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const clone = (row: Audience) =>
    setRows((rs) => [
      ...rs,
      // A copy starts unattached — campaigns keep pointing at the original.
      {
        ...row,
        id: crypto.randomUUID(),
        name: `${row.name} (copy)`,
        campaignIds: [],
        created: today(),
        edited: today(),
      },
    ]);

  const create = () =>
    setRows((rs) => [
      ...rs,
      {
        id: crypto.randomUUID(),
        name: `New Audience ${rs.length + 1}`,
        campaignIds: [],
        // A fresh audience targets nothing until the buyer ticks something.
        deviceTypes: [],
        connectionTypes: [],
        storeCategories: [],
        created: today(),
        edited: today(),
        status: "Active",
      },
    ]);

  return (
    <AppShell activeHref="/audience" breadcrumbs={[{ label: "Audience" }]}>
      <div className="mb-4 flex h-9 items-center">
        <h1 className="flex items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
          Audience
          <a
            href="https://help.dsp.epom.com/docs/Audience"
            target="_blank"
            rel="noreferrer"
            title="Learn about Audience"
            aria-label="Learn about Audience"
            className="ml-2 flex h-5 w-5 text-epom-primary transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
          >
            <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
          </a>
        </h1>
      </div>

      <div ref={toolsRef} className="flex justify-between gap-4 rounded bg-epom-surface p-4">
        <div className="flex gap-3">
          <div className="relative min-w-[200px] max-w-[324px] flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="h-9 w-full rounded border border-epom-border bg-epom-surface py-2 pl-3 pr-9 text-[14px] leading-5 text-epom-text transition-[border-color] duration-150 ease-in-out focus:border-epom-primary focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>

          <FilterSelect
            label="Status:"
            value={status}
            options={STATUS_OPTIONS}
            className="w-[264px]"
            open={open === "status"}
            onToggle={() => setOpen(open === "status" ? null : "status")}
            onPick={(o) => {
              setStatus(o);
              setPage(1);
              setOpen(null);
            }}
          />
        </div>

        <button
          type="button"
          onClick={create}
          className="flex h-9 shrink-0 items-center gap-2 self-start rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
        >
          <MaterialIcon name="add_circle_outline" filled className="block text-[16px] leading-4" />
          Create new Audience
        </button>
      </div>

      <div className="mt-4">
        <div className="overflow-x-auto rounded-[3px] border border-epom-border bg-epom-surface">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr>
                <Head>
                  <SortLabel label="Name" sortKey="name" sort={sort} setSort={setSort} />
                </Head>
                <Head>Linked Campaigns</Head>
                <Head>
                  <SortLabel label="Created" sortKey="created" sort={sort} setSort={setSort} />
                </Head>
                <Head>Edited</Head>
                <Head>Status</Head>
                <th className="bg-[#e1e2ec] px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="group text-epom-text">
                  <Cell>
                    <a
                      href={`/audience/edit/${row.id}`}
                      className="inline-flex font-semibold leading-[18px] text-epom-primary underline hover:text-epom-primary-hover"
                    >
                      {row.name}
                    </a>
                  </Cell>
                  <Cell>{linkedCampaignNames(row)}</Cell>
                  <Cell>{row.created}</Cell>
                  <Cell>{row.edited}</Cell>
                  <Cell>
                    <span
                      className={cn(
                        "flex items-center whitespace-nowrap",
                        row.status === "Active" ? "text-epom-success" : "text-epom-muted",
                      )}
                    >
                      <MaterialIcon name="circle" filled className="mr-1 block text-[10px] leading-none" />
                      {row.status}
                    </span>
                  </Cell>
                  <td className="px-4 py-4 text-right align-middle transition-colors group-hover:bg-[#fafafa]">
                    <ul className="flex h-[18px] items-center justify-end">
                      <RowAction
                        icon="edit"
                        label="Edit"
                        onClick={() => {
                          window.location.href = `/audience/edit/${row.id}`;
                        }}
                      />
                      <RowAction icon="content_copy" label="Clone" onClick={() => clone(row)} />
                      <RowAction
                        icon={row.status === "Active" ? "archive" : "unarchive"}
                        label={row.status === "Active" ? "Archive" : "Restore"}
                        onClick={() =>
                          update(row.id, {
                            status: row.status === "Active" ? "Archived" : "Active",
                            edited: today(),
                          })
                        }
                      />
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="border-t border-epom-border py-8 text-center text-[12px] leading-[18px] text-epom-muted">
              No available data to show.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between pr-4">
          <div className="flex items-start gap-2">
            <span className="flex h-9 items-center whitespace-nowrap text-[12px] leading-[18px] text-epom-muted">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === "size" ? null : "size")}
                aria-expanded={open === "size"}
                className="flex h-9 items-center gap-1 rounded border border-epom-primary px-2 py-[7.5px] text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
              >
                {pageSize}
                <MaterialIcon name="arrow_drop_down" className="block text-[20px] leading-5" />
              </button>

              {open === "size" && (
                <div className="absolute bottom-10 left-0 z-[999] w-[72px] rounded bg-epom-surface py-1 shadow-epom-dropdown">
                  {PAGE_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setPageSize(Number(s));
                        setPage(1);
                        setOpen(null);
                      }}
                      className={cn(
                        "block h-[34px] w-full px-3 text-left text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8",
                        Number(s) === pageSize && "bg-epom-primary-16 font-semibold",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pageCount > 1 && (
            <nav className="flex items-center gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-8 min-w-8 rounded px-2 text-[12px] leading-[18px] transition-colors hover:bg-epom-primary-8",
                    p === current ? "bg-epom-primary-16 font-semibold text-epom-primary" : "text-epom-text",
                  )}
                >
                  {p}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text">
      {children}
    </th>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="max-w-[600px] break-words px-4 py-4 text-[12px] font-normal leading-[18px] transition-colors group-hover:bg-[#fafafa]">
      {children}
    </td>
  );
}

function RowAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <li className="ml-3 first:ml-0">
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-full text-epom-muted transition-colors hover:bg-[#fafafa] hover:text-epom-primary group-hover:text-epom-link"
      >
        <MaterialIcon name={icon} className="block text-[20px] leading-5" />
      </button>
    </li>
  );
}
