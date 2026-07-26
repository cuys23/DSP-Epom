# Design Tokens — dsp.epom.market/dashboard

Source: `getComputedStyle` on the live page. Theme in use: `body.theme-violet.light-mode`.
Full resolved custom-property dump: `docs/research/raw/theme-vars.json` (294 props).

## Typography

| Role | Value |
|---|---|
| Font family | `"Open Sans", sans-serif` |
| Icon families | `"Material Icons"`, `"Material Icons Outlined"` (ligature fonts, self-hosted) |
| Body | 14px / 20px, weight 400, `#333333` |
| Page title (`h1`) | 20px / 24px, weight 700, `#1A1C1E` |
| Card title (`.config-title`) | 16px / 24px, weight 700, `#1A1C1E` |
| Muted body (`.config-no-data`) | 12px / 21px, weight 400, `#74777F` |
| Nav item | 14px / 21px, weight 400 |
| Button label | 14px / 21px, weight 600 |
| Breadcrumb | 12px / 17.14px, weight 400 |
| Sidebar version text | 10px / 14.29px, weight 400, `#D3D1D5` |
| Dropdown item | 14px / 21px, weight 400 (active: 600) |
| Dropdown email | 12px / 18px, weight 400, `#74777F` |

Weights actually used: 400, 600, 700.

## Colors

### Brand / accent
| Token | Value | Use |
|---|---|---|
| `--themePrimButtonsBg-color` | `#7E239F` | Primary button bg, accent text, calendar icon, footer links |
| `--themePrimButtonsBg-hover-color` | `#8D3DAB` | Primary button hover |
| `--themePrimButtonsBg-8-color` | `rgba(126,35,159,0.08)` | Text-button hover, open dropdown toggle bg |
| `--themePrimButtonsBg-12-color` | `rgba(126,35,159,0.12)` | Text-button active, active dropdown item bg |
| `--themePrimButtonsBg-16-color` | `rgba(126,35,159,0.16)` | Active date-range item bg |
| `--on-themePrimButtonsBg-color` | `#FFFFFF` | Text on primary |

### Sidebar / navigation
| Token | Value | Use |
|---|---|---|
| `--themeSidebarBg-color` | `#060028` | Sidebar background |
| `--themeNavActiveBg-color` | `#447FF9` | Active nav item background |
| `--themeNavActiveBg-8-color` | `rgba(68,127,249,0.08)` | Nav item hover background |
| `--themeNavActiveBg-16-color` | `rgba(68,127,249,0.16)` | Collapsed active icon pill |
| `--themeNavActiveTxt-color` | `#FFFFFF` | Active nav text |
| Nav idle text | `#8E969C` | Inactive nav label + icon |
| Collapse button | `#A9ABB4` | Sidebar toggle icon |
| Version text | `#D3D1D5` | Footer version line |

### Surfaces & text
| Token | Value | Use |
|---|---|---|
| Page background | `#F0F2F8` | `body`, `.content` |
| Card / topbar surface | `#FFFFFF` | `.top-bar`, `.component-charts-dashboard-container` |
| `--neutral-on-main-neutral-color` | `#1A1C1E` | Primary text |
| Default body text | `#333333` | Inherited base |
| `--neutral-outline-color` | `#74777F` | Muted/secondary text |
| Border | `#C4C6D0` | Input border, topbar bottom border |
| Link colour | `#6F79DD` | `.link`, logo-adjacent anchors, user dropdown toggle |

### Status
| Token | Value |
|---|---|
| Positive balance text | `#006D3E` (`--success-default-color`) |
| Error | `#BA1A1A` |
| Toast surface | `#2F3033` (`--neutral-inverse-surface-color`) |
| Toast text | `#F1F0F4` (`--neutral-on-inverse-surface-color`) |

## Spacing

Observed scale: **4, 8, 12, 16, 24, 32, 44** px.

| Element | Value |
|---|---|
| Page wrapper padding | `32px` |
| Card padding | `24px` |
| Topbar padding | `0 32px 0 26px` |
| Topbar row gap | `44px` |
| Sidebar header padding | `16px` |
| Nav item padding | `10px 45px 10px 35px` |
| Button padding (primary) | `7.5px 16px` |
| Button padding (text) | `6.5px 16px` |
| Dropdown item padding | `4px 12px`, margin `0 4px` |
| Input padding | `8px 48px 8px 12px` |

## Radii

| Element | Value |
|---|---|
| Card | `3px` |
| Button, input, dropdown item | `4px` |
| Dropdown menu | `4px 4px 3px 3px` |
| Dropdown toggle | `5px` |
| Toast | `4px` |

## Shadows

| Token | Value |
|---|---|
| Primary button | `0 1px 2px rgba(24,28,34,0.15), 0 0 5px rgba(0,0,0,0.05)` |
| Dropdown menu | `0 6px 12px rgba(0,0,0,0.176)` |
| `--shadow-card-color` | `0 0 5px rgba(0,0,0,0.05), 0 1px 2px rgba(24,28,34,0.15)` |
| Dashboard card | **none** |

## Motion

| Element | Transition |
|---|---|
| Sidebar, nav links, icons, `.wrapper` | `0.12s linear` |
| Input | `border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out` |
| Version text | `0.2s` |
| Toast | `1s` |

## Layout metrics

| Element | Value |
|---|---|
| Sidebar width (expanded) | `240px`, `position: fixed`, `z-index: 1000` |
| Sidebar width (collapsed) | `78px` visible; content `margin-left: 74px` |
| Topbar height | `56.5px`, border-bottom `0.5px solid #C4C6D0` |
| Sidebar header height | `76px` |
| Nav item height | `41px` |
| Card min-height | `438px` |
| Toast | `position: fixed; bottom: 24px; right: 24px; width: 396px; z-index: 100000001` |

## Breakpoints

The app is a **fixed-width desktop layout**; it is not mobile-responsive.

- `≥960px` — `.user-nickname` is `display: inline-block`; below that the username hides and only the person icon shows.
- Below ~1000px the content area overflows and the page scrolls horizontally. There is no stacking, no hamburger, no sidebar drawer.
- The browser could not be sized below ~500px CSS px; the layout simply overflows.
