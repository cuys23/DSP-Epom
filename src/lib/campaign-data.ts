import type { SspEndpoint, SummarySection } from "@/types/campaign";
import endpoints from "./ssp-endpoints.json";

/** Summary rail on the creative-type step — nothing configured yet. */
export const CREATIVE_TYPE_SUMMARY: SummarySection[] = [
  { heading: "Summary", description: "Creative type are not configured." },
  { heading: "Basic info", description: "Basic info are not configured." },
  { heading: "Audience", description: "Audience are not configured." },
  { heading: "Budgets", description: "Budgets are not configured." },
  { heading: "Bidding strategy", description: "Bidding strategy are not configured." },
  { heading: "Traffic source", description: "Traffic source are not configured." },
  // Heading/description grammar mismatch is verbatim from the live site.
  { heading: "Optimizations", description: "Optimization are not configured." },
];

/** Summary rail inside the wizard, reflecting the state carried from step 1. */
export const WIZARD_SUMMARY: SummarySection[] = [
  { heading: "Summary", media: { label: "Creative type:", value: "Video", icon: "smart_display" } },
  {
    heading: "Basic info",
    spacedTitle: true,
    items: [{ title: "Bid Price", inline: { label: "Pricing Model:", value: "CPM" } }],
  },
  { heading: "Audience", description: "Audience are not configured." },
  { heading: "Budgets", description: "Budgets are not configured." },
  { heading: "Bidding strategy", items: [{ title: "Bidding settings" }] },
  { heading: "Traffic source", description: "Traffic source are not configured." },
  {
    heading: "Optimizations",
    items: [
      {
        title: "Risk tolerance level",
        inline: { label: "Risk tolerance level:", value: "High" },
      },
    ],
  },
];

/** 122 SSP endpoints scraped from the live Traffic Source tab. */
export const SSP_ENDPOINTS = endpoints as SspEndpoint[];
