# Campaign Summary Rail Specification

## Overview
- **Target file:** `src/components/CampaignSummaryRail.tsx`
- **Screenshot:** `docs/design-references/creative-type-1440-top.jpg`
- **Interaction model:** static (independently scrollable); no click, hover, or scroll-triggered behaviour observed

## DOM Structure
```
<aside campaign-summary>              fixed, right edge, 270px
  <div subtitle pt-24 pl-24 pr-24>    "Summary"
  <div description p-24>              "Creative type are not configured."
  <div line>                          1px divider
  <section block>×6                   subtitle + description, padding 24px
    (each followed by a 1px divider)
```

Note the **first** block is not a `<section>` — its heading and description are two
sibling divs with asymmetric padding. Every subsequent block is a uniform
`section.campaign-summary-block`.

## Computed Styles

### Container (`app-campaign-summary`)
- position: fixed; top: 57px; right: 0 (computed `left: 1170px` at 1440)
- width: 270px; height: `calc(100vh - 57px)` (measured 594px)
- backgroundColor: `#FFFFFF`
- borderLeft: `1px solid #E1E2EC`
- overflowY: auto; padding: 0
- Content height 711px at 1440×651, so it scrolls independently of the main area.

### First heading (`.campaign-summary-text-subtitle.pt-24.pl-24.pr-24`)
- padding: `24px 24px 0`
- fontSize: 14px; fontWeight: 600; lineHeight: 21px
- color: `#1A1C1E`

### First description (`.campaign-summary-description.p-24`)
- padding: 24px
- fontSize: 12px; fontWeight: 400; lineHeight: 18px
- color: `#74777F`

### Divider (`.campaign-summary-line`)
- height: 1px; width: 100%
- backgroundColor: `#E1E2EC`

### Block (`section.campaign-summary-block`)
- padding: 24px
- measured height 99px

### Block heading (`.campaign-summary-text-subtitle`)
- fontSize: 14px; fontWeight: 600; lineHeight: 21px
- color: `#1A1C1E`

### Block description (`.campaign-summary-description.mt-12`)
- margin-top: 12px
- fontSize: 12px; fontWeight: 400; lineHeight: 18px
- color: `#74777F`

## States & Behaviors

- **Static on this page.** No hover, click, or scroll behaviour on any block.
- **Independent scroll:** the rail is `position: fixed`, so scrolling the main content area leaves it stationary. Verified by scrolling `.page-wrapper` to 200px — the rail did not move.
- **Cross-page state (documented, not built here):** after choosing a creative type, the first description changes from `Creative type are not configured.` to `Creative type: Banner` with a small inline icon, and the Basic info block expands to list `Bid Price` / `Pricing Model: CPM`. That state belongs to `/campaigns/new`, not this URL.

## Text Content (verbatim, in order)

| Heading | Description |
|---|---|
| Summary | Creative type are not configured. |
| Basic info | Basic info are not configured. |
| Audience | Audience are not configured. |
| Budgets | Budgets are not configured. |
| Bidding strategy | Bidding strategy are not configured. |
| Traffic source | Traffic source are not configured. |
| Optimizations | Optimization are not configured. |

Note the last row's grammar mismatch (`Optimizations` heading, `Optimization are not
configured.` description) is verbatim from the live site — reproduce it as-is.

## Assets
None.

## Responsive Behavior
- Fixed 270px at every viewport width — it never collapses, stacks, or hides.
- Because both this rail and the 240px sidebar stay fixed, the content column between them is what shrinks. Below ~1000px the page overflows horizontally.
