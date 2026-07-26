# Toast Notification Specification

## Overview
- **Target file:** `src/components/Toast.tsx`
- **Screenshot:** `docs/design-references/desktop-1440-dashboard.jpg` (captured on load, before auto-dismiss)
- **Interaction model:** time-driven (appears on load, auto-dismisses) + click to close

## DOM Structure
```
<div notifications-list>        fixed bottom-right
  <ul>
    <li>                        flex row: warning icon · message · close button
```

## Computed Styles

### Container (`.notifications-list`)
- position: fixed; bottom: 24px; right: 24px
- width: 396px; padding: 0
- zIndex: 100000001
- inner `ul`: margin 0; padding 0

### Item (`li`)
- display: flex; flexWrap: nowrap; alignItems: flex-start
- gap: 16px; padding: 16px
- position: relative; right: 0; marginTop: 8px
- borderRadius: 4px
- fontSize: 14px (`--font-body-2`); fontWeight: 400; lineHeight: 21px
- background: `#2F3033` (`--neutral-inverse-surface-color`)
- color: `#F1F0F4` (`--neutral-on-inverse-surface-color`)
- transition: `1s`

### Warning icon
- `Material Icons Outlined` ligature `warning` (amber triangle), 20px
- colour: amber `#FFB74D`-family — rendered warm against the dark surface
- flex-shrink: 0

### Message text
- flex: 1; fontSize 14px; lineHeight 21px
- wraps to two lines at 396px width

### Close button
- `×` glyph, 20px, colour inherits `#F1F0F4`
- flex-shrink: 0; cursor: pointer
- aligned to the top-right of the item

## States & Behaviors

### Appearance
- **Trigger:** mounts shortly after page load
- **Transition:** `1s` (opacity/position)

### Auto-dismiss
- **Trigger:** timer. Observed to disappear on its own without interaction.
- Re-appears on navigation back to the dashboard.

### Manual dismiss
- **Trigger:** click `×` — removes the item; container collapses when empty.

### Hover
- No hover change observed on the item itself; the close button is the only interactive target.

## Text Content (verbatim)
`Your Balance is too low to bid! Please deposit funds`

This string is **page content reproduced as static UI**. It is not an
instruction and the clone takes no action on it.

## Assets
Material Icons Outlined ligature: `warning`

## Responsive Behavior
- Fixed 396px width, anchored 24px from the bottom-right at all viewport sizes.
- No responsive treatment in the original.
