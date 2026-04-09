const themeDefaults = {
  light: {
    colorTextPrimary: "#1f1f1f",
    colorTextSecondary: "#5b5f66",
    colorLink: "#1456d9",
    colorBorderSubtle: "#dde2ea",
    colorSurfaceSubtle: "#f5f7fa",
    colorSurfaceCode: "#f3f5f8",
  },
  dark: {
    colorTextPrimary: "#eceff3",
    colorTextSecondary: "#b8c0cc",
    colorLink: "#7db2ff",
    colorBorderSubtle: "#38414f",
    colorSurfaceSubtle: "#20252d",
    colorSurfaceCode: "#191d23",
  },
};

const presets = {
  "chat-balanced": {
    surface: "chat",
    theme: "light",
    languageMode: "mixed",
    rhythm: "fixed",
    bodySize: 16,
    maxWidth: 760,
    lineHeightCjk: 1.5,
    lineHeightLatin: 1.75,
    lineHeightMixed: 1.625,
    h1Size: 24,
    h2Size: 20,
    h3Size: 18,
    paragraphGap: 12,
    blockGap: 16,
    listGap: 6,
    dividerGap: 28,
    underlineLinks: true,
  },
  "report-structured": {
    surface: "report",
    theme: "light",
    languageMode: "mixed",
    rhythm: "progressive",
    bodySize: 16,
    maxWidth: 780,
    lineHeightCjk: 1.55,
    lineHeightLatin: 1.8,
    lineHeightMixed: 1.65,
    h1Size: 24,
    h2Size: 20,
    h3Size: 18,
    paragraphGap: 16,
    blockGap: 20,
    listGap: 6,
    dividerGap: 32,
    underlineLinks: true,
  },
  "doc-technical": {
    surface: "doc",
    theme: "dark",
    languageMode: "latin",
    rhythm: "fixed",
    bodySize: 16,
    maxWidth: 800,
    lineHeightCjk: 1.5,
    lineHeightLatin: 1.75,
    lineHeightMixed: 1.625,
    h1Size: 24,
    h2Size: 20,
    h3Size: 18,
    paragraphGap: 14,
    blockGap: 18,
    listGap: 6,
    dividerGap: 28,
    underlineLinks: false,
  },
};

const samples = {
  assistant: `# Agent 输出设计基线

这是一个用于调试 **Markdown 排版样式** 的示例。它覆盖中文、English phrases、[外链](https://remarkjs.github.io/react-markdown/) 和 \`inline code\`，方便观察长文本阅读节奏。

## 设计建议

- 正文字号建议从 16px 起步
- 行长建议控制在 720px 到 800px
- 标题层级建议重点强化 H1 到 H3
- H4 及以下尽量保持接近正文，靠字重和间距区分

> 在聊天场景里，Markdown 更像“结构化回复”，不是传统 CMS 页面。它需要先服务扫描效率，再服务装饰感。

### 检查项

- [x] 列表间距是否稳定
- [x] 引用块是否足够轻
- [ ] 表格在移动端是否可横向滚动

---

| 维度 | 建议值 | 说明 |
| --- | --- | --- |
| Body | 16px / 1.5-1.75 | 兼顾 CJK 与 Latin |
| Width | 760px | 长文本最稳妥 |
| H3 | 18px / 28px | 适合单标题回复 |

\`\`\`tsx
<article className="markdown-body">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {content}
  </ReactMarkdown>
</article>
\`\`\`
`,
  report: `# Q2 Markdown Experience Review

## Executive Summary

The current reading surface is acceptable for short answers, but it breaks down under long-form structured output. Paragraph rhythm is inconsistent, tables feel cramped, and links are not obvious enough.

## Findings

1. **Hierarchy is top-heavy**
   - H1 and H2 are usable
   - H3 and H4 collapse too close to body copy
2. **Reading measure is unstable**
   - Some pages exceed 900px
   - Dense content becomes harder to scan
3. **Support blocks need normalization**
   - Blockquotes, code blocks, and tables do not feel like one system

## Recommendation

Adopt a restrained heading scale, maintain a 760px prose measure, and keep code surfaces quieter than explanatory text. See the [full reference](https://example.com/spec) for implementation details.
`,
  technical: `# React Markdown Integration

## Setup

Install \`react-markdown\` and \`remark-gfm\` in your app.

### Component Wrapper

\`\`\`tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="md-table-wrap">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
\`\`\`

### Notes

- Use tokenized spacing instead of one-off margins
- Keep tables wrapped for overflow
- Avoid changing typography between assistant messages
`,
};

