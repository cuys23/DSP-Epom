import type { Metadata } from "next";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import { SearchField } from "@/components/form/FormPrimitives";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

/** Real account data — the only audience on this account. */
const AVAILABLE = [{ name: "Test", href: "/audience/edit" }];

export default function AudiencePage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/audience"
      footer={["Cancel", "Previous", "Next", "Save"]}
    >
      <div className="flex flex-col rounded bg-epom-surface p-6">
        <div className="flex h-9 items-center justify-between">
          <span className="text-[14px] leading-[21px] text-epom-muted">
            Choose the audience to target.
          </span>
          <button
            type="button"
            className="flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
          >
            <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
            Create new Audience
          </button>
        </div>

        <div className="mt-8 flex h-[230px] gap-4">
          <div className="flex-1 pr-5">
            <div className="text-[14px] font-bold leading-[21px] text-epom-text">Available</div>
            <SearchField className="mb-8 mt-4" />
            <ul>
              {AVAILABLE.map((a) => (
                <li
                  key={a.name}
                  className="flex h-[52px] flex-col justify-between gap-1 rounded border border-epom-border pb-[11px] pl-4 pr-2 pt-[7px]"
                >
                  <div className="flex h-8 items-center justify-between">
                    <a
                      href={a.href}
                      className="text-[14px] font-semibold leading-[18px] text-epom-primary underline transition-colors duration-[120ms] ease-linear"
                    >
                      {a.name}
                    </a>
                    <button
                      type="button"
                      className="flex h-8 items-center justify-center gap-1 rounded px-2 py-[7px] text-[12px] font-semibold leading-[18px] text-epom-primary transition-colors hover:bg-epom-primary-8"
                    >
                      <MaterialIcon
                        name="add_circle_outline"
                        className="block text-[16px] leading-4"
                      />
                      Add
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <hr className="h-[230px] w-px border-0 bg-epom-border" />

          <div className="flex-1 pl-4">
            <div className="mb-4 text-[14px] font-bold leading-[21px] text-epom-text">
              Linked (0/5)
            </div>
            <div className="text-center text-[12px] leading-[18px] text-epom-muted">
              No linked Audiences.
            </div>
          </div>
        </div>
      </div>
    </CampaignWizardShell>
  );
}
