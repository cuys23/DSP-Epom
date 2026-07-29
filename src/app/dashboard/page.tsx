import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";

export const metadata: Metadata = { title: "Dashboard | Epom Market" };

export default function DashboardPage() {
  return (
    <AppShell activeHref="/dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <DashboardView />
    </AppShell>
  );
}
