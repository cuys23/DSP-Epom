# Sidebar Specification

## Overview
- **Target file:** `src/components/Sidebar.tsx`
- **Screenshot:** `docs/design-references/desktop-1440-dashboard.jpg`
- **Interaction model:** click-driven (collapse toggle, submenu expand, nav links)

## DOM Structure
```
<aside>                       fixed, 240px, bg #060028, z-index 1000
  <div header>                76px, flex, space-between, align-center, padding 16px
    <a href="/"><img logo></a>
    <button collapse>         material-icons "start"
  <nav scroll>                flex-1, overflow-y auto, custom scrollbar
    <ul>
      <li><a>                 41px row
        <span icon>           material-icons-outlined, absolute left 11px, 18px
        <div label>           14px/21px
        <i arrow>             optional, absolute left 187.5px — only for parents
      <ul submenu>            conditional; child rows indented
  <nav footer>                absolute bottom
    <div version>
    <a>Privacy Policy</a><a>Terms and Conditions</a>
```

## Computed Styles

### Container
- position: fixed; top: 0; left: 0; bottom: 0
- width: 240px; z-index: 1000
- backgroundColor: `#060028`
- transition: `0.12s linear`

### Header
- height: 76px; padding: 16px
- display: flex; justifyContent: space-between; alignItems: center
- Logo `img`: 122.219px × 44px, `public/images/logo.png` (intrinsic 500×180), alt `Epom Market`, cursor pointer
- Collapse icon: fontFamily `Material Icons`, ligature `start`, fontSize 20px, lineHeight 20px, color `#A9ABB4`

### Nav scroll region
- starts at y=76; `overflow-y: auto`; fills remaining height
- Scrollbar is thin/custom; hidden when collapsed

### Nav item — anchor (`li > a`)
- display: block; position: relative
- height: 41px; padding: `10px 45px 10px 35px`
- fontSize: 14px; lineHeight: 21px; fontWeight: 400
- color: `#8E969C`
- cursor: pointer; transition: `0.12s linear`

### Nav item — icon span
- position: absolute; left: 11px; top: 0
- width: 18px; height: 41px; lineHeight: 41px
- fontSize: 18px; fontFamily: `Material Icons Outlined`
- color: inherits `#8E969C`

### Nav item — label
- fontSize: 14px; lineHeight: 21px
- color: `#8E969C`
- overflow: hidden; whiteSpace: nowrap; padding-right: 1px

### Nav item — arrow (parents only)
- position: absolute; left: 187.5px; top: 10px
- width: 20px; height: 25px; color: `#8E969C`
- ligature `arrow_right` collapsed → `arrow_drop_down` expanded
- transition: `0.12s linear`

### Active item (`li.active > a`)
- backgroundColor: `#447FF9`
- color: `#FFFFFF` (label and icon)

### Submenu child (`a.inside-item`)
- same 41px row height
- icon at x=34 (i.e. `left: 32px`), label at x=60 (`padding-left: 58px`)
- inherits idle colour; active child gets `#447FF9` bg + white text

### Footer nav
- position: absolute; bottom: 0; width: 100%
- Version block: fontSize 10px; lineHeight 14.2857px; color `#D3D1D5`; padding 4px; text-align center; two lines (`Version 8.2`, `Epom Ltd. © 2026`); transition `0.2s`
- Legal links: fontSize 14px; lineHeight 20px; fontWeight 600; color `#7E239F`; `text-decoration: underline`; laid out inline filling the 240px row (92px + 148px, no gap)

## States & Behaviors

### Collapse toggle
- **Trigger:** click the `start` icon
- **State A (expanded):** width 240px; logo visible; labels visible; footer visible
- **State B (collapsed):** visible width 78px; labels and logo hidden; footer `opacity: 0`; icons horizontally centred; active row keeps `#447FF9` and gains `border-right: 2px solid #447FF9`
- **Transition:** `0.12s linear`
- **Implementation:** lift state to the page, animate `width`, centre icons when collapsed. Do **not** copy the original's negative-`left` + per-element `translate` hack.

### Submenu expand
- **Trigger:** click the arrow chevron only (label click navigates)
- Child `<ul>` expands in place; parent arrow rotates `arrow_right` → `arrow_drop_down`

### Hover
- Non-active `li > a`: `background: rgba(68,127,249,0.08)`, transition `0.12s linear`
- Active item: no hover change
- Collapse icon: `color → #7E239F`

## Content (verbatim, in order)

| Label | Icon ligature | href | Children |
|---|---|---|---|
| Explore | `rocket_launch` | /explore | — |
| Dashboard | `dashboard` | /dashboard | — (**active**) |
| Campaigns | `campaign` | /campaigns | — |
| Audience | `groups` | /audience | — |
| Conversion Tracking | `link` | /conversion-tracking | — |
| Analytics | `assessment` | /analytics | Analytics (`assessment`, /analytics), Traffic Funnel (`leaderboard`, /traffic-funnel) |
| Creative Assets | `image` | /creative-assets | — |
| Filters | `filter_alt` | /filters | — |
| Retargeting | `sync` | /retargeting/ifa | Segments (`segment`, /retargeting/segments), IFA Lists (`adjust`, /retargeting/ifa), User IDs (`person_pin_circle`, /retargeting/user-ids) |
| Custom Locations | `location_on` | /custom-locations | — |
| Billing | `credit_card` | /billing | — |
| Planning | `calendar_month` | /planning | Media plannings (`bar_chart`, /planning), Demand Analytics (`data_usage`, /demand-analytics) |
| Autopilot | `play_circle` | /autopilot | Bidding Rules (`device_hub`, /autopilot/bidding-rules), Autopilot Log (`published_with_changes`, /autopilot/autopilot-logs), Bid Modifiers (`price_change`, /autopilot/bid-modifiers) |
| Tag Manager | `sell` | /tag-manager | — |
| Access Management | `how_to_reg` | /manager/access-management | — |
| User Activity | `query_builder` | /manager/user-activity | — |

Footer text: `Version 8.2`, `Epom Ltd. © 2026`, `Privacy Policy`, `Terms and Conditions`

## Assets
- `public/images/logo.png` (500×180 PNG, rendered 122×44)
- Material Icons Outlined ligature font (`public/fonts/material-icons-outlined.woff2`)

## Responsive Behavior
- Fixed 240px at every width — the original never collapses automatically or turns into a drawer.
- Below ~1000px the page overflows horizontally; the sidebar stays put.
