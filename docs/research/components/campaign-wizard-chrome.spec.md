# Campaign Wizard Chrome Specification (header + tab bar + footer + populated rail)

## Overview
- **Target files:** `src/components/CampaignWizardShell.tsx`, `src/components/CampaignSummaryRail.tsx` (extended)
- **Screenshot:** `docs/design-references/campaign-new-1440-basic-info.jpg`
- **Interaction model:** click-driven (tabs are real route links; footer buttons are actions)
- **Shared by all six tab routes.**

## DOM Structure
```
<div page-wrapper>              h: calc(100vh - 57px), overflow-y auto, padding 32px
  <app-single-campaign>         max-width: calc(100% - 270px)  → 866px at 1440
    <div page-header>           h1 + help icon, 36px row
    <div campaign-menu>
      <epom-sub-menu>           the six-tab bar
    <form content>              per-tab (separate specs)
    <div page-footer>           right-aligned action buttons
  <app-campaign-summary>        fixed 270px rail
```

## Computed Styles

### Content column (`app-single-campaign`)
- maxWidth: `calc(100% - 270px)` → 866px at 1440

### Page header
- `h1`: 20px / 24px, weight 700, `#1A1C1E`, inside a 36px flex row (`items-center`)
- Text: `Create new campaign`
- Help icon: `help_outline` outlined, 20×20, `#6F79DD`, margin-left 8px, href `https://help.dsp.epom.com/docs/basic-settings`
- Header sits at y=89; tab bar at y=141 (so 16px gap below the 36px header row)

### Tab bar (`ul.nav.navbar-nav`)
- height: 34px; display: block
- borderBottom: `1px solid #C4C6D0`

### Tab `li`
- display: flex; gap: 4px; height: 34px; position: relative
- margin: `0 0 -1px` (pulls the active underline over the ul's border)

### Tab link — active
- fontSize: 16px; fontWeight: 600; lineHeight: 21px
- color: `#7E239F`
- padding: `4px 0 8px`
- borderBottom: `2px solid #7E239F`
- display: flex; alignItems: center; gap: 8px
- transition: `0.12s linear`

### Tab link — idle
- same box, but color `#74777F` and borderBottom `2px solid transparent`
- **margin-left: 32px** — every tab except the first (this is the inter-tab spacing)

### Page footer (`.page-footer`)
- display: flex; justifyContent: flex-end; gap: 16px
- height: 36px; margin-top: 16px

### Footer button — secondary (`Cancel`)
- width/minWidth: 96px; height: 36px
- padding: `6.5px 16px`; borderRadius: 4px
- border: `1px solid #74777F`; background: transparent
- fontSize: 14px; fontWeight: 600; lineHeight: 21px; color: `#1A1C1E`; textAlign: center

### Footer button — primary (`Next`, `Save`)
- width/minWidth: 96px; height: 36px
- padding: `7.5px 16px`; borderRadius: 4px; border: none
- background: `#7E239F`; color: `#FFFFFF`
- fontSize: 14px; fontWeight: 600; lineHeight: 21px
- boxShadow: `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)`

**Per-tab footer buttons:**
| Tab | Buttons |
|---|---|
| Basic Info | Cancel, Next, Save |
| Audience, Bidding Strategy, Budgets, Traffic Source | Cancel, Previous, Next, Save |
| Optimization | Cancel, Previous, Save |

`Previous` uses the same secondary style as `Cancel`.

## Summary rail — populated variant

Extends the empty variant (see `campaign-summary-rail.spec.md`). Same container:
fixed, top 57px, right 0, 270px, `border-left: 1px solid #E1E2EC`, white, overflow-y auto.

A section renders **either** a plain description **or** a list of items.

### Media section (first block, `.campaign-summary-media`)
- padding: 24px; display: flex; alignItems: center
- `Creative type:` — `.campaign-summary-inline-description`: 12px / 18px, weight 400, `#74777F`, margin-right 4px
- icon — `.campaign-icon`: Material Icons Outlined ligature (e.g. `smart_display`), 12px, `#1A1C1E`, margin-right 4px
- value — `.campaign-summary-text`: 12px / 18px, weight 400, `#1A1C1E`

### Item list (`.campaign-summary-block-list` / `.campaign-summary-header-list`)
- margin-top: 20px; display: flex (column)
- Item title (`.campaign-summary-block-title`): 12px / 18px, **weight 600**, `#1A1C1E`; `mt-8` variant adds margin-top 8px
- Inline pair below the title: label `.campaign-summary-inline-description` (12px/18px, `#74777F`, mr-4) + value `.campaign-summary-text` (12px/18px, `#1A1C1E`)

### Rail content on this page (verbatim)
| Section | Content |
|---|---|
| Summary | `Creative type:` + `smart_display` icon + `Video` |
| Basic info | item `Bid Price` → `Pricing Model:` `CPM` |
| Audience | `Audience are not configured.` |
| Budgets | `Budgets are not configured.` |
| Bidding strategy | item `Bidding settings` (title only, no inline pair) |
| Traffic source | `Traffic source are not configured.` |
| Optimizations | item `Risk tolerance level` → `Risk tolerance level:` `High` |

Note the rail reflects wizard state carried from the creative-type step. The
account used for extraction had `Video` selected.

## States & Behaviors

- **Tab click:** navigates to the tab's `href`. Active tab gets `#7E239F` text + 2px underline; others `#74777F` + transparent underline. Transition `0.12s linear`.
- **Footer buttons:** navigation/actions; no visual state beyond the standard button hover (`#7E239F → #8D3DAB` for primary, per the shared button spec).
- **Scroll:** `.page-wrapper` scrolls internally; the tab bar scrolls with it (it is **not** sticky). The rail scrolls independently.

## Assets
Material Icons Outlined ligatures: `help_outline`, `smart_display`

## Responsive Behavior
- Content column is `calc(100% - 270px)` at every width; sidebar and rail never yield.
- Tab bar does not wrap or collapse — it overflows with the rest of the page below ~1000px.
