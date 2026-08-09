# Campaign Edit Wizard — Budgets step Specification

## Overview
- **Live URL:** `/campaigns/edit/dadb539e-a65a-45bf-8764-ffc55d87506d?step=budgets`
- **Target files:**
  - `src/components/CampaignEditWizard.tsx` (shell: header, tabs, footer, rail slot)
  - `src/components/CampaignEditSummaryRail.tsx` (fixed 240px rail)
  - `src/components/CampaignBudgetsStep.tsx` (filter bar + budget card + empty state)
  - `src/app/campaigns/edit/[id]/page.tsx` — branches on `?step=`
- **Screenshots:**
  - `docs/design-references/campaign-edit-1440-budgets.jpg`
  - `docs/design-references/campaign-edit-1440-budgets-empty.jpg`
- **Interaction model:** click-driven throughout. Nothing scroll-driven, no entrance
  animations, no scroll-snap, no smooth-scroll library.

> **Not the same page as `CampaignSettingsView`.** That component clones
> `/campaigns/edit/<id>?viewMode=true` (the read-only two-column overview). This is
> the *edit wizard*: five steps, a fixed summary rail, and a pinned action footer.

## Page layout

```
.page-wrapper                          240,57  1200×650   (no padding of its own)
└── app-campaign-wizard-page.page-main  flex column, height 100%
    ├── .wizard-content   padding 32, flex:1, overflow:auto
    │   └── .wizard-main  flex:1, max-width: calc(100% - 240px)   → 896px @1440
    │       ├── .wizard-header      margin-bottom 16, height 30, flex, items-center
    │       ├── stepper.mb-16       tab strip, height 34
    │       └── wizard-content      the step body
    └── app-campaign-wizard-footer  1200×68.5, bg #fff, border-top .5px #C4C6D0
        └── .page-footer  padding 16px 24px, max-width calc(100% - 240px),
                          display flex, justify-content flex-end, gap 16

app-campaign-wizard-summary.wizard-summary   position: fixed; top: 57px; right: 0;
    width: 240px; height: calc(100% - 57px); overflow-y: auto;
    background: #fff; border-left: .5px solid #C4C6D0
```

The main column and the summary rail scroll independently. The footer is pinned to
the bottom of the viewport (last child of a full-height flex column), and its white
bar runs the full 1200px content width — the fixed rail simply sits on top of its
right-hand 240px.

## Computed styles

### Header
- `.wizard-header__title` (h1) — `20px / 600 / 30px`, colour `#333333`
- Help icon — Material `help_outline`, 20px, colour `--color-epom-link`,
  href `https://help.dsp.epom.com/docs/budget` (the link is per-step)
- Title text: `weigh loss`

### Tab strip (`stepper`)
Identical geometry to every other tab strip in this app:
- `ul` — height `34px`, `border-bottom: 1px solid #C4C6D0`
- `li` — `margin: 0 0 -1px`, position relative
- **active `a`** — `16px / 600 / 21px`, colour `#38CE9F`, `padding: 4px 0 8px`,
  `border-bottom: 2px solid #38CE9F`
- **idle `a`** — colour `#74777F`, `border-bottom: 2px solid transparent`,
  `transition: 0.12s linear`, `cursor: pointer`
- `margin-left: 32px` on all but the first
- Tabs (in order): `General`, `Audience`, `Price & Optimization`, `Budgets`,
  `Traffic source`. **Budgets is active.**
- Tabs have **no `href`** — they are JS handlers that swap the `?step=` query param.

### Filter bar — `.page-block.d-flex.items-center`
- `background: #fff`, `border-radius: 4px`, `padding: 16px 24px`,
  `display: flex; justify-content: space-between; align-items: center`, height `68px`

**Status multi-select** (`filter-select-component`), width `364px`:
- Trigger button — height `36px`, `padding: 6px 11px 7px`, `border-radius: 4px`,
  `border: 1px solid #C4C6D0`, display flex, align-items center, `cursor: pointer`
