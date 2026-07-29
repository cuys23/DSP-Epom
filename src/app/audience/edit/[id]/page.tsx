import type { Metadata } from "next";
import { AudienceEditView } from "@/components/AudienceEditView";
import { AUDIENCES } from "@/lib/audiences";

/** Rows created in the browser are not in the roster; they fall back to "Test". */
const nameOf = (id: string) => AUDIENCES.find((a) => a.id === id)?.name ?? "Test";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Audience | ${nameOf(id)} | Epom Market` };
}

export default async function AudienceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AudienceEditView name={nameOf(id)} />;
}
