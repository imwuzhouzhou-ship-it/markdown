***

name: vc-markdown
description: "AI Agent 聊天界面的 Markdown 渲染组件规范。使用此 skill 的场景：生成或重建 Markdown 元素（标题、段落、代码块、表格、列表、引用、图片、引用标记），编写 Figma 插件还原这些组件，生成符合此规范的前端代码，或查询间距规则、组件结构。涵盖 20 个 Markdown 变体、5 个气泡变体。色彩 token 由 volcengine-design-system skill 统一管理，本 skill 仅定义组件结构与排版。"
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Markdown 渲染组件规范

Agent 聊天响应的 Markdown 渲染层。定义组件结构、排版、间距——色彩 token 由 [volcengine-design-system](../volcengine-design-system/SKILL.md) 统一提供，本 skill 不重复定义色彩。

组件中引用的语义色（如 `foreground`、`muted`、`border`）均指火山引擎设计系统中的 CSS 变量，直接使用即可。

***

## 文件拆分

当前规范已拆分为两部分：

- **Skill 说明文件**：当前文件 [SKILL.md](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/SKILL.md)
- **CSS 样式文件**：[markdown.css](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css)

使用原则：

- 在生成规范、说明组件结构、描述尺寸与交互时，优先引用当前 `SKILL.md`
- 在实现前端、还原样式、生成组件 class、映射 CSS 变量时，直接引用 `reference/markdown.css`
- 若两者出现差异，以 **结构关系和交互规则遵循** **`SKILL.md`**、以 **选择器和变量命名遵循** **`markdown.css`**

***

## 接入方式

推荐按以下方式关联：

```html
<link rel="stylesheet" href="./reference/markdown.css" />
<article class="vc-md-root markdown-body" data-vc-md-scene="chat">
  ...
</article>
```

容器层级建议：

- 最外层阅读容器：`.vc-md-root`
- Markdown 内容域：`.markdown-body`
- 场景切换：`data-vc-md-scene="ide" | "drawer" | "chat"`
- 卡片容器：`.vc-md-card`
- 纯文本流宽度控制：`.vc-md-flow`

***

## 字体与字号场景判断

根据不同的显示场景，正文的 `base` 字号需进行相应调整。所有行高、间距均应基于该场景的 Base 字号（1rem）进行比例计算，以确保在不同环境下视觉比例一致。

| 场景                 | Base 字号  | 比例参考 (rem)  | 推荐行高              | 容器属性                        |
| ------------------ | -------- | ----------- | ----------------- | --------------------------- |
| **抽屉式内容 (Drawer)** | **14px** | 1rem = 14px | 1.571rem (22px)   | `data-vc-md-scene="drawer"` |
| **默认场景 (Chat)**    | **16px** | 1rem = 16px | 1.625rem (26.0px) | `data-vc-md-scene="chat"`   |

***

## 字体配置详情

| 角色      | 字体              | 回退                                                                                                                                             |
| ------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 正文 / UI | "ui-sans-serif" | "-apple-system" → "system-ui" → "Segoe UI" → "Helvetica" → "Apple Color Emoji" → "Arial" → "sans-serif" → "Segoe UI Emoji" → "Segoe UI Symbol" |
| 代码      | JetBrains Mono  | SF Mono → Roboto Mono → "ui-sans-serif"                                                                                                        |

**渲染优化建议（Web 端）：**
为了在 Mac/Webkit 内核浏览器下获得更细腻的字重表现（避免文字发虚偏粗），建议在全局或容器层开启抗锯齿：

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

字重：Regular (400)、Medium (500)、Semi Bold (600)、Italic。

***

## CSS 变量映射

`reference/markdown.css` 已统一抽出核心变量，前端实现时优先通过覆盖 CSS Custom Properties 调整，而不是在组件内部重新硬编码值。

| 变量                                     | 含义        |
| -------------------------------------- | --------- |
| `--vc-md-base-size`                    | 正文基准字号    |
| `--vc-md-line-height`                  | 正文行高倍率    |
| `--vc-md-reading-width`                | 纯文本最佳阅读宽度 |
| `--vc-md-card-width`                   | 卡片宽度      |
| `--vc-md-card-padding`                 | 卡片内边距     |
| `--vc-md-text`                         | 主文本色      |
| `--vc-md-muted`                        | 次级文本色     |
| `--vc-md-border`                       | 边框色       |
| `--vc-md-surface`                      | 主背景色      |
| `--vc-md-surface-muted`                | 次级背景色     |
| `--vc-md-primary`                      | 主链接/品牌色   |
| `--vc-md-h1-size` \~ `--vc-md-h4-size` | 标题字阶      |
| `--vc-md-p-space`                      | 段落间距      |

