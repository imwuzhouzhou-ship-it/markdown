# Markdown Style Spec

This reference turns the research summary in `/Users/bytedance/Downloads/AgentDesign组件_Markdown版本.md` into a practical design spec for Markdown surfaces in AI products.

## Research Anchors

Use these as the baseline assumptions unless product constraints override them:

- Most surveyed products use `16px` body text
- Comfortable reading width clusters around `720px-800px`
- Chinese interfaces often use `1.5` body line-height
- English interfaces commonly use `1.65-1.75`, with `1.75` appearing often
- Hierarchy is concentrated in `H1-H3`
- `H4+` usually stay at body size and rely on weight plus spacing
- Text color trends toward dark neutral values rather than pure black
- Some products use dividers to separate major chunks, but not as a default after every heading

## Recommended Tokens

Use semantic tokens rather than raw values:

```css
.markdown-body {
  --md-max-width: 760px;
  --md-font-size-body: 1rem;
  --md-line-height-cjk: 1.5;
  --md-line-height-latin: 1.75;
  --md-line-height-mixed: 1.625;

  --md-color-text-primary: #1f1f1f;
  --md-color-text-secondary: #5b5f66;
  --md-color-text-muted: #7a808a;
  --md-color-link: #1456d9;
  --md-color-border-subtle: #dde2ea;
  --md-color-surface-subtle: #f5f7fa;
  --md-color-surface-code: #f3f5f8;
  --md-color-quote-accent: #b8c6e3;

  --md-space-1: 4px;
  --md-space-2: 8px;
  --md-space-3: 12px;
  --md-space-4: 16px;
  --md-space-5: 20px;
  --md-space-6: 24px;
  --md-space-7: 32px;
}
```

If the product already has semantic tokens, map these values into the existing system instead of inventing parallel tokens.

## Typography Defaults

### Body

- `font-size`: `16px`
- `line-height`:
  - Chinese-first UI: `24px` or `1.5`
  - English-first UI: `28px` or `1.75`
  - Mixed-language fallback: `26px` or `1.625`
- `font-weight`: `400`
- `max-width`: `720px-800px`
- `font-family`: system sans or the product's established sans family

Font rule:

- Default to system sans for dense product Markdown unless the brand already ships a proven reading face
- Reserve expressive display fonts for surrounding UI, not the main prose column

### Headings

Use a restrained scale:

| Element | Size | Line height | Weight | Margin top | Margin bottom |
|---|---:|---:|---:|---:|---:|
| `h1` | 24px | 32px | 700 | 32px | 16px |
| `h2` | 20px | 28px | 700 | 28px | 12px |
| `h3` | 18px | 28px | 600 | 24px | 8px |
| `h4` | 16px | 24px | 600 | 20px | 8px |
| `h5` | 16px | 24px | 600 | 16px | 8px |
| `h6` | 16px | 24px | 600 | 16px | 8px |

Rules:

- Let `h1-h3` create most hierarchy
- Keep `h4-h6` near body size
- If the surface usually contains only one generated title, treat `h3` as the default visual scale
- Avoid giant hero-style Markdown headings inside chat surfaces

## Spacing Rhythm

### Safe Default Rhythm

Use this when the Markdown sits in chat cards, answer panels, drawers, or split views:

- Paragraph to paragraph: `12px`
- Paragraph before list: `12px`
- List after list: `8px`
- Blockquote/code/table before next paragraph: `16px`
- Major section divider gap: `24px-32px`

### Editorial Rhythm

Use this when the Markdown is the primary page content:

- Paragraph to paragraph: `16px`
- `h1` top gap: `32px`
- `h2` top gap: `28px`
- `h3` top gap: `24px`
- Larger code/table/quote blocks can use `20px-24px` bottom spacing

## Element Guidance

### Paragraphs

- Left-align for both Chinese and English content
- Avoid justified text in product UI
- Keep paragraph spacing consistent
- Do not use first-line indentation unless the product is intentionally book-like

### Lists

- Use `padding-inline-start: 1.25em-1.5em`
- Keep `li + li` gap between `4px` and `8px`
- Nested lists should tighten slightly rather than repeating full outer spacing
- Preserve marker alignment; do not fake bullets with background icons unless required by brand

### Blockquotes

- Use a left border or tinted rail
- Optional subtle background tint is fine
- Keep text size equal to body size
- Avoid oversized italic styling that makes quotes feel ornamental rather than readable

Suggested treatment:

- Left border: `2px-3px`
- Left padding: `12px-16px`
- Background: very subtle neutral or brand tint

### Inline Code

- Font size: `0.875em-0.94em`
- Line height should inherit or remain close to body
- Background should be subtle, not a high-contrast chip
- Add small horizontal padding and slight corner radius

