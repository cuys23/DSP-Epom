import type { Metadata } from "next";
import { CampaignSettingsView } from "@/components/CampaignSettingsView";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function CampaignSettingsPage() {
  return <CampaignSettingsView />;
}
