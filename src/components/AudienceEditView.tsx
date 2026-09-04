"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BTN_OUTLINED, BTN_PRIMARY, Dialog } from "@/components/form/Dialog";
import { VALUE_ICONS, type AudienceTargeting } from "@/lib/audiences";

type Mode = "Include" | "Exclude";

/** Every picker button on the page, with the option list its modal shows. */
const OPTIONS = {
  segments: [
    "Auto Intenders",
    "Business Decision Makers",
    "Frequent Travelers",
    "Gamers",
    "Health & Fitness Enthusiasts",
    "Luxury Shoppers",
    "Parents",
    "Sports Fans",
  ],
  geo: [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Canada",
    "Australia",
    "Japan",
    "Brazil",
    "India",
    "Vietnam",
  ],
  // The account has no custom locations yet, so this picker is empty.
  customLocations: [],
  os: ["Windows", "Linux", "macOS", "Android", "iOS"],
  browser: ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Samsung Internet"],
  languages: ["English", "Spanish", "German", "French", "Portuguese", "Japanese", "Chinese", "Vietnamese"],
  schedule: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  carriers: ["AT&T", "T-Mobile", "Verizon", "Vodafone", "Orange", "Telefonica"],
  proxy: ["Residential", "Datacenter", "Mobile", "VPN", "TOR"],
  isp: ["Comcast", "AT&T Internet", "Deutsche Telekom", "Orange", "BT"],
  taxonomies: [
    "Arts & Entertainment",
    "Automotive",
    "Business",
    "Education",
    "Health & Fitness",
    "News",
    "Sports",
    "Technology & Computing",
    "Travel",
  ],
  retargeting: [],
  stores: ["App Store", "Google Play", "Amazon Appstore", "Roku Channel Store", "Samsung Galaxy Store"],
  storeCategories: [
    "Books",
    "Business",
    "Education",
    "Entertainment",
    "Games",
    "Health & Fitness",
    "Lifestyle",
    "Music",
    "News",
    "Sports",
    "Travel",
  ],
} satisfies Record<string, string[]>;

type FieldKey = keyof typeof OPTIONS;

/** Button caption plus the placeholder the live app shows for an empty selection. */
const FIELDS: Record<FieldKey, { title: string; button: string; empty: string }> = {
  segments: { title: "Targeting Segments", button: "Select Targeting Segments", empty: "0" },
  geo: { title: "Geo Position", button: "Select Geo Position", empty: "Any" },
  customLocations: { title: "Custom Locations", button: "Select Custom Location", empty: "Any" },
  os: { title: "Operation Systems", button: "Select Operation Systems", empty: "Any" },
  browser: { title: "Browsers", button: "Select Browsers", empty: "Any" },
  languages: { title: "Languages", button: "Select Language", empty: "Any" },
  schedule: { title: "Day and Time Schedule", button: "Select Day and Time Schedule", empty: "Any" },
  carriers: { title: "Carriers", button: "Select Carrier", empty: "0" },
  proxy: { title: "Proxy type", button: "Proxy type", empty: "0" },
  isp: { title: "ISP", button: "Select ISP", empty: "0" },
  taxonomies: { title: "Taxonomies", button: "Select Taxonomies", empty: "0" },
  retargeting: { title: "Retargeting Lists", button: "Select Retargeting Lists", empty: "0" },
  stores: { title: "Stores", button: "Select Stores", empty: "0" },
  storeCategories: { title: "App Store Categories", button: "Select App Store Categories", empty: "0" },
};

/** Selections carried by this audience on the live account. */
const INITIAL: Record<FieldKey, string[]> = {
  segments: [],
  geo: [],
  customLocations: [],
  os: ["macOS", "iOS"],
  browser: ["Chrome", "Safari"],
  languages: [],
  schedule: [],
  carriers: [],
  proxy: [],
  isp: [],
  taxonomies: [],
  retargeting: [],
  stores: ["App Store"],
  storeCategories: ["Health & Fitness"],
};

