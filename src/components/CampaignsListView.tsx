"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FoldersPanel } from "@/components/FoldersPanel";
import { CampaignFilters } from "@/components/CampaignFilters";
import { ExploreTile } from "@/components/ExploreTile";
import { MaterialIcon } from "@/components/MaterialIcon";

const FOLDERS = [{ name: "Unsorted", count: 0 }];

export function CampaignsListView() {
  const [foldersCollapsed, setFoldersCollapsed] = useState(false);

  return (
    <AppShell activeHref="/campaigns" breadcrumbs={[{ label: "Campaigns" }]}>
      {/* Grid column 1 is the folders panel; the transition drives the collapse. */}
      <div
        className="grid gap-8 transition-[grid-template-columns] duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateColumns: `${foldersCollapsed ? 51 : 233}px 1fr` }}
      >
        <FoldersPanel
          collapsed={foldersCollapsed}
          onToggle={() => setFoldersCollapsed((v) => !v)}
          allCount={0}
          folders={FOLDERS}
        />

        {/* .main cancels the wrapper padding and re-applies its own. */}
        <div className="-m-8 overflow-auto p-8">
          <div className="flex h-9 items-center">
            <h1 className="text-[20px] font-bold leading-6 text-epom-text">All campaigns</h1>
            <button
              type="button"
              aria-label="Campaign list actions"
              // Inert with zero campaigns on the live site, hence the 0.5 opacity.
              className="ml-2 flex h-[22px] w-8 items-center justify-center px-1.5 py-px text-epom-primary opacity-50"
            >
              <MaterialIcon name="more_horiz" className="block text-[16px] leading-5" />
            </button>
            <a
              href="https://help.dsp.epom.com/docs/campaigns"
              target="_blank"
              rel="noreferrer"
              aria-label="Campaigns help"
              className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
            >
              <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
            </a>
          </div>

          <div className="mt-4">
            <CampaignFilters />

            <ExploreTile
              heading="Get started by creating your first Campaign"
              description="Start by creating your first Campaign to launch ads."
              image="/images/explore/campaign.svg"
              imageWidth={104}
              imageHeight={65}
            >
              <a
                href="/campaigns/new/creative-type"
                className="flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
              >
                <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-4" />
                Create new Campaign
              </a>
              <a
                href="https://help.dsp.epom.com/docs/campaigns"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center rounded border border-epom-primary px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:bg-epom-primary-8"
              >
                View guide
              </a>
            </ExploreTile>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