### Strong And Emphasis

- `strong` should primarily increase weight, not switch to a loud accent color
- `em` can use italics for Latin text, but avoid relying on italics alone in Chinese-heavy interfaces
- Avoid stacking too many emphasis signals in one sentence

### Fenced Code Blocks

- Font size: `14px`
- Line height: `20px-22px`
- Padding: `14px-16px`
- Radius: `10px-12px`
- Overflow: horizontal scroll
- Prefer neutral or lightly tinted surfaces before defaulting to full dark blocks

If the product is code-heavy, you may increase contrast and use a darker code surface. If code is secondary, keep it quieter than the surrounding prose hierarchy.

### Tables

- Use cell padding of at least `10px 12px`
- Preserve alignment for numbers
- Use horizontal scrolling on narrow viewports
- Keep borders subtle
- Zebra striping is optional; use only if it improves scanability

Recommended behavior:

- Desktop: full-width inside prose column if readable
- Mobile: wrap in `overflow-x: auto`

### Links

- Inline links should remain visually discoverable without hover
- Color plus underline is the safest default
- In dense enterprise UI, underline-on-hover is acceptable only if links already have strong contrast and surrounding affordances

### Task Lists And Footnotes

- Task list checkboxes should align cleanly with text baselines
- Do not let checkbox chrome outweigh the prose itself
- Footnotes should be smaller than body text but still readable, usually `14px` with relaxed spacing
- Footnote separators and backlink affordances should stay subtle

### Dividers

- Use `hr` for chunk separation, not decoration
- Keep stroke subtle
- Surround with `24px-32px` vertical spacing

### Images And Captions

- Keep images inside the prose measure
- Use `12px-16px` top and bottom spacing
- Caption size: `14px`
- Caption color: secondary or muted text

## Light And Dark Theme Guidance

### Light Theme

- Primary text should stay in a deep neutral
- Avoid pure black if the rest of the UI uses tinted neutrals
- Code and quote surfaces can use very light neutral backgrounds

### Dark Theme

- Preserve hierarchy through contrast, not glow
- Avoid medium-gray-on-dark body text
- Raise line-height slightly if the dark palette reduces perceived readability
- Keep borders low-contrast but still visible

Suggested dark-theme direction:

- Primary text: high-contrast neutral, around `#ECEFF3`
- Secondary text: softer neutral, around `#B8C0CC`
- Surfaces: layered dark neutrals rather than flat black

## Mixed Chinese And English Text

This is where many Markdown systems break.

- If possible, use `lang`-aware styles to separate CJK and Latin line-height behavior
- If not possible, use the mixed fallback line-height around `1.625`
- Avoid overly condensed Latin headings inside otherwise Chinese surfaces
- Check punctuation rhythm, inline code breaks, and link wrapping in mixed-language paragraphs

## Responsive Rules

Prefer changing container padding before shrinking the type scale.

### Mobile

- Body text stays at `16px`
- Reduce outer container padding to `12px-16px`
- Allow tables and code blocks to scroll horizontally
- Tighten heading top margins slightly

### Desktop

- Keep the prose column constrained even inside wide pages
- Let block elements breathe with larger vertical spacing

## React Markdown Implementation Notes

Recommended shape:

- One scoped prose container: `.markdown-body`
- One token layer: CSS custom properties or design tokens
- One semantic mapping layer: `components={{ h1, h2, p, code, pre, table, blockquote }}` as needed
- One feature layer: `remark-gfm` for tables, task lists, and strikethrough

Implementation principles:

- Avoid global `h1`, `p`, `ul` overrides
- Wrap tables in a scroll container
- Wrap code blocks only when the renderer does not do it for you
- Keep typography and spacing tokens in one place

## Surface Integration

When Markdown appears inside AI reply cards or assistant panels:

- Keep the container distinction at the surface level: background, border, radius, or padding
- Keep the prose rules stable across assistant replies so content structure remains predictable
- Differentiate user and assistant messages through container styling, not a second typography system
- Avoid over-decorating generated content blocks inside already elevated message surfaces

## QA Checklist

Use this before shipping:

- Body text is `16px` and comfortable to read
- Reading width stays within `720px-800px` or a justified product-specific range
- `h1-h3` feel clearly different; `h4-h6` do not explode the scale
- Paragraph spacing is consistent
- Nested lists do not create awkward gaps
- Inline code and links remain readable in running text
- Code blocks do not overflow the layout unexpectedly
- Tables are usable on mobile
- Light and dark themes keep sufficient contrast
- Mixed Chinese and English content still feels balanced
- Generated Markdown with unpredictable structure still looks stable
