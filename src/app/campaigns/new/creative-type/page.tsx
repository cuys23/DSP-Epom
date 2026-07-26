import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CreativeTypeCard } from "@/components/CreativeTypeCard";
import { CampaignSummaryRail } from "@/components/CampaignSummaryRail";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CreativeType } from "@/types/campaign";
import { CREATIVE_TYPE_SUMMARY } from "@/lib/campaign-data";

export const metadata: Metadata = { title: "Epom Market" };

const CREATIVE_TYPES: CreativeType[] = [
  {
    label: "Banner",
    image: "/images/creatives/banner-creative.svg",
    width: 277,
    height: 155,
    href: "/campaigns/new",
  },
  {
    label: "Video",
    image: "/images/creatives/video-creative.svg",
    width: 279,
    height: 159,
    href: "/campaigns/new",
  },
  {
    label: "Native",
    image: "/images/creatives/native-creative.svg",
    width: 279,
    height: 159,
    href: "/campaigns/new",
  },
  {
    label: "Interstitial",
    image: "/images/creatives/interstitial-creative.svg",
    width: 279,
    height: 159,
    href: "/campaigns/new",
  },
];

export default function CreativeTypePage() {
  return (
    <AppShell
      activeHref="/campaigns"
      breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: "Creatives" }]}
      rightRail={<CampaignSummaryRail sections={CREATIVE_TYPE_SUMMARY} />}
    >
      {/* Reserve the width the fixed summary rail occupies. */}
      <div className="max-w-[calc(100%-270px)]">
        {/* 36px row, matching the live page-title box the h1 is centred in. */}
        <div className="mb-4 flex h-9 items-center">
          <h1 className="flex items-center text-[20px] font-bold leading-6 text-epom-text">
            Create new campaign: choose creative type
            <a
              href="https://help.dsp.epom.com/docs/creative"
              target="_blank"
              rel="noreferrer"
              aria-label="Creative type help"
              className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
            >
              <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
            </a>
          </h1>
        </div>

        {/* Bootstrap-style grid: -8px row margin against 8px column padding.
            Breakpoints match Bootstrap 3: 1 col, 2 at ≥768px, 3 at ≥992px. */}
        <div className="-mx-2 flex flex-wrap">
          {CREATIVE_TYPES.map((type) => (
            <div key={type.label} className="w-full px-2 min-[768px]:w-1/2 min-[992px]:w-1/3">
              <CreativeTypeCard {...type} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
