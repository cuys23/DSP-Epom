# Campaign Wizard — Bidding Strategy Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/bidding-strategy/page.tsx`
- **Screenshot:** `docs/design-references/campaign-new-1440-bidding-strategy.jpg`
- **Interaction model:** click-driven (Capping accordion expands; Manage links navigate). Inputs presentational.
- **Content height:** scrollHeight 999 vs client 594 → scrolls

## DOM Structure
```
<section form-box p-24>          Bidding Settings
  <h3 headline-3 mb-0>
  <div optimization-info-block mt-24>   "Exposure Time Multiplier" + info icon
  <div form-control-wrapper>            Decay Rate label + input
<section form-box p-24>          Capping — collapsed accordion only
  <epom-single-accordion>
    <div block-toggle block-toggle-big>
      <div accordion-header-main>       arrow_right icon + title
<section form-box p-24>          Auto optimization
  <h4 headline-3 mb-0>
  <div optimization-link-block mt-20>   "Bidding Rules" + "Manage Bidding Rules" link
  <app-bidding-rules-list>              empty table (Name | Preview | ·)
  <div optimization-link-block mt-24>   "Bid Modifiers" + "Manage Bid Modifiers" link
  <app-bid-multipliers-list>            empty table (Name | Type | items | ·)
  <div mt-24>                           Max Bid Price input + helper
<div page-footer>                Cancel · Previous · Next · Save
```

Each `section.form-box` is a sibling; they stack with the standard 16px gap
(the second and third sit at y=394 and y=482 against a 187px and 72px first/second box).

## Computed Styles

### `section.optimization-accordion-item.form-box.p-24`
- padding: 24px; backgroundColor: `#FFFFFF`; borderRadius: 4px
- display: flex; flexDirection: column

### `h3/h4.headline-3.mb-0`
- fontSize: 16px; fontWeight: 700; lineHeight: 24px; color: `#1A1C1E`; margin: 0

### `.optimization-info-block` row
- margin-top: 24px; height: 21px
- `.optimization-main-block-text`: fontSize 14px; fontWeight 600; lineHeight 21px; color `#1A1C1E`
- trailing `info` icon: 16px, color `#74777F`, ~8px after the text

### `.control-label` (field label)
- fontSize: 12px; lineHeight: 18px; fontWeight: 600; color: `#74777F`; margin-bottom 4px

### `input.form-control`
- height: 36px; width: 720px; padding: `8px 12px`
- borderRadius: 4px; border: `1px solid #C4C6D0`
- fontSize: 14px; lineHeight: 20px; color: `#1A1C1E`

### Accordion (`.block-toggle.block-toggle-big`)
- display: flex; alignItems: center; justifyContent: space-between; cursor: pointer; height: 24px
- `.accordion-header-main`: display flex; alignItems center
- toggle icon `arrow_right`: 20px, color `#1A1C1E`, width 20px, height 24px, transition `all`
- `.accordion-title.headline-3`: fontSize 16px; fontWeight 700; lineHeight 24px; color `#1A1C1E`; sits ~28px from the icon's left edge

### `.optimization-link-block`
- display: flex; justifyContent: space-between; alignItems: center
- margin: `20px 0 12px` (the Bid Modifiers instance uses `mt-24`)

### `a.button-link.button-link-big.button-link-primary`
- fontSize: 12px; fontWeight: 600; lineHeight: 18px
- color: `#7E239F`; text-decoration: none; cursor: pointer

### Data table
- Wrapper `.table-flex`: border `1px solid #C4C6D0`; borderRadius 3px; background `#FFFFFF`
- `table`: width 816px; borderCollapse collapse; background `#FFFFFF`
- `th`: backgroundColor `#E1E2EC`; padding `8px 12px`; height 34px
  fontSize 12px; fontWeight 600; lineHeight 18px; color `#1A1C1E`; textAlign left
- Empty row `td` (colspan 3): padding `16px 12px`; height 66px
- Inner `.config-no-data`: **textAlign center**; fontSize 12px; lineHeight 12px; color `#74777F`

**Bidding Rules columns:** `Name` (680px), `Preview` (112px), unnamed action column (24px)
**Bid Modifiers columns:** `Name`, `Type`, `items`, unnamed action column

### `.optimization-max-bid-price-info`
- fontSize: 12px; fontWeight: 400; lineHeight: 18px; color: `#74777F`
- margin-top: 4px; display: inline-block

## States & Behaviors

### Capping accordion
- **Trigger:** click `.block-toggle`
- **Collapsed (default at this URL):** icon `arrow_right`, body hidden, box height 72px
- **Expanded:** icon rotates to `arrow_drop_down`, body reveals capping fields
- **Transition:** `all` on the icon (`0.12s linear` family)
- The clone renders the collapsed default and toggles to a placeholder body.

### Manage links
- Navigate to `/campaigns/edit/bulk-mode/bidding-rules` and `/campaigns/new/bid-modifiers`.

### Hover
- `button-link-primary`: standard link hover; tables have `.no-hover` on the empty row (no row highlight).

## Text Content (verbatim)
- `Bidding Settings`
- `Exposure Time Multiplier`
- `Decay Rate (1 Fastest / 100 Slowest)` — placeholder `0`
- `Capping`
- `Auto optimization`
- `Bidding Rules` · `Manage Bidding Rules` · columns `Name`, `Preview` · `No available data to show.`
- `Bid Modifiers` · `Manage Bid Modifiers` · columns `Name`, `Type`, `items` · `No available data to show.`
- `Max Bid Price` — placeholder `Enter Max Bid`
- `Applied For Bid Rules And Bid Modifiers`
- Footer: `Cancel`, `Previous`, `Next`, `Save`

## Assets
Material Icons Outlined: `info`, `arrow_right`, `arrow_drop_down`

## Responsive Behavior
- Fixed desktop layout; inputs stay 720px, tables 816px inside the 818px content box.
- Below ~1000px the page overflows horizontally.
