import type { Metadata } from "next";
import { CreativeAssetsView } from "@/components/creative-assets/CreativeAssetsView";

export const metadata: Metadata = {
  title: "Creative Assets | Epom Market",
  description: "Manage images, videos, and HTML5 creative assets in Epom Market DSP.",
};

export default function CreativeAssetsPage() {
  return <CreativeAssetsView />;
}