***

## 间距计算规则

每个组件自带上下 padding，父容器 `itemSpacing: 0`。间距值应优先使用 `rem` 单位以适配 Base 字号的变化。

实现约束（避免间距“覆盖”）：

- Markdown 的相邻块级元素在默认文档流里会发生 `margin` 折叠，导致“前一个元素的 margin-bottom + 后一个元素的 margin-top”被折叠成单个值（视觉上像被覆盖）。
- 为了保证**每个元素的上下间距都独立生效且不折叠**，渲染容器 `.markdown-body` 必须使用列布局容器（推荐 `display: flex; flex-direction: column; gap: 0;`），对应实现已在 [markdown.css](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css) 固化。

| 位置          | 像素值 (16px base) | rem 计算值             |
| ----------- | --------------- | ------------------- |
| 段落之间        | 8px             | 0.5rem              |
| H1 前 / 后    | 16.5 / 8px      | 1.03125rem / 0.5rem |
| H2 前 / 后    | 15 / 8px        | 0.9375rem / 0.5rem  |
| H3 前 / 后    | 13.5 / 8px      | 0.84375rem / 0.5rem |
| H4-H6 前 / 后 | 12 / 8px        | 0.75rem / 0.5rem    |
| 代码块上下       | 8px             | 0.5rem              |
| 列表项底部       | 8px             | 0.5rem              |
| 分割线上下       | 16px            | 1.00rem             |
| 表格单元格       | 10px 16px       | 0.625rem 1rem       |

***

## Agent 响应容器

在纯文本流展示时，宽度设定为 768px 以保证最佳阅读行长。
如需将响应内容包裹在卡片内，推荐规范如下：

```
宽度: 680px FIXED    内边距: 32px 四边    圆角: 16px
布局: VERTICAL       itemSpacing: 0
填充: background     边框: border 1px inside
投影: y:1 r:3 a:0.04 + y:4 r:12 spread:-2 a:0.06
```

子组件统一 `layoutAlign: STRETCH`。

***

## 内容元素与样式归属

下列内容的**结构、排版、交互规则保留在本文件**，实际类名与样式实现在 [markdown.css](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css)：

| 模块           | 结构规范                                    | CSS 类/选择器                                                                                        |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Markdown 根容器 | 阅读宽度、字号、抗锯齿                             | `.vc-md-root`, `.vc-md-flow`, `.vc-md-card`, `.markdown-body`                                    |
| 标题与正文        | 字阶、上下边距、正文节奏                            | `.markdown-body h1` \~ `.markdown-body h6`, `.markdown-body p`                                   |
| 行内代码与代码块     | Header / Actions / 行号 / 内容区             | `.vc-md-code-block`, `.vc-md-code-inner`, `.vc-md-code-header`, `.vc-md-code-content`            |
| 引用           | 左侧 3px 竖线 + 内容区                         | `.markdown-body blockquote`                                                                      |
| 列表           | 多层级缩进与 marker 节奏                        | `.markdown-body ul`, `.markdown-body ol`, `.markdown-body li`                                    |
| 表格           | 标题栏吸顶、列头吸顶、滚动容器                         | `.vc-md-table-wrap`, `.vc-md-table-header`, `.markdown-body thead th`, `.markdown-body tbody td` |
| 引用标记         | badge 与 reference item                  | `.vc-md-citation`, `.vc-md-reference-item`                                                       |
| 图片           | 栅格、Hover Action、Caption                 | `.vc-md-image-group`, `.vc-md-image-frame`, `.vc-md-image-actions`, `.vc-md-image-caption`       |
| 气泡           | user / agent / system / loading / error | `.vc-md-bubble-*`                                                                                |

***

<br />

## 标题（6 级）

| 变体 | 字号            | 行高 | 比例 (calc) | 边距 上/下 (rem)             | 字重  |
| -- | ------------- | -- | --------- | ------------------------ | --- |
| h1 | 22 (1.375rem) | 33 | 1.5       | 16.5 (1.03125) / 8 (0.5) | 600 |
| h2 | 20 (1.25rem)  | 30 | 1.5       | 15 (0.9375) / 8 (0.5)    | 600 |
| h3 | 18 (1.125rem) | 27 | 1.5       | 13.5 (0.84375) / 8 (0.5) | 600 |
| h4 | 16 (1.00rem)  | 24 | 1.5       | 12 (0.75) / 8 (0.5)      | 600 |
| h5 | 16 (1.00rem)  | 24 | 1.5       | 12 (0.75) / 8 (0.5)      | 600 |
| h6 | 16 (1.00rem)  | 24 | 1.5       | 12 (0.75) / 8 (0.5)      | 600 |

