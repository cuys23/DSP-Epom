import type { Metadata } from "next";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import { ExploreTile } from "@/components/ExploreTile";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function BudgetsPage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/budgets"
      footer={["Cancel", "Previous", "Next", "Save"]}
    >
      <ExploreTile
        heading="Create first Budget"
        description="Manage campaign Budgets through a dedicated Budget object with clear types, limits, and control options."
        image="/images/explore/budgets.svg"
        imageWidth={78}
        imageHeight={88}
      >
        <button
          type="button"
          className="flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
        >
          <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
          Create new Budget
        </button>
      </ExploreTile>
    </CampaignWizardShell>
  );
}