const storageKey = "markdown-style-lab-state-v1";

const formIds = [
  "preset",
  "surface",
  "theme",
  "languageMode",
  "rhythm",
  "bodySize",
  "maxWidth",
  "lineHeightCjk",
  "lineHeightLatin",
  "lineHeightMixed",
  "h1Size",
  "h2Size",
  "h3Size",
  "paragraphGap",
  "blockGap",
  "listGap",
  "dividerGap",
  "underlineLinks",
  "colorTextPrimary",
  "colorTextSecondary",
  "colorLink",
  "colorBorderSubtle",
  "colorSurfaceSubtle",
  "colorSurfaceCode",
  "markdownInput",
];

const controls = Object.fromEntries(
  formIds.map((id) => [id, document.getElementById(id)]),
);

const outputLabels = {
  css: "可直接复制到样式文件",
  react: "可直接粘贴到 React 组件附近",
  tokens: "当前调试状态的 token 快照",
  html: "预览解析出的 HTML 结构",
};

const outputEl = document.getElementById("outputCode");
const outputLabelEl = document.getElementById("outputLabel");
const previewEl = document.getElementById("markdownPreview");
const surfaceFrameEl = document.getElementById("surfaceFrame");
const surfaceMetaEl = document.getElementById("surfaceMeta");
const copyOutputButton = document.getElementById("copyOutput");
const copyShareLinkButton = document.getElementById("copyShareLink");
const resetPresetButton = document.getElementById("resetPreset");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const sampleButtons = [...document.querySelectorAll(".chip-button")];

let activeTab = "css";
let latestHtml = "";
let latestOutputs = {
  css: "",
  react: "",
  tokens: "",
  html: "",
};

initialize();

function initialize() {
  const initialState = getInitialState();
  applyState(initialState);

  Object.entries(controls).forEach(([id, element]) => {
    const eventName =
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLInputElement
        ? "input"
        : "change";

    element.addEventListener(eventName, () => {
      if (id === "preset") {
        const presetState = makeStateFromPreset(controls.preset.value);
        applyPresetState(presetState);
        return;
      }

      if (id === "theme") {
        applyThemeDefaults(controls.theme.value);
      }

      syncUi();
      renderAll();
      persistState();
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      syncTabs();
      renderOutputs();
    });
  });

  sampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples[button.dataset.sample];
      if (!sample) {
        return;
      }

      controls.markdownInput.value = sample;
      sampleButtons.forEach((item) =>
        item.classList.toggle("is-active", item === button),
      );
      renderAll();
      persistState();
    });
  });

  resetPresetButton.addEventListener("click", () => {
    const presetState = makeStateFromPreset(controls.preset.value);
    applyPresetState(presetState);
  });

  copyOutputButton.addEventListener("click", async () => {
    const value = latestOutputs[activeTab];
    await copyText(value, copyOutputButton, "已复制");
  });

  copyShareLinkButton.addEventListener("click", async () => {
    const url = buildShareUrl(readState());
    await copyText(url, copyShareLinkButton, "链接已复制");
  });

  syncUi();
  syncTabs();
  renderAll();
}

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.size ? readStateFromParams(params) : null;
  const fromStorage = readStateFromStorage();
  const base = makeStateFromPreset("chat-balanced");
  return {
    ...base,
    ...fromStorage,
    ...fromQuery,
  };
}

function makeStateFromPreset(presetName) {
  const preset = presets[presetName] || presets["chat-balanced"];
  return {
    preset: presetName,
    markdownInput: samples.assistant,
    ...preset,
    ...themeDefaults[preset.theme],
  };
}

