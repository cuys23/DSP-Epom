import type { Metadata } from "next";
import { TrafficFunnelView } from "@/components/TrafficFunnelView";

/** The live app keeps the Analytics tab title on this route. */
export const metadata: Metadata = { title: "Analytics | Epom Market" };

export default function TrafficFunnelPage() {
  return <TrafficFunnelView />;
}
