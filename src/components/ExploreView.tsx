import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

/** `.link-component.link-component-md` on the live site. */
const LINK =
  "inline-block text-[14px] font-semibold leading-[21px] text-epom-primary underline transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover";

/** `.text` — 14px on the neutral body colour. */
const TEXT = "text-[14px] leading-5 text-epom-text";

/** `.headline-2` */
const H2 = "text-[20px] font-bold leading-6 text-epom-text";

interface Tile {
  icon: string;
  title: string;
  body: string;
  image: string;
  width: number;
  height: number;
  action?: { label: string; href: string };
  guide: string;
}

/** Quick Start Guide tiles, transcribed from the live Explore page. */
const TILES: Tile[] = [
  {
    icon: "link",
    title: "1. Add a Tracking pixel URL",
    body: "Add a Tracking pixel URL to measure campaign performance accurately.",
    image: "/images/explore/step_2.svg",
    width: 103,
    height: 56,
    action: { label: "Add the Tracking pixel URL", href: "/conversion-tracking" },
    guide: "https://help.dsp.epom.com/docs/postback-settings",
  },
  {
    icon: "campaign",
    title: "2. Create a Campaign",
    body: "Start by creating your first Campaign to launch ads. You can also explore our guide to learn the basics.",
    image: "/images/explore/step_3.svg",
    width: 104,
    height: 65,
    action: { label: "Create a Campaign", href: "/campaigns/new/creative-type" },
    guide: "https://help.dsp.epom.com/docs/campaigns",
  },
  {
    icon: "groups",
    title: "3. Find an Audience",
    body: "Build your first Audience using targeting segments, demographics, interests, and other data to improve campaign performance.",
    image: "/images/explore/step_4.svg",
    width: 110,
    height: 76,
    action: { label: "Create an Audience", href: "/audience" },
    guide: "https://help.dsp.epom.com/docs/audience",
  },
  {
    // Verbatim from the live site — the Budgets tile really does reuse the
    // "groups" glyph.
    icon: "groups",
    title: "4. Set the Budgets",
    body: "Optimize your Budgets to increase the completed view rate as much as possible for your chosen audience.",
    image: "/images/explore/step_5.svg",
    width: 78,
    height: 88,
    guide: "https://help.dsp.epom.com/docs/budget",
  },
  {
    icon: "photo_library",
    title: "5. Add a Creative",
    body: "Upload or select a Creative from a 3rd Party Ad Tag, Creative Library, HTML5, or upload a file.",
    image: "/images/explore/step_6.svg",
    width: 114,
    height: 78,
    guide: "https://help.dsp.epom.com/docs/creative",
  },
];

const NEW_TILES = [
  {
    title: "DMP Segments Integration",
    body: "Demographic and behavioral data targeting is now live with targeting segments, which are now embedded into the DSP campaign flow.",
    href: "https://help.dsp.epom.com/docs/lotame-segments",
  },
  {
    title: "Audiences",
    body: "Targeting decoupled from campaigns — create reusable Audiences with full targeting setups, then link them to campaigns.",
    href: "https://help.dsp.epom.com/docs/targeting-options-copy",
  },
];

export function ExploreView() {
  return (
    <AppShell breadcrumbs={[{ label: "Explore" }]} activeHref="/explore">
      {/* .welcome-block — fixed 254px tall, its text column capped at 516px. */}
      <div className="flex h-[254px] items-center rounded bg-epom-surface p-8">
        <div className="w-[516px]">
          <h2 className={H2}>Welcome to Epom Market!</h2>
          <div className={`mt-3 ${TEXT}`}>
            Ad Formats settings Thanks for choosing Epom Market. Here you&apos;ll find diverse ad
            formats and top-quality traffic worldwide! Explore a help center to see how it works.
          </div>
          <a
            href="https://help.dsp.epom.com/docs/"
            target="_blank"
            rel="noreferrer"
            className={`mt-4 ${LINK}`}
          >
            View guide
          </a>
        </div>
      </div>

      <h2 className={`mt-8 ${H2}`}>Quick Start Guide</h2>
      <div className={`mt-2 ${TEXT}`}>
        Learn how to set up your first campaign in a DSP from zero to completion.
      </div>

      {TILES.map((tile) => (
        <div
          key={tile.title}
          className="mt-4 flex min-h-[194px] gap-8 rounded bg-epom-surface p-8"
        >
          <div className="flex w-full max-w-[201px] shrink-0 items-center justify-center rounded bg-epom-image">
            <Image src={tile.image} alt={tile.title} width={tile.width} height={tile.height} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <MaterialIcon
                name={tile.icon}
                className="block text-[18px] leading-[18px] text-epom-tile-icon"
              />
              <h4 className="text-[14px] font-bold leading-[21px] text-epom-text">{tile.title}</h4>
            </div>
            <div className={`mt-2 ${TEXT}`}>{tile.body}</div>
            <div className="mt-4 flex items-center gap-4">
              {tile.action && (
                <a
                  href={tile.action.href}
                  className="inline-flex h-9 min-w-24 max-w-[720px] items-center gap-2 whitespace-nowrap rounded border border-epom-primary px-[15px] py-[6.5px] text-center text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors duration-[120ms] ease-linear hover:bg-epom-primary-8"
                >
                  <MaterialIcon
                    name="add_circle_outline"
                    className="block text-[18px] leading-[18px]"
                  />
                  {tile.action.label}
                </a>
              )}
              <a href={tile.guide} target="_blank" rel="noreferrer" className={LINK}>
                View guide
              </a>
            </div>
          </div>
        </div>
      ))}

      <h2 className={`mt-8 ${H2}`}>What&apos;s new?</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {NEW_TILES.map((tile) => (
          <div key={tile.title} className="rounded bg-epom-surface p-8">
            <h4 className="text-[14px] font-bold leading-[21px] text-epom-text">{tile.title}</h4>
            <div className={`mt-2 ${TEXT}`}>{tile.body}</div>
            <a href={tile.href} target="_blank" rel="noreferrer" className={`mt-4 ${LINK}`}>
              Read more
            </a>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
