import type { Metadata } from "next";
import { ExploreView } from "@/components/ExploreView";

export const metadata: Metadata = {
  title: "Explore | Epom Market",
  description: "Quick start guide and platform overview for Epom Market DSP.",
};

export default function ExplorePage() {
  return <ExploreView />;
}
