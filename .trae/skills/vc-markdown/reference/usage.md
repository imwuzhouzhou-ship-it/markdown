# vc-markdown 接入说明

本目录将 markdown 规范拆分为两层：

- 结构规范：[`../SKILL.md`](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/SKILL.md)
- 样式实现：[`markdown.css`](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css)

使用原则：

- 组件结构、间距关系、交互规则以 `SKILL.md` 为准
- 选择器、CSS 变量、场景切换以 `markdown.css` 为准
- 如果需要扩展新元素，先补结构说明，再补 CSS 实现

---

## HTML 接入

```html
<link rel="stylesheet" href="./reference/markdown.css" />

<article class="vc-md-root vc-md-flow markdown-body" data-vc-md-scene="chat">
  <h1>标题</h1>
  <p>这里是一段正文，包含 <a href="#">链接</a> 与 <code>inline code</code>。</p>
  <blockquote>
    <p>引用内容</p>
  </blockquote>
  <pre><code>const a = 1;</code></pre>
</article>
```

可选容器：

- `.vc-md-root`：根字体、抗锯齿、基础节奏
- `.vc-md-flow`：768px 阅读宽度
- `.vc-md-card`：680px 卡片容器
- `.markdown-body`：Markdown 元素样式作用域

场景切换：

```html
<article class="vc-md-root markdown-body" data-vc-md-scene="ide"></article>
<article class="vc-md-root markdown-body" data-vc-md-scene="drawer"></article>
<article class="vc-md-root markdown-body" data-vc-md-scene="chat"></article>
```

---

## React 接入

```jsx
import "./reference/markdown.css";

export function MarkdownArticle({ html, scene = "chat" }) {
  return (
    <article
      className="vc-md-root vc-md-flow markdown-body"
      data-vc-md-scene={scene}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

如果使用 `react-markdown`：

```jsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./reference/markdown.css";

export function MarkdownRenderer({ children, scene = "chat" }) {
  return (
    <article className="vc-md-root vc-md-flow markdown-body" data-vc-md-scene={scene}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </article>
  );
}
```

建议：

- 表格外包一层 `.vc-md-table-wrap`
- 自定义代码块时使用 `.vc-md-code-block`、`.vc-md-code-inner`、`.vc-md-code-header`
- 引用标记使用 `.vc-md-citation`

---

## CSS 变量覆盖

可以只覆写变量，不改选择器：

```css
.my-markdown-surface {
  --vc-md-base-size: 14px;
  --vc-md-line-height: 1.571;
  --vc-md-text: var(--foreground, #20242b);
  --vc-md-primary: var(--primary, #336dff);
  --vc-md-border: var(--border, #d8dee8);
}
```

```html
<article class="vc-md-root markdown-body my-markdown-surface" data-vc-md-scene="drawer">
  ...
</article>
```

---

## Figma 插件/还原

如果用于 Figma 插件或设计稿还原：

- 从 `SKILL.md` 读取结构树与尺寸关系
- 从 `markdown.css` 读取圆角、边框、sticky、grid、hover、变量命名
- 组件拆分建议：
  - Heading
  - Paragraph
  - InlineCode
  - CodeBlock
  - Blockquote
  - ListItem
  - Table
  - CitationBadge
  - ReferenceItem
  - ImageGroup
  - Bubble

---

## 与编辑器的关系

编辑器路径：

- [`tools/vc-markdown-editor/index.html`](file:///Users/bytedance/Desktop/AD/agent%20design3/tools/vc-markdown-editor/index.html)
- [`tools/vc-markdown-editor/server.mjs`](file:///Users/bytedance/Desktop/AD/agent%20design3/tools/vc-markdown-editor/server.mjs)

当前编辑器保存时会同步写入：

- [`../SKILL.md`](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/SKILL.md)
- [`markdown.css`](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css)
