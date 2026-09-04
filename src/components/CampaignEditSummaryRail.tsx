"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Toggle } from "@/components/CampaignSettingsView";
import { creativeTypeIcon } from "@/lib/creative-type";

/** `.text-md.text-semi-bold` — a top-level section heading. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className="text-[14px] font-semibold leading-[21px] text-epom-text">{children}</div>;
}

/** `.text-sm.text-semi-bold` — a sub-heading, 20px above whatever precedes it. */
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 text-[12px] font-semibold leading-[18px] text-epom-text">{children}</div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] leading-[18px] text-epom-muted">{children}</span>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] leading-[18px] text-epom-text">{children}</span>;
}

/** Green `circle` glyph + caption, used for Included / Include rows. */
function IncludedDot({ label }: { label: string }) {
  return (
    <div className="mt-3 flex items-center">
      <MaterialIcon
        name="circle"
        filled
        className="mr-2 block text-[8px] leading-[8px] text-epom-primary"
      />
      <Value>{label}</Value>
    </div>
  );
}

/** A platform row: 16px logo, name, and the `;` separator the live rail prints. */
function PlatformRow({ src, name, last }: { src: string; name: string; last?: boolean }) {
  return (
    <div className="mt-2 flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="mr-2 h-4 w-4 shrink-0 object-contain" />
      <Value>
        {name}
        {!last && ";"}
      </Value>
    </div>
  );
}

/** `.summary__divider` — a half-pixel rule bled through the 24px padding. */
function Divider() {
  return <div className="-mx-6 my-4 h-[0.5px] bg-epom-border" />;
}

/**
 * Fixed 240px rail on the campaign edit wizard. Narrower than the create-wizard's
 * `CampaignSummaryRail` (270px) and it carries the campaign's real configuration
 * rather than "not configured" placeholders.
 */
export function CampaignEditSummaryRail({ name, media }: { name: string; media: string }) {
  const [live, setLive] = useState(false);

  return (
    <aside className="fixed right-0 top-[57px] h-[calc(100vh-57px)] w-[240px] overflow-y-auto border-l-[0.5px] border-epom-border bg-epom-surface">
      <div className="p-6">
        <h3 className="mb-4 text-[16px] font-bold leading-6 text-epom-text">Summary</h3>

        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Toggle on={live} onToggle={() => setLive((v) => !v)} />
        </div>

        <Divider />

        <section className="flex flex-col">
          <SectionHeading>General</SectionHeading>
          <SubHeading>Basic info</SubHeading>
          <div className="mt-3">
            <Label>Name: </Label>
            <Value>{name}</Value>
          </div>
          <div className="mt-3">
            <Label>Folder: </Label>
            <Value>Unsorted</Value>
          </div>
          <SubHeading>Ad Format</SubHeading>
          <div className="mt-3 flex items-center">
            <MaterialIcon
              name={creativeTypeIcon(media)}
              className="mr-2 block text-[16px] leading-4 text-epom-text"
            />
            <Value>{media}</Value>
          </div>
        </section>

        <Divider />

        <section className="flex flex-col">
          <SectionHeading>Audience</SectionHeading>
          <SubHeading>Device</SubHeading>
          <div className="mt-3">
            <Label>Operation System:</Label>
          </div>
          <IncludedDot label="Included" />
          <PlatformRow src="/images/macos.png" name="macOS" />
          <PlatformRow src="/images/ios.png" name="iOS" last />
          <div className="mt-3">
            <Label>Browser:</Label>
          </div>
          <IncludedDot label="Included" />
          <PlatformRow src="/images/chrome.svg" name="Chrome" />
          <PlatformRow src="/images/safari.png" name="Safari" last />
          <SubHeading>Stores</SubHeading>
          <div className="mt-3">
            <Label>Stores: </Label>
            <Value>App Store</Value>
          </div>
          <div className="mt-3">
            <Label>App Store Categories:</Label>
          </div>
          <IncludedDot label="Included" />
          <div className="mt-2">
            <Value>Health &amp; Fitness</Value>
          </div>
        </section>

        <Divider />

        <section className="flex flex-col">
          <SectionHeading>Price &amp; Optimization</SectionHeading>
          <SubHeading>Pricing</SubHeading>
          <div className="mt-3">
            <Label>Pricing Model: </Label>
            <Value>CPM</Value>
          </div>
          <div className="mt-3">
            <Label>Default Price: </Label>
            <Value>0.025</Value>
          </div>
        </section>

        <Divider />

        <section className="flex flex-col">
          <SectionHeading>Traffic source</SectionHeading>
          <IncludedDot label="Include" />
          <div className="mt-2">
            <Value>Scale_In_App_Display_5</Value>
          </div>
          <div className="mt-2">
            <Label>Low-Volume</Label>
          </div>
          <div className="mt-2">
            <Label>Banner</Label>
          </div>
          <div className="mt-2">
            <Label>CPM</Label>
          </div>
        </section>
      </div>
    </aside>
  );
}
