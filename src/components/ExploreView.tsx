"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export function ExploreView() {
  return (
    <AppShell
      breadcrumbs={[{ label: "home", href: "/" }, { label: "Explore" }]}
      activeHref="/explore"
    >
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        {/* Welcome Header Banner */}
        <div className="rounded-lg bg-epom-surface p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-[20px] font-bold leading-7 text-epom-text">
              Welcome to Epom Market!
            </h1>
            <p className="text-[14px] leading-6 text-epom-text">
              Ad Formats settings Thanks for choosing Epom Market. Here you&apos;ll find diverse ad formats and top-quality traffic worldwide! Explore a help center to see how it works.
            </p>
            <div className="pt-1">
              <a
                href="https://help.dsp.epom.com/docs"
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-semibold text-epom-primary hover:underline"
              >
                View guide
              </a>
            </div>
          </div>
        </div>

        {/* Quick Start Guide Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-[18px] font-bold leading-7 text-epom-text">
              Quick Start Guide
            </h2>
            <p className="text-[14px] text-epom-text">
              Learn how to set up your first campaign in a DSP from zero to completion.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex flex-col gap-6 rounded-lg bg-epom-surface p-6 shadow-xs md:flex-row md:items-center">
              {/* Left: Illustration Box */}
              <div className="flex h-[181px] w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa] p-4">
                <Image
                  src="/images/explore/step_2.svg"
                  alt="1. Add a Tracking pixel URL"
                  width={160}
                  height={110}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="link" className="text-[20px] text-epom-text" />
                  <h3 className="text-[16px] font-bold text-epom-text">
                    1. Add a Tracking pixel URL
                  </h3>
                </div>
                <p className="text-[14px] leading-5 text-epom-text">
                  Add a Tracking pixel URL to measure campaign performance accurately.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/conversion-tracking"
                    className="inline-flex h-9 items-center gap-1.5 rounded border border-epom-primary bg-white px-4 text-[14px] font-semibold text-epom-primary transition-colors hover:bg-epom-primary-8"
                  >
                    <MaterialIcon name="add_circle_outline" className="text-[18px]" />
                    Add the Tracking pixel URL
                  </Link>
                  <a
                    href="https://help.dsp.epom.com/docs/conversion-tracking"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-epom-primary hover:underline"
                  >
                    View guide
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-6 rounded-lg bg-epom-surface p-6 shadow-xs md:flex-row md:items-center">
              {/* Left: Illustration Box */}
              <div className="flex h-[181px] w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa] p-4">
                <Image
                  src="/images/explore/step_3.svg"
                  alt="2. Create a Campaign"
                  width={160}
                  height={110}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="campaign" className="text-[20px] text-epom-text" />
                  <h3 className="text-[16px] font-bold text-epom-text">
                    2. Create a Campaign
                  </h3>
                </div>
                <p className="text-[14px] leading-5 text-epom-text">
                  Start by creating your first Campaign to launch ads. You can also explore our guide to learn the basics.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/campaigns/new"
                    className="inline-flex h-9 items-center gap-1.5 rounded border border-epom-primary bg-white px-4 text-[14px] font-semibold text-epom-primary transition-colors hover:bg-epom-primary-8"
                  >
                    <MaterialIcon name="add_circle_outline" className="text-[18px]" />
                    Create a Campaign
                  </Link>
                  <a
                    href="https://help.dsp.epom.com/docs/creating-a-campaign"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-epom-primary hover:underline"
                  >
                    View guide
                  </a>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-6 rounded-lg bg-epom-surface p-6 shadow-xs md:flex-row md:items-center">
              {/* Left: Illustration Box */}
              <div className="flex h-[181px] w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa] p-4">
                <Image
                  src="/images/explore/step_4.svg"
                  alt="3. Find an Audience"
                  width={160}
                  height={110}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="groups" className="text-[20px] text-epom-text" />
                  <h3 className="text-[16px] font-bold text-epom-text">
                    3. Find an Audience
                  </h3>
                </div>
                <p className="text-[14px] leading-5 text-epom-text">
                  Build your first Audience using targeting segments, demographics, interests, and other data to improve campaign performance.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/audience"
                    className="inline-flex h-9 items-center gap-1.5 rounded border border-epom-primary bg-white px-4 text-[14px] font-semibold text-epom-primary transition-colors hover:bg-epom-primary-8"
                  >
                    <MaterialIcon name="add_circle_outline" className="text-[18px]" />
                    Create an Audience
                  </Link>
                  <a
                    href="https://help.dsp.epom.com/docs/audiences"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-epom-primary hover:underline"
                  >
                    View guide
                  </a>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-6 rounded-lg bg-epom-surface p-6 shadow-xs md:flex-row md:items-center">
              {/* Left: Illustration Box */}
              <div className="flex h-[181px] w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa] p-4">
                <Image
                  src="/images/explore/step_5.svg"
                  alt="4. Set the Budgets"
                  width={160}
                  height={110}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="groups" className="text-[20px] text-epom-text" />
                  <h3 className="text-[16px] font-bold text-epom-text">
                    4. Set the Budgets
                  </h3>
                </div>
                <p className="text-[14px] leading-5 text-epom-text">
                  Optimize your Budgets to increase the completed view rate as much as possible for your chosen audience.
                </p>
                <div className="pt-2">
                  <a
                    href="https://help.dsp.epom.com/docs/budgets"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-epom-primary hover:underline"
                  >
                    View guide
                  </a>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col gap-6 rounded-lg bg-epom-surface p-6 shadow-xs md:flex-row md:items-center">
              {/* Left: Illustration Box */}
              <div className="flex h-[181px] w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa] p-4">
                <Image
                  src="/images/explore/step_6.svg"
                  alt="5. Add a Creative"
                  width={160}
                  height={110}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="photo_library" className="text-[20px] text-epom-text" />
                  <h3 className="text-[16px] font-bold text-epom-text">
                    5. Add a Creative
                  </h3>
                </div>
                <p className="text-[14px] leading-5 text-epom-text">
                  Upload or select a Creative from a 3rd Party Ad Tag, Creative Library, HTML5, or upload a file.
                </p>
                <div className="pt-2">
                  <a
                    href="https://help.dsp.epom.com/docs/creatives"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-epom-primary hover:underline"
                  >
                    View guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's New Section */}
        <div className="space-y-4">
          <h2 className="text-[18px] font-bold leading-7 text-epom-text">
            What&apos;s new?
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-lg bg-epom-surface p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-epom-text">
                DMP Segments Integration
              </h3>
              <p className="text-[14px] leading-6 text-epom-text">
                Demographic and behavioral data targeting is now live with targeting segments, which are now embedded into the DSP campaign flow.
              </p>
              <div className="pt-2">
                <a
                  href="https://help.dsp.epom.com/docs/dmp-segments"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] font-semibold text-epom-primary hover:underline"
                >
                  Read more
                </a>
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-epom-surface p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-epom-text">
                Audiences
              </h3>
              <p className="text-[14px] leading-6 text-epom-text">
                Targeting decoupled from campaigns — create reusable Audiences with full targeting setups, then link them to campaigns.
              </p>
              <div className="pt-2">
                <a
                  href="https://help.dsp.epom.com/docs/audiences"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] font-semibold text-epom-primary hover:underline"
                >
                  Read more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
