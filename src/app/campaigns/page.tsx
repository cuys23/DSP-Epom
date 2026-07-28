import type { Metadata } from "next";
import { CampaignsListView } from "@/components/CampaignsListView";

export const metadata: Metadata = { title: "Campaigns | Epom Market" };

export default function CampaignsPage() {
  return <CampaignsListView />;
}
