# Creative Type Page Specification (page header + card grid)

## Overview
- **Target files:** `src/app/campaigns/new/creative-type/page.tsx`, `src/components/CreativeTypeCard.tsx`
- **Screenshots:** `docs/design-references/creative-type-1440-top.jpg`, `creative-type-1440-scrolled.jpg`
- **Interaction model:** click-driven (each card navigates to the next wizard step); hover changes card shadow
- **URL:** `/campaigns/new/creative-type` — document title is `Epom Market` (no page prefix)

## DOM Structure
```
<div page-wrapper>              h: calc(100vh - 57px), overflow-y auto, padding 32px
  <app-campaign-wizard>         max-width: calc(100% - 270px)
    <div page-header>           h1 + help icon, margin-bottom 16px
    <div cat-list>
      <div row row-space-16>    margin 0 -8px
        <div col>×4             padding 0 8px, width 33.3333%
          <a cat-box>           278×270 card
            <img>               SVG illustration, margin-bottom 32px
            <span>              absolute inset 214px 0 0 0 — the label
  <app-campaign-summary>        fixed right rail (separate spec)
```

## Computed Styles

### Page wrapper
- height: `calc(100vh - 57px)`; overflow-y: auto; overflow-x: auto
- padding: 32px

### Wizard container (`app-campaign-wizard`)
- display: block
- maxWidth: `calc(100% - 270px)` — reserves space for the fixed summary rail

### Page header
- `.page-header > .container { margin-bottom: 16px }`

### `h1`
- fontSize: 20px; lineHeight: 24px; fontWeight: 700
- color: `#1A1C1E`; margin: 0
- display: flex; alignItems: center
- Help icon: `a.help-center-icon`, margin-left 8px, 20×20, color `#6F79DD`, ligature `help_outline` (outlined), href `https://help.dsp.epom.com/docs/creative`

### Grid row (`.row.row-space-16`)
- margin: `0 -8px`

### Grid column
- padding: `0 8px`
- width: `33.3333%` (≥992px) → measured 293.992px at 1440
- position: relative; minHeight: 1px

### Card (`a.cat-box`)
- display: flex; flexDirection: column; alignItems: center; justifyContent: flex-end
- width: 277.992px; height: 270px; minHeight: 270px
- padding: `36px 15px`; margin: `0 0 16px`
- backgroundColor: `#FFFFFF`; borderRadius: 4px
- boxShadow: `0 0 5px rgba(0,0,0,0.05), 0 1px 2px rgba(24,28,34,0.15)`
- textAlign: center; color: `#6F79DD`
- position: relative; cursor: pointer
- transition: `0.12s linear`

### Card illustration (`img`)
- display: inline-block; maxWidth: 100%
- marginBottom: 32px
- rendered ~248 × 139–141px (intrinsic 277–279 × 155–159)

### Card label (`span`)
- position: absolute; inset: `214px 0 0 0` (so it occupies the bottom 56px of the card)
- fontSize: 16px; fontWeight: 700; lineHeight: 22.8571px
- color: `#1A1C1E`; textAlign: center
- textTransform: capitalize

## States & Behaviors

### Card hover
- **Trigger:** pointer hover
- **State A:** boxShadow `0 0 5px rgba(0,0,0,0.05), 0 1px 2px rgba(24,28,34,0.15)`
- **State B:** boxShadow `-1px 0 20px rgba(24,28,34,0.08), 0 1px 5px rgba(0,0,0,0.18)`; borderColor `#CCCCCC`
- **Transition:** `0.12s linear`

### Card active
- `:active` reverts to the base shadow (`--shadow-card-color`)

### Card click
- Navigates to `/campaigns/new` (the Basic Info wizard step). The cards are **navigation, not selection** — no selected/highlighted state exists on this page.
- Verified: clicking "Banner" loads `/campaigns/new` and the summary rail then reads `Creative type: Banner`.

### Scroll
- `.page-wrapper` scrolls independently (scrollHeight 688 vs client 594 at 1440×651). The body itself does not scroll, and the summary rail does not move with it.

## Text Content (verbatim)
- Heading: `Create new campaign: choose creative type`
- Card labels, in order: `Banner`, `Video`, `Native`, `Interstitial`

## Assets
- `public/images/creatives/banner-creative.svg` (277×155)
- `public/images/creatives/video-creative.svg` (279×159)
- `public/images/creatives/native-creative.svg` (279×159)
- `public/images/creatives/interstitial-creative.svg` (279×159)
- Icon: `help_outline` (Material Icons Outlined)

## Responsive Behavior
Bootstrap 3 grid; the sidebar (240px) and summary rail (270px) stay fixed at every width, so the content column is squeezed rather than reflowed.

- **≥992px:** 3 columns (`col-md-4`, 33.3333%). At 1440 the wizard area is 866px, columns 294px, cards 278px.
- **768–991px:** 2 columns (`col-sm-6`, 50%). At 768 the wizard area collapses to **194px** and columns to 105px — cards and illustrations are heavily squeezed, and the page overflows horizontally.
- **<768px:** no `col-xs` class, so columns fall back to full width (single column).
- **Breakpoints:** 992px (3→2 columns), 768px (2→1 column).