字体 "ui-sans-serif" 及回退字体栈，色 `foreground`，layout VERTICAL。

***

## 正文与分割线

| 变体   | 字号           | 行高 | 比例 (calc) | 边距 上/下 (rem)                | 字重  |
| ---- | ------------ | -- | --------- | --------------------------- | --- |
| body | 16 (1.00rem) | 26 | 1.625     | 0 / 8 (0.5)                 | 400 |
| 分割线  | —            | —  | —         | 16 (1.00rem) / 16 (1.00rem) | —   |

实现约束（去掉默认 margin）：

- 段落等块级元素需要强制 `margin-top: 0`，避免浏览器默认 `1em` 顶部外边距在嵌套结构（如 `blockquote > p`）里出现 16px 的“额外空白”。
- 引用块内部的 `p` 必须 `margin: 0`，只由组件自己的 `padding/gap` 控制视觉间距。

**正文具体变体：**

| 变体          | 字体                     | 色          | 特殊     |
| ----------- | ---------------------- | ---------- | ------ |
| paragraph   | "ui-sans-serif"        | foreground | 字重 400 |
| bold        | "ui-sans-serif"        | foreground | 字重 600 |
| italic      | "ui-sans-serif" Italic | foreground | —      |
| link        | "ui-sans-serif"        | primary    | 无下划线   |
| inline-link | "ui-sans-serif"        | link       | 无下划线   |

***

## 代码

**行内代码** **`inline-code`：** Mono 13px / 20px，padding 2px 5px，圆角 4px，填充 `muted`。

特例（仅用于单个 token 示例的无侵入覆盖）：

- 若某些**单个**文案示例需要去除上下 padding / 去除边框，但又不能影响全局所有 inline code，可在该 `code` 节点上追加 class：`vc-md-inline-code-tight`。
- 对应 CSS 已在 [markdown.css](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css) 提供（`padding-top/bottom: 0`，`border-width: 0`）。

**代码块** **`code-block`：** 宽度 100%（与外层容器 STRETCH 对齐），paddingTop/Bottom 8px。

强制规则：

- 代码块必须保留 Header，不允许仅渲染单独的 `pre/code` 而缺失 Header
- Header 必须包含 `Language` 与 `Actions` 两个区域，且 `Copy` 操作必选（下载/折叠/全屏可选）
- Header 高度 40px，背景 `muted`，下边框 `border`
- 内容区必须包含行号列与代码列（行号宽 20px，右对齐）
- Markdown 中的 fenced code block（即 ` ```lang ... ``` `）只是**输入语法**，不是最终 DOM 结构；最终渲染结果必须转换为 `CodeBlockInner > Header > Content` 的组件结构
- 若实现层仍直接输出浏览器默认的 `<pre><code>...</code></pre>`，即判定为**不符合本 skill**

交互能力要求：

| 操作         | 是否必选 | 规则                                |
| ---------- | ---- | --------------------------------- |
| Copy       | 必选   | 复制完整代码文本，不带行号                     |
| Collapse   | 推荐   | 收起后仅保留 Header，Content 区隐藏；再次点击可展开 |
| Fullscreen | 推荐   | 进入视口级全屏查看，优先用于超长代码块；退出后回到原滚动位置    |
| Download   | 可选   | 下载为代码文件，文件后缀优先依据 Language 推断      |

- 若同时展示多个 Action，顺序建议为：`Download → Collapse → Copy → Fullscreen`
- Fullscreen 状态下代码块应提升为最高层级展示，并保持 Header 常驻可见
- Fullscreen 状态下内容区最大高度应切换为视口自适应，而非沿用普通场景高度限制
- Collapse / Fullscreen 属于代码块组件自身状态，不应影响外层消息流布局顺序
- 不允许把 Action 能力放到代码正文区域内部，必须位于 Header 区

场景化高度规则：

