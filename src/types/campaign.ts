export interface CreativeType {
  label: string;
  /** SVG illustration under public/images/creatives/. */
  image: string;
  /** Intrinsic SVG size — the banner asset differs from the other three. */
  width: number;
  height: number;
  /** Where the card navigates to. */
  href: string;
}

/** A "Label: value" pair, optionally prefixed by a Material Icons ligature. */
export interface SummaryInline {
  label: string;
  value: string;
  icon?: string;
}

export interface SummaryItem {
  title: string;
  inline?: SummaryInline;
}

/**
 * A block in the right-hand summary rail. Renders either a plain description,
 * an inline media row (the first block), or a list of items — never more than one.
 */
export interface SummarySection {
  heading: string;
  description?: string;
  media?: SummaryInline;
  items?: SummaryItem[];
  /**
   * The live rail has two list wrappers: `block-list` adds 8px above the first
   * item title, `header-list` does not. True selects the `block-list` spacing.
   */
  spacedTitle?: boolean;
}

export interface SspLabel {
  text: string;
  /** Account-configured badge colour, carried in the data rather than a fixed palette. */
  color: string;
}

export interface SspEndpoint {
  name: string;
  labels: SspLabel[];
}
