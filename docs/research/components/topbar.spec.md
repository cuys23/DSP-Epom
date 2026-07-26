# TopBar Specification

## Overview
- **Target file:** `src/components/TopBar.tsx`
- **Screenshot:** `docs/design-references/desktop-1440-dashboard.jpg`
- **Interaction model:** click-driven (language dropdown, user dropdown)

## DOM Structure
```
<header><div top-bar>                 56.5px, bg #fff, border-bottom .5px #C4C6D0
  <div top-bar-row>                   flex, space-between, align-center, gap 44px, min-height 56px
    <div left>  <ul breadcrumb>       home icon link + "/" + "Dashboard"
    <div right> <ul nav>              balance · timezone · language · user
```

## Computed Styles

### Container (`.top-bar`)
- backgroundColor: `#FFFFFF`
- height: 56.5px
- padding: `0 32px 0 26px`
- borderBottom: `0.5px solid #C4C6D0`

### Row (`.top-bar-row`)
- display: flex; justifyContent: space-between; alignItems: center
- gap: 44px; minHeight: 56px

### Breadcrumb (`ul.breadcrumb`)
- display: flex; padding: `4px 0`
- fontSize: 12px; lineHeight: 17.1429px; color: `#333333`
- Home icon: `Material Icons Outlined` ligature `home`, 16px, colour `#7E239F`, link to `/dashboard`
- Separator: `/` — muted
- Current crumb: `Dashboard`, 12px

### Right section (`ul.header-nav`)
- display: flex; align-items: center; height 36px

### Balance button (`.button.button-primary-text`)
- display: inline-block; padding: `6.5px 16px`
- fontSize: 14px; lineHeight: 21px; fontWeight: 600
- color: `#7E239F`; background: transparent
- border: `1px solid transparent`; borderRadius: 4px; minWidth: 96px
- Label span `Balance:` colour `#7E239F`
- Value span `$0` colour `#006D3E` (positive variant), same size/weight

### Timezone button (`.button.button-primary-text.ml-12`)
- same text-button treatment, `margin-left: 12px`
- text: `UTC+00:00`

### Language toggle (`.dropdown-toggle.user-btn`)
- display: flex; align-items: center; justify-content: center; gap: 8px
- padding: `7.5px 16px`; borderRadius: 5px; position: relative; overflow: hidden
- fontSize: 14px; lineHeight: 20px; color: `#7E239F`
- `EN` span 14px; caret `arrow_drop_down` 20px `Material Icons Outlined`
- aria-label: `Language`

### User toggle (`.dropdown-toggle.user-btn`)
- same box as language toggle; colour `#6F79DD`
- `person` icon 20px + `.user-nickname` + `arrow_drop_down` 20px
- `.user-nickname`: fontSize 14px; lineHeight 20px; fontWeight 600; color `#7E239F`; maxWidth 150px; overflow hidden; whiteSpace nowrap

## States & Behaviors

### Language dropdown
- **Trigger:** click toggle
- **Menu:** absolute; `top: 49px`; right-aligned; width 101px; minWidth 101px; background `#FFFFFF`; padding 2px; borderRadius `4px 4px 3px 3px`; boxShadow `0 6px 12px rgba(0,0,0,0.176)`; zIndex 1000
- **Items:** `EN`, `中文`, `UA`, `DE`, `FR`, `ES`, `PT` — 36px rows, padding `7px 12px 8px`, radius 4px, fontSize 14px, lineHeight 21px
- **Active (`EN`):** background `rgba(126,35,159,0.12)`, fontWeight 600, colour `#1A1C1E`
- **Hover:** `rgba(126,35,159,0.08)`

### User dropdown
- **Trigger:** click toggle. Toggle gains background `rgba(126,35,159,0.08)` while open.
- **Menu:** absolute; `top: 49px`; right-aligned; width 324px; padding 2px; radius `4px 4px 3px 3px`; shadow `0 6px 12px rgba(0,0,0,0.176)`; zIndex 1000
- **Header block:** padding `8px 16px`
  - username `Minh Do` — 14px/21px, weight 600, `#1A1C1E`
  - email `admin@vinmedia.net` — 12px/18px, weight 400, `#74777F`
- **Actions block:** `margin-top: 4px`; each row 36px, padding `4px 12px`, margin `0 4px`, radius 4px, display flex, align-items center, fontSize 14px, lineHeight 21px, colour `#1A1C1E`
  - `Edit profile`, `Review Us on G2`, `Help center`, `Sign out`
- **Hover:** `rgba(126,35,159,0.08)`

### Text-button hover states
- `:hover` → background + border-color `rgba(126,35,159,0.08)`
- `:active` → `rgba(126,35,159,0.12)`

### Outside click
Both dropdowns close on outside click / Escape.

## Text Content (verbatim)
`Dashboard` · `Balance:` · `$0` · `UTC+00:00` · `EN` · `Minh Do` · `admin@vinmedia.net`
· `Edit profile` · `Review Us on G2` · `Help center` · `Sign out`

## Assets
Material Icons Outlined ligatures: `home`, `arrow_drop_down`, `person`

## Responsive Behavior
- **≥960px:** `.user-nickname` visible (`display: inline-block`).
- **<960px:** username hidden, only the `person` icon + caret remain. This is the single real media query on the page.
- **<~1000px:** the breadcrumb label is squeezed out by the flex row and the page overflows horizontally. No stacking, no hamburger.