function applyPresetState(state) {
  controls.preset.value = state.preset;
  controls.surface.value = state.surface;
  controls.theme.value = state.theme;
  controls.languageMode.value = state.languageMode;
  controls.rhythm.value = state.rhythm;
  controls.bodySize.value = String(state.bodySize);
  controls.maxWidth.value = String(state.maxWidth);
  controls.lineHeightCjk.value = String(state.lineHeightCjk);
  controls.lineHeightLatin.value = String(state.lineHeightLatin);
  controls.lineHeightMixed.value = String(state.lineHeightMixed);
  controls.h1Size.value = String(state.h1Size);
  controls.h2Size.value = String(state.h2Size);
  controls.h3Size.value = String(state.h3Size);
  controls.paragraphGap.value = String(state.paragraphGap);
  controls.blockGap.value = String(state.blockGap);
  controls.listGap.value = String(state.listGap);
  controls.dividerGap.value = String(state.dividerGap);
  controls.underlineLinks.checked = Boolean(state.underlineLinks);
  controls.colorTextPrimary.value = state.colorTextPrimary;
  controls.colorTextSecondary.value = state.colorTextSecondary;
  controls.colorLink.value = state.colorLink;
  controls.colorBorderSubtle.value = state.colorBorderSubtle;
  controls.colorSurfaceSubtle.value = state.colorSurfaceSubtle;
  controls.colorSurfaceCode.value = state.colorSurfaceCode;
  if (typeof state.markdownInput === "string") {
    controls.markdownInput.value = state.markdownInput;
  }
  syncSampleButtons();
  syncUi();
  renderAll();
  persistState();
}

function applyState(state) {
  applyPresetState({
    ...makeStateFromPreset(state.preset || "chat-balanced"),
    ...state,
  });
}

function applyThemeDefaults(theme) {
  const palette = themeDefaults[theme];
  if (!palette) {
    return;
  }

  controls.colorTextPrimary.value = palette.colorTextPrimary;
  controls.colorTextSecondary.value = palette.colorTextSecondary;
  controls.colorLink.value = palette.colorLink;
  controls.colorBorderSubtle.value = palette.colorBorderSubtle;
  controls.colorSurfaceSubtle.value = palette.colorSurfaceSubtle;
  controls.colorSurfaceCode.value = palette.colorSurfaceCode;
}

function syncUi() {
  document.getElementById("bodySizeValue").textContent = `${controls.bodySize.value}px`;
  document.getElementById("maxWidthValue").textContent = `${controls.maxWidth.value}px`;
  document.getElementById("lineHeightCjkValue").textContent = Number(
    controls.lineHeightCjk.value,
  ).toFixed(2);
  document.getElementById("lineHeightLatinValue").textContent = Number(
    controls.lineHeightLatin.value,
  ).toFixed(2);
  document.getElementById("lineHeightMixedValue").textContent = Number(
    controls.lineHeightMixed.value,
  ).toFixed(2);
  document.getElementById("h1SizeValue").textContent = `${controls.h1Size.value}px`;
  document.getElementById("h2SizeValue").textContent = `${controls.h2Size.value}px`;
  document.getElementById("h3SizeValue").textContent = `${controls.h3Size.value}px`;
  document.getElementById("paragraphGapValue").textContent = `${controls.paragraphGap.value}px`;
  document.getElementById("blockGapValue").textContent = `${controls.blockGap.value}px`;
  document.getElementById("listGapValue").textContent = `${controls.listGap.value}px`;
  document.getElementById("dividerGapValue").textContent = `${controls.dividerGap.value}px`;
}

function syncTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === activeTab);
  });
  outputLabelEl.textContent = outputLabels[activeTab];
}

function syncSampleButtons() {
  const markdown = controls.markdownInput.value;
  sampleButtons.forEach((button) => {
    button.classList.toggle("is-active", samples[button.dataset.sample] === markdown);
  });
}

function renderAll() {
  const state = readState();
  const tokens = buildTokens(state);
  syncSampleButtons();
  applyPreviewState(state, tokens);
  renderPreview(state, tokens);
  renderOutputs();
}

function applyPreviewState(state, tokens) {
  surfaceFrameEl.dataset.surface = state.surface;
  surfaceFrameEl.dataset.theme = state.theme;
  previewEl.dataset.underlineLinks = String(state.underlineLinks);
  surfaceMetaEl.textContent = `${capitalize(state.surface)} / ${state.languageMode.toUpperCase()} / ${capitalize(state.rhythm)}`;

  Object.entries(tokens).forEach(([key, value]) => {
    previewEl.style.setProperty(key, String(value));
  });
}

function renderPreview(state) {
  latestHtml = renderMarkdown(controls.markdownInput.value);
  previewEl.innerHTML = latestHtml;

  previewEl.lang =
    state.languageMode === "cjk"
      ? "zh-CN"
      : state.languageMode === "latin"
        ? "en"
        : "zh-CN";
}

