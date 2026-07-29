"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { FoldersPanel } from "@/components/FoldersPanel";
import {
  CAMPAIGN_FILTER_DEFAULTS,
  CampaignFilters,
  type CampaignFilterValue,
} from "@/components/CampaignFilters";
import { ExploreTile } from "@/components/ExploreTile";
import { MaterialIcon } from "@/components/MaterialIcon";
import { SortLabel, type Sort } from "@/components/SortLabel";
import { CAMPAIGNS as SOURCE_CAMPAIGNS } from "@/lib/campaigns";
import { CREATIVE_DOT, STATS, type CreativeStatus } from "@/lib/campaign-stats";
import { CreativePreview } from "@/components/CreativePreview";

interface Creative {
  name: string;
  /** Path under `public/creatives`, or empty when the asset was never uploaded. */
  src: string;
  video: boolean;
  on: boolean;
  size: string;
  price: string;
  /** Drives the round status dot in the first creatives column. */
  status: CreativeStatus;
  archived?: boolean;
}

/** `.budget` cell: the delivering/scheduled budget lines plus its status dot. */
interface Budget {
  lines: string[];
  status: string;
  state: "delivering" | "scheduled" | "paused" | "stopped";
}

interface Campaign {
  id: string;
  name: string;
  /** Folder the campaign is filed under, shown in the folders panel. */
  folder: string;
  on: boolean;
  mediaType: string;
  mediaIcon: string;
  pricing: string;
  budget: Budget | null;
  ecpm: string;
  winRate: string;
  created: string;
  archived?: boolean;
  creatives: Creative[];
}

/**
 * The account's newest campaign, saved from the wizard and not delivering yet, so
 * it has nothing to report. Kept verbatim from the live account.
 */
const DRAFT_CAMPAIGN: Campaign = {
  id: "dadb539e-a65a-45bf-8764-ffc55d87506d",
  name: "weigh loss",
  folder: "Unsorted",
  on: true,
  mediaType: "Video",
  mediaIcon: "smart_display",
  pricing: "CPM",
  budget: {
    lines: ["$100 per day", "10,000 Impressions per day"],
    status: "Scheduled (4 days left)",
    state: "scheduled",
  },
  ecpm: "-",
  winRate: "-",
  created: "28/07/26",
  creatives: [
    {
      name: "home fitness 2.mp4",
      src: "/creatives/home-fitness/4_3-16NPI3.mp4",
      video: true,
      on: true,
      size: "1920x1440",
      price: "$0.03",
      status: "pending_approval",
    },
  ],
};

const int = (n: number) => n.toLocaleString("en-US");

/** The campaigns that have run, newest first, with the unstarted draft on top. */
const CAMPAIGNS: Campaign[] = [
  DRAFT_CAMPAIGN,
  ...[...SOURCE_CAMPAIGNS]
    .sort((a, b) => b.from.localeCompare(a.from))
    .map((c): Campaign => {
      const s = STATS.get(c.id)!;
      const delivering = s.state === "delivering";
      return {
        id: c.id,
        name: c.name,
        folder: c.productLabel,
        // A campaign past the end of its flight is switched off.
        on: delivering,
        mediaType: "Video",
        mediaIcon: "smart_display",
        pricing: "CPM",
        budget: {
          lines: [`$${s.spendLimit} per day`, `${int(s.impressionLimit)} Impressions per day`],
          status: s.status,
          state: s.state,
        },
        ecpm: s.ecpm,
        winRate: s.winRate,
        created: s.created,
        creatives: c.creatives.map((k) => ({
          name: k.name,
          src: k.src,
          video: k.video,
          on: delivering,
          size: k.size,
          price: k.price,
          status: delivering ? "active" : "paused",
        })),
      };
    }),
];