| 场景      | 内容区最大高度 | 使用原则                    |
| ------- | ------- | ----------------------- |
| IDE 编辑器 | 360px   | 保守限制，避免长代码块吞掉编辑与对照空间    |
| Drawer  | 420px   | 抽屉内优先保证上下文连续性，允许略高于 IDE |
| Chat    | 512px   | 默认聊天场景允许更高的代码块，减少频繁滚动   |

- `最大高度` 作用于 **Header 下方的 Content 区**，不包含 Header 本身
- 当代码行数或总高度超出最大高度时，**仅 Content 区内部滚动**，外层卡片与 Header 保持固定
- 超长代码块必须保留 Header 可见，不允许整个代码块整体滚出屏幕后 Header 消失
- 水平方向始终允许横向滚动，禁止为适应容器强制折行破坏代码格式
- 如业务场景对比阅读更重要，可在组件级覆盖 `--vc-md-code-max-height`，但不得取消高度上限

```
CodeBlockInner  fill: #fcfdfe  stroke: #eaedf1 1px  radius: 12px
├── Header      h:40px STRETCH  fill: #f6f8fa  padding: 0 16px  borderBottom: #eaedf1 1px
│   ├── Language    "ui-sans-serif" 14/22  色 #0c0d0e
│   └── Actions     gap 8px (包含下载、折叠、复制、全屏图标，色 #a0a2a7)
└── Content     maxHeight: 场景决定(IDE 360 / Drawer 420 / Chat 512)  overflow: auto  padding: 8px 16px 8px  gap 32px  layout HORIZONTAL
    ├── LineNumbers  Mono 14/24  色 #a0a2a7  textAlign RIGHT  w:20px
    └── Code         Mono 14/24  色 #0c0d0e  textAutoResize: HEIGHT (带语法高亮色)
```

语法高亮色板（代码块）

| Token / 角色      | 十六进制      | 着色对象                            |
| --------------- | --------- | ------------------------------- |
| keyword（关键字）    | `#7928A1` | `import`、`public`、`class`、`new` |
| type（类型）        | `#027FAA` | 类型名、类名                          |
| parameter（参数）   | `#AA5D01` | 函数参数                            |
| key（键名）         | `#AA5D01` | JSON / YAML 中的对象键、字段名           |
| string（字符串）     | `#008001` | 字符串字面量                          |
| literal（字面量）    | `#7928A1` | `true`、`false`、`null`           |
| punctuation（标点） | `#737A87` | `{ } [ ] : ,` 等结构标点             |
| comment（注释）     | `#737A87` | 注释                              |
| default（默认）     | `#0C0D0E` | 其他所有文本                          |

补充约束：

- 代码高亮必须按语言类型分支处理；`json` 不允许退回为“纯黑文本”效果。
- `json` 至少需要区分 `key / string / number / literal / punctuation` 五类 token。
- 代码高亮不允许仅依赖远程 CDN 脚本作为唯一实现；当第三方高亮库加载失败时，仍必须保留本地兜底高亮能力，避免退回成纯文本代码块。

***

## 引用 `blockquote`

```
BlockquoteWrap  layout HORIZONTAL  alignItems FLEX_START  margin 0  paddingBottom 8px
├── Border      w:3px  alignSelf: STRETCH  fill: #eaedf1
└── Content     "ui-sans-serif" Regular 16/26  色 #0c0d0e  paddingLeft: 16px (取消斜体)
```

***

## 列表项

列表项共享同一结构：layout HORIZONTAL，paddingBottom 8px。
基础 `paddingLeft` 为 24px。

**多层级缩进规范：**

- 第一层：paddingLeft 24px
- 第二层：paddingLeft 48px (24 + 24px)
- 第三层：paddingLeft 72px (24 + 48px)
- 单层缩进递增值为 **24px (1.5rem)**

| 变体       | 标记                                              | 内容字体                  |
| -------- | ----------------------------------------------- | --------------------- |
| ul-item  | 第一层：实心圆 (5px)，色 #9e9e9e，marginTop 10px          | "ui-sans-serif" 16/26 |
| ul-item2 | 第二层：空心圆 (5px)，边框 #9e9e9e                        | 同上                    |
| ul-item3 | 第三层：实心方块 (4px)，色 #9e9e9e                        | 同上                    |
| ol-item  | `Number` 文本节点（如 "1." 或 "a."），色 muted-foreground | 同上                    |

实现约束（确保和设计一致）：

