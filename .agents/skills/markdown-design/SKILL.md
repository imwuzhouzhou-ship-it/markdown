---
name: markdown-design
description: Guide Markdown typography, spacing, theming, and element styling for AI/chatbot/content surfaces. Use when designing markdown renderer styles, react-markdown presentation, markdown theme tokens, or long-form reading experiences.
user-invocable: true
argument-hint: [TARGET=<value>] [SURFACE=chat|doc|article|report]
---

Design Markdown surfaces that feel structured, readable, and calm over long passages. This skill turns raw Markdown output into a consistent reading system instead of a pile of browser defaults.

## When To Use

Use this skill when you need to:

- Design or restyle a Markdown renderer
- Define typography and spacing for AI answer cards, chatbot bubbles, doc panels, or report views
- Build or tune `react-markdown` output styles
- Create theme tokens for Markdown content
- Review a Markdown surface that feels cramped, noisy, flat, or inconsistent

Pair with other skills when needed:

- Use `frontend-design` if the Markdown surface must align with a broader visual identity
- Use `typeset` when the main issue is typography quality
- Use `clarify` when the Markdown content itself is hard to understand
- Use `harden` when long content, overflow, i18n, or edge cases are breaking the UI

## Gather Context

Before styling, collect the minimum context that changes the system:

- **Surface type**: chat answer, knowledge QA, article, report, documentation, notes
- **Container model**: full-width page, centered column, card, drawer, side panel
- **Language mix**: Chinese, English, or mixed CJK/Latin
- **Markdown feature set**: headings, lists, tables, task lists, code fences, blockquotes, images, footnotes
- **Theme requirements**: light only, dark only, or both
- **Viewport range**: mobile-first, desktop-heavy, or both
- **Brand tone**: neutral utility, editorial, technical, premium, playful

If context is missing, use safe long-form reading defaults rather than over-designing.

## Establish Baseline

Start from these defaults unless the product has stronger constraints:

- **Body size**: `16px`
- **Readable line length**: `720px-800px`, default to `760px`
- **CJK body line-height**: `1.5`
- **Latin body line-height**: `1.75`
- **Mixed-language fallback**: `1.625` when per-language tuning is unavailable
- **Hierarchy emphasis**: concentrate visible size jumps in `H1-H3`
- **H4-H6**: keep near body size and distinguish with weight, color, and spacing
- **Primary text color**: deep neutral with strong contrast, around `#1F1F1F` on light surfaces

These defaults come from the research pattern in `/Users/bytedance/Downloads/AgentDesign组件_Markdown版本.md`: most competitors center on `16px` body text, use a `720px-800px` reading measure, and rely on strong heading rhythm rather than decorative styling.

## Choose A Rhythm Model

Pick one model and keep it consistent:

### 1. Fixed Spacing

Best for chatbot and assistant surfaces.

- Keep paragraph spacing stable
- Let headings create most of the rhythm
- Use dividers sparingly
- Prefer predictable scanability over editorial drama

### 2. Progressive Spacing

Best for reports, docs, and richer editorial content.

- Increase top spacing as heading level rises
- Use larger section breaks for content chunks
- Allow tables, quotes, and code blocks to carry their own spacing presence

If unsure, use fixed spacing. It is more stable inside cards, split panes, and conversation views.

## Design The Reading System

Work from structure to detail:

1. **Set the measure first**
   - Limit text width before changing typography
   - Keep prose in a readable column even if the outer layout is wider

2. **Define body rhythm**
   - Make paragraphs comfortable for long reading
   - Keep line-height generous enough to reduce fatigue
   - Do not shrink body text to compensate for dense content

3. **Build a restrained heading scale**
   - Make `H1-H3` do most of the hierarchy work
   - Keep `H4-H6` close to body size
   - In chat surfaces with a single top title, default to `H3` scale instead of oversized `H1`

4. **Normalize content blocks**
   - Lists, blockquotes, code blocks, tables, and dividers should feel like part of the same system
   - Use spacing, border treatment, and background tint to separate blocks without visual noise

5. **Preserve inline affordances**
   - Links must stay obviously interactive
   - Inline code must stay legible without overpowering the sentence
   - Bold and emphasis should reinforce meaning, not replace hierarchy

6. **Handle mobile early**
   - Reduce outer margins before shrinking type
   - Let tables scroll horizontally
   - Keep code blocks usable on narrow screens

## Element Rules

Use the detailed defaults in [style spec](reference/style-spec.md). The key rules are:

- **Fonts**: default to system sans or the product's established sans family for body copy; keep display fonts out of dense prose
- **Headings**: strong hierarchy through size, weight, and top spacing, not decorative ornaments
- **Paragraphs**: consistent bottom margins; avoid first-line indentation for product surfaces
- **Lists**: compact, readable, and nested without exploding vertical space
- **Blockquotes**: use border and subtle tint; avoid oversized italic-only treatments
- **Strong and emphasis**: reinforce meaning with weight and tone shifts, not loud color changes
- **Inline code**: slightly denser type with a soft background; never tiny
- **Code blocks**: treat as scrollable content regions, not giant dark slabs by default
- **Tables**: prioritize readability and overflow handling; mobile should scroll, not squash
- **Links**: preserve discoverability with color plus underline or equivalent cue
- **Task lists and footnotes**: keep them visually subordinate to the main reading rhythm
- **Dividers**: use for chunking large sections, not after every heading
- **Images**: keep margins and optional captions consistent with the text rhythm

## Implementation Notes

For `react-markdown` or similar renderers:

- Scope all styles under a dedicated container such as `.markdown-body`
- Prefer semantic element mapping through `components` instead of brittle descendant overrides
- Use design tokens or CSS custom properties instead of hardcoded one-off values
- Support `remark-gfm` if tables, task lists, and strikethrough are expected
- Wrap tables and fenced code blocks in overflow-aware containers
- Keep prose styles independent from surrounding app styles to avoid accidental inheritance drift

Do not style Markdown as if it were generic CMS HTML. Markdown in AI products is usually short-to-medium structured output, so scanning speed matters as much as aesthetics.

If the Markdown sits inside a chat reply, make the prose system work with the reply container rather than fighting it:

- Keep the message bubble or answer panel calmer than the typography inside it
- Differentiate user and assistant surfaces with container background or chrome, not by changing the Markdown typography system itself
- Avoid nested card treatments inside already elevated answer containers unless a block truly needs separate emphasis

## Never Do These

- Do not set body text below `16px`
- Do not let prose span full-width across large desktop containers
- Do not create a six-level dramatic heading scale for chat answers
- Do not rely on color alone to show links or hierarchy
- Do not make code blocks visually louder than the surrounding explanation unless the product is code-first
- Do not collapse all spacing to make dense answers fit more on screen
- Do not use raw browser defaults for tables, lists, and blockquotes
- Do not make dark theme contrast low just to look softer

## Verify The Result

Check the finished Markdown surface against these questions:

- Can users scan section structure in under a few seconds?
- Is long-form reading comfortable at body size?
- Do headings, paragraphs, lists, and blocks feel like one system?
- Does mixed Chinese and English text still feel balanced?
- Are links, code, and tables readable on mobile?
- Does light/dark theme preserve contrast and hierarchy?
- Do spacing and typography still hold when content is generated unpredictably?

For exact defaults, tokens, responsive behavior, and QA criteria, use [style spec](reference/style-spec.md).