/** Column widths come straight from `.campaigns-table .col-*`. */
const COLUMNS = [
  { key: "status", label: "Status", width: "flex-[0_0_120px]" },
  { key: "mediaType", label: "Media type", width: "flex-[0_0_100px]" },
  { key: "pricing", label: "Pricing", width: "flex-[0_0_75px]" },
  {
    key: "budget",
    label: "Budget delivery",
    width: "flex-[0_0_200px]",
    info: "The delivering budget currently in flight. If no delivering budget, shows the first scheduled one.",
  },
  { key: "ecpm", label: "eCPM / eCPC", width: "flex-[0_0_130px]", info: "Value for the last week" },
  { key: "winRate", label: "Win rate", width: "flex-[0_0_110px]", info: "Value for the last week" },
  { key: "created", label: "Creation date", width: "flex-[0_0_110px]" },
];

const PAGE_SIZES = ["10", "25", "50", "100"];

export function CampaignsListView() {
  const [foldersCollapsed, setFoldersCollapsed] = useState(false);
  const [rows, setRows] = useState(CAMPAIGNS);
  const [filters, setFilters] = useState<CampaignFilterValue>(CAMPAIGN_FILTER_DEFAULTS);
  const [expanded, setExpanded] = useState<string[]>([CAMPAIGNS[0].id]);
  const [sort, setSort] = useState<Sort | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [preview, setPreview] = useState<Creative | null>(null);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = rows.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (filters.status === "Archived") return !!c.archived;
      if (c.archived) return false;
      if (filters.status === "Active") return c.on;
      if (filters.status === "Inactive") return !c.on;
      return true;
    });
    if (!sort) return list;
    const cell = (c: Campaign) =>
      sort.key === "name"
        ? c.name.toLowerCase()
        : sort.key === "status"
          ? String(c.on)
          : String(c[sort.key as keyof Campaign] ?? "");
    return [...list].sort(
      (a, b) => cell(a).localeCompare(cell(b), undefined, { numeric: true }) * (sort.asc ? 1 : -1),
    );
  }, [rows, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const shown = filtered.slice((current - 1) * pageSize, current * pageSize);

  const patch = (id: string, next: Partial<Campaign>) =>
    setRows((rs) => rs.map((c) => (c.id === id ? { ...c, ...next } : c)));

  const patchCreative = (id: string, name: string, next: Partial<Creative>) =>
    setRows((rs) =>
      rs.map((c) =>
        c.id === id
          ? { ...c, creatives: c.creatives.map((k) => (k.name === name ? { ...k, ...next } : k)) }
          : c,
      ),
    );

  const clone = (c: Campaign) =>
    setRows((rs) => [...rs, { ...c, id: crypto.randomUUID(), name: `${c.name} (copy)` }]);

  const active = rows.filter((c) => !c.archived);
  const activeCount = active.length;
  // One entry per folder that still has a campaign in it, in first-seen order.
  const folders = [...new Set(active.map((c) => c.folder))].map((name) => ({
    name,
    count: active.filter((c) => c.folder === name).length,
  }));

  return (
    <AppShell activeHref="/campaigns" breadcrumbs={[{ label: "Campaigns" }]}>
      {/* Grid column 1 is the folders panel; the transition drives the collapse. */}
      <div
        className="grid gap-8 transition-[grid-template-columns] duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateColumns: `${foldersCollapsed ? 51 : 233}px 1fr` }}
      >
        <FoldersPanel
          collapsed={foldersCollapsed}
          onToggle={() => setFoldersCollapsed((v) => !v)}
          allCount={activeCount}
          folders={folders}
        />

        {/* .main cancels the wrapper padding and re-applies its own. */}
        <div className="-m-8 overflow-auto p-8">
          <div className="flex h-9 items-center pb-4">
            <h1 className="text-[20px] font-bold leading-6 text-epom-text">All campaigns</h1>
            <button
              type="button"
              title="More actions"
              aria-label="More actions"
              // Inert until a folder is selected on the live site, hence the 0.5 opacity.
              className="ml-2 flex h-[22px] w-8 items-center justify-center px-1.5 py-px text-epom-primary opacity-50"
            >
              <MaterialIcon name="more_horiz" className="block text-[16px] leading-5" />
            </button>
            <a
              href="https://help.dsp.epom.com/docs/campaigns"
              target="_blank"
              rel="noreferrer"
              title="Learn about Campaigns"
              aria-label="Learn about Campaigns"
              className="ml-2 flex h-5 w-5 text-epom-primary transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
            >
              <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
            </a>

            <a
              href="/campaigns/new/creative-type"
              className="ml-auto flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
            >
              <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
              Create new Campaign
            </a>
          </div>

          <CampaignFilters value={filters} onChange={setFilters} />

          {shown.length === 0 ? (
            <ExploreTile
              heading="Get started by creating your first Campaign"
              description="Start by creating your first Campaign to launch ads."
              image="/images/explore/campaign.svg"
              imageWidth={104}
              imageHeight={65}
            >
              <a
                href="/campaigns/new/creative-type"
                className="flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
              >
                <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
                Create new Campaign
              </a>
              <a
                href="https://help.dsp.epom.com/docs/campaigns"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center rounded border border-epom-primary px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
              >
                View guide
              </a>
            </ExploreTile>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden rounded border border-epom-border bg-epom-surface text-[12px] leading-[1.5]">
              <div className="flex rounded-t-[3px] bg-[#e1e2ec] font-semibold">
                <div className="flex h-[34px] flex-[0_0_250px] items-center">
                  <div className="flex min-h-[34px] items-center">
                    <button
                      type="button"
                      title="Table configuration"
                      aria-label="Table configuration"
                      className="ml-4 mr-1.5 flex text-epom-primary"
                    >
                      <MaterialIcon name="settings" className="block text-[16px] leading-4" />
                    </button>
                    <SortLabel label="Campaign" sortKey="name" sort={sort} setSort={setSort} />
                  </div>
                </div>

                {COLUMNS.map((c) => (
                  <div
                    key={c.key}
                    className={cn("flex h-[34px] items-center px-2", c.width)}
                  >
                    {c.info && (
                      <button
                        type="button"
                        title={c.info}
                        aria-label={c.info}
                        className="mr-1.5 flex text-epom-muted"
                      >
                        <MaterialIcon name="info" className="block text-[16px] leading-4" />
                      </button>
                    )}
                    <SortLabel label={c.label} sortKey={c.key} sort={sort} setSort={setSort} />
                  </div>
                ))}

                <div className="flex h-[34px] flex-[1_0_185px] items-center justify-end px-2" />
              </div>

              <div>
                {shown.map((c) => {
                  const isOpen = expanded.includes(c.id);
                  return (
                    <div key={c.id} className="group/row overflow-y-clip bg-epom-surface">
                      <div className="relative w-max min-w-full">
                        <div className="absolute inset-0 -right-[3000px] bg-black/[0.04] opacity-0 transition-opacity duration-200 group-hover/row:opacity-100" />
                        <div className="relative z-[3] flex pb-3">
                          <div className="flex flex-[0_0_250px] items-start pt-4">
                            <div className="grid grid-cols-[32px_1fr] gap-2.5 pl-2.5">
                              <button
                                type="button"
                                title={isOpen ? "Hide creative details" : "Show creative details"}
                                aria-label={isOpen ? "Hide creative details" : "Show creative details"}
                                onClick={() =>
                                  setExpanded((e) =>
                                    isOpen ? e.filter((x) => x !== c.id) : [...e, c.id],
                                  )
                                }
                                className="-mt-1 flex text-epom-muted"
                              >
                                <MaterialIcon
                                  name="keyboard_arrow_right"
                                  className={cn(
                                    "block text-[20px] leading-5 transition-transform duration-200",
                                    isOpen && "rotate-90",
                                  )}
                                />
                              </button>
                              <div className="-mt-0.5 flex flex-col gap-1">
                                <div className="break-words text-[14px] font-semibold leading-[1.5]">
                                  <a
                                    href={`/campaigns/edit/${c.id}`}
                                    className="text-epom-primary underline hover:text-epom-primary-hover"
                                  >
                                    {c.name}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Cell width="flex-[0_0_120px]">
                            <Toggle
                              on={c.on}
                              label={c.on ? "On" : "Off"}
                              onToggle={() => patch(c.id, { on: !c.on })}
                            />
                          </Cell>
                          <Cell width="flex-[0_0_100px]">
                            <span className="flex h-[18px] items-center gap-1">
                              <MaterialIcon
                                name={c.mediaIcon}
                                className="block text-[16px] leading-4"
                              />
                              {c.mediaType}
                            </span>
                          </Cell>
                          <Cell width="flex-[0_0_75px]">{c.pricing}</Cell>
                          <Cell width="flex-[0_0_200px]">
                            {c.budget ? <BudgetCell {...c.budget} /> : "-"}
                          </Cell>
                          <Cell width="flex-[0_0_130px]">{c.ecpm}</Cell>
                          <Cell width="flex-[0_0_110px]">{c.winRate}</Cell>
                          <Cell width="flex-[0_0_110px]">{c.created}</Cell>

                          <div className="flex flex-[1_0_185px] items-start justify-end px-2 pt-4 text-right">
                            <ul className="flex items-center gap-3">
                              <Action
                                icon="arrow_forward"
                                label="View campaign"
                                href={`/campaigns/edit/${c.id}`}
                              />
                              <Action icon="assessment" label="Show Analytics" href="/analytics" />
                              <Action icon="content_copy" label="Copy" onClick={() => clone(c)} />
                              <Action
                                icon={c.archived ? "unarchive" : "archive"}
                                label={c.archived ? "Restore" : "Archive"}
                                onClick={() => patch(c.id, { archived: !c.archived })}
                              />
                            </ul>
                          </div>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="relative pb-4 pl-[52px] pr-4">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="h-[34px]">
                                <th className="w-12 rounded-l bg-[#e1e2ec] pl-2 text-left align-middle text-[12px] font-semibold leading-[1.5] text-epom-text">
                                  <button
                                    type="button"
                                    title="Filter creatives"
                                    aria-label="Filter creatives"
                                    className="flex text-epom-muted"
                                  >
                                    <MaterialIcon
                                      name="filter_list"
                                      className="block text-[20px] leading-5"
                                    />
                                  </button>
                                </th>
                                {["Creatives", "Status", "Size", "Price"].map((h) => (
                                  <th
                                    key={h}
                                    className="bg-[#e1e2ec] px-4 text-left align-middle text-[12px] font-semibold leading-[1.5] text-epom-text"
                                  >
                                    {h}
                                  </th>
                                ))}
                                <th className="rounded-r bg-[#e1e2ec] pr-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {c.creatives
                                .filter((k) => !k.archived)
                                .map((k) => (
                                  <tr key={k.name} className="h-[52px] border-b border-black/[0.12]">
                                    <td className="w-12 pl-2 align-middle">
                                      <span className="flex justify-center">
                                        <i
                                          className={cn(
                                            "block h-4 w-4 rounded-full",
                                            CREATIVE_DOT[k.status],
                                          )}
                                        />
                                      </span>
                                    </td>
                                    <td className="px-4 align-middle">
                                      <div className="flex min-w-[140px] items-center justify-between gap-2 font-semibold">
                                        <a
                                          href="#"
                                          className="max-w-[200px] break-words text-epom-primary underline hover:text-epom-primary-hover"
                                        >
                                          {k.name}
                                        </a>
                                        <button
                                          type="button"
                                          title="Preview creative"
                                          aria-label="Preview creative"
                                          onClick={() => setPreview(k)}
                                          className="flex text-epom-muted transition-colors hover:text-epom-primary"
                                        >
                                          <MaterialIcon
                                            name="remove_red_eye"
                                            className="block text-[20px] leading-5"
                                          />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 align-middle">
                                      <Toggle
                                        on={k.on}
                                        label={k.on ? "On" : "Off"}
                                        onToggle={() => patchCreative(c.id, k.name, { on: !k.on })}
                                      />
                                    </td>
                                    <td className="px-4 align-middle">{k.size}</td>
                                    <td className="px-4 align-middle">{k.price}</td>
                                    <td className="pr-2 align-middle">
                                      <div className="flex items-center justify-end gap-3">
                                        <Action icon="mode_edit_outline" label="Edit creative" />
                                        <Action icon="content_copy" label="Copy creative" />
                                        <Action
                                          icon="archive"
                                          label="Archive creative"
                                          onClick={() =>
                                            patchCreative(c.id, k.name, { archived: true })
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          <a
                            href="/campaigns/new/creative-type"
                            className="mt-1 flex items-center gap-1 text-[14px] font-semibold leading-[21px] text-epom-primary hover:text-epom-primary-hover"
                          >
                            <MaterialIcon
                              name="add_circle_outline"
                              className="block text-[16px] leading-4"
                            />
                            Add new Creative
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-end justify-between">
            <div className="flex items-start gap-2">
              <span className="flex h-9 items-center whitespace-nowrap text-[12px] leading-[18px] text-epom-muted">
                {filtered.length} items
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSizeOpen((v) => !v)}
                  aria-expanded={sizeOpen}
                  className="flex h-9 items-center gap-1 rounded border border-epom-primary px-2 py-[7.5px] text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
                >
                  {pageSize}
                  <MaterialIcon name="arrow_drop_down" className="block text-[20px] leading-5" />
                </button>

                {sizeOpen && (
                  <div className="absolute bottom-10 left-0 z-[999] w-[72px] rounded bg-epom-surface py-1 shadow-epom-dropdown">
                    {PAGE_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setPageSize(Number(s));
                          setPage(1);
                          setSizeOpen(false);
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
                      p === current
                        ? "bg-epom-primary-16 font-semibold text-epom-primary"
                        : "text-epom-text",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>

      {preview && <CreativePreview creative={preview} onClose={() => setPreview(null)} />}
    </AppShell>
  );
}

const BUDGET_DOT: Record<Budget["state"], string> = {
  delivering: "bg-[#006d3e] text-[#006d3e]",
  scheduled: "bg-[#005bc0] text-[#005bc0]",
  paused: "bg-epom-muted text-epom-muted",
  stopped: "bg-epom-muted text-epom-muted",
};

function BudgetCell({ lines, status, state }: Budget) {
  return (
    <div>
      {lines.map((l) => (
        <div key={l} className="font-semibold">
          {l}
        </div>
      ))}
      {/* 8px dot pinned 1px from the left, vertically centred on the line. */}
      <span className={cn("relative block pl-[15px]", BUDGET_DOT[state].split(" ")[1])}>
        <span
          className={cn(
            "absolute left-px top-1/2 block h-2 w-2 -translate-y-1/2 rounded-full",
            BUDGET_DOT[state].split(" ")[0],
          )}
        />
        {status}
      </span>
    </div>
  );
}

function Cell({ width, children }: { width: string; children: React.ReactNode }) {
  return <div className={cn("flex items-start px-2 pt-4", width)}>{children}</div>;
}

/** `mat-slide-toggle` — 36×20 bar with a 16px thumb and the On/Off caption. */
function Toggle({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <label className="flex cursor-pointer items-center">
      <input type="checkbox" role="switch" checked={on} onChange={onToggle} className="sr-only" />
      <span
        className={cn(
          "relative mr-2 h-5 w-9 rounded-full transition-colors",
          on ? "bg-epom-primary" : "bg-epom-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 block h-4 w-4 rounded-full bg-white transition-transform",
            on ? "translate-x-[17px]" : "translate-x-1",
          )}
        />
      </span>
      <span className="flex min-w-4 items-center gap-0.5 text-[12px] text-epom-text">{label}</span>
    </label>
  );
}

function Action({
  icon,
  label,
  href,
  onClick,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex text-epom-muted transition-colors hover:text-epom-primary";
  const content = <MaterialIcon name={icon} className="block text-[20px] leading-5" />;
  return (
    <li className="flex list-none">
      {href ? (
        <a href={href} title={label} aria-label={label} className={className}>
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} title={label} aria-label={label} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}
