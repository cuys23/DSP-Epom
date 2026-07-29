"use client";

import Image from "next/image";
import type { CreativeType } from "@/types/campaign";
import { rememberCreativeType } from "@/lib/creative-type";

/**
 * Card is a link, not a selection control — on the live site clicking any
 * creative type navigates straight to the next wizard step.
 */
export function CreativeTypeCard({ label, image, width, height, href }: CreativeType) {
  return (
    <a
      href={href}
      onClick={() => rememberCreativeType(label)}
      className="relative mb-4 flex h-[270px] min-h-[270px] cursor-pointer flex-col items-center justify-end rounded bg-epom-surface px-[15px] py-9 text-center shadow-epom-card transition-shadow duration-[120ms] ease-linear hover:shadow-epom-card-hover"
    >
      <Image
        src={image}
        alt=""
        width={width}
        height={height}
        className="mb-8 inline-block max-w-full"
      />
      {/* Label is pinned to the bottom 56px of the card, as on the live site. */}
      <span className="absolute inset-x-0 bottom-0 top-[214px] text-[16px] font-bold capitalize leading-[22.8571px] text-epom-text">
        {label}
      </span>
    </a>
  );
}