- 禁止使用浏览器默认 `list-style` / `::marker` 的视觉样式作为最终效果来源；必须将 `ul/ol` 设为 `list-style: none`，并使用组件节点或 CSS 伪元素渲染标记。
- `ul` 的 marker 必须随层级变化：第 1 层 ●、第 2 层 ○、第 3 层 ■，尺寸与颜色见上表。
- `ol` 的编号必须是“独立编号列”，编号列宽 16px，右对齐，编号与正文间距 8px，颜色为 `muted-foreground`，数字使用 `tabular-nums`。
- `ol` 层级编号格式：第 1 层 `1.`（decimal），第 2 层 `a.`（lower-alpha），第 3 层 `i.`（lower-roman）。

***

## 分隔线 `separator`

560×41px FIXED，padding 16px 上下。内含 1px 矩形 STRETCH，fill `border`。
**使用场景限定**：分隔线主要用于划分大的逻辑区块，**通常仅在出现 H2 及以上级别（H1, H2）的新标题区块前使用**。避免在较低层级（如 H3, H4）或普通段落之间滥用分隔线，以保持信息流的紧凑性。

***

## 引用标记

| 变体             | 结构                                                                                                                                                                      | 尺寸与交互                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| citation-badge | pill 形，圆角 22px，fill `secondary`，`Number` "ui-sans-serif" 11/14 色 muted-foreground，使用 `vertical-align: middle` 并结合适当的相对偏移（如 `position: relative; top: -1px`）以确保与正文绝对居中对齐 | 18px 固定宽                                                                                                                                                          |
| reference-item | 水平排列，结构为：Badge(18px) + `Title` (14/22, 色 primary/0c0d0e) + `Date` (12/16, 色 muted-foreground/737a87)。容器采用 `inline-flex` 布局。                                             | itemSpacing 12px, padding: 6px 0, 垂直绝对居中对齐（`align-items: center`）。**Hover 交互**：鼠标悬浮时指针变手型（`cursor: pointer`），并且 `Title` 文字颜色平滑过渡为品牌色（`#1456d9`），带 `0.2s ease` 动画。 |

***

## 表格 `table`

宽度 100%（与外层容器 STRETCH 对齐），paddingTop/Bottom 8px。
支持纵向滚动，并且要求**表头吸顶**（包括标题栏和列头）。

间距规则（强制）：

- 表格作为块级组件，**上下必须保留 8px 间距**，用于与相邻段落/标题分隔（在 CSS 中通过 `TableWrap` 外边距实现）。

强制规则：

- 表格必须保留标题栏 Header（TableHeader），不允许仅渲染 `table` 而缺失标题栏
- TableHeader 必须包含 `Title` 与 `Actions` 两个区域，且 `Copy` 操作必选
- TableHeader 吸顶 `top: 0`，列头吸顶 `top: 40px`，并保证层级 `z-index` 正确
- Markdown 原生表格语法只是**输入语法**；最终渲染结果必须转换为 `TableWrap > TableHeader + table` 的组件结构
- 若实现层仅输出裸 `<table>` 且没有标题栏 Header，即判定为**不符合本 skill**

交互能力要求：

| 操作           | 是否必选 | 规则                         |
| ------------ | ---- | -------------------------- |
| Copy         | 必选   | 复制完整表格文本，至少保留表头与单元格顺序      |
| Fullscreen   | 推荐   | 进入视口级全屏查看，适用于大表格横向/纵向对比    |
| Download CSV | 推荐   | 导出当前表格内容为 CSV 文件，表头必须包含在首行 |

- 若同时展示多个 Action，顺序建议为：`Download CSV → Copy → Fullscreen`
- Fullscreen 状态下标题栏与列头仍需保持可见，优先维持 `TableHeader + HeaderRow` 的吸顶关系
- Fullscreen 状态下表格容器高度应切换为视口自适应，而非沿用普通场景高度
- Copy / Download CSV 必须以当前渲染后的表格数据为准，不允许导出丢列、乱序或忽略表头
- 不允许把表格操作按钮放入表格正文区，必须位于 TableHeader 区

```
TableWrap   radius:12  clipsContent  stroke: #eaedf1 1px inside  maxHeight: 可自定义(如386px)  overflow: auto
├── TableHeader h:40px STRETCH  flexShrink: 0  fill: #f6f8fa  padding: 0 16px  position: sticky  top: 0  zIndex: 20
│   ├── Title   "ui-sans-serif" Medium 14/18  色 #0c0d0e
│   └── Actions 包含下载 CSV、复制、全屏图标，色 #a0a2a7
├── HeaderRow   fill: none
│   └── Cell    "ui-sans-serif" Medium 14/18  色 #0c0d0e  padding: 15px 16px (左右根据列宽自适应)  fill: #fff  borderBottom: #eaedf1 1px  position: sticky  top: 40px  zIndex: 10
└── Row         fill: #fff  borderBottom: #eaedf1 1px
    ├── Col1    "ui-sans-serif" Regular 14/20  色 #0c0d0e  padding: 14px 16px
    └── Col2+   "ui-sans-serif" Regular 14/20  色 #0c0d0e  padding: 14px 16px
```

