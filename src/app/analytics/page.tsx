import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsView } from "@/components/AnalyticsView";

export const metadata: Metadata = { title: "Analytics | Epom Market" };

export default function AnalyticsPage() {
  // The view reads `?cid=`, so it needs a boundary to stay prerenderable.
  return (
    <Suspense>
      <AnalyticsView />
    </Suspense>
  );
}
