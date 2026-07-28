import Image from "next/image";

/**
 * Two-column empty-state tile: text + CTAs on the left, a tinted illustration
 * panel on the right. Shared by the Budgets wizard tab and the campaigns list.
 */
export function ExploreTile({
  heading,
  description,
  image,
  imageWidth,
  imageHeight,
  children,
}: {
  heading: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Action buttons, laid out in a 36px row with 16px gaps. */
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-8 rounded bg-epom-surface p-8">
      <div>
        <h4 className="text-[16px] font-bold leading-6 text-epom-text">{heading}</h4>
        <div className="mt-2 max-w-[516px] text-[14px] leading-5 text-epom-text">{description}</div>
        <div className="mt-4 flex h-9 items-center gap-4">{children}</div>
      </div>

      <div className="flex h-[181px] w-[268px] max-w-[268px] shrink-0 items-center justify-center rounded bg-[#f1f2fa]">
        <Image src={image} alt="" width={imageWidth} height={imageHeight} />
      </div>
    </div>
  );
}
