# Campaigns List Page Specification (header + filters + empty state)

## Overview
- **Target file:** `src/app/campaigns/page.tsx`, `src/components/CampaignFilters.tsx`, `src/components/ExploreTile.tsx`
- **URL:** `/campaigns` — document title `Campaigns | Epom Market`
- **Screenshot:** `docs/design-references/campaigns-1440.jpg`
- **Interaction model:** click-driven (two select dropdowns, filter button, two CTAs)
- No page scroll at 1440×651; `.main` is the scroll container (`overflow: auto`)

## DOM Structure
```
<div page-wrapper>                 padding 32
  <div page-content-grid>          grid: 233px | 1fr, gap 32
    <app-campaign-folders>         separate spec
    <div main>                     margin -32, padding 32, overflow auto
      <div page-header>            height 136
        <div page-title>           h1 + "..." actions + help icon
        <app-campaigns-filters>    white bar
      <no-items-on-page-placeholder>
        <div explore-tile>         empty state tile
```

## Computed Styles

### Page title row
- `h1`: fontSize 20px; lineHeight 24px; fontWeight 700; color `#1A1C1E`; text `All campaigns`
- actions button (`more_horiz`): 32 × 22px, **opacity 0.5**, icon 16px `#7E239F` — inert with 0 campaigns
- help icon: `help_outline` 20×20, `#6F79DD`, href `https://help.dsp.epom.com/docs/campaigns`
- `.page-header` total height 136px (52px title block + 68px filter bar + 16px gap)

### Filter bar (`.campaigns-filters`)
- backgroundColor `#FFFFFF`; padding 16px; borderRadius 4px; margin-bottom 16px; height 68px

### `.campaigns-filters-row`
- display: flex; gap: 12px; alignItems: flex-start; height 36px

### `.campaigns-filters-grid`
- display: flex; gap: 12px; width 714px (three 230px controls + two 12px gaps)

### Search input
- 230 × 36px; padding `8px 12px`; borderRadius 4px; border `1px solid #C4C6D0`
- fontSize 14px; color `#1A1C1E`; placeholder `Search`
- trailing `search` icon 20×20 `#74777F`, absolute right

### Filter select (new variant — label + value in one control)
- `.select-title`: 230 × 36px; padding `6px 36px 7px 11px`; borderRadius 4px; border `1px solid #C4C6D0`; display flex
- `label.subtitle`: fontSize 14px; lineHeight 21px; color `#74777F`; **margin-right 8px** (e.g. `Status:`)
- `label.title`: fontSize 14px; lineHeight 21px; color `#1A1C1E`; margin-bottom 5px (e.g. `Active, Inactive`)
- caret `arrow_drop_down` 20×20, absolute right

### Filter icon button
- 32 × 32px; transparent; no border; no radius
- icon `filter_list`, fontSize 20px, colour `#7E239F`, filling the 32×32 box

### Empty-state tile (`.explore-tile.page-block-32`)
Identical structure to the Budgets tab tile — extract as a shared `ExploreTile`.
- backgroundColor `#FFFFFF`; padding 32px; borderRadius 4px; height 245px
- display: flex; justifyContent: space-between; gap: 32px
- `h4.headline-3`: 16px / 24px, weight 700, `#1A1C1E`, margin 0
- description `.mt-8.text`: 14px / 20px, `#1A1C1E`, margin-top 8px
- button row `.mt-16.d-flex.items-center.g-16`: margin-top 16px, gap 16px, height 36px
- image panel `.image-container`: 268 × 181px, backgroundColor `#F1F2FA`, borderRadius 4px, flex centred
- illustration: `campaign.svg` rendered **104 × 65px**

### `Create new Campaign` (primary + icon)
- flex; alignItems center; gap 8px; padding `7.5px 16px`; height 36px; borderRadius 4px
- background `#7E239F`; color `#FFFFFF`; 14px / 21px weight 600
- boxShadow `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)`
- leading icon `add_circle_outline` 16px

### `View guide` (outlined link-button)
- height 36px; padding `6.5px 15px`; borderRadius 4px
- border `1px solid #7E239F`; color `#7E239F`; 14px / 21px weight 600; text-align center
- href `https://help.dsp.epom.com/docs/campaigns`

## States & Behaviors

### Select dropdowns (Status, Budget)
- **Trigger:** click the control
- **Trigger open state:** border `1px solid #7E239F`; borderRadius `3px 3px 0 0`
- **Panel** (`.select-values`): directly below the control, width 230px, z-index 999
  - backgroundColor `#FFFFFF`
  - `border-width: 0 1px 1px`, solid, colour `#7E239F` (no top border — it joins the trigger)
  - borderRadius `0 0 4px 4px`; maxHeight 190px; `overflow-y: auto`
- **Option rows** (`.select-value`): height 34px; padding `6px 12px 7px`; 14px / 21px; `#1A1C1E`
- **Selected option:** backgroundColor `rgba(126,35,159,0.16)`, fontWeight 600

**Status options (verbatim, in order):** `Active, Inactive` (selected), `Active`, `Inactive`, `Archived`
**Budget options (verbatim, in order):** `All` (selected), `Delivering`, `Scheduled`, `Paused`, `No current budget`

### Hover
- Buttons follow the shared hover rules (`#7E239F → #8D3DAB` primary; `rgba(126,35,159,0.08)` wash on outlined/icon buttons)
- Option rows highlight on hover

### Scroll
`.main` has `overflow: auto` but content fits at 1440×651, so no scrollbar appears.

## Text Content (verbatim)
- `All campaigns`
- Search placeholder `Search`
- `Status:` `Active, Inactive`
- `Budget:` `All`
- `Get started by creating your first Campaign`
- `Start by creating your first Campaign to launch ads.`
- `Create new Campaign`
- `View guide`

## Assets
- `public/images/explore/campaign.svg` (intrinsic 104×65, rendered 104×65)
- Material Icons Outlined: `more_horiz`, `help_outline`, `search`, `arrow_drop_down`, `filter_list`, `add_circle_outline`

## Responsive Behavior
**None** — see the folders-panel spec. The single media query that mentions this
page targets `.page-title.campaigns input`, which is absent in the empty state.
Layout is fixed at every width.
