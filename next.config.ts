import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    // VeePN's creatives are served from the Supabase Storage bucket they were
    // uploaded to rather than from `public/`, so the optimizer has to allow the host.
    remotePatterns: [
      { protocol: "https", hostname: "lgfiuybibrrtrzaktcso.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