- `.dropdown-title` — `Status:`, `14px / 21px`, colour `#74777F`, `margin-right: 8px`
- `.selected-filters` — `14px / 21px`, colour `#1A1C1E`, `flex: 1`, `overflow-y: hidden`
- Arrow — Material `arrow_drop_down`, 20px, colour `#74777F`; flips to
  `arrow_drop_up` while open

**Create new Budget** — `.button-primary.button-with-icon`, width `185px`, height `36px`,
`background: #38CE9F`, white text, `14px / 600 / 21px`, `padding: 7.5px 16px`,
`border-radius: 4px`, `gap: 4px`, shadow `0 1px 2px rgba(24,28,34,.15), 0 0 5px rgba(0,0,0,.05)`,
leading Material `add_circle_outline` at 16px. Hover `#50D4AB`.

### Status dropdown panel (open state)
- `.custom-dropdown` — `position: absolute`, `margin-top: 40px`, width `364px`,
  `padding: 4px`, `background: #fff`, `border-radius: 4px`,
  `border-top: 1px solid #38CE9F`,
  `box-shadow: -1px 0 20px rgba(24,28,34,.05), 0 1px 5px rgba(0,0,0,.15)`
- `li` — height `36px`, `margin-bottom: 2px`, `border-radius: 4px`
- `a.filter-option` — `padding: 7px 12px 8px`, flex, 16px checkbox with `margin-right: 8px`
  - **checked:** `background: rgba(56,206,159,.12)`, `font-weight: 600`
  - **idle:** transparent background, `font-weight: 400`
- Options: `Delivering`, `Scheduled`, `Paused`, `Ended` — **all four checked by default**
- Trigger label is the checked options joined with `", "`.

### Budget card — `.page-block.budget-list-item` (`margin-top: 16px`)
- Card — `background: #fff`, `border-radius: 4px`, `padding: 16px`, height `134.5px`
- `.budget-card-header` — `padding-bottom: 20px`, flex, `justify-content: space-between`,
  `align-items: center`
  - `.headline-4` — `Budget`, `14px / 700 / 21px`, colour `#1A1C1E`
  - Status dot, `gap: 8px` from the title: Material `circle` at `10px` with
    `margin-right: 4px`, plus `12px / 18px` text. **`Ended` → colour `#1A1C1E`**
    (`status-wrapper-black`)
  - Right: `visibility` icon button, 20px, colour `#74777F`, tooltip `View Budget`
- `.budget-card-grid` — `display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px`
  - `.description-text` (label) — `12px / 18px`, colour `#74777F`, `margin-bottom: 4px`
  - `.text.text-sm` (value) — `12px / 18px`, colour `#1A1C1E`

Card content (verbatim):

| Column | Label | Value(s) |
|---|---|---|
| 1 | `Start date` | `July 28, 2026 07:03 UTC+0` |
| 2 | `End date` | `July 31, 2026 23:59 UTC+0` |
| 3 | `Spend limit / Impressions limit` | `$100 daily` · `10,000 daily Impressions` |
| 4 | `Even pacing` | `-` |

### Empty state — `.page-block.mt-16.budget-empty`
Replaces the card list when the status filter excludes every budget.
- `background: #fff`, `border-radius: 4px`, `padding: 24px`, `min-height: 160px`,
  `display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px`
- Two `.description-text` lines — `12px / 18px`, colour `#74777F`:
  - `No {selected statuses, lowercased, comma-joined} budget.`
  - `Try a different status filter to see more.`
- `Reset Filter` link — `12px / 600 / 18px`, colour `#38CE9F`, `margin-top: 8px`,
  flex, `gap: 4px`, leading Material `restart_alt` at 16px, `cursor: pointer`.
  Clicking it re-checks all four statuses.

### Footer buttons
Right-aligned, `gap: 16px`, each `96px × 36px`, `14px / 600 / 21px`, `border-radius: 4px`.
All four are **enabled**.

| Button | Class | Style |
|---|---|---|
| `Cancel` | `.button-outlined-grey` | transparent, `border: 1px solid #74777F`, text `#1A1C1E` |
| `Previous` | `.button-outlined` | transparent, `border: 1px solid #38CE9F`, text `#38CE9F` |
| `Next` | `.button-primary` | `#38CE9F`, white text, button shadow |
| `Save` | `.button-primary` | `#38CE9F`, white text, button shadow |

