# Campaigns — Folders Panel Specification

## Overview
- **Target file:** `src/components/FoldersPanel.tsx`
- **Screenshot:** `docs/design-references/campaigns-1440.jpg`
- **Interaction model:** click-driven (collapse toggle, folder select, add folder, per-folder actions menu)
- New layout element: a second sidebar between the main nav and the content column.

## Layout mechanism

The page content is a CSS grid whose first column is the panel:

```css
.page-content-grid {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;   /* 233px 871px at 1440 */
  gap: 32px;
  transition: grid-template-columns 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
```

The panel itself breaks out of the wrapper's 32px padding so it sits flush against
the main sidebar and spans the full viewport height:

- `app-campaign-folders`: `margin: -32px 0 -32px -28px`; width 261px (233 grid cell + 28 bleed)
- backgroundColor `#FFFFFF`; `border-right: 0.5px solid #C4C6D0`
- `overflow: hidden`; `white-space: nowrap` — this is what clips labels when collapsed
- Rendered rect at 1440: `[244, 57, 261, 594]`

`.main` mirrors the trick: `margin: -32px; padding: 32px; overflow: auto` → `[505, 57, 935, 594]`.

## Computed Styles

### `.folders-main`
- padding: `24px 0 0`; display: flex; flexDirection: column; width 260.5px

### `.folders-top` (the "All campaigns" row, active)
- padding: `10px 24px`; height: 41px
- display: flex; justifyContent: space-between
- backgroundColor: `rgba(126, 35, 159, 0.12)` (active state)
- fontSize: 14px; lineHeight: 21px; color: `#1A1C1E`; cursor: pointer
- count span: same size, color `#74777F`, `margin-right: 4px` on the label before it
- collapse icon: ligature `start`, 20×20, color `#74777F`, `transform: rotate(180deg)`

### `.folders-title` (the "Folders" header row)
- padding: `24px 24px 12px`; margin-top: 8px; height: 61px
- borderTop: `1px solid #C4C6D0`
- display: flex; justifyContent: space-between; alignItems: center
- `h3`: fontSize 16px; lineHeight 24px; **fontWeight 600**; color `#1A1C1E`; margin 0
- add button: ligature `add_circle_outline`, fontSize 16px in a 20×20 box, color `#7E239F`

### `.folders-search`
- padding: `0 24px 12px`; height: 48px
- input: 200 × 36px; padding `8px 12px`; borderRadius 4px; border `1px solid #C4C6D0`; 14px; `#1A1C1E`; placeholder `Search`
- trailing `search` icon 20×20, `#74777F`, absolutely positioned right

### `.folders-list li`
- padding: `10px 24px`; height: 42px
- display: flex; justifyContent: space-between; alignItems: center; gap: 8px
- cursor: pointer; transition: `0.1s`
- `.folder-name`: 14px / 20px, `#1A1C1E`, `flex: 1 1 0`, overflow hidden, nowrap
- `.count`: 14px / 20px, `#74777F`, margin-left 4px, `flex: 0 0 auto`
- actions button: 32 × 22px, padding `1px 6px`, transparent, no border; icon `more_horiz` 16px in a 20×20 box, `#7E239F`

## States & Behaviors

### Collapse toggle
- **Trigger:** click the `start` icon in `.folders-top`
- **Mechanism:** `.folders-main` gains `.folders-collapsed`, and `--sidebar-width` goes **233px → 51px**
- **Transition:** `grid-template-columns 0.12s cubic-bezier(0.4, 0, 0.2, 1)`
- **Collapsed geometry:** grid `51px 1053px`; panel rect `[244, 57, 79, 594]` (51 + 28 bleed); `.main` `[323, 57, 1117, 594]`
- **Collapsed content changes:**
  - a new centred row (`div.d-flex.content-center`) appears at the top holding the toggle icon
  - the "All campaigns" label, the `Folders` h3, and the search input are hidden — only the `(0)` count and the ⊕ icon remain
  - folder rows keep the name but it clips: `.folders-collapsed .folders-list li { padding: 10px 16px }`, so "Unsorted" renders as "U"

### Folder actions (`more_horiz`)
- Present on each folder row and beside the page title.
- On this account (0 campaigns) the page-title instance renders at **opacity 0.5** and opens nothing — it is inert until campaigns exist.

### Hover
- `.folders-list li` — transition `0.1s`; row highlight on hover
- Add / actions icon buttons use the shared icon-button hover (`rgba(126,35,159,0.08)` wash)

## Text Content (verbatim)
- `All campaigns` `(0)`
- `Folders`
- Search placeholder: `Search`
- `Unsorted` `(0)`

## Assets
Material Icons Outlined: `start`, `add_circle_outline`, `search`, `more_horiz`

## Responsive Behavior
**None.** The only media query touching this page is
`@media (max-width: 767px) { .page-title.campaigns input { display: none } }`,
and that input does not exist in the empty state. The grid columns, panel width
and bleed margins are fixed at every viewport, matching the rest of the app.
