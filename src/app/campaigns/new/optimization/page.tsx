import type { Metadata } from "next";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import { FormBox, FormHeading, SelectField } from "@/components/form/FormPrimitives";
import { Accordion } from "@/components/form/Accordion";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

const RISK_LEVELS = [
  "Low: Blocks more traffic, stricter filtering.",
  "Medium: Balanced approach between reach and protection.",
  "High: Only blocks the riskiest traffic, maximum reach.",
];

export default function OptimizationPage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/optimization"
      footer={["Cancel", "Previous", "Save"]}
    >
      <FormBox>
        <FormHeading className="mb-2">Risk tolerance level</FormHeading>
        <div className="mb-4 text-[12px] leading-[18px] text-epom-muted">
          <div>Set the level of fraud risk you&apos;re willing to accept.</div>
          {RISK_LEVELS.map((r) => (
            <div key={r} className="flex items-center">
              {/* 3px dot — the live site uses the `circle` ligature at font-size 3px. */}
              <MaterialIcon name="circle" className="mr-2 block text-[3px] leading-[3px]" />
              {r}
            </div>
          ))}
        </div>
        <div className="w-[720px]">
          <SelectField value="High" />
        </div>
      </FormBox>

      <FormBox>
        <div className="w-[720px]">
          <FormHeading className="mb-2">Pixalate</FormHeading>
          <div className="mb-6 text-[12px] leading-[18px] text-epom-muted">
            A technology fee of $0.10 CPM will be applied to all impressions in this campaign to
            enable Pixalate&apos;s MRC-accredited analytics. This includes fraud detection,
            viewability measurement, and supply chain optimization to help improve your ROI.
          </div>
          <div className="flex h-5 items-center">
            <span className="flex h-5 w-9 items-center rounded-[30px] bg-[#faf9fd]">
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="block h-2.5 w-2.5 rounded-full bg-epom-muted" />
              </span>
            </span>
            <span className="ml-2 text-[14px] leading-6 text-epom-body">Pixalate Optimization</span>
          </div>
        </div>
      </FormBox>

      <FormBox>
        <FormHeading className="mb-6">Filters</FormHeading>
        <button
          type="button"
          className="h-9 w-[720px] rounded border border-epom-primary px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
        >
          Select Filters (0)
        </button>
      </FormBox>

      <FormBox>
        <Accordion title="Events tracking" defaultOpen>
          <div className="flex gap-4">
            <div className="w-[352px]">
              <div className="mb-2 text-[12px] font-semibold leading-[18px] text-epom-muted">
                Tracking Pixels/URLs
              </div>
              <button type="button" className={mutedButtonClass}>
                Tracking Pixels/URLs (0)
              </button>
            </div>
            <div className="w-[352px]">
              <div className="mb-2 text-[12px] font-semibold leading-[18px] text-epom-muted">
                Attribution Links
              </div>
              <button type="button" className={mutedButtonClass}>
                Attribution Links
              </button>
            </div>
          </div>
        </Accordion>
      </FormBox>

      <FormBox>
        <Accordion title="Auto filling retargeting" />
      </FormBox>

      <FormBox>
        <Accordion title="SKAdNetwork" />
      </FormBox>
    </CampaignWizardShell>
  );
}

// Rendered in a muted/disabled treatment until the campaign is saved.
const mutedButtonClass =
  "h-9 w-[352px] rounded border border-[rgba(26,28,30,0.3)] px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-[rgba(26,28,30,0.3)]";
