import type { Metadata } from "next";
import { AudienceEditView } from "@/components/AudienceEditView";

export const metadata: Metadata = { title: "Audience | Test | Epom Market" };

export default function AudienceEditPage() {
  return <AudienceEditView name="Test" />;
}