function renderOutputs() {
  const state = readState();
  const tokens = buildTokens(state);
  latestOutputs = {
    css: generateCssSnippet(tokens, state),
    react: generateReactSnippet(tokens, state),
    tokens: JSON.stringify(buildTokenExport(tokens, state), null, 2),
    html: latestHtml,
  };
  outputEl.textContent = latestOutputs[activeTab];
}

function readState() {
  return {
    preset: controls.preset.value,
    surface: controls.surface.value,
    theme: controls.theme.value,
    languageMode: controls.languageMode.value,
    rhythm: controls.rhythm.value,
    bodySize: Number(controls.bodySize.value),
    maxWidth: Number(controls.maxWidth.value),
    lineHeightCjk: Number(controls.lineHeightCjk.value),
    lineHeightLatin: Number(controls.lineHeightLatin.value),
    lineHeightMixed: Number(controls.lineHeightMixed.value),
    h1Size: Number(controls.h1Size.value),
    h2Size: Number(controls.h2Size.value),
    h3Size: Number(controls.h3Size.value),
    paragraphGap: Number(controls.paragraphGap.value),
    blockGap: Number(controls.blockGap.value),
    listGap: Number(controls.listGap.value),
    dividerGap: Number(controls.dividerGap.value),
    underlineLinks: controls.underlineLinks.checked,
    colorTextPrimary: controls.colorTextPrimary.value,
    colorTextSecondary: controls.colorTextSecondary.value,
    colorLink: controls.colorLink.value,
    colorBorderSubtle: controls.colorBorderSubtle.value,
    colorSurfaceSubtle: controls.colorSurfaceSubtle.value,
    colorSurfaceCode: controls.colorSurfaceCode.value,
    markdownInput: controls.markdownInput.value,
  };
}

function buildTokens(state) {
  const bodyLineHeight =
    state.languageMode === "cjk"
      ? state.lineHeightCjk
      : state.languageMode === "latin"
        ? state.lineHeightLatin
        : state.lineHeightMixed;

  const rhythmBoost = state.rhythm === "progressive" ? 8 : 0;
  const h4Size = state.bodySize;
  const h5Size = state.bodySize;
  const h6Size = state.bodySize;

  return {
    "--md-max-width": `${state.maxWidth}px`,
    "--md-font-size-body": `${state.bodySize}px`,
    "--md-line-height-body": bodyLineHeight,
    "--md-color-text-primary": state.colorTextPrimary,
    "--md-color-text-secondary": state.colorTextSecondary,
    "--md-color-link": state.colorLink,
    "--md-color-border-subtle": state.colorBorderSubtle,
    "--md-color-surface-subtle": state.colorSurfaceSubtle,
    "--md-color-surface-code": state.colorSurfaceCode,
    "--md-paragraph-gap": `${state.paragraphGap}px`,
    "--md-block-gap": `${state.blockGap}px`,
    "--md-list-gap": `${state.listGap}px`,
    "--md-divider-gap": `${state.dividerGap}px`,
    "--md-h1-size": `${state.h1Size}px`,
    "--md-h2-size": `${state.h2Size}px`,
    "--md-h3-size": `${state.h3Size}px`,
    "--md-h4-size": `${h4Size}px`,
    "--md-h5-size": `${h5Size}px`,
    "--md-h6-size": `${h6Size}px`,
    "--md-h1-line-height": `${resolveHeadingLineHeight(state.h1Size)}px`,
    "--md-h2-line-height": `${resolveHeadingLineHeight(state.h2Size)}px`,
    "--md-h3-line-height": `${resolveHeadingLineHeight(state.h3Size)}px`,
    "--md-h4-line-height": `${resolveHeadingLineHeight(h4Size)}px`,
    "--md-h5-line-height": `${resolveHeadingLineHeight(h5Size)}px`,
    "--md-h6-line-height": `${resolveHeadingLineHeight(h6Size)}px`,
    "--md-h1-margin-top": `${state.blockGap + 16 + rhythmBoost}px`,
    "--md-h2-margin-top": `${state.blockGap + 12 + rhythmBoost}px`,
    "--md-h3-margin-top": `${state.blockGap + 8 + Math.round(rhythmBoost * 0.75)}px`,
    "--md-h4-margin-top": `${state.blockGap + 4}px`,
    "--md-h5-margin-top": `${state.blockGap}px`,
    "--md-h6-margin-top": `${state.blockGap}px`,
  };
}