const MODE_FIELDS = ["os", "browser", "storeCategories"] as const;
type ModeField = (typeof MODE_FIELDS)[number];

const DEVICE_TYPES = ["Desktop", "Mobile", "Tablet", "Connected TV", "Connected Device", "Set Top Box"];
const CONNECTION_TYPES = ["Any", "Ethernet", "WIFI", "Carrier"];
const TRAFFIC_TYPES = ["Any", "Websites", "Mobile Apps"];

/**
 * OS and browser use the three-column picker — each target carries an optional
 * version constraint. Every other field uses the plain checklist.
 */
const VERSION_FIELDS: Partial<Record<FieldKey, string>> = {
  os: "Specify the OS versions to target. If none are selected, all versions will be included.",
  browser:
    "Specify the browser versions to target. If none are selected, all versions will be included.",
};

const CONDITIONS = ["=> this or newer", "<= this or older", "= exactly this"];

interface VersionRule {
  condition: string;
  version: string;
}

/** Where each selection lands in the right-hand summary, in render order. */
const RAIL: { key: string; section: string; block: string; label: string; inline?: boolean }[] = [
  { key: "segments", section: "Targeting options", block: "Third-party Segments", label: "Segments:" },
  { key: "geo", section: "Targeting options", block: "Geo", label: "Geo position:" },
  { key: "customLocations", section: "Targeting options", block: "Geo", label: "Custom Locations:" },
  { key: "trafficType", section: "Targeting options", block: "Traffic environment", label: "Traffic Type:", inline: true },
  { key: "deviceTypes", section: "Targeting options", block: "Device", label: "Device Type:" },
  { key: "os", section: "Targeting options", block: "Device", label: "Operation System:" },
  { key: "browser", section: "Targeting options", block: "Device", label: "Browser:" },
  { key: "languages", section: "Targeting options", block: "Device", label: "Language:" },
  { key: "schedule", section: "Targeting options", block: "Device", label: "Day and Time Schedule:" },
  { key: "connectionTypes", section: "Targeting options", block: "Connection", label: "Connection Type:" },
  { key: "carriers", section: "Targeting options", block: "Connection", label: "Carrier:" },
  { key: "proxy", section: "Targeting options", block: "Connection", label: "Proxy type:" },
  { key: "isp", section: "Targeting options", block: "Connection", label: "ISP:" },
  { key: "taxonomies", section: "Targeting options", block: "Content Categories", label: "Categories:" },
  { key: "retargeting", section: "Retargeting", block: "Retargeting Lists", label: "Lists:" },
  { key: "stores", section: "Advanced settings", block: "Stores", label: "Stores:", inline: true },
  { key: "storeCategories", section: "Advanced settings", block: "Stores", label: "App Store Categories:" },
];

interface RailEntry {
  label: string;
  values: string[];
  mode?: Mode;
  inline?: boolean;
}

interface LinkedCampaign {
  id: string;
  name: string;
}

