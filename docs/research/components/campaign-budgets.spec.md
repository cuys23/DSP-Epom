# Campaign Wizard — Budgets Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/budgets/page.tsx`
- **Screenshot:** `docs/design-references/campaign-new-1440-budgets.jpg`
- **Interaction model:** static empty state; one CTA button
- **Content height:** scrollHeight 594 vs client 594 — no scroll

## DOM Structure
```
<div explore-tile page-block page-block-32 d-flex>   white tile, flex row, space-between
  <div>                                              text column
    <h4 headline-3 mb-0>       "Create first Budget"
    <div mt-8 text>            description
    <div mt-16 d-flex items-center g-16>
      <button button-primary button-with-icon>   add_circle_outline + "Create new Budget"
  <div image-container tile-image>                   tinted panel with the illustration
    <img>                      budgets.svg
<div page-footer>              Cancel · Previous · Next · Save
```

## Computed Styles

### Tile (`.explore-tile.page-block.page-block-32`)
- backgroundColor: `#FFFFFF`; borderRadius: 4px
- padding: 32px; width: 866px; height: 245px
- display: flex; flexDirection: row; justifyContent: space-between; gap: 32px

### Text column
- width: 502px (flexible); height: 181px

### `h4.headline-3.mb-0`
- fontSize: 16px; fontWeight: 700; lineHeight: 24px; color: `#1A1C1E`; margin: 0

### Description (`.mt-8.text`)
- fontSize: 14px; fontWeight: 400; lineHeight: 20px; color: `#1A1C1E`
- margin-top: 8px; maxWidth: 516px

### Button row (`.mt-16.d-flex.items-center.g-16`)
- margin-top: 16px; display: flex; alignItems: center; gap: 16px; height: 36px

### `Create new Budget` (`.button-primary.button-with-icon`)
- display: flex; alignItems: center; gap: 8px
- padding: `7.5px 16px`; height: 36px; minWidth: 96px; maxWidth: 720px; borderRadius: 4px
- backgroundColor: `#7E239F`; color: `#FFFFFF`
- fontSize: 14px; fontWeight: 600; lineHeight: 21px
- boxShadow: `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)`
- Leading icon `add_circle_outline`: 16px, weight 600, color `#FFFFFF`

### Image panel (`.image-container.tile-image`)
- backgroundColor: `#F1F2FA`; borderRadius: 4px
- width/maxWidth: 268px; height: 181px
- display: flex; justifyContent: center; alignItems: center

### Illustration (`img`)
- rendered 78 × 88px
- source `assets/images/explore/budgets.svg`

## States & Behaviors
- **`Create new Budget` click:** opens the budget-creation flow. Presentational in the clone.
- **Hover:** standard primary-button hover (`#7E239F → #8D3DAB`).
- No scroll-, time- or tab-driven behaviour. The tile is entirely static.

## Text Content (verbatim)
- `Create first Budget`
- `Manage campaign Budgets through a dedicated Budget object with clear types, limits, and control options.`
- `Create new Budget`
- Footer: `Cancel`, `Previous`, `Next`, `Save`

## Assets
- `public/images/explore/budgets.svg` (rendered 78×88)
- Material Icons Outlined: `add_circle_outline`

## Responsive Behavior
- Fixed desktop layout: the tile stays a two-column flex row at every width; the
  image panel keeps its 268px max-width and the text column absorbs the remainder.
- Below ~1000px the page overflows horizontally.
