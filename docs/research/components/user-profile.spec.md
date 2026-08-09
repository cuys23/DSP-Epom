# UserProfileView Specification

## Overview
- **Target file:** `src/components/UserProfileView.tsx`
- **Route:** `src/app/user-profile/page.tsx` (`/user-profile`, `?tab=analytics`, `?tab=password`)
- **Screenshots:**
  - `docs/design-references/user-profile-1440-settings.jpg`
  - `docs/design-references/user-profile-1440-analytics.jpg`
  - `docs/design-references/user-profile-1440-password.jpg`
- **Interaction model:** click-driven. Three tabs, each a real link that swaps the
  `?tab=` query param and re-renders the card stack below. Nothing on this page is
  scroll-driven — no IntersectionObserver, no scroll-snap, no entrance animations.
  Inputs have **no** focus ring (border stays `#C4C6D0`, `box-shadow: none`).

## Live DOM structure

```
app-user-settings
└── main.profile-wrapper
    ├── app-user-profile-header
    │   ├── .page-header > .profile-container > .page-title    h1 + help icon
    │   └── epom-sub-menu.page-actions.mt-16 > ul.nav          3 tabs
    ├── <tab body>                                             1–2 .page-content cards
    └── app-user-profile-footer > section.profile-footer-content   Cancel · Save
```

## Computed styles (getComputedStyle, 1440×900)

### Page chrome
- `.page-wrapper` — padding `32px`, width `1200px` (the shell already does this)
- `.page-title` — display flex, align-items center, height `36px`, width `1136px`
- `h1` — `20px / 700 / 24px`, color `#1A1C1E`, flex, align-items center
- help icon — Material `help_outline`, `20px`, colour `--color-epom-link`,
  links to `https://help.dsp.epom.com/docs/settings`
- `epom-sub-menu.page-actions` — `margin: 16px 0 0`, height `34px`
- `ul.nav` — height `34px`, `border-bottom: 1px solid #C4C6D0`
- `li` — `margin: 0 0 -1px`, display flex, position relative, height `34px`
- **active `a`** — `16px / 600 / 21px`, colour `#38CE9F`, `padding: 4px 0 8px`,
  `border-bottom: 2px solid #38CE9F`, display flex, align-items center, gap `8px`
- **idle `a`** — same box, colour `#74777F`, `border-bottom: 2px solid transparent`,
  `transition: 0.12s linear`, `cursor: pointer`, and `margin-left: 32px` (all but first)

### Cards
- `.page-content` — `background: #fff`, `border-radius: 4px`, width `1136px`
- `.profile-form-box` — `padding: 24px`
- Gap between stacked cards: `16px`
- Gap between last card and the footer: `16px`

### Fields (shared)
- `.profile-block` — display flex, `max-width: 720px` (fields are fluid below that)
- Label — `12px / 600 / 18px`, colour `#74777F`, `margin-bottom: 4px`
- Required asterisk `.required-item` — colour `#38CE9F`, `margin: -2px 0 0 4px`
- Text input — height `36px`, `padding: 7px 12px 8px`, `border-radius: 4px`,
  `border: 1px solid #C4C6D0`, colour `#1A1C1E`, `14px / 20px`,
  `transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out`
- **Read-only input** — `background: #E1E2EC`, `border: 1px solid #E1E2EC`
- Select trigger `.select-title` — height `36px`, `padding: 6px 36px 7px 11px`,
  `border-radius: 4px`, `border: 1px solid #C4C6D0`, display flex
- **Disabled select** — `background: #E1E2EC`, no border
- Dropdown arrow — Material `arrow_drop_down`, `20px`, colour `#74777F`,
  `position: absolute; top: 7px; right: 12px`
- Selected value text — `14px / 21px`, colour `#1A1C1E`
- Country flag — `.fi.fi-vn`, `16×12px`, `background-size: contain`,
  `margin-right: 10px` → `public/images/flag-vn.svg`

### Footer
- `.profile-footer-content` — display flex, `gap: 16px`, justified right, height `36px`
- **Cancel** `.button-outlined-grey` — `border: 1px solid #74777F`, colour `#1A1C1E`,
  `padding: 6.5px 16px`, min-width `96px`, hover `background: rgba(26,28,30,.08)`,
  active `rgba(26,28,30,.12)`
- **Save** `.button-primary` — `background: #38CE9F`, colour `#fff`,
  `padding: 7.5px 16px`, `box-shadow: 0 1px 2px rgba(24,28,34,.15), 0 0 5px rgba(0,0,0,.05)`,
  hover `#50D4AB`, active drops the shadow
- Both `14px / 600 / 21px`, `border-radius: 4px`, height `36px`

## Tab 1 — Profile Settings (`/user-profile`)

Two cards.