export function AudienceEditView({
  name: initialName,
  targeting,
  linked = [],
}: {
  name: string;
  /** What this audience was set up to target. */
  targeting: AudienceTargeting;
  /** Campaigns pointing at this audience — all stopped, so all "inactive". */
  linked?: LinkedCampaign[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [renaming, setRenaming] = useState(false);
  const [sel, setSel] = useState({
    ...INITIAL,
    os: targeting.os,
    browser: targeting.browsers,
    stores: targeting.stores,
    storeCategories: targeting.storeCategories,
  });
  const [modes, setModes] = useState<Record<ModeField, Mode>>({
    os: "Include",
    browser: "Include",
    storeCategories: "Include",
  });
  const [trafficType, setTrafficType] = useState("Any");
  const [deviceTypes, setDeviceTypes] = useState<string[]>(targeting.deviceTypes);
  const [connectionTypes, setConnectionTypes] = useState<string[]>(targeting.connectionTypes);
  const [openBlock, setOpenBlock] = useState<Record<string, boolean>>({});
  const [picker, setPicker] = useState<FieldKey | null>(null);
  const [rules, setRules] = useState<Record<string, VersionRule>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const values: Record<string, string[]> = {
    ...sel,
    deviceTypes,
    connectionTypes,
    trafficType: trafficType === "Any" ? [] : [trafficType],
  };

  // Only non-empty selections reach the summary, matching the live rail.
  const sections: { heading: string; blocks: { title: string; entries: RailEntry[] }[] }[] = [];
  for (const r of RAIL) {
    const v = values[r.key];
    if (!v?.length) continue;
    let section = sections.find((s) => s.heading === r.section);
    if (!section) sections.push((section = { heading: r.section, blocks: [] }));
    let block = section.blocks.find((b) => b.title === r.block);
    if (!block) section.blocks.push((block = { title: r.block, entries: [] }));
    block.entries.push({
      label: r.label,
      values: v,
      inline: r.inline,
      mode: MODE_FIELDS.includes(r.key as ModeField) ? modes[r.key as ModeField] : undefined,
    });
  }

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const toggleConnection = (v: string) =>
    setConnectionTypes((c) =>
      // "Any" is exclusive with the concrete connection types.
      v === "Any" ? (c.includes("Any") ? [] : ["Any"]) : toggle(c, v).filter((x) => x !== "Any"),
    );

  return (
    <AppShell
      activeHref="/audience"
      breadcrumbs={[{ label: "Audience", href: "/audience" }, { label: name }]}
      rightRail={<SummaryRail sections={sections} linked={linked} />}
    >
      <div className="max-w-[calc(100%-270px)]">
        <section className="mb-6 flex h-9 items-center gap-2 text-[20px] font-bold leading-6 text-epom-text">
          {renaming ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
              className="h-9 w-[320px] rounded border border-epom-primary px-3 text-[20px] font-bold leading-6 text-epom-text outline-none"
            />
          ) : (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</div>
          )}
          <button
            type="button"
            title="Edit Title"
            aria-label="Edit Title"
            onClick={() => setRenaming(true)}
            className="flex h-5 w-5 items-center justify-center text-epom-primary transition-colors hover:text-epom-primary-hover"
          >
            <MaterialIcon name="edit" className="block text-[16px] leading-5" />
          </button>
        </section>

        <div className="rounded bg-epom-surface p-6">
          <div className="max-w-[720px]">
            <div className="text-[16px] font-bold leading-6 text-epom-text">Third-party Segments</div>
            <p className="mt-2 text-[12px] leading-[18px] text-epom-muted">
              Access predefined, high-quality audience groups created from behavioral, demographic, and
              interest data via Lotame DMP Segments. Include the highest selected segment cost in your bid
              price to stay competitive in the auction. Segments work only with CPM campaigns.
            </p>
            <SelectButton field="segments" sel={sel} onOpen={setPicker} className="mt-4" />
          </div>
        </div>

        <div className="mt-4 rounded bg-epom-surface p-6">
          <div className="max-w-[720px]">
            <h3 className="mb-8 text-[16px] font-bold leading-6 text-epom-text">Targeting</h3>

            <BlockHeader>Geo</BlockHeader>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Geo position</Label>
                <SelectButton field="geo" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>
              <div className="flex-1">
                <Label hint="Click to learn more">Custom Locations</Label>
                <SelectButton field="customLocations" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>
            </div>

            <div className="mt-8">
              <BlockHeader>Traffic environment</BlockHeader>
              <label className="mb-2 block text-[12px] font-semibold leading-[18px] text-epom-muted">
                Traffic Type
              </label>
              <div className="flex gap-3">
                {TRAFFIC_TYPES.map((t) => (
                  <RadioButton
                    key={t}
                    name="trafficType"
                    label={t}
                    checked={trafficType === t}
                    onChange={() => setTrafficType(t)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <BlockHeader>Device</BlockHeader>
              <Label>Device Type</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {DEVICE_TYPES.map((d) => (
                  <CheckButton
                    key={d}
                    label={d}
                    checked={deviceTypes.includes(d)}
                    onChange={() => setDeviceTypes((v) => toggle(v, d))}
                  />
                ))}
              </div>

              <div className="mt-4">
                <Label>Operation System</Label>
                <div className="mt-2 flex gap-2">
                  <IncludeExclude
                    mode={modes.os}
                    onChange={(m) => setModes((v) => ({ ...v, os: m }))}
                  />
                  <SelectButton field="os" sel={sel} onOpen={setPicker} />
                </div>
              </div>

              <div className="mt-4">
                <Label>Browser</Label>
                <div className="mt-2 flex gap-2">
                  <IncludeExclude
                    mode={modes.browser}
                    onChange={(m) => setModes((v) => ({ ...v, browser: m }))}
                  />
                  <SelectButton field="browser" sel={sel} onOpen={setPicker} />
                </div>
              </div>

              <div className="mt-4">
                <Label hint="Click to learn more">Language</Label>
                <SelectButton field="languages" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>

              <div className="mt-4">
                <BlockHeader>Date and time</BlockHeader>
                <SelectButton field="schedule" sel={sel} onOpen={setPicker} />
              </div>
            </div>

            <h4 className="mb-4 mt-8 text-[14px] font-bold leading-[21px] text-epom-text">Connection</h4>
            <label className="mb-2 block text-[12px] font-semibold leading-[18px] text-epom-muted">
              Connection Type
            </label>
            <div className="flex gap-3">
              {CONNECTION_TYPES.map((c) => (
                <CheckButton
                  key={c}
                  label={c}
                  className="flex-1"
                  checked={connectionTypes.includes(c)}
                  onChange={() => toggleConnection(c)}
                />
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <Label>Carrier</Label>
                <SelectButton field="carriers" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>
              <div className="flex-1">
                <Label>Proxy type</Label>
                <SelectButton field="proxy" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <Label>ISP</Label>
                <SelectButton field="isp" sel={sel} onOpen={setPicker} className="mt-2" />
              </div>
            </div>

            <div className="mt-8">
              <BlockHeader>Content Categories</BlockHeader>
              <SelectButton field="taxonomies" sel={sel} onOpen={setPicker} />
            </div>
          </div>
        </div>

        <Accordion
          title="Retargeting"
          helpHref="https://help.dsp.epom.com/docs/retargeting"
          open={!!openBlock.retargeting}
          onToggle={() => setOpenBlock((v) => ({ ...v, retargeting: !v.retargeting }))}
        >
          <div className="max-w-[720px]">
            <Label>Retargeting Lists</Label>
            <SelectButton field="retargeting" sel={sel} onOpen={setPicker} className="mt-2" />
          </div>
        </Accordion>

        <Accordion
          title="Advanced settings"
          open={!!openBlock.advanced}
          onToggle={() => setOpenBlock((v) => ({ ...v, advanced: !v.advanced }))}
        >
          <div className="max-w-[720px]">
            <Label>Stores</Label>
            <SelectButton field="stores" sel={sel} onOpen={setPicker} className="mt-2" />
            <div className="mt-4">
              <Label>App Store Categories</Label>
              <div className="mt-2 flex gap-2">
                <IncludeExclude
                  mode={modes.storeCategories}
                  onChange={(m) => setModes((v) => ({ ...v, storeCategories: m }))}
                />
                <SelectButton field="storeCategories" sel={sel} onOpen={setPicker} />
              </div>
            </div>
          </div>
        </Accordion>

        <div className="mt-4 flex justify-end gap-4">
          <button type="button" onClick={() => router.push("/audience")} className={BTN_OUTLINED}>
            Cancel
          </button>
          <button type="button" onClick={() => setToast("Audience has been saved.")} className={BTN_PRIMARY}>
            Save
          </button>
          <button type="button" onClick={() => router.push("/audience")} className={BTN_PRIMARY}>
            Save &amp; Exit
          </button>
        </div>
      </div>

      {picker &&
        (VERSION_FIELDS[picker] ? (
          <TargetModal
            title={`Select ${FIELDS[picker].title}`}
            description={VERSION_FIELDS[picker]}
            options={OPTIONS[picker]}
            value={sel[picker]}
            rules={rules}
            onCancel={() => setPicker(null)}
            onApply={(v, r) => {
              setSel((s) => ({ ...s, [picker]: v }));
              setRules(r);
              setPicker(null);
            }}
          />
        ) : (
          <SelectModal
            title={FIELDS[picker].title}
            options={OPTIONS[picker]}
            value={sel[picker]}
            onCancel={() => setPicker(null)}
            onApply={(v) => {
              setSel((s) => ({ ...s, [picker]: v }));
              setPicker(null);
            }}
          />
        ))}

      {toast && (
        <div className="fixed bottom-6 left-[264px] z-[1100] rounded bg-epom-toast px-4 py-3 text-[14px] leading-[21px] text-epom-toast-fg shadow-epom-dropdown">
          {toast}
        </div>
      )}
    </AppShell>
  );
}

function BlockHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">{children}</div>;
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-epom-muted">
      {children}
      {hint && (
        <span title={hint} className="flex h-4 w-4 items-center justify-center text-epom-muted">
          <MaterialIcon name="info" className="block text-[14px] leading-4" />
        </span>
      )}
    </label>
  );
}

/** Full-width outlined picker button; the caption carries the selection count. */
function SelectButton({
  field,
  sel,
  onOpen,
  className,
}: {
  field: FieldKey;
  sel: Record<FieldKey, string[]>;
  onOpen: (f: FieldKey) => void;
  className?: string;
}) {
  const { button, empty } = FIELDS[field];
  const count = sel[field].length;
  return (
    <button
      type="button"
      onClick={() => onOpen(field)}
      className={cn(BTN_OUTLINED, "w-full", className)}
    >
      {button} ({count || empty})
    </button>
  );
}

function CheckButton({
  label,
  checked,
  onChange,
  className,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  icon?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2 rounded border px-3 text-[14px] leading-[21px] transition-colors",
        checked
          ? "border-epom-primary bg-epom-primary-8 hover:bg-epom-primary-12"
          : "border-epom-border hover:bg-black/[0.04]",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-epom-primary"
      />
      {/* An empty string reserves the icon slot so labels stay aligned in a mixed list. */}
      {icon === "" ? (
        <span className="h-4 w-4" />
      ) : (
        icon && <Image src={icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
      )}
      {label}
    </label>
  );
}

function RadioButton({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex h-9 flex-1 cursor-pointer items-center rounded border pb-2 pl-9 pr-3 pt-[7px] text-[14px] leading-[21px] transition-colors",
        checked
          ? "border-epom-primary bg-epom-primary-8 hover:bg-epom-primary-12"
          : "border-epom-border hover:bg-black/[0.04]",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="absolute left-[9px] h-4 w-4 accent-epom-primary"
      />
      {label}
    </label>
  );
}

/** 202px segmented control — green when including, red when excluding. */
function IncludeExclude({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <section className="relative flex h-9 w-[202px] shrink-0 items-center justify-center rounded outline outline-1 outline-epom-border">
      <button
        type="button"
        onClick={() => onChange("Include")}
        className={cn(
          "flex h-9 w-full items-center justify-center rounded px-2 py-[7.5px] text-[14px] leading-[21px] transition-colors",
          mode === "Include"
            ? "bg-epom-success/12 text-epom-success outline outline-1 outline-epom-success"
            : "text-epom-text hover:bg-epom-success/12",
        )}
      >
        Include
      </button>
      <button
        type="button"
        onClick={() => onChange("Exclude")}
        className={cn(
          "flex h-9 w-full items-center justify-center rounded px-2 py-[7.5px] text-[14px] leading-[21px] transition-colors",
          mode === "Exclude"
            ? "bg-epom-error/12 text-epom-error outline outline-1 outline-epom-error"
            : "text-epom-text hover:bg-epom-error/12",
        )}
      >
        Exclude
      </button>
    </section>
  );
}

function Accordion({
  title,
  helpHref,
  open,
  onToggle,
  children,
}: {
  title: string;
  helpHref?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded bg-epom-surface p-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex items-center text-[16px] font-bold leading-6 text-epom-text transition-colors hover:text-epom-primary"
          >
            <MaterialIcon
              name={open ? "arrow_drop_down" : "arrow_right"}
              className="mr-2 block text-[20px] leading-6"
            />
            {title}
          </button>
          {helpHref && (
            <a
              href={helpHref}
              target="_blank"
              rel="noreferrer"
              title={`Learn about ${title}`}
              aria-label={`Learn about ${title}`}
              className="ml-2 flex h-5 w-5 items-center text-epom-primary transition-colors hover:text-epom-primary-hover"
            >
              <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
            </a>
          )}
        </div>
      </div>
      {open && <div className="mt-6">{children}</div>}
    </div>
  );
}

/** Target / Condition / Version picker used by Operation System and Browser. */
function TargetModal({
  title,
  description,
  options,
  value,
  rules,
  onCancel,
  onApply,
}: {
  title: string;
  description?: string;
  options: string[];
  value: string[];
  rules: Record<string, VersionRule>;
  onCancel: () => void;
  onApply: (value: string[], rules: Record<string, VersionRule>) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [draftRules, setDraftRules] = useState(rules);

  const ruleOf = (o: string) => draftRules[o] ?? { condition: CONDITIONS[0], version: "" };
  const setRule = (o: string, patch: Partial<VersionRule>) =>
    setDraftRules((r) => ({ ...r, [o]: { ...ruleOf(o), ...patch } }));

  return (
    <Dialog title={title} width="w-[712px]" onCancel={onCancel} onApply={() => onApply(draft, draftRules)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {description && <p className="text-[14px] leading-[21px] text-epom-body">{description}</p>}

        <div className="mt-6 grid grid-cols-[200px_232px_200px] gap-4">
          <div className="text-[12px] font-semibold leading-[18px] text-epom-muted">Target</div>
          <div className="text-[12px] font-semibold leading-[18px] text-epom-muted">Condition</div>
          <div className="text-[12px] font-semibold leading-[18px] text-epom-muted">Version</div>

          {options.map((o) => {
            const on = draft.includes(o);
            const rule = ruleOf(o);
            return (
              <Fragment key={o}>
                <CheckButton
                  label={o}
                  icon={VALUE_ICONS[o] ?? ""}
                  checked={on}
                  onChange={() =>
                    setDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]))
                  }
                />
                <div className="relative">
                  <select
                    value={rule.condition}
                    disabled={!on}
                    onChange={(e) => setRule(o, { condition: e.target.value })}
                    className={cn(
                      "h-9 w-full appearance-none rounded border border-epom-border bg-epom-surface pl-3 pr-9 text-[14px] leading-[21px]",
                      on ? "text-epom-text" : "cursor-not-allowed text-epom-muted",
                    )}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <MaterialIcon
                    name="arrow_drop_down"
                    className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Version"
                  disabled={!on}
                  value={rule.version}
                  onChange={(e) => setRule(o, { version: e.target.value })}
                  className="h-9 w-full rounded border border-epom-border px-3 text-[14px] leading-[21px] text-epom-text focus:border-epom-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-epom-surface"
                />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}

function SelectModal({
  title,
  options,
  value,
  onCancel,
  onApply,
}: {
  title: string;
  options: string[];
  value: string[];
  onCancel: () => void;
  onApply: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const visible = options.filter((o) => !q || o.toLowerCase().includes(q));

  return (
    <Dialog title={title} width="w-[560px]" onCancel={onCancel} onApply={() => onApply(draft)}>
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded border border-epom-border py-2 pl-3 pr-9 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
          />
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
          />
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="py-8 text-center text-[12px] leading-[18px] text-epom-muted">
              No available data to show.
            </div>
          ) : (
            visible.map((o) => (
              <label
                key={o}
                className="flex h-9 cursor-pointer items-center gap-2 rounded px-2 text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-black/[0.04]"
              >
                <input
                  type="checkbox"
                  checked={draft.includes(o)}
                  onChange={() =>
                    setDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]))
                  }
                  className="h-4 w-4 accent-epom-primary"
                />
                {o}
              </label>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}

function SummaryRail({
  sections,
  linked,
}: {
  sections: { heading: string; blocks: { title: string; entries: RailEntry[] }[] }[];
  linked: LinkedCampaign[];
}) {
  return (
    <aside className="fixed right-0 top-[57px] h-[calc(100vh-57px)] w-[270px] overflow-y-auto border-l border-[#e1e2ec] bg-epom-surface">
      <div className="px-6 pt-6 text-[16px] font-bold leading-6 text-epom-text">Summary</div>

      {linked.length > 0 && (
        <section className="p-6">
          <div className="text-[14px] font-semibold leading-[21px] text-epom-text">
            Linked campaigns
          </div>
          <div className="mt-5 text-[12px] leading-[18px] text-epom-muted">
            Linked inactive campaigns:
          </div>
          <div className="mt-2 flex flex-col">
            {linked.map((c) => (
              <a
                key={c.id}
                href={`/campaigns/edit/${c.id}?viewMode=true`}
                className="text-[12px] leading-[18px] text-epom-primary underline transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
              >
                {c.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section
          key={section.heading}
          className="p-6 [&+section]:border-t [&+section]:border-[#e1e2ec]"
        >
          <div className="text-[14px] font-semibold leading-[21px] text-epom-text">
            {section.heading}
          </div>

          {section.blocks.map((block) => (
            <div key={block.title} className="mt-5">
              <div className="text-[12px] font-semibold leading-[18px] text-epom-text">
                {block.title}
              </div>

              {block.entries.map((entry) =>
                entry.inline ? (
                  <div key={entry.label} className="mt-4">
                    <span className="mr-2 text-[12px] leading-[18px] text-epom-muted">
                      {entry.label}
                    </span>
                    <span className="text-[12px] leading-[18px] text-epom-text">
                      {entry.values.join(", ")}
                    </span>
                  </div>
                ) : (
                  <div key={entry.label} className="mt-4">
                    <div className="text-[12px] leading-[18px] text-epom-muted">{entry.label}</div>
                    {entry.mode && (
                      <div className="mt-2">
                        <span
                          className={cn(
                            "text-[12px] leading-[18px]",
                            entry.mode === "Include" ? "text-epom-success" : "text-epom-error",
                          )}
                        >
                          <span
                            className={cn(
                              "mb-[3px] mr-1 inline-block h-[10px] w-[10px] rounded-full align-middle",
                              entry.mode === "Include" ? "bg-epom-success" : "bg-epom-error",
                            )}
                          />
                          {entry.mode === "Include" ? "Included" : "Excluded"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col text-[12px] leading-[18px] text-epom-text">
                      {entry.values.map((v) => (
                        <div key={v} className="mt-1 flex items-center gap-1">
                          {VALUE_ICONS[v] && (
                            <Image
                              src={VALUE_ICONS[v]}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                            />
                          )}
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ))}
        </section>
      ))}
    </aside>
  );
}
