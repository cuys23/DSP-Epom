# Behaviors — dsp.epom.market/dashboard

Findings from the mandatory scroll / click / hover / responsive sweep.

## Scroll sweep

**Nothing is scroll-driven.** At 1440×900 the page does not scroll vertically —
`document.body.scrollHeight === innerHeight`. The topbar does not change
appearance, no elements animate into view, there are no scroll-snap containers,
and no smooth-scroll library is present (checked for `.lenis`,
`.locomotive-scroll`, and custom scroll wrappers — none found).

The only independently scrolling region is `nav.custom-scrollbar` inside the
sidebar, which scrolls when the 17 nav items exceed the viewport height. Its
scrollbar is styled and is hidden entirely when the sidebar is collapsed
(`body.aside-hide #aside > nav.custom-scrollbar::-webkit-scrollbar { display: none }`).

## Click sweep

### 1. Sidebar collapse toggle (`start` icon, sidebar header right)
- **Trigger:** click. Toggles class `aside-hide` on `<body>`.
- **State A (expanded):** sidebar 240px, logo visible, nav labels visible, `.content { margin-left: 240px }`.
- **State B (collapsed):** `#aside { left: -162px }` leaving 78px visible, `.content { margin-left: 74px }`, labels clipped out of view, `.footer-nav { opacity: 0 }`, active item gets `border-right: 2px solid #447FF9`.
- **Transition:** `0.12s linear`.
- **Note:** the original achieves this with negative `left` plus per-element `translate` hacks. The clone reproduces the *visual result* with a width change and centred icons — same appearance, far less code.

### 2. Nav submenu expand (Analytics, Retargeting, Planning, Autopilot)
- **Trigger:** click on the `arrow-icon` chevron only (clicking the label navigates).
- **Behaviour:** the child `<ul>` expands in place, pushing later items down. The parent's icon swaps `arrow_right` → `arrow_drop_down`.
- **Child item layout:** icon at x=34, label at x=60 (indented ~23px vs parent), same 41px row height, class `a.inside-item` + `.nav-title-child`.
- All four submenus are already in the DOM on load, just collapsed.

### 3. Language dropdown (`EN`)
- Opens a 101px menu, `top: 49px`, right-aligned, white, `border-radius: 4px 4px 3px 3px`, `box-shadow: 0 6px 12px rgba(0,0,0,0.176)`, padding 2px.
- Items: **EN, 中文, UA, DE, FR, ES, PT** — 36px rows, `padding: 7px 12px 8px`, radius 4px.
- Active item (`EN`): `background: rgba(126,35,159,0.12)`, weight 600.

### 4. User dropdown (`Minh Do`)
- Opens a 324px menu, `top: 49px`, right-aligned, same surface treatment.
- Header block (`padding: 8px 16px`): username 14px/21px weight 600 `#1A1C1E`; email 12px/18px `#74777F`.
- Actions: **Edit profile**, **Review Us on G2**, **Help center**, **Sign out** — 36px rows, `padding: 4px 12px`, `margin: 0 4px`, radius 4px.
- **Toggle open state:** background becomes `rgba(126,35,159,0.08)`.

### 5. Date-range input
- Opens the `ngx-daterangepicker-material` ranges list directly beneath the input.
- Options: **Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, Custom range**.
- Rows: 36px, full width, radius 4px, `margin-bottom: 4px`, font 14px.
- Hover: `background: rgba(126,35,159,0.08)`.
- Active (`Last 7 days`): `background: rgba(126,35,159,0.16)`, weight 600, `padding: 7px 12px 8px`.

### 6. `Create new campaign` button
- Navigates away. Purely a click target on this page.

## Hover sweep

