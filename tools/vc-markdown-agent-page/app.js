function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return String(value).replaceAll('"', "&quot;");
}

function buildKeywordRegex(keywords) {
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "g");
}

function normalizeLanguage(language) {
  const raw = String(language || "")
    .toLowerCase()
    .trim()
    .split(/\s+/)[0];
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    yml: "yaml",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    md: "markdown",
  };
  return map[raw] || raw || "text";
}

function highlightCodeFallback(code, language) {
  const lang = normalizeLanguage(language);
  const source = String(code || "");
  const patterns = [];
  const add = (type, regex) =>
    patterns.push({
      type,
      regex: new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`),
    });

  if (lang === "python") {
    add("comment", /#[^\n]*/g);
    add("string", /'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g);
    add("number", /\b\d+(\.\d+)?\b/g);
    add(
      "keyword",
      buildKeywordRegex([
        "False", "None", "True", "and", "as", "assert", "async", "await", "break",
        "class", "continue", "def", "elif", "else", "except", "finally", "for",
        "from", "if", "import", "in", "is", "lambda", "not", "or", "pass", "raise",
        "return", "try", "while", "with", "yield",
      ]),
    );
  } else if (lang === "yaml") {
    add("comment", /#[^\n]*/g);
    add("string", /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g);
    add("number", /\b\d+(\.\d+)?\b/g);
    add("literal", /\b(?:true|false|null|yes|no|on|off)\b/gi);
    add("attr", /[A-Za-z0-9_-]+(?=\s*:)/g);
  } else if (lang === "json") {
    add("attr", /"(?:\\.|[^"\\])*"(?=\s*:)/g);
    add("string", /"(?:\\.|[^"\\])*"/g);
    add("number", /-?\b\d+(\.\d+)?\b/g);
    add("literal", /\b(?:true|false|null)\b/g);
    add("punctuation", /[\[\]\{\}:,]/g);
  } else if (lang === "javascript" || lang === "typescript") {
    add("comment", /\/\/[^\n]*/g);
    add("comment", /\/\*[\s\S]*?\*\//g);
    add("string", /`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g);
    add("number", /\b\d+(\.\d+)?\b/g);
    add(
      "keyword",
      buildKeywordRegex([
        "break", "case", "catch", "class", "const", "continue", "default", "delete", "do",
        "else", "export", "extends", "false", "finally", "for", "function", "if", "import",
        "in", "instanceof", "let", "new", "null", "return", "super", "switch", "this",
        "throw", "true", "try", "typeof", "var", "while", "await", "async", "interface", "type",
      ]),
    );
  } else {
    add("comment", /#[^\n]*/g);
    add("comment", /\/\/[^\n]*/g);
    add("string", /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g);
    add("number", /\b\d+(\.\d+)?\b/g);
  }

  let index = 0;
  let out = "";
  while (index < source.length) {
    let best = null;
    for (const pattern of patterns) {
      pattern.regex.lastIndex = index;
      const match = pattern.regex.exec(source);
      if (!match) continue;
      if (!best || match.index < best.index || (match.index === best.index && match[0].length > best.text.length)) {
        best = { type: pattern.type, index: match.index, text: match[0] };
      }
    }
    if (!best) {
      out += escapeHtml(source.slice(index));
      break;
    }
    if (best.index > index) out += escapeHtml(source.slice(index, best.index));
    out += `<span class="vc-md-token vc-md-token-${best.type}">${escapeHtml(best.text)}</span>`;
    index = best.index + best.text.length;
  }
  return out;
}

function normalizeCodeLines(code) {
  const normalized = String(code).replace(/\r\n?/g, "\n");
  return normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
}

function inferExtension(language) {
  const lang = String(language || "")
    .toLowerCase()
    .trim()
    .split(/\s+/)[0];

  const map = {
    js: "js",
    javascript: "js",
    ts: "ts",
    typescript: "ts",
    html: "html",
    css: "css",
    json: "json",
    md: "md",
    markdown: "md",
    bash: "sh",
    sh: "sh",
    shell: "sh",
    zsh: "sh",
    python: "py",
    py: "py",
  };

  return map[lang] || "txt";
}

function normalizeHljsLanguage(language) {
  const lang = String(language || "")
    .toLowerCase()
    .trim()
    .split(/\s+/)[0];

  // highlight.js language ids / aliases
  if (lang === "html") return "xml";
  if (lang === "shell" || lang === "sh" || lang === "zsh") return "bash";
  if (lang === "md") return "markdown";
  return lang || "plaintext";
}

function buildCodeBlockHtml(code, infoString) {
  const language = (infoString || "").trim().split(/\s+/)[0] || "plain";
  const normalized = normalizeCodeLines(code);
  const lines = normalized ? normalized.split("\n") : [""];
  const lineNumbersHtml = lines.map((_, idx) => `${idx + 1}`).join("<br/>");
  const hljs = globalThis.hljs;
  let highlightedHtml = null;
  if (hljs && typeof hljs.highlight === "function") {
    try {
      const hljsLang = normalizeHljsLanguage(language);
      if (hljsLang && hljs.getLanguage && hljs.getLanguage(hljsLang)) {
        highlightedHtml = hljs.highlight(normalized, {
          language: hljsLang,
          ignoreIllegals: true,
        }).value;
      } else if (typeof hljs.highlightAuto === "function") {
        highlightedHtml = hljs.highlightAuto(normalized).value;
      }
    } catch {
      highlightedHtml = null;
    }
  }
  const codeHtml = highlightedHtml == null ? highlightCodeFallback(normalized, language) : highlightedHtml;

  return `
<div class="vc-md-code-block">
  <div class="vc-md-code-inner" data-vc-code-collapsed="false" data-vc-code-fullscreen="false" data-vc-code-language="${escapeAttr(
    language,
  )}">
    <div class="vc-md-code-header">
      <span class="vc-md-code-language">${escapeHtml(language)}</span>
      <div class="vc-md-code-actions">
        <button type="button" data-vc-md-action="download-code" title="Download">
          <i data-lucide="download"></i>
        </button>
        <button type="button" data-vc-md-action="toggle-collapse" title="Collapse">
          <i data-lucide="chevrons-up-down"></i>
        </button>
        <button type="button" data-vc-md-action="copy-code" title="Copy">
          <i data-lucide="copy"></i>
        </button>
        <button type="button" data-vc-md-action="toggle-fullscreen" title="Fullscreen">
          <i data-lucide="maximize"></i>
        </button>
      </div>
    </div>
    <div class="vc-md-code-content">
      <div class="vc-md-code-lines">${lineNumbersHtml}</div>
      <pre class="vc-md-code"><code class="hljs language-${escapeAttr(language)}">${codeHtml}</code></pre>
    </div>
  </div>
</div>
`.trim();
}

function buildTableWrapHtml(tableInnerHtml, titleText) {
  const title = titleText || "表格";
  return `
<div class="vc-md-table-wrap" data-vc-table-fullscreen="false">
  <div class="vc-md-table-header">
    <span class="vc-md-table-title">${escapeHtml(title)}</span>
    <div class="vc-md-table-actions">
      <button type="button" data-vc-md-action="copy-table" title="Copy">
        <i data-lucide="copy"></i>
      </button>
      <button type="button" data-vc-md-action="download-csv" title="Download CSV">
        <i data-lucide="download"></i>
      </button>
      <button type="button" data-vc-md-action="toggle-table-fullscreen" title="Fullscreen">
        <i data-lucide="maximize"></i>
      </button>
    </div>
  </div>
  ${tableInnerHtml}
</div>
`.trim();
}

function createMarkedRenderer() {
  const markedGlobal = globalThis.marked;
  if (!markedGlobal) {
    throw new Error("marked not found on window");
  }

  const renderer = new markedGlobal.Renderer();

  // Enforce vc-markdown structure for fenced code blocks.
  renderer.code = function codeRenderer(code, infoString) {
    return buildCodeBlockHtml(code, infoString);
  };

  // Enforce vc-markdown structure for tables (header bar + sticky thead).
  renderer.table = function tableRenderer(header, body) {
    const tableHtml = `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
    return buildTableWrapHtml(tableHtml, "表格");
  };

  return renderer;
}

function markdownToHtml(markdown) {
  const markedGlobal = globalThis.marked;
  const renderer = createMarkedRenderer();
  markedGlobal.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });
  return markedGlobal.parse(String(markdown || ""));
}

function buildUserBubble(text) {
  const safe = escapeHtml(text);
  return `
<div class="user-row">
  <div class="vc-md-bubble">
  <div class="vc-md-bubble-user">${safe}</div>
  </div>
</div>
`.trim();
}

function buildSystemBubble(text) {
  const safe = escapeHtml(text);
  return `
<div class="system-row">
  <div class="vc-md-bubble">
    <div class="vc-md-bubble-system">${safe}</div>
  </div>
</div>
`.trim();
}

function buildLoadingBubble() {
  return `
<div class="loading-row">
  <div class="vc-md-bubble vc-md-bubble-loading">
    <div class="vc-md-loading-dots" aria-label="loading">
      <span></span><span></span><span></span>
    </div>
  </div>
</div>
`.trim();
}

function buildErrorBubble(text) {
  const safe = escapeHtml(text);
  return `
<div class="error-row">
  <div class="vc-md-bubble">
    <div class="vc-md-bubble-error">
      <span data-icon="error">!</span>
      <span>${safe}</span>
    </div>
  </div>
</div>
`.trim();
}

function buildAgentBubble(html, scene) {
  const sceneAttr = escapeAttr(scene || "chat");
  return `
<div class="vc-md-bubble vc-md-bubble-agent">
  <div class="vc-md-bubble-agent-content">
    <article class="vc-md-root markdown-body" data-vc-md-scene="${sceneAttr}">
      ${html}
    </article>
  </div>
</div>
`.trim();
}

function buildAgentFlow(html, scene) {
  const sceneAttr = escapeAttr(scene || "chat");
  return `
<div class="vc-md-root vc-md-flow markdown-body" data-vc-md-scene="${sceneAttr}">
  ${html}
</div>
`.trim();
}

function buildAgentCard(html, scene) {
  const sceneAttr = escapeAttr(scene || "chat");
  return `
<div class="agent-row">
  <div class="vc-md-root" data-vc-md-scene="${sceneAttr}">
    <div class="vc-md-card">
      <article class="markdown-body">
        ${html}
      </article>
    </div>
  </div>
</div>
`.trim();
}

function guessAgentReplyMarkdown(userText) {
  const trimmed = String(userText || "").trim();
  // Fallback demo content (when API is not configured).
  // Keep output as final Markdown content (no rule explanation).
  return `# Agent 回复示例

下面是一条结构化回复，包含标题、段落、列表、引用、代码块与表格。

## 输入

> ${trimmed || "（空）"}

## 要点清单

- 先给出结论，再给出可执行步骤
- 代码示例使用 TypeScript
- 表格给出字段对照

> 这是一个引用块，用于强调关键结论：输出内容保持结构化与可扫描。

## 示例代码

\`\`\`ts
export function sum(a: number, b: number) {
  return a + b;
}
\`\`\`

## 字段对照表

| 字段 | 含义 | 备注 |
| --- | --- | --- |
| scene | 渲染场景 | chat/drawer/ide |
| code | 代码块 | 带语言标识 |
`;
}

function csvEscapeCell(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

function tableToMatrix(tableEl) {
  const rows = [];
  const rowEls = tableEl.querySelectorAll("tr");
  rowEls.forEach((tr) => {
    const cells = [];
    tr.querySelectorAll("th,td").forEach((cell) => {
      cells.push((cell.textContent || "").trim());
    });
    if (cells.length) rows.push(cells);
  });
  return rows;
}

async function copyText(text) {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }
  await navigator.clipboard.writeText(text);
}

function downloadText({ filename, mime, text }) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function attachActionHandlers(rootEl) {
  rootEl.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-vc-md-action]");
    if (!button) return;

    const action = button.dataset.vcMdAction;
    if (!action) return;

    try {
      if (action === "copy-code") {
        const inner = button.closest(".vc-md-code-inner");
        const codeEl = inner?.querySelector("pre code");
        await copyText(codeEl?.textContent || "");
        return;
      }

      if (action === "download-code") {
        const inner = button.closest(".vc-md-code-inner");
        const codeEl = inner?.querySelector("pre code");
        const language = inner?.dataset.vcCodeLanguage || "plain";
        const ext = inferExtension(language);
        downloadText({
          filename: `code.${ext}`,
          mime: "text/plain;charset=utf-8",
          text: codeEl?.textContent || "",
        });
        return;
      }

      if (action === "toggle-collapse") {
        const inner = button.closest(".vc-md-code-inner");
        if (!inner) return;
        inner.dataset.vcCodeCollapsed = inner.dataset.vcCodeCollapsed === "true" ? "false" : "true";
        return;
      }

      if (action === "toggle-fullscreen") {
        const inner = button.closest(".vc-md-code-inner");
        if (!inner) return;
        inner.dataset.vcCodeFullscreen =
          inner.dataset.vcCodeFullscreen === "true" ? "false" : "true";
        return;
      }

      if (action === "copy-table") {
        const wrap = button.closest(".vc-md-table-wrap");
        const table = wrap?.querySelector("table");
        if (!table) return;
        const matrix = tableToMatrix(table);
        const tsv = matrix.map((row) => row.join("\t")).join("\n");
        await copyText(tsv);
        return;
      }

      if (action === "download-csv") {
        const wrap = button.closest(".vc-md-table-wrap");
        const table = wrap?.querySelector("table");
        if (!table) return;
        const matrix = tableToMatrix(table);
        const csv = matrix.map((row) => row.map(csvEscapeCell).join(",")).join("\n");
        downloadText({
          filename: "table.csv",
          mime: "text/csv;charset=utf-8",
          text: csv,
        });
        return;
      }

      if (action === "toggle-table-fullscreen") {
        const wrap = button.closest(".vc-md-table-wrap");
        if (!wrap) return;
        wrap.dataset.vcTableFullscreen =
          wrap.dataset.vcTableFullscreen === "true" ? "false" : "true";
        return;
      }
    } catch (err) {
      // This is a demo page; fail silently to avoid breaking the thread.
      console.error(err);
    }
  });
}

