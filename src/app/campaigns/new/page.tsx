import type { Metadata } from "next";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import {
  Banner,
  FieldLabel,
  FormBox,
  FormHeading,
  SelectField,
  TextField,
} from "@/components/form/FormPrimitives";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function BasicInfoPage() {
  return (
    <CampaignWizardShell activeTab="/campaigns/new" footer={["Cancel", "Next", "Save"]}>
      <FormBox>
        <FormHeading className="mb-6">Basic settings</FormHeading>

        {/* Controls are 720px inside the 818px content box — they don't stretch. */}
        <div className="w-[720px]">
          <FieldLabel required>Name</FieldLabel>
          <TextField placeholder="Enter Name" />
        </div>

        <div className="mt-4 w-[720px]">
          <FieldLabel required>Folder</FieldLabel>
          <SelectField placeholder="Select Folder" />
        </div>

        <div className="mt-4 w-[720px]">
          <FieldLabel>Tags</FieldLabel>
          <TextField placeholder="Enter tags" />
          <span className="mt-1 inline-block text-[12px] leading-[18px] text-epom-muted">
            Max 3 tags
          </span>
        </div>
      </FormBox>

      <FormBox>
        <FormHeading className="mb-6">Bid Price</FormHeading>

        <div className="flex w-[720px] gap-4">
          <div className="flex-1">
            <FieldLabel required>Pricing Model</FieldLabel>
            <SelectField value="CPM" />
          </div>
          <div className="flex-[2]">
            <FieldLabel required>Default Price</FieldLabel>
            <TextField placeholder="Enter Default Bid Price" />
          </div>
        </div>

        <Banner variant="info" className="mt-4 w-[720px]">
          <span className="text-[14px] font-semibold leading-[19px]">
            Set your price per 1,000 ad views
          </span>
          <ul className="mb-0 mt-2 list-disc pl-5">
            <li className="leading-5">
              Use the Recommended Price as a starting point. (calculated based on ad format, geo and
              device type)
            </li>
            <li className="leading-5">You can update your price at any time.</li>
          </ul>
        </Banner>
      </FormBox>

      <Banner variant="warning" className="w-[720px]">
        Flight dates and limits have been moved to the Budget tab.
      </Banner>
    </CampaignWizardShell>
  );
}