| Element | Change | Transition |
|---|---|---|
| Nav item (non-active) | `background: rgba(68,127,249,0.08)`, `opacity: 1` | `0.12s linear` |
| Nav item (active) | no change — stays `#447FF9` | — |
| Primary button | `background: #7E239F → #8D3DAB` | `all` |
| Primary button `:active` | shadow removed | — |
| Text button (Balance, UTC) | `background` + `border-color` → `rgba(126,35,159,0.08)` | — |
| Text button `:active` | → `rgba(126,35,159,0.12)` | — |
| Dropdown toggle | → `rgba(126,35,159,0.08)` | — |
| Date-range row | → `rgba(126,35,159,0.08)` | — |
| Icon button (`.button-icon`) | `background: rgba(126,35,159,0.08)`, `color: #7E239F` | — |
| Ghost icon button (collapse toggle) | `color: #7E239F` via `::before` scale-in pill | — |
| Footer legal links | already underlined; colour `#7E239F` | `0.12s linear` |

## Time-driven

### Toast notification
- Appears shortly after page load, bottom-right, and **auto-dismisses**.
- Content on this account: `Your Balance is too low to bid! Please deposit funds`
  (warning icon + text + `×` close button).
- Container: `position: fixed; bottom: 24px; right: 24px; width: 396px; z-index: 100000001`.
- Item: `display: flex; gap: 16px; padding: 16px; border-radius: 4px; margin-top: 8px; line-height: 21px; transition: 1s; background: #2F3033; color: #F1F0F4`.
- This is genuine page content, not an instruction to act on — it is reproduced as static UI only.

## Responsive sweep

| Width | Result |
|---|---|
| 1440px | Reference layout. Everything fits, no scrollbars. |
| 768px | Sidebar unchanged at 240px. Username hides (below the `960px` breakpoint) leaving the person icon. Breadcrumb label is squeezed out by the flex row. Content area overflows → horizontal scroll. |
| 390px | No mobile layout at all. The window would not go below ~500 CSS px; the page simply overflows horizontally. |

**Only one real media query affects this page:**
`@media screen and (min-width: 960px) { .user-nickname { display: inline-block } }`

Everything else is a fixed desktop layout. The clone reproduces this faithfully
rather than inventing a responsive design the original does not have.

---

# Page: `/campaigns/new/creative-type`

## Scroll sweep

The document body does not scroll. `.page-wrapper` scrolls internally
(scrollHeight 688 vs client 594 at 1440×651) and the summary rail scrolls
separately (711 vs 594). Scrolling the main column to 200px leaves the rail
stationary — confirmed by measurement, not inference.

No scroll-triggered style changes, no entrance animations, no scroll-snap, no
smooth-scroll library.

## Click sweep

- **Creative type cards** — navigate to `/campaigns/new` (the Basic Info step).
  They are **navigation, not selection**; no selected state exists on this page.
  After navigating, the rail's first description becomes `Creative type: Banner`.
- **Breadcrumb `Campaigns`** — link to `/campaigns`, colour `#7E239F`, 12px, weight 600, no underline.
- **Help icon** — opens `https://help.dsp.epom.com/docs/creative`.
- Summary rail blocks are inert — not clickable.

## Hover sweep

| Element | Change | Transition |
|---|---|---|
| `a.cat-box` | boxShadow `0 0 5px rgba(0,0,0,0.05), 0 1px 2px rgba(24,28,34,0.15)` → `-1px 0 20px rgba(24,28,34,0.08), 0 1px 5px rgba(0,0,0,0.18)`; borderColor → `#CCCCCC` | `0.12s linear` |
| Summary rail blocks | none | — |

## Responsive sweep

| Width | Result |
|---|---|
| 1440px | 3 columns. Wizard area 866px, columns 294px, cards 278px. |
| 768px | Grid drops to 2 columns (`col-sm-6`), but sidebar (240) + rail (270) stay fixed, leaving the wizard area just **194px** — columns 105px, cards and illustrations badly squeezed, page overflows horizontally. |
| <768px | Columns fall back to full width (no `col-xs` class). |

Breakpoints: **992px** (3→2 columns) and **768px** (2→1). Both are stock
Bootstrap 3; neither produces a usable mobile layout because the two rails never yield.
