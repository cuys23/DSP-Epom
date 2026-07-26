# Dashboard Content Specification (PageHeader + ChartCard empty state)

## Overview
- **Target files:** `src/components/PageHeader.tsx`, `src/components/ChartCard.tsx`
- **Screenshot:** `docs/design-references/desktop-1440-dashboard.jpg`
- **Interaction model:** click-driven (date-range dropdown, CTA button); otherwise static

## DOM Structure
```
<div page-wrapper>                    padding 32px
  <div page-header>                   margin-bottom 16px
    <div row>  flex, space-between, align-center
      <div page-title>  <h1>Dashboard</h1> <a help icon>
      <div daterange>   <input> + calendar icon
  <div card>                          white, radius 3px, padding 24px, min-height 438px
    <div no-data overlay>             absolute inset, height 350px, flex column, centred
      <div config-title>No data yet</div>
      <div config-no-data>You don't have campaigns yet</div>
      <div button-list><button>Create new campaign</button></div>
```

## Computed Styles

### Page wrapper
- padding: 32px (content begins at x=272, y=89 given the 240px sidebar and 57px topbar)

### Page header row
- display: flex; justifyContent: space-between; alignItems: center
- height 36px; `.page-header > .container { margin-bottom: 16px }`

### `h1`
- fontSize: 20px; lineHeight: 24px; fontWeight: 700
- color: `#1A1C1E`; margin: 0
- display: flex; alignItems: center; whiteSpace: nowrap

### Help icon (`a.help-center-icon`)
- display: flex; margin: `0 0 0 8px`; width/height 20px
- color: `#6F79DD`; cursor: pointer; transition `0.12s linear`
- `Material Icons Outlined` ligature `help_outline`, fontSize 20px
- href: `https://help.dsp.epom.com/docs/dashboard`

### Date-range input (`input.form-control`)
- width: 220px; height: 36px
- padding: `8px 48px 8px 12px`
- fontSize: 14px; lineHeight: 20px; color: `#1A1C1E`
- border: `1px solid #C4C6D0`; borderRadius: 4px
- transition: `border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out`
- value: `20.07.2026 - 26.07.2026`; placeholder `Select date`
- Wrapper is `position: relative`

### Calendar icon
- position: absolute; top: 8px; right: 12px
- width/height 20px; fontSize 20px; lineHeight 20px
- fontFamily `Material Icons` (filled, **not** outlined); ligature `event`
- color: `#7E239F`

### Card (`.component-charts-dashboard-container`)
- backgroundColor: `#FFFFFF`
- padding: 24px; margin: `0 0 16px`
- minHeight: 438px; borderRadius: 3px
- position: relative
- **boxShadow: none**

### No-data overlay (`.component-charts-no-data`)
- position: absolute; left: 0; top: 0; width: 100%; height: 350px; zIndex: 3
- display: flex; flexDirection: column; placeContent: center; textAlign: center
- background: `#FFFFFF`; padding: 0

### `.config-title`
- fontSize: 16px; lineHeight: 24px; fontWeight: 700
- color: `#1A1C1E`; margin: `0 0 8px`

### `.config-no-data`
- fontSize: 12px; lineHeight: 21px; fontWeight: 400
- color: `#74777F`

### `.button-list` wrapper
- margin-top: 16px (button sits 16px below the subtitle within a 53px block)

### CTA button (`button.button.button-primary`)
- display: inline-block; padding: `7.5px 16px`
- width: 178.188px (content-driven); height: 36px; minWidth: 96px
- fontSize: 14px; lineHeight: 21px; fontWeight: 600
- color: `#FFFFFF`; backgroundColor: `#7E239F`
- borderRadius: 4px; border: none
- boxShadow: `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)`
- cursor: pointer; whiteSpace: nowrap; transition: all

## States & Behaviors

### Date-range dropdown
- **Trigger:** click the input
- **Panel:** opens directly beneath the input, white, rounded, shadowed; ranges column `width: 216px`, `padding: 12px 12px 0`
- **Rows:** height 36px, width 100%, borderRadius 4px, marginBottom 4px, fontSize 14px, colour `#1A1C1E`
- **Hover:** `background: rgba(126,35,159,0.08)`
- **Active (`Last 7 days`):** `background: rgba(126,35,159,0.16)`, fontWeight 600, padding `7px 12px 8px`, lineHeight 21px
- **Options (verbatim, in order):** `Today`, `Yesterday`, `Last 7 days`, `Last 30 days`, `This month`, `Last month`, `Custom range`
- Closes on outside click.

### CTA button hover / active
- `:hover` → background `#8D3DAB`
- `:active` → background `#7E239F`, `box-shadow: none`
- `:disabled` → background `rgba(26,28,30,0.12)`

### Help icon hover
- colour shifts toward `#7E239F`, transition `0.12s linear`

## Hidden layer (documented, not built)
Beneath the overlay sits `.box-diagram` with a Highcharts 9.0.1 SVG line chart
(flat zero series, x-axis ticks `2026-07-20` … `2026-07-26`, y-axis `0`) and a
`Metric: Impressions` dropdown in its header. The whole layer is inside
`.fade-hidden` and is **not visible** at this URL for this account, so the clone
renders the empty state only.

## Text Content (verbatim)
`Dashboard` · `20.07.2026 - 26.07.2026` · `No data yet` ·
`You don't have campaigns yet` · `Create new campaign`

## Assets
Material Icons ligatures: `help_outline` (outlined), `event` (filled)

## Responsive Behavior
- Fixed desktop layout. The card is full-width within the 32px-padded wrapper at every size.
- No column changes, no stacking. Below ~1000px the whole page overflows horizontally.
