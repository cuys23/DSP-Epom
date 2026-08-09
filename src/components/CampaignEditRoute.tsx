"use client";

import { useParams, useSearchParams } from "next/navigation";
import { CampaignEditWizard } from "@/components/CampaignEditWizard";
import { CampaignSettingsView } from "@/components/CampaignSettingsView";
import { CAMPAIGNS } from "@/lib/campaigns";
import type { CampaignBudget } from "@/lib/records";

/**
 * `/campaigns/edit/<id>` serves two different pages on the live site: the
 * read-only overview, and — once `?step=` is present — the edit wizard.
 */
export function CampaignEditRoute({ budget }: { budget: CampaignBudget }) {
  const id = String(useParams().id ?? "");
  const step = useSearchParams().get("step");

  if (!step) return <CampaignSettingsView />;

  // Unknown ids fall back to the newest campaign, matching the overview page.
  const campaign = CAMPAIGNS.find((c) => c.id === id) ?? CAMPAIGNS[0];
  return (
    <CampaignEditWizard
      id={campaign.id}
      name={campaign.name}
      step={step}
      budget={budget}
    />
  );
}
