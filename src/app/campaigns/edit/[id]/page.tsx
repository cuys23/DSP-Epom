import type { Metadata } from "next";
import { Suspense } from "react";
import { CampaignEditRoute } from "@/components/CampaignEditRoute";
import { readBudget } from "@/app/actions";
import { CAMPAIGNS } from "@/lib/campaigns";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

// The budget row is editable at runtime, so this page can't be prerendered.
export const dynamic = "force-dynamic";

export default async function CampaignSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Unknown ids fall back to the newest campaign, so the budget follows the
  // campaign actually rendered rather than the one in the URL.
  const campaign = CAMPAIGNS.find((c) => c.id === id) ?? CAMPAIGNS[0];
  const budget = await readBudget(campaign.id);

  return (
    <Suspense>
      <CampaignEditRoute budget={budget} />
    </Suspense>
  );
}
