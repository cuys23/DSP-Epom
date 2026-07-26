import type { Metadata } from "next";
import Image from "next/image";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function BudgetsPage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/budgets"
      footer={["Cancel", "Previous", "Next", "Save"]}
    >
      <div className="flex justify-between gap-8 rounded bg-epom-surface p-8">
        <div>
          <h4 className="text-[16px] font-bold leading-6 text-epom-text">Create first Budget</h4>
          <div className="mt-2 max-w-[516px] text-[14px] leading-5 text-epom-text">
            Manage campaign Budgets through a dedicated Budget object with clear types, limits, and
            control options.
          </div>
          <div className="mt-4 flex h-9 items-center gap-4">
            <button
              type="button"
              className="flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
            >
              <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
              Create new Budget
            </button>
          </div>
        </div>

        <div className="flex h-[181px] w-[268px] max-w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa]">
          <Image src="/images/explore/budgets.svg" alt="" width={78} height={88} />
        </div>
      </div>
    </CampaignWizardShell>
  );
}