function applyInlineCodeOverrides(rootEl) {
  rootEl.querySelectorAll("code").forEach((node) => {
    const text = (node.textContent || "").trim();
    if (text === "--vc-md-base-size: 1rem") {
      node.classList.add("vc-md-inline-code-tight");
    }
    if (text === "alipay") {
      node.classList.add("vc-md-inline-code-no-y-padding");
    }
  });
}

const historyStorageKey = "vc-md-agent-history-v1";
const maxHistoryItems = 50;

function loadHistory() {
  try {
    const raw = window.localStorage.getItem(historyStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(items) {
  try {
    window.localStorage.setItem(historyStorageKey, JSON.stringify(items));
  } catch {}
}

function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

async function generateViaApi(prompt) {
  const resp = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data?.error || `请求失败 (${resp.status})`);
  }
  return String(data?.content ?? "");
}

function createApp() {
  const threadEl = document.getElementById("thread");
  const sceneSelectEl = document.getElementById("sceneSelect");
  const layoutSelectEl = document.getElementById("layoutSelect");
  const historyBtnEl = document.getElementById("historyBtn");
  const historyOverlayEl = document.getElementById("historyOverlay");
  const historyCloseBtnEl = document.getElementById("historyCloseBtn");
  const historyListEl = document.getElementById("historyList");
  const composerForm = document.getElementById("composerForm");
  const composerInput = document.getElementById("composerInput");
  const sendBtn = document.getElementById("sendBtn");

  if (
    !threadEl ||
    !sceneSelectEl ||
    !layoutSelectEl ||
    !historyBtnEl ||
    !historyOverlayEl ||
    !historyCloseBtnEl ||
    !historyListEl ||
    !composerForm ||
    !composerInput ||
    !sendBtn
  ) {
    throw new Error("Missing required DOM nodes");
  }

  attachActionHandlers(threadEl);

  const state = {
    scene: sceneSelectEl.value || "chat",
    layout: layoutSelectEl.value || "card",
    messages: [],
    history: loadHistory(),
  };

  function setHistoryOpen(open) {
    historyOverlayEl.dataset.open = open ? "true" : "false";
    historyOverlayEl.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function renderHistory() {
    if (!state.history.length) {
      historyListEl.innerHTML = `<div style="color:#5b5f66;font-size:12px;">暂无历史记录</div>`;
      return;
    }

    const html = state.history
      .map((item) => {
        const prompt = escapeHtml(item.prompt || "");
        const ts = escapeHtml(formatTime(item.createdAt || ""));
        const id = escapeAttr(item.id || "");
        return `
<div class="history-item" data-history-id="${id}">
  <div class="history-meta">
    <span>${ts}</span>
    <span>${escapeHtml(item.layout || "")}/${escapeHtml(item.scene || "")}</span>
  </div>
  <div class="history-prompt" title="${prompt}">${prompt || "(empty)"}</div>
  <div class="history-actions">
    <button type="button" data-action="restore">恢复</button>
    <button type="button" data-action="delete" data-variant="danger">删除</button>
  </div>
</div>
`.trim();
      })
      .join("\n");

    historyListEl.innerHTML = html;
  }

  function render() {
    const scene = state.scene;
    const parts = [];

    state.messages.forEach((msg) => {
      if (msg.role === "system") {
        parts.push(buildSystemBubble(msg.text));
        return;
      }
      if (msg.role === "user") {
        parts.push(buildUserBubble(msg.text));
        return;
      }
      if (msg.role === "loading") {
        parts.push(buildLoadingBubble());
        return;
      }
      if (msg.role === "error") {
        parts.push(buildErrorBubble(msg.text || "生成失败"));
        return;
      }
      if (msg.role === "agent") {
        const html = markdownToHtml(msg.markdown || "");
        if (state.layout === "flow") {
          parts.push(buildAgentFlow(html, scene));
        } else {
          parts.push(buildAgentCard(html, scene));
        }
      }
    });

    threadEl.innerHTML = parts.join("\n");
    applyInlineCodeOverrides(threadEl);

    if (globalThis.lucide && typeof globalThis.lucide.createIcons === "function") {
      globalThis.lucide.createIcons();
    }
  }

  sceneSelectEl.addEventListener("change", () => {
    state.scene = sceneSelectEl.value || "chat";
    render();
  });

  layoutSelectEl.addEventListener("change", () => {
    state.layout = layoutSelectEl.value || "card";
    render();
  });

  historyBtnEl.addEventListener("click", () => {
    renderHistory();
    setHistoryOpen(true);
  });

  historyCloseBtnEl.addEventListener("click", () => {
    setHistoryOpen(false);
  });

  historyOverlayEl.addEventListener("click", (event) => {
    if (event.target === historyOverlayEl) {
      setHistoryOpen(false);
    }
  });

  historyListEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const itemEl = btn.closest("[data-history-id]");
    if (!itemEl) return;

    const id = itemEl.getAttribute("data-history-id");
    const action = btn.getAttribute("data-action");
    const idx = state.history.findIndex((h) => String(h.id) === String(id));
    if (idx === -1) return;

    if (action === "delete") {
      state.history.splice(idx, 1);
      persistHistory(state.history);
      renderHistory();
      return;
    }

    if (action === "restore") {
      const h = state.history[idx];
      state.scene = h.scene || state.scene;
      state.layout = h.layout || state.layout;
      sceneSelectEl.value = state.scene;
      layoutSelectEl.value = state.layout;
      state.messages = [
        { role: "user", text: String(h.prompt || "") },
        { role: "agent", markdown: String(h.markdown || "") },
      ];
      setHistoryOpen(false);
      render();
    }
  });

  composerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = String(composerInput.value || "").trim();
    if (!text) return;

    state.messages.push({ role: "user", text });
    state.messages.push({ role: "loading" });
    composerInput.value = "";
    sendBtn.disabled = true;
    render();

    const container = threadEl.parentElement;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    (async () => {
      try {
        const markdown = await generateViaApi(text);
        // Replace the last loading bubble with agent content.
        const idx = state.messages.map((m) => m.role).lastIndexOf("loading");
        if (idx !== -1) state.messages.splice(idx, 1, { role: "agent", markdown });

        // Save into history (newest first).
        const entry = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          prompt: text,
          markdown,
          scene: state.scene,
          layout: state.layout,
        };
        state.history.unshift(entry);
        if (state.history.length > maxHistoryItems) {
          state.history.length = maxHistoryItems;
        }
        persistHistory(state.history);
        render();
      } catch (err) {
        const idx = state.messages.map((m) => m.role).lastIndexOf("loading");
        if (idx !== -1) state.messages.splice(idx, 1, { role: "error", text: err?.message || "生成失败" });
        render();
      } finally {
        sendBtn.disabled = false;
        const c = threadEl.parentElement;
        c?.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
      }
    })();
  });

  render();
}

createApp();
