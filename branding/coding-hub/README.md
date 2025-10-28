# Coding Hub Brand Assets

This folder contains the official Coding Hub logo assets.

## Files
- `logomark.svg`: Standalone symbol (hub with three nodes)
- `logo-horizontal.svg`: Horizontal lockup (mark + wordmark)
- `variants/logo-horizontal-dark.svg`: Horizontal lockup for dark backgrounds
- `variants/logomark-mono.svg`: Monochrome logomark for constraints
- `favicon.svg`: Square icon for browsers and app icons

## Colors
- Primary: `#6E56CF` (Violet)
- Dark accent: `#0B0F1A`
- Light text: `#E5E7EB`
- Muted text: `#6B7280` (light), `#9CA3AF` (dark)

## Usage
- Prefer `logo-horizontal.svg` on light backgrounds.
- Use `variants/logo-horizontal-dark.svg` on dark backgrounds ≥ `#111827`.
- For single-color or embossing, use `variants/logomark-mono.svg`.
- Maintain minimum clear space equal to the logomark node diameter.
- Do not alter colors, proportions, or letter spacing.

## Typography
Wordmark is designed in a geometric sans style using a portable system stack. For web, pair with `Inter` or the system fallback stack.

## Favicon
`favicon.svg` is optimized for 16–64 px. For PNG exports, recommended sizes: 16, 32, 180, 512 px.

## Export Notes
All SVGs are resolution-independent and accessible with `title`/`desc`. When embedding inline, keep `role` and `aria-labelledby` when present.