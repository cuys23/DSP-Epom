# Campaign Wizard — Basic Info Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/page.tsx`
- **URL:** `/campaigns/new` — document title `Campaign settings | Epom Market`
- **Screenshot:** `docs/design-references/campaign-new-1440-basic-info.jpg`
- **Interaction model:** static form (no data binding required — inputs are presentational)
- **Content height:** `.page-wrapper` scrollHeight 917 vs client 594 → scrolls

## DOM Structure
```
<div form-box>                      Basic settings
  <h3 headline-3 mb-24>
  <div form-control-wrapper>        Name  (custom-input)
  <div mt-16>                       Folder (select-input)
  <div mt-16>                       Tags (tags-dropdown) + "Max 3 tags"
<div form-box mt-16>                Bid Price
  <h3 headline-3 mb-24>
  <div two-controls-row>            Pricing Model (flex-1) + Default Price (flex-2)
  <app-banner-info mt-16>           info banner
<div info-banner warning>           "Flight dates..." — outside the boxes
<div page-footer>                   Cancel · Next · Save
```

## Shared form primitives (reused by all six tabs)

### `.form-box`
- backgroundColor: `#FFFFFF`; borderRadius: 4px; padding: 24px
- display: flex; flexDirection: column
- Subsequent boxes carry `mt-16` (margin-top 16px)

### `h3.headline-3`
- fontSize: 16px; lineHeight: 24px; fontWeight: 700; color: `#1A1C1E`
- margin: `0 0 24px`

### Field label — `.custom-input__label` / `.control-label`
- fontSize: 12px; lineHeight: 18px; fontWeight: 600; color: `#74777F`
- `.control-label` has margin-bottom 4px; `.custom-input__label` uses `display: flex; align-items: flex-end`
- Required asterisk: `*`, 12px/18px, weight 600, color `#7E239F`, margin-left 4px

### Text input — `.custom-input__field`
- height: 36px; width: 100%
- padding: `2px 12px`; borderRadius: 4px
- border: `1px solid #C4C6D0`
- fontSize: 14px; lineHeight: 15.4px; color: `#1A1C1E`

### Select — `.select-wrapper` / `.select-title`
- wrapper: position relative, height 36px
- title box: height 36px; padding: `6px 36px 7px 11px`; borderRadius 4px; border `1px solid #C4C6D0`; display flex
- placeholder text: 14px / 21px, color `#74777F`
- selected value (`label.mb-0`): 14px / 21px, color inherits `#1A1C1E`
- caret: `arrow_drop_down` outlined, 20×20, positioned right (at x=983 in a 720px control → ~12px from the right edge)
- Read-only variant (`.read-only`, used by Pricing Model) looks identical

### Field group spacing
- Each field block is 58px tall (18px label + 4px gap + 36px control)
- Successive blocks use `mt-16`

### Two-column row — `.two-controls-row`
- display: flex; gap: 16px
- children `flex-1` and `flex-2` → 235px and 469px inside a 720px row

### Control width
Controls are **720px** inside an 818px content box (they do not stretch full width).

### Helper text — `.text-info`
- fontSize: 12px; lineHeight: 18px; color: `#74777F`; margin-top: 4px

### Info banner — `.info-banner.info`
- backgroundColor: `#CCDEF2`; color: `#1A1C1E`
- padding: 16px; borderRadius: 4px
- display: flex; alignItems: start; gap: 16px; width: 720px
- icon `info` (Material Icons Outlined), 16px, color `#005BC0`
- Bold lead line uses `.text-semi-bold`
- Bullet list: `ul.list-disc` with margin-top 8px, items 20px line-height

### Warning banner — `.info-banner.warning`
- backgroundColor: `#FFEFD5`; color: `#1A1C1E`
- padding: 16px; borderRadius: 4px
- display: flex; alignItems: center; gap: 16px; width: 720px
- icon `warning`, 16px, color `#987100`

## Text Content (verbatim)

**Basic settings**
- `Basic settings`
- `Name` * — placeholder `Enter Name`
- `Folder` * — placeholder `Select Folder`
- `Tags` — placeholder `Enter tags`; helper `Max 3 tags`

**Bid Price**
- `Bid Price`
- `Pricing Model` * — value `CPM` (read-only select)
- `Default Price` * — placeholder `Enter Default Bid Price`
- Info banner lead: `Set your price per 1,000 ad views`
- Bullet 1: `Use the Recommended Price as a starting point. (calculated based on ad format, geo and device type)`
- Bullet 2: `You can update your price at any time.`

**Warning banner**
- `Flight dates and limits have been moved to the Budget tab.`

**Footer:** `Cancel`, `Next`, `Save`

## States & Behaviors
- **Inputs:** presentational in the clone. Focus state follows the shared input treatment (border → `#7E239F`).
- **Selects:** the live Folder select opens a dropdown panel; Pricing Model is `.read-only`. Clone renders them closed — opening is not part of this URL's default state.
- No scroll-driven, time-driven, or tab-switching behaviour inside the form.

## Assets
Material Icons Outlined: `arrow_drop_down`, `info`, `warning`, `help_outline`

## Responsive Behavior
- Fixed desktop layout. Controls stay 720px; the 866px column is `calc(100% - 270px)`.
- Below ~1000px the whole page overflows horizontally, as elsewhere in this app.
