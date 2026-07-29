import type { Metadata } from "next";
import { AudienceListView } from "@/components/AudienceListView";

export const metadata: Metadata = { title: "Audience | Epom Market" };

export default function AudiencePage() {
  return <AudienceListView />;
}