列宽按内容权重分配，禁止等宽（如示例中的分类 150px，核心功能 260px，说明 358px）。

***

## 图片与多媒体

| 变体 | 布局与列数                                          | 尺寸约束        |
| -- | ---------------------------------------------- | ----------- |
| 单图 | 1列 (`grid-template-columns: repeat(1, 400px)`) | 固定最大宽 400px |
| 双图 | 2列 (`grid-template-columns: repeat(2, 1fr)`)   | 等宽平分        |
| 三图 | 3列 (`grid-template-columns: repeat(3, 1fr)`)   | 等宽平分        |
| 四图 | 4列 (`grid-template-columns: repeat(4, 1fr)`)   | 等宽平分        |

**图片容器共享规则**：

- **布局**：使用 `display: grid`，间距 `gap: 12px`，容器宽度 `100%`，顶部/底部 `padding: 8px`，左对齐。
- **ImageFrame**：圆角 `12px`，边框 `border` 1px，使用 `aspect-ratio: 1 / 1` 保持正方形比例，超出隐藏（`overflow: hidden`），设置相对定位（`position: relative`）。
- **操作按钮组 (Hover Actions)**：绝对定位在右下角（`bottom: 8px`, `right: 8px`）。默认透明度为 0（`opacity: 0`），仅在鼠标悬浮（Hover）到整张图片时显示（`opacity: 1`），带 `0.2s ease` 过渡动画。按钮内仅包含**下载**图标。按钮为 `28x28px`，圆角 `6px`，背景色 `rgba(0,0,0,0.4)`，带有 `backdrop-filter: blur(4px)` 的毛玻璃效果。图标居中，颜色为纯白 `#fff`。
- **图片拉伸**：内部 `img` 元素需设置 `width: 100%`, `height: 100%`, `object-fit: cover` 确保填满容器不留白。

***

## 实现要求

- 前端实现不得再把完整样式硬编码回 `SKILL.md`
- 需要样式时优先引用 [markdown.css](file:///Users/bytedance/Desktop/AD/agent%20design3/.trae/skills/vc-markdown/reference/markdown.css)
- 需要增减元素时，先修改当前 `SKILL.md` 的结构说明，再同步修改 `markdown.css`
- 生成 React、Vue、HTML、Figma 插件时，都要保持 **结构描述在 Skill、视觉落地在 CSS**
- 使用 `marked`、`markdown-it`、`react-markdown` 等通用 Markdown 解析器时，必须对 `code` / `pre` / `table` 节点做二次封装或自定义 renderer，不能直接使用默认输出结果
- 验收时以**最终渲染 DOM 结构**为准，不以“输入内容里写了 Markdown 代码块/表格语法”作为符合规范的依据

***

## 反模式

| ❌ 错误                         | ✅ 正确                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| 父容器 itemSpacing > 0          | itemSpacing 0，各组件自带 padding                                |
| 在本 skill 中重新定义色彩 token       | 引用火山引擎设计系统的语义色变量                                           |
| 代码块不加 Header                 | 始终包含 Language + Copy 等操作图标                                 |
| blockquote 用 padding-left 模拟 | 3px 矩形竖线 + 16px paddingLeft                                |
| 表格不带 Header（标题栏）             | 始终包含 TableHeader（Title + Copy）并吸顶                          |
| 表格每列等宽                       | 按内容权重分配列宽                                                  |
| 图片不带 Caption                 | 始终保留 Caption 节点                                            |
| 用户气泡四角统一圆角                   | 右上角 4px，其余 16px                                            |
| 在 Markdown 组件内硬编码 hex        | 尽量使用语义 token 名（特定场景下的精准还原除外）                               |
| 引用标记垂直不对齐                    | 配合 `relative; top:-1px` 和 `flex/align-items` 确保圆圈和文字视觉绝对居中 |
| 只维护 Skill 不维护 CSS            | 结构与 CSS 同步维护，避免规范失真                                        |
