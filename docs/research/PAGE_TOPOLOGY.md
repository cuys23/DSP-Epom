# Page Topology — dsp.epom.market/dashboard

## What this page is

An authenticated Angular admin dashboard (Epom DSP v8.2). The account used for
extraction has **no campaigns**, so the dashboard renders its **empty state**:
the Highcharts line chart is present in the DOM but faded out, and a
"No data yet" panel is layered over it.

> **Clone diverges here on purpose.** The account now has campaigns, so
> `ChartCard` renders a real impressions chart plus weekly totals instead of the
> empty state. See `docs/research/DEMO_DATA_REVIEW.md`.

Detected stack: Angular (ViewEncapsulation `_ngcontent-*` attributes),
Angular Material, Bootstrap 3 grid remnants, Highcharts 9.0.1,
`ngx-daterangepicker-material`, Material Icons ligature fonts.
No smooth-scroll library (no Lenis / Locomotive). No scroll-snap.
The page does not scroll vertically at 1440×900 — all content fits.

## Structure

```
body.theme-violet.light-mode          bg #F0F2F8
└── app-root
    ├── sidebar                        position: fixed, 240px, z-index 1000, bg #060028
    │   ├── header (76px)              logo + collapse toggle
    │   ├── nav.custom-scrollbar       17 nav items, scrolls independently
    │   └── nav.footer-nav             position: absolute, bottom — version + legal links
    └── div.content                    margin-left: 240px, bg #F0F2F8
        ├── header > .top-bar          56.5px, bg #fff, border-bottom .5px #C4C6D0
        │   ├── .header-left-section   breadcrumbs
        │   └── .header-right-section  balance · timezone · language · user
        └── div.page-wrapper           padding: 32px
            └── dashboard
                ├── .page-header       h1 + help icon | date-range input
                └── .container
                    └── .component-charts-dashboard-container   white card, 24px, r3
                        ├── .box-diagram (fade-hidden)          Highcharts chart + Metric dropdown
                        └── .component-charts-no-data           overlay, z-index 3, 350px

└── .notifications-list                position: fixed, bottom 24 right 24, z-index 100000001
```

## Sections, in visual order

| # | Name | Type | Interaction model |
|---|---|---|---|
| 1 | `Sidebar` | fixed overlay, full height | click — collapse toggle, nav links, submenu expand |
| 2 | `TopBar` | flow, sticky-feeling (page doesn't scroll) | click — two dropdowns |
| 3 | `PageHeader` | flow | click — date-range dropdown |
| 4 | `ChartCard` (empty state) | flow | static; button is a click target |
| 5 | `Toast` | fixed overlay | time-driven — auto-dismisses; click to close |

Nothing on this page is scroll-driven. There are no entrance animations, no
parallax, no IntersectionObserver behaviour, and no hover-reveal content.
All state changes are click- or timer-triggered.

## Z-index layers

| Layer | z-index |
|---|---|
| Toast notifications | 100000001 |
| Sidebar | 1000 |
| Dropdown menus | 1000 |
| No-data overlay (within card) | 3 |

## Assembly notes

- The sidebar is `position: fixed`, so `.content` carries `margin-left: 240px`
  (`74px` when collapsed). Collapse state lives as `aside-hide` on `<body>`.
- The card is a single full-width column (`col-sm-12`) inside a 12-column
  Bootstrap grid whose gutters produce the 296px content inset seen in rects.
  Reproduce with plain flex/grid — the gutter maths is incidental.
- The chart is real (Highcharts SVG with a flat zero series and 7 date ticks)
  but sits under `.fade-hidden`. In the empty state only the overlay is visible.
  The clone renders the empty state; the chart layer is not reproduced because it
  is invisible at this URL for this account.

---

# Page: `/campaigns/new/creative-type`

Step 1 of the campaign-creation wizard. Same app shell (fixed 240px sidebar,
56.5px topbar) with two additions: a **fixed 270px summary rail** on the right,
and a **scrolling content column** between them.

## Structure

```
body
├── sidebar                      fixed, 240px  (identical to dashboard)
└── div.content                  margin-left: 240px
    ├── header > .top-bar        breadcrumb now: home / Campaigns / Creatives
    └── div.page-wrapper         h: calc(100vh - 57px), overflow-y auto, padding 32px
        ├── app-campaign-wizard  max-width: calc(100% - 270px)
        │   ├── .page-header     h1 "Create new campaign: choose creative type" + help icon
        │   └── .cat-list        Bootstrap row, 4 × col-md-4 cards
        └── app-campaign-summary fixed; top 57px; right 0; 270px; border-left 1px #E1E2EC
```

## Sections

| # | Name | Type | Interaction model |
|---|---|---|---|
| 1 | `Sidebar` | fixed overlay | click (shared with dashboard) |
| 2 | `TopBar` | flow | click (shared; breadcrumb differs) |
| 3 | `CreativeTypeGrid` | flow, scrolls | click-driven — each card navigates to `/campaigns/new` |
| 4 | `CampaignSummaryRail` | fixed overlay, scrolls independently | static |
| 5 | `Toast` | fixed overlay | time-driven (shared) |

## Scroll containers

Three independent scroll regions, none of which is the document body:
- `nav.custom-scrollbar` — sidebar nav
- `div.page-wrapper` — main content (scrollHeight 688 vs client 594 at 1440×651)
- `app-campaign-summary` — right rail (scrollHeight 711 vs client 594)

## Assembly notes

- The summary rail is `position: fixed`, so it does not participate in the content
  column's layout. The wizard reserves room for it via `max-width: calc(100% - 270px)`.
- The `.page-wrapper` fixed-height + internal scroll pattern is shared with the
  dashboard (where content simply fits, so no scrollbar appears). Implement it once
  in the shared shell.
