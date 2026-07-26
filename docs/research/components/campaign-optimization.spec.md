# Campaign Wizard — Optimization Tab Specification

## Overview
- **Target file:** `src/app/campaigns/new/optimization/page.tsx`
- **Screenshot:** `docs/design-references/campaign-new-1440-optimization.jpg`
- **Interaction model:** click-driven (three accordions, a toggle, a select, three buttons)
- **Content height:** scrollHeight 1096 vs client 594 → scrolls
- **Footer here is `Cancel · Previous · Save`** — no `Next`, this is the last step

## DOM Structure
```
<div form-box>                          Risk tolerance level
  <h3 headline-3 mb-8>
  <div no-auto-optimization-text mb-16> lead line + 3 dotted rows
  <custom-select>                       value "High"
<section form-box>                      Pixalate
  <div pixalate-block-content>
    <h3 headline-3 mb-8>
    <div no-auto-optimization-text mb-24>  fee notice
    <mat-slide-toggle>                  off + "Pixalate Optimization"
<section form-box>                      Filters
  <h3 headline-3 mb-24>
  <button button-outlined button-fw>    "Select Filters (0)"
<section optimization-accordion-item>   Events tracking — EXPANDED by default
  <div block-toggle block-toggle-big>   rotated arrow + label
  <div optimization-block-content>
    <div optimization-group>            two 352px items, gap 16
<section optimization-accordion-item>   Auto filling retargeting — collapsed
<section optimization-accordion-item>   SKAdNetwork — collapsed
<div page-footer>                       Cancel · Previous · Save
```

## Computed Styles

### Box (`.form-box` / `section.optimization-accordion-item`)
- padding: 24px; backgroundColor `#FFFFFF`; borderRadius 4px
- display: flex; flexDirection: column
- Boxes are separated by 16px

### Headings
- `h3.headline-3`: 16px / 24px, weight 700, `#1A1C1E`; `mb-8` = 8px, `mb-24` = 24px

### Descriptive text (`.no-auto-optimization-text`)
- fontSize: 12px; lineHeight: 18px; color: `#74777F`
- Risk block uses `mb-16`; Pixalate block uses `mb-24`

### Bullet row
- display: flex; alignItems: center; 12px / 18px; `#74777F`
- Dot: `circle` ligature at **fontSize 3px**, 3×3px, colour `#74777F`, margin-right 8px

### Select (`custom-select`)
- Same control as elsewhere: 720px × 36px, borderRadius 4px, border `1px solid #C4C6D0`
- Selected value `High` — 14px / 21px
- Caret `arrow_drop_down` 20px at the right edge

### Slide toggle (`mat-slide-toggle`, **off** state)
- bar: 36 × 20px; borderRadius 30px; backgroundColor `#FAF9FD`
- thumb: 10 × 10px; borderRadius 50%; backgroundColor `#74777F`; no shadow
- thumb container: 20 × 20px; transition `transform 0.08s linear`
- label (`.mat-slide-toggle-content`): 14px / 24px, weight 400, `#333333`, ~8px after the bar

### Full-width outlined button (`.button-outlined.button-fw`)
- width: 720px; height: 36px; padding `6.5px 15px`; borderRadius 4px
- border: `1px solid #7E239F`; background transparent; color `#7E239F`
- fontSize 14px; fontWeight 600; lineHeight 21px; textAlign center

### Accordion header (`.block-toggle.block-toggle-big`)
- display: flex; alignItems: center; cursor: pointer; height 24px
- icon `arrow_right`: 24px, colour `#1A1C1E`, width/height 24px
- label: 16px / 24px, weight 700, `#1A1C1E`, ~24px after the icon

### Accordion expanded state
- **Trigger:** click the header
- Icon gains `.rotate` → `transform: rotate(90deg)` (`matrix(0, 1, -1, 0, 0, 0)`), transition `all`
- Body `.optimization-block-content` appears with `margin-top: 24px`
- **`Events tracking` is expanded on load; the other two are collapsed.**

### Option group (`.optimization-group`)
- display: flex; gap: 16px
- `.optimization-group-item`: width 352px
- `.optimization-option-title`: 12px / 18px, weight 600, `#74777F`, margin-bottom 8px

### Disabled-looking button (`.optimization-button`)
- width 352px; height 36px; padding `6.5px 15px`; borderRadius 4px
- border: `1px solid rgba(26,28,30,0.3)`; color `rgba(26,28,30,0.3)`
- fontSize 14px; fontWeight 600; lineHeight 21px; textAlign center
- These render in a muted/disabled treatment (no campaign saved yet)

## Text Content (verbatim)
- `Risk tolerance level`
- `Set the level of fraud risk you're willing to accept.`
- `Low: Blocks more traffic, stricter filtering.`
- `Medium: Balanced approach between reach and protection.`
- `High: Only blocks the riskiest traffic, maximum reach.`
- Select value: `High`
- `Pixalate`
- `A technology fee of $0.10 CPM will be applied to all impressions in this campaign to enable Pixalate's MRC-accredited analytics. This includes fraud detection, viewability measurement, and supply chain optimization to help improve your ROI.`
- `Pixalate Optimization`
- `Filters` · `Select Filters (0)`
- `Events tracking` · `Tracking Pixels/URLs` · `Tracking Pixels/URLs (0)` · `Attribution Links` · `Attribution Links`
- `Auto filling retargeting`
- `SKAdNetwork`
- Footer: `Cancel`, `Previous`, `Save`

## Assets
Material Icons Outlined: `circle`, `arrow_drop_down`, `arrow_right`

## Responsive Behavior
- Fixed desktop layout; controls stay 720px and option items 352px.
- Below ~1000px the page overflows horizontally.