**Card 1** (height 108px) — one field, `.form-control-wrapper` is
`display: flex; flex-direction: column-reverse`, so the label renders **above** the
select with a `4px` gap.
- Label: `Account Time zone` + required `*`, with a Material `info` icon pushed to
  the far right of the 720px row (`16px`, colour `#74777F`, `border-radius: 50%`,
  `padding: 2px`, `cursor: pointer`).
  Tooltip text (verbatim): *"Sets the default time zone for all data across your
  account. Can be overridden in Analytics and when creating Budgets."*
- Select value: `UTC+00:00 London, GBR; Reykjavik, ISL; Dakar, SEN` — enabled, 720px

**Card 2** (height 418px) — 5 rows, each `margin-bottom: 16px` **including the last**
(so the card reads as `padding: 24px 24px 40px`).

| Row | Field | Width | Value | State |
|---|---|---|---|---|
| 1 | `First Name` * / `Last Name` * | 352 + 352, gap 16 | `Minh` / `Do` | editable |
| 2 | `Email` | 720 | `admin@vinmedia.net` | **read-only** (`#E1E2EC`) |
| 3 | `Company name` * | 720 | `Adstarget` | editable |
| 4 | `Country` * | 720 | 🇻🇳 `Viet Nam` | **disabled select** (`#E1E2EC`, no border) |
| 5 | `Phone` | 720 | `0999999` | editable |

> The live account has `-` in Company name. The clone uses `Adstarget` to stay
> consistent with the account label rename in `4e82a32`.

## Tab 2 — User Analytics Settings (`?tab=analytics`)

One card, height 254px. Three rows (`.row.profile-row`, height `58px`, `16px` apart).
Each row is two `272px` columns with a `16px` gap:

- **Left:** label `Action N Title` + `*`, input value `Action N` (N = 0, 1, 2)
- **Right:** a bordered checkbox pill, offset `padding-top: 21px` so it aligns with
  the input, not the label.

**Checkbox pill** (`epom-checkbox-button`):
- Wrapper `label` — width `272px`, height `36px`, `padding: 0 12px`, display flex,
  align-items center, `border-radius: 4px`, `border: 1px solid #C4C6D0`, `cursor: pointer`
- Box — `16×16px`, `border-radius: 2px`, `border: 1px solid #74777F`,
  `margin-right: 8px`, `transition: border-color .09s cubic-bezier(0,0,.2,.1)`
- Text — `Allow multiple events`, `14px / 21px`, colour `#1A1C1E`
- **Checked state:** box fills `#38CE9F` with a white check, wrapper border becomes
  `#38CE9F` and wrapper background `rgba(56, 206, 159, 0.08)`
- All three default to unchecked.

## Tab 3 — Change Password (`?tab=password`)

One card, height 254px. `.profile-block` is `display: flex; flex-direction: column;
gap: 16px`, max-width 720px. Three full-width `720px` password inputs, each with a
label above:

| Label | Placeholder | Type |
|---|---|---|
| `Current Password` | `Current Password` | password |
| `New Password` | `New Password` | password |
| `Confirm New Password` | `Confirm New Password` | password |

## States & behaviours

### Tab switch (click-driven)
- **Trigger:** click a tab link → URL query `?tab=` changes → body swaps
- **Transition:** colour/border only, `0.12s linear` on the tab link itself.
  The card content swaps instantly (no fade).
- **Hover (idle tab):** colour `#74777F` → `#50D4AB`, `0.12s linear`

### Input focus
- No change. Border stays `#C4C6D0`, no box-shadow, no outline.

### Save / Cancel
- Both always enabled once the profile data has loaded.

## Assets
- `public/images/flag-vn.svg` (downloaded from `dsp.epom.market/vn.*.svg`)
- Material icons via existing `<MaterialIcon>`: `help_outline`, `info`,
  `arrow_drop_down`, `check`

## Responsive behaviour
There is no mobile design. The sidebar stays a fixed `240px` at every width and the
content column simply shrinks. Fields are fluid with `max-width: 720px`
(half-width pair splits the remaining space with a `16px` gap). Verified at 390px
and 1440px — layout is identical apart from field widths. This matches every other
page already cloned in this repo.

## Reuse notes
- `AppShell` (breadcrumb `User Profile`, no sidebar item is active)
- `FormBox`, `FieldLabel`, `TextField`, `SelectField` from `form/FormPrimitives`
- `BTN_PRIMARY`, `BTN_OUTLINED_GREY` from `form/Dialog`
- `MaterialIcon`
- `TextField` needs new optional `value` / `type` / `readOnly` props;
  `SelectField` needs `disabled` and a leading-icon slot for the flag.
- The `Edit profile` entry in the `TopBar` user dropdown should link here.