function buildTokenExport(tokens, state) {
  return {
    preset: state.preset,
    surface: state.surface,
    theme: state.theme,
    languageMode: state.languageMode,
    rhythm: state.rhythm,
    underlineLinks: state.underlineLinks,
    tokens,
  };
}

function generateCssSnippet(tokens, state) {
  const tokenLines = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  const linkDecoration = state.underlineLinks ? "underline" : "none";

  return `.markdown-body {
${tokenLines}
  max-width: min(100%, var(--md-max-width));
  color: var(--md-color-text-primary);
  font-size: var(--md-font-size-body);
  line-height: var(--md-line-height-body);
  overflow-wrap: anywhere;
}

.markdown-body > :first-child {
  margin-top: 0;
}

.markdown-body > :last-child {
  margin-bottom: 0;
}

.markdown-body p,
.markdown-body ul,
.markdown-body ol,
.markdown-body blockquote,
.markdown-body pre,
.markdown-body .md-table-wrap {
  margin: 0 0 var(--md-block-gap);
}

.markdown-body p + p {
  margin-top: calc(var(--md-paragraph-gap) - var(--md-block-gap));
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-bottom: 8px;
  color: var(--md-color-text-primary);
  letter-spacing: -0.02em;
}

.markdown-body h1 {
  margin-top: var(--md-h1-margin-top);
  font-size: var(--md-h1-size);
  line-height: var(--md-h1-line-height);
}

.markdown-body h2 {
  margin-top: var(--md-h2-margin-top);
  font-size: var(--md-h2-size);
  line-height: var(--md-h2-line-height);
}

.markdown-body h3 {
  margin-top: var(--md-h3-margin-top);
  font-size: var(--md-h3-size);
  line-height: var(--md-h3-line-height);
  font-weight: 600;
}

.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  font-weight: 600;
}

.markdown-body h4 {
  margin-top: var(--md-h4-margin-top);
  font-size: var(--md-h4-size);
  line-height: var(--md-h4-line-height);
}

.markdown-body h5 {
  margin-top: var(--md-h5-margin-top);
  font-size: var(--md-h5-size);
  line-height: var(--md-h5-line-height);
}

.markdown-body h6 {
  margin-top: var(--md-h6-margin-top);
  font-size: var(--md-h6-size);
  line-height: var(--md-h6-line-height);
}

.markdown-body a {
  color: var(--md-color-link);
  text-decoration: ${linkDecoration};
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.14em;
}

.markdown-body code {
  padding: 0.15em 0.4em;
  border-radius: 7px;
  background: var(--md-color-surface-code);
  font-size: 0.9em;
}

.markdown-body pre {
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--md-color-border-subtle);
  border-radius: 14px;
  background: var(--md-color-surface-code);
}

.markdown-body pre code {
  padding: 0;
  background: transparent;
  font-size: 14px;
  line-height: 1.55;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.4em;
}

.markdown-body li + li {
  margin-top: var(--md-list-gap);
}

.markdown-body blockquote {
  padding: 12px 16px;
  border-left: 3px solid var(--md-color-link);
  background: var(--md-color-surface-subtle);
}

.markdown-body hr {
  height: 1px;
  margin: var(--md-divider-gap) 0;
  border: 0;
  background: var(--md-color-border-subtle);
}

.md-table-wrap {
  overflow-x: auto;
}

.markdown-body table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
}

.markdown-body th,
.markdown-body td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--md-color-border-subtle);
  text-align: left;
  vertical-align: top;
}`;
}

