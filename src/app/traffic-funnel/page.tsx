import type { Metadata } from "next";
import { Suspense } from "react";
import { TrafficFunnelView } from "@/components/TrafficFunnelView";

/** The live app keeps the Analytics tab title on this route. */
export const metadata: Metadata = { title: "Analytics | Epom Market" };

export default function TrafficFunnelPage() {
  // The view reads `?campaign_id=`, so it needs a boundary to stay prerenderable.
  return (
    <Suspense>
      <TrafficFunnelView />
    </Suspense>
  );
}
