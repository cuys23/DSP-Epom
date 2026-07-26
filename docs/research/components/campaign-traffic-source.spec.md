# Campaign Wizard — Traffic Source Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/traffic-source/page.tsx`
- **Screenshot:** `docs/design-references/campaign-new-1440-traffic-source.jpg`
- **Interaction model:** click-driven (Include / Exclude per row, search, label filter). Presentational in the clone.
- **Content height:** page scrollHeight 595 (no page scroll) — the **left column scrolls internally**

## DOM Structure
```
<div page-block traffic-source-select>          white tile
  <div description-text description-text-md pl-24>   lead line
  <div select-popup-content mt-32>              flex row
    <div column column-left pr-20>              overflow-y: auto  ← the scroll region
      <h4 headline-4>                           "Available"
      <epom-search-input mt-16>                 input + absolute search icon
      <tags-dropdown mt-16>                     "Select labels" + arrow_drop_down
      <div table-list-item-card>×122            endpoint cards
    <hr vertical-line>
    <div column column-right pr-20>
      <div content-between d-flex>              "Linked (0)" + "Clear all"
      <div description-text text-center mt-16>  empty message
<div page-footer>                               Cancel · Previous · Next · Save
```

## Computed Styles

### Lead text (`.description-text.description-text-md.pl-24`)
- fontSize: 14px; lineHeight: 21px; color: `#74777F`; height: 21px

### `.select-popup-content.mt-32`
- display: flex; flexDirection: row; margin-top: 32px; height: 276px

### `.column-left` — **scroll container**
- flex: 1 1 0; padding-right: 20px
- **overflowY: auto**; height: 275.5px
- `.column-right` mirrors it with `pr-20`

### Column heading (`h4.headline-4`)
- fontSize: 14px; fontWeight: 700; lineHeight: 21px; color: `#1A1C1E`
  (note: this tab uses `h4.headline-4`, the Audience tab uses `label.table-list-label` — same rendered values)

### Search input (`.custom-search-input`)
- height: 36px; width: 373px; padding: `8px 12px`; borderRadius 4px; border `1px solid #C4C6D0`
- placeholder `Search`; icon `search` 20px `#74777F`, absolutely positioned right
- wrapper `mt-16`

### Label filter (`tags-dropdown`, `mt-16`)
- 36px tall wrapper; inner `input.tags-input-input-field` placeholder `Select labels`
- trailing `arrow_drop_down` icon, 20px
- Opens a `ul.dropdown.pt-8` panel: `max-height: 324px; overflow-y: auto`, items `a.tags-input-item.dropdown-item` with `margin-bottom: 2px` (284 selectable labels)

### Endpoint card (`.table-list-item-card`)
- height: 80px (52px when the card has no labels row)
- padding: `7px 8px 11px 16px`; borderRadius 4px; border `1px solid #C4C6D0`; background transparent
- display: flex; flexDirection: column; justifyContent: space-between; gap: 4px

### Card top row (`.select-rows`)
- display: flex; alignItems: center; gap: 8px; height: 32px

### Endpoint name (`.filter-name-span`)
- fontSize: 14px; fontWeight: 400; lineHeight: 21px; color: `#1A1C1E`
- display: flex; alignItems: center; gap: 8px

### `Include` button (`.button-include`)
- height: 32px; padding: `7px 8px`; borderRadius 4px; background transparent
- display: flex; alignItems: center; gap: 4px
- fontSize: 12px; fontWeight: 600; lineHeight: 18px; color: `#006D3E` (green)
- Leading icon `add_circle_outline`, 16px, same green

### `Exclude` button (`.button-exclude`)
- identical box; color `#BA1A1A` (red)
- Leading icon `block`, 16px, same red

### Labels row (`ul.list-labels.mt-4`)
- display: flex; gap: 4px; margin-top: 4px; height: 20px

### Label badge (`span.label.label-enpoint`)
- fontSize: 10px; fontWeight: 700; lineHeight: 16px
- color: `#FFFFFF`; padding: `2px 4px`; borderRadius: 8px
- **background colour comes from the data, not a fixed palette** — each label carries its own account-configured colour:

| Label | Colour |
|---|---|
| Web | `#ff8800` |
| In-app | `#e1ff00` |
| Banner | `#ff0095` |
| CPM | `#c07f0f` |
| Video | `#00ff33` |
| test | `#bd0910` |
| topon-all | `#717866` |

### Right column
- `Linked (0)` heading + `span.button-link` `Clear all` on a `content-between d-flex` row
- `Clear all`: 12px/18px style link, colour `#7E239F`
- Empty text: `.description-text.text-center.mt-16` — 12px / 18px, `#74777F`, centered

### Divider (`hr.vertical-line`)
- width 1px; height 276px; backgroundColor `#C4C6D0`

## States & Behaviors
- **Include / Exclude click:** moves the endpoint into the Linked column with the corresponding mode and increments the counter. The card class `table-list-item-card-include` hints at an included variant. Presentational in the clone.
- **Search:** filters the Available list client-side.
- **Select labels:** multi-select dropdown filtering by label.
- **Clear all:** empties the Linked column.
- **Scroll:** `.column-left` scrolls internally — the page itself does not scroll on this tab.
- No hover state observed on the cards themselves beyond the button hovers.

## Content
- Lead: `Select SSP Endpoints that will be sending traffic to this Campaign.`
- `Available` · placeholder `Search` · placeholder `Select labels`
- `Linked (0)` · `Clear all` · `No selected SSP Endpoints.`
- Footer: `Cancel`, `Previous`, `Next`, `Save`

**122 real endpoints** captured to `src/lib/ssp-endpoints.json` (name + labels with colours).
First few: `Aceex Native Web` [Web], `Aceex video` [In-app], `Aceex1 Display` [In-app],
`Aceex1 Display Web` [Web, Banner, CPM], `AdEclipse Display` [In-app].

## Assets
Material Icons Outlined: `search`, `arrow_drop_down`, `add_circle_outline`, `block`

## Responsive Behavior
- Two columns side by side at every width; each is `flex: 1 1 0` within the 842px content box.
- Below ~1000px the page overflows horizontally; the columns never stack.
