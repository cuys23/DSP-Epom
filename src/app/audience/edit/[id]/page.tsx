import type { Metadata } from "next";
import { AudienceEditView } from "@/components/AudienceEditView";
import { AUDIENCES, linkedCampaigns } from "@/lib/audiences";

/** Rows created in the browser are not in the roster; they fall back to the first one. */
const audienceOf = (id: string) => AUDIENCES.find((a) => a.id === id) ?? AUDIENCES[0];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Audience | ${audienceOf(id).name} | Epom Market` };
}

export default async function AudienceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audience = audienceOf(id);
  return (
    <AudienceEditView name={audience.name} targeting={audience} linked={linkedCampaigns(id)} />
  );
}