function generateReactSnippet(tokens, state) {
  const tokenObject = Object.entries(tokens)
    .map(([key, value]) => `  "${key}": "${String(value)}",`)
    .join("\n");

  return `import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownVars = {
${tokenObject}
} satisfies CSSProperties;

const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="md-table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer" />
  ),
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <section className="markdown-shell theme-${state.theme} surface-${state.surface}">
      <article
        className="markdown-body"
        data-language-mode="${state.languageMode}"
        data-rhythm="${state.rhythm}"
        data-underline-links="${String(state.underlineLinks)}"
        style={markdownVars}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isFenceStart(line)) {
      const result = parseFencedCode(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (isTableStart(lines, index)) {
      const result = parseTable(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const headingMatch = line.match(/^ {0,3}(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInline(headingMatch[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const result = parseBlockquote(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (isListLine(line)) {
      const result = parseList(lines, index, countIndent(line));
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const result = parseParagraph(lines, index);
    html.push(result.html);
    index = result.nextIndex;
  }

  return html.join("\n");
}

function parseParagraph(lines, startIndex) {
  const buffer = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      break;
    }

    if (
      isFenceStart(line) ||
      isListLine(line) ||
      isTableStart(lines, index) ||
      /^ {0,3}(#{1,6})\s+/.test(line) ||
      /^>\s?/.test(line) ||
      /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)
    ) {
      break;
    }

    buffer.push(line.trim());
    index += 1;
  }

  return {
    html: `<p>${parseInline(buffer.join(" "))}</p>`,
    nextIndex: index,
  };
}

function parseBlockquote(lines, startIndex) {
  const buffer = [];
  let index = startIndex;

  while (index < lines.length && /^>\s?/.test(lines[index])) {
    buffer.push(lines[index].replace(/^>\s?/, ""));
    index += 1;
  }

  return {
    html: `<blockquote>${renderMarkdown(buffer.join("\n"))}</blockquote>`,
    nextIndex: index,
  };
}

function parseFencedCode(lines, startIndex) {
  const opening = lines[startIndex].trim();
  const language = opening.replace(/^```/, "").trim();
  const buffer = [];
  let index = startIndex + 1;

  while (index < lines.length && !/^```/.test(lines[index].trim())) {
    buffer.push(lines[index]);
    index += 1;
  }

  return {
    html: `<pre><code class="language-${escapeAttribute(language || "plain")}">${escapeHtml(
      buffer.join("\n"),
    )}</code></pre>`,
    nextIndex: index + 1,
  };
}

function parseTable(lines, startIndex) {
  const headers = splitTableLine(lines[startIndex]);
  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && /\|/.test(lines[index])) {
    if (!lines[index].trim()) {
      break;
    }
    rows.push(splitTableLine(lines[index]));
    index += 1;
  }

  const headHtml = headers.map((cell) => `<th>${parseInline(cell)}</th>`).join("");
  const bodyHtml = rows
    .map((row) => {
      const cells = row.map((cell) => `<td>${parseInline(cell)}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return {
    html: `<div class="md-table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
    nextIndex: index,
  };
}

function parseList(lines, startIndex, baseIndent) {
  let index = startIndex;
  const items = [];

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      break;
    }

    const match = parseListLine(line);
    if (!match) {
      break;
    }

    if (match.indent < baseIndent) {
      break;
    }

    if (match.indent > baseIndent) {
      if (items.length) {
        const nested = parseList(lines, index, match.indent);
        items[items.length - 1].children += nested.html;
        index = nested.nextIndex;
        continue;
      }
      break;
    }

    items.push({
      type: match.type,
      body: match.html,
      children: "",
    });
    index += 1;

    while (index < lines.length) {
      const continuation = lines[index];
      if (!continuation.trim()) {
        break;
      }

      const continuationMatch = parseListLine(continuation);
      if (continuationMatch && continuationMatch.indent <= baseIndent) {
        break;
      }

      if (continuationMatch && continuationMatch.indent > baseIndent) {
        break;
      }

      if (countIndent(continuation) > baseIndent) {
        items[items.length - 1].body += ` ${parseInline(continuation.trim())}`;
        index += 1;
        continue;
      }

      break;
    }
  }

  const grouped = [];
  let current = null;

  items.forEach((item) => {
    if (!current || current.type !== item.type) {
      current = { type: item.type, items: [] };
      grouped.push(current);
    }
    current.items.push(item);
  });

  const html = grouped
    .map((group) => {
      const children = group.items
        .map((item) => `<li>${item.body}${item.children}</li>`)
        .join("");
      return `<${group.type}>${children}</${group.type}>`;
    })
    .join("");

  return {
    html,
    nextIndex: index,
  };
}

function parseListLine(line) {
  const taskMatch = line.match(/^(\s*)[-+*]\s+\[( |x|X)\]\s+(.*)$/);
  if (taskMatch) {
    const checked = taskMatch[2].toLowerCase() === "x";
    return {
      indent: countIndent(taskMatch[1]),
      type: "ul",
      html: `<label class="task-item"><input type="checkbox" disabled${
        checked ? " checked" : ""
      } /><span>${parseInline(taskMatch[3])}</span></label>`,
    };
  }

  const listMatch = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
  if (!listMatch) {
    return null;
  }

  return {
    indent: countIndent(listMatch[1]),
    type: /\d+\./.test(listMatch[2]) ? "ol" : "ul",
    html: parseInline(listMatch[3]),
  };
}

function parseInline(source) {
  const codeTokens = [];
  const linkTokens = [];

  let text = source.replace(/`([^`]+)`/g, (_, code) => {
    const token = `%%CODE_${codeTokens.length}%%`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  text = escapeHtml(text);

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const token = `%%LINK_${linkTokens.length}%%`;
    const safeUrl = escapeAttribute(url);
    linkTokens.push(
      `<a href="${safeUrl}" target="_blank" rel="noreferrer">${applyTextFormatting(
        escapeHtml(label),
      )}</a>`,
    );
    return token;
  });

  text = applyTextFormatting(text);

  codeTokens.forEach((value, index) => {
    text = text.replace(`%%CODE_${index}%%`, value);
  });

  linkTokens.forEach((value, index) => {
    text = text.replace(`%%LINK_${index}%%`, value);
  });

  return text;
}

function applyTextFormatting(source) {
  return source
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[\s(>])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(>])_([^_]+)_(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>");
}

function isFenceStart(line) {
  return /^```/.test(line.trim());
}

function isListLine(line) {
  return /^(\s*)([-+*]|\d+\.)\s+/.test(line) || /^(\s*)[-+*]\s+\[( |x|X)\]\s+/.test(line);
}

function isTableStart(lines, index) {
  if (!/\|/.test(lines[index] || "")) {
    return false;
  }
  const separator = lines[index + 1] || "";
  return /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(separator);
}

function splitTableLine(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function countIndent(value) {
  return value.replace(/\t/g, "  ").length;
}

function resolveHeadingLineHeight(size) {
  return Math.max(Math.ceil((size + 8) / 4) * 4, size + 8);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return String(value).replaceAll('"', "&quot;");
}

function persistState() {
  const state = readState();
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  const url = buildShareUrl(state);
  window.history.replaceState({}, "", url);
}

function readStateFromStorage() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readStateFromParams(params) {
  const numericKeys = [
    "bodySize",
    "maxWidth",
    "lineHeightCjk",
    "lineHeightLatin",
    "lineHeightMixed",
    "h1Size",
    "h2Size",
    "h3Size",
    "paragraphGap",
    "blockGap",
    "listGap",
    "dividerGap",
  ];

  const state = {};

  [
    "preset",
    "surface",
    "theme",
    "languageMode",
    "rhythm",
    "colorTextPrimary",
    "colorTextSecondary",
    "colorLink",
    "colorBorderSubtle",
    "colorSurfaceSubtle",
    "colorSurfaceCode",
  ].forEach((key) => {
    if (params.has(key)) {
      state[key] = params.get(key);
    }
  });

  numericKeys.forEach((key) => {
    if (params.has(key)) {
      state[key] = Number(params.get(key));
    }
  });

  if (params.has("underlineLinks")) {
    state.underlineLinks = params.get("underlineLinks") === "true";
  }

  return state;
}

function buildShareUrl(state) {
  const url = new URL(window.location.href);
  url.search = "";
  const params = new URLSearchParams();
  [
    "preset",
    "surface",
    "theme",
    "languageMode",
    "rhythm",
    "bodySize",
    "maxWidth",
    "lineHeightCjk",
    "lineHeightLatin",
    "lineHeightMixed",
    "h1Size",
    "h2Size",
    "h3Size",
    "paragraphGap",
    "blockGap",
    "listGap",
    "dividerGap",
    "underlineLinks",
    "colorTextPrimary",
    "colorTextSecondary",
    "colorLink",
    "colorBorderSubtle",
    "colorSurfaceSubtle",
    "colorSurfaceCode",
  ].forEach((key) => {
    params.set(key, String(state[key]));
  });
  url.search = params.toString();
  return url.toString();
}

async function copyText(text, button, successLabel) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successLabel;
  } catch {
    button.textContent = "复制失败";
  }
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}
