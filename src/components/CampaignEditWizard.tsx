"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { CampaignBudgetsStep } from "@/components/CampaignBudgetsStep";
import { CampaignEditSummaryRail } from "@/components/CampaignEditSummaryRail";
import { BTN_OUTLINED, BTN_OUTLINED_GREY, BTN_PRIMARY } from "@/components/form/Dialog";
import { saveBudget } from "@/app/actions";
import type { CampaignBudget } from "@/lib/records";

/**
 * The edit wizard's five steps — fewer, and named differently, than the create
 * flow. The ids are the live `?step=` values, camelCase and all.
 */
export const STEPS = [
  { id: "basic", label: "General" },
  { id: "audience", label: "Audience" },
  { id: "pricingOptimization", label: "Price & Optimization" },
  { id: "budgets", label: "Budgets" },
  { id: "trafficSources", label: "Traffic source" },
] as const;

/** Each step points the header's help icon at its own doc page. */
const HELP_DOC: Record<string, string> = { budgets: "budget" };

export function CampaignEditWizard({
  id,
  name,
  step,
  budget,
}: {
  id: string;
  name: string;
  step: string;
  budget: CampaignBudget;
}) {
  const router = useRouter();
  // The live stepper swaps ?step= through the router; the tabs carry no href.
  const active = STEPS.some((s) => s.id === step) ? step : "basic";

  // The panel's OK applies an edit to `draft`; this footer's Save is what writes
  // it. `saved` tracks what the database holds so Cancel has something to revert
  // to and Save can stay disabled until something actually changed.
  const [saved, setSaved] = useState(budget);
  const [draft, setDraft] = useState(budget);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const onSave = () =>
    startSaving(async () => {
      try {
        const row = await saveBudget(id, draft);
        setSaved(row);
        setDraft(row);
        setStatus("Budget saved.");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Could not save the budget.");
      }
    });

  return (
    <AppShell
      activeHref="/campaigns"
      breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: name }]}
      rightRail={<CampaignEditSummaryRail name={name} />}
      contentClassName="flex flex-col"
    >
      {/* The padded column scrolls; the footer below it never moves. */}
      <div className="min-h-0 flex-1 overflow-auto p-8">
        <div className="max-w-[calc(100%-240px)]">
          <div className="mb-4 flex h-[30px] items-center">
            <h1 className="text-[20px] font-semibold leading-[30px] text-epom-body">{name}</h1>
            <a
              href={`https://help.dsp.epom.com/docs/${HELP_DOC[active] ?? "basic-settings"}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Campaign help"
              className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
            >
              <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
            </a>
          </div>

          <nav className="mb-4">
            <ul className="flex h-[34px] border-b border-epom-border">
              {STEPS.map((s, i) => (
                <li key={s.id} className="relative -mb-px flex h-[34px]">
                  <button
                    type="button"
                    onClick={() => router.replace(`/campaigns/edit/${id}?step=${s.id}`)}
                    className={cn(
                      "flex h-[34px] items-center border-b-2 pb-2 pt-1 text-[16px] font-semibold leading-[21px] transition-colors duration-[120ms] ease-linear",
                      i > 0 && "ml-8",
                      active === s.id
                        ? "border-epom-primary text-epom-primary"
                        : "border-transparent text-epom-muted hover:text-epom-primary-hover",
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {active === "budgets" ? (
            <CampaignBudgetsStep
              budget={draft}
              onChange={(next) => {
                setDraft(next);
                setStatus(null);
              }}
            />
          ) : (
            <div className="flex min-h-[160px] items-center justify-center rounded bg-epom-surface p-6 text-[12px] leading-[18px] text-epom-muted">
              This step is not part of the cloned URL.
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t-[0.5px] border-epom-border bg-epom-surface">
        <div className="flex max-w-[calc(100%-240px)] items-center justify-end gap-4 px-6 py-4">
          {status && <span className="text-[12px] leading-[18px] text-epom-muted">{status}</span>}
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setStatus(null);
            }}
            className={BTN_OUTLINED_GREY}
          >
            Cancel
          </button>
          <button type="button" className={BTN_OUTLINED}>
            Previous
          </button>
          <button type="button" className={BTN_PRIMARY}>
            Next
          </button>
          <button
            type="button"
            onClick={onSave}
            // Only the Budgets step is backed by a row.
            disabled={saving || !dirty || active !== "budgets"}
            className={cn(
              BTN_PRIMARY,
              "disabled:cursor-not-allowed disabled:bg-black/[0.12] disabled:text-black/30 disabled:shadow-none disabled:hover:bg-black/[0.12]",
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
