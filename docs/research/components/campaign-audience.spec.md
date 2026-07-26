# Campaign Wizard — Audience Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/audience/page.tsx` (route `/campaigns/new?tab=audience` on the live site)
- **Screenshot:** `docs/design-references/campaign-new-1440-audience.jpg`
- **Interaction model:** click-driven (Add moves an item from Available to Linked; search filters). Presentational in the clone.
- **Content height:** scrollHeight 595 vs client 594 — effectively no scroll

## DOM Structure
```
<div page-content>                    flex, gap 16, margin-top 16, radius 4
  <div content-body>                  white, padding 24, flex column
    <div additional-info>             lead text + "Create new Audience" pulled right
    <div select-popup-content mt-32>  flex row, gap 16 — the dual list
      <div column pr-20>              left: Available
        <label table-list-label>
        <epom-search-input>           input + absolute search icon
        <ul table-list>
          <li table-list-item-card>   name link + Add button
      <hr vertical-line>              1px divider
      <div column column-right>       right: Linked
        <label ...selected-label mb-16>
        <div description-text text-center>
<div page-footer>                     Cancel · Previous · Next · Save
```

## Computed Styles

### `.page-content`
- display: flex; gap: 16px; margin-top: 16px; borderRadius: 4px; width: 866px

### `.content-body`
- backgroundColor: `#FFFFFF`; padding: 24px
- display: flex; flexDirection: column; flex: 1 1 0

### `.additional-info` (lead text)
- fontSize: 14px; lineHeight: 21px; color: `#74777F`; height: 36px
- Text: `Choose the audience to target.`

### `Create new Audience` button (`.button-primary.button-with-icon`)
- display: flex; alignItems: center; gap: 8px
- padding: `7.5px 16px`; height: 36px; minWidth: 96px; borderRadius: 4px
- backgroundColor: `#7E239F`; color: `#FFFFFF`
- fontSize: 14px; fontWeight: 600; lineHeight: 21px
- boxShadow: `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)`
- Leading icon: `add_circle_outline`, 16px
- Floated right (`pull-right`) on the same 36px row as the lead text

### `.select-popup-content` (dual-list row)
- display: flex; flexDirection: row; gap: 16px; margin-top: 32px; height: 230px

### `.column` (left)
- flex: 1 1 0; padding-right: 20px
- `.column-right` has no right padding; its children are inset ~16px from the divider

### Column heading (`.table-list-label`)
- fontSize: 14px; fontWeight: 700; lineHeight: 21px; color: `#1A1C1E`
- The `Linked` heading adds `margin-bottom: 16px`

### Search input (`.custom-search-input`)
- height: 36px; width: 100%; padding: `8px 12px`
- borderRadius: 4px; border: `1px solid #C4C6D0`
- fontSize: 14px; color: `#1A1C1E`; placeholder `Search`
- transition: `border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out`
- Wrapper has `mt-16 mb-32`
- Icon `search`: position absolute, 20×20, color `#74777F`, right-aligned inside the field

### List item (`li.table-list-item-card`)
- height: 52px; padding: `7px 8px 11px 16px`
- borderRadius: 4px; border: `1px solid #C4C6D0`
- display: flex; flexDirection: column; justifyContent: space-between; gap: 4px
- Inner `.select-rows` is a 32px row holding the name and the action

### Item name (`a.link-item`)
- fontSize: 14px; fontWeight: 600; lineHeight: 18px
- color: `#7E239F`; `text-decoration: underline`
- transition: `0.12s linear`

### `Add` button (`.button-add`)
- height: 32px; padding: `7px 8px`; borderRadius: 4px; border: none; background: transparent
- display: flex; justifyContent: center; alignItems: center; gap: 4px
- fontSize: 12px; fontWeight: 600; lineHeight: 18px; color: `#7E239F`
- Leading icon: `add_circle_outline`

### Divider (`hr.vertical-line`)
- width: 1px; height: 230px; backgroundColor: `#C4C6D0`

### Empty text (`.description-text.text-center`)
- fontSize: 12px; lineHeight: 18px; color: `#74777F`; textAlign: center

### Footer button — `Previous` (`.button-outlined`)
**New variant, distinct from `Cancel`:**
- padding: `6.5px 15px`; width/minWidth: 96px; height: 36px; borderRadius: 4px
- border: `1px solid #7E239F`; background: transparent
- fontSize: 14px; fontWeight: 600; lineHeight: 21px; color: `#7E239F`; textAlign: center

(`Cancel` remains `.button-outlined-grey`: `1px solid #74777F`, color `#1A1C1E`.)

## States & Behaviors
- **Add click:** moves the audience from Available into Linked and increments the `(n/5)` counter. Presentational in the clone.
- **Search:** filters the Available list client-side. Presentational in the clone.
- **Item name link:** navigates to the audience edit page.
- No scroll-, hover- or time-driven behaviour beyond standard button/link hovers.

## Text Content (verbatim)
- `Choose the audience to target.`
- `Create new Audience`
- `Available` · placeholder `Search` · item `Test` · `Add`
- `Linked (0/5)` · `No linked Audiences.`
- Footer: `Cancel`, `Previous`, `Next`, `Save`

The single Available item is real account data (an audience named `Test`).

## Assets
Material Icons Outlined: `add_circle_outline`, `search`

## Responsive Behavior
- Fixed desktop layout; the two columns stay side by side at every width.
- Column widths are `flex: 1 1 0` within the 818px content box → ~385px / ~401px.
- Below ~1000px the page overflows horizontally.