## Summary rail (`.summary`, padding 24, content width 191.5px)
- `h3.headline-3` — `Summary`, `16px / 700 / 24px`, colour `#1A1C1E`, `margin-bottom: 16px`
- Status row — `.description-text` `Status:` (`12px / 18px`, `#74777F`) + `gap: 8px`
  + slide toggle, currently **Off**
- `.summary__divider` — `height: .5px`, `background: #C4C6D0`, `margin: 16px -24px`
  (full-bleed through the 24px padding)
- Section heading `.text-md.text-semi-bold` — `14px / 600 / 21px`, colour `#1A1C1E`
- Sub-heading `.text-sm.text-semi-bold` — `12px / 600 / 18px`, colour `#1A1C1E`,
  `margin-top: 20px`
- Label / value pairs — `12px / 18px`, label `#74777F`, value `#1A1C1E`

Content, in order (dividers between the four top-level sections):

1. **General**
   - `Basic info` → `Name: weigh loss`, `Folder: Unsorted`
   - `Ad Format` → Material `smart_display` icon + `Video`
2. **Audience**
   - `Device` → `Operation System:` · green dot `Included` ·
     `macos.png` `macOS` `;` · `ios.png` `iOS`
   - `Browser:` · green dot `Included` · `chrome.svg` `Chrome` `;` · `safari.png` `Safari`
   - `Stores` → `Stores: App Store`, `App Store Categories:` · green dot `Included` ·
     `Health & Fitness`
3. **Price & Optimization**
   - `Pricing` → `Pricing Model: CPM`, `Default Price: 0.025`
4. **Traffic source**
   - green `circle` dot + `Include` · `Scale_In_App_Display_5` · `Low-Volume` ·
     `Banner` · `CPM`

## States & behaviours

### Status filter (click-driven)
- **Trigger:** click the trigger button → panel toggles; click a row → toggles that status
- **Effect:** the budget list re-filters immediately. With `Ended` unchecked the single
  budget disappears and the empty state renders.
- **Trigger label** recomputes to the checked list, e.g. `Delivering, Scheduled, Paused`
- **Close:** outside click or Escape

### Reset Filter (click-driven)
Re-checks all four statuses and restores the card list.

### Tabs (click-driven)
Swap the `?step=` query param. No transition beyond the `0.12s linear` colour/border
change on the link itself.

### Hover
- Idle tab: colour `#74777F` → `#50D4AB`, `0.12s linear`
- `Create new Budget` / `Next` / `Save`: `#38CE9F` → `#50D4AB`
- `Cancel`: background → `rgba(26,28,30,.08)`
- `Previous`: background → `rgba(56,206,159,.08)`

### Scroll
`.wizard-content` and the summary rail each scroll independently (`overflow-y: auto`).
The footer never moves.

## Assets
Already present in `public/images/`: `macos.png`, `ios.png`, `chrome.svg`, `safari.png`.
Material Icons used: `help_outline`, `arrow_drop_down`, `arrow_drop_up`,
`add_circle_outline`, `circle`, `visibility`, `restart_alt`, `smart_display`.
No new downloads required.

## Responsive behaviour
No breakpoint. Verified at 1440px and 768px: the sidebar stays 240px, the summary rail
stays a fixed 240px, the filter bar stays a single row, and the budget grid stays four
columns — everything simply squeezes (`repeat(4, 1fr)` lets the tracks shrink below
their content). This matches every other page cloned in this repo.

## Reuse notes
- `AppShell` — needs one new optional prop so the content column can drop its `p-8`
  and become a flex column (the footer is full-bleed and pinned).
- `MaterialIcon`, `cn()`, `BTN_PRIMARY` / `BTN_OUTLINED` / `BTN_OUTLINED_GREY`
- The `Toggle` helper in `CampaignSettingsView.tsx` matches the rail's slide toggle —
  export it rather than duplicating.
- `FilterSelect` in `CampaignFilters.tsx` is **single**-select; this one is
  multi-select with checkboxes, so it needs its own small component.
