"use client";

import { useSyncExternalStore } from "react";
import { CampaignSummaryRail } from "@/components/CampaignSummaryRail";
import { WIZARD_SUMMARY } from "@/lib/campaign-data";
import { creativeTypeIcon, readCreativeType } from "@/lib/creative-type";

/**
 * Same rail as the rest of the wizard, but the Summary block reflects the
 * creative type picked in step 1. Reaching the wizard without picking one
 * leaves the "not configured" copy the live site shows.
 */
export function WizardSummaryRail() {
  // Read-only snapshot of sessionStorage — nothing writes it while this renders.
  const type = useSyncExternalStore(
    () => () => {},
    readCreativeType,
    () => null,
  );

  const sections = [
    type
      ? {
          heading: "Summary",
          media: { label: "Creative type:", value: type, icon: creativeTypeIcon(type) },
        }
      : { heading: "Summary", description: "Creative type are not configured." },
    ...WIZARD_SUMMARY.slice(1),
  ];

  return <CampaignSummaryRail sections={sections} />;
}
