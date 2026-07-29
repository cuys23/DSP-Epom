import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";

export const metadata: Metadata = { title: "Dashboard | Epom Market" };

export default function DashboardPage() {
  return (
    <AppShell activeHref="/dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <PageHeader />
      <ChartCard />
    </AppShell>
  );
}
