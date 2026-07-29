import type { Metadata } from "next";
import Link from "next/link";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import {
  EmptyTable,
  FieldLabel,
  FormBox,
  FormHeading,
  TextField,
} from "@/components/form/FormPrimitives";
import { Accordion } from "@/components/form/Accordion";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function BiddingStrategyPage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/bidding-strategy"
      footer={["Cancel", "Previous", "Next", "Save"]}
    >
      <FormBox>
        <FormHeading>Bidding Settings</FormHeading>
        <div className="mt-6 flex h-[21px] items-center gap-2">
          <span className="text-[14px] font-semibold leading-[21px] text-epom-text">
            Exposure Time Multiplier
          </span>
          <MaterialIcon name="info" className="block text-[16px] leading-4 text-epom-muted" />
        </div>
        <div className="mt-3 w-[720px]">
          <FieldLabel>Decay Rate (1 Fastest / 100 Slowest)</FieldLabel>
          <TextField placeholder="0" />
        </div>
      </FormBox>

      <FormBox>
        <Accordion title="Capping" iconSize={20} />
      </FormBox>

      <FormBox>
        <FormHeading as="h4">Auto optimization</FormHeading>

        <div className="mb-3 mt-5 flex items-center justify-between">
          <span className="text-[14px] font-semibold leading-[21px] text-epom-text">
            Bidding Rules
          </span>
          <Link
            href="/campaigns/edit/bulk-mode/bidding-rules"
            className="text-[12px] font-semibold leading-[18px] text-epom-primary"
          >
            Manage Bidding Rules
          </Link>
        </div>
        <EmptyTable columns={[{ label: "Name", width: 680 }, { label: "Preview", width: 112 }]} />

        <div className="mb-3 mt-6 flex items-center justify-between">
          <span className="text-[14px] font-semibold leading-[21px] text-epom-text">
            Bid Modifiers
          </span>
          <a
            href="/campaigns/new/bid-modifiers"
            className="text-[12px] font-semibold leading-[18px] text-epom-primary"
          >
            Manage Bid Modifiers
          </a>
        </div>
        <EmptyTable
          columns={[
            { label: "Name", width: 508 },
            { label: "Type", width: 172 },
            { label: "items", width: 112 },
          ]}
        />

        <div className="mt-6 w-[720px]">
          <FieldLabel>Max Bid Price</FieldLabel>
          <TextField placeholder="Enter Max Bid" />
          <span className="mt-1 inline-block text-[12px] leading-[18px] text-epom-muted">
            Applied For Bid Rules And Bid Modifiers
          </span>
        </div>
      </FormBox>
    </CampaignWizardShell>
  );
}
