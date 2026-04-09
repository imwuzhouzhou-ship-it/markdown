***

name: "agentdesign-typography"
description: "提供经典的排版原则和代码实现指导（包含垂直节奏、模块化比例、字体选择、加载优化等）。当用户需要进行前端排版设计、设定全局样式或遇到排版错位问题时调用。"
------------------------------------------------------------------------------------------

# AgentDesign Typography Guidelines

这个 Skill 旨在指导用户产出符合经典排版原则、美观且可读性高的页面排版。

## 1. 经典排版原则

### 垂直节奏

- 你的 `line-height` 应该是所有垂直间距的基础单位。
- **示例**：如果正文字体为 16px，`line-height: 1.5`（即 24px），那么页面上所有的垂直间距（margin、padding）都应该是 24px 的倍数。这会在潜意识中创造一种和谐感——文字和空间共享同一个数学基础。

### 模块化比例与层级

- **常见错误**：使用过多且尺寸相近的字号（如 14px, 15px, 16px, 18px...），这会导致层级混乱。
- **最佳实践**：使用较少的字号，拉大对比度。推荐使用 **5级字号系统** 配合固定的比例（如 1.25, 1.333, 1.5）。

| 角色 (Role) | 典型比例 (Ratio) | 使用场景 (Use Case) |
| --------- | ------------ | --------------- |
| xs        | 0.75rem      | 图注、免责声明         |
| sm        | 0.875rem     | 次要 UI、元数据       |
| base      | 1rem         | 正文              |
| lg        | 1.25-1.5rem  | 副标题、引导文字        |
| xl+       | 2-4rem       | 主标题、Hero 文本     |

### 可读性与行长

- 使用 `ch` 单位控制字符行长（建议 `max-width: 65ch`）。
- **反比例缩放**：行高与行长成反比。窄列需要更紧凑的行高，宽列需要更大的行高。
- **暗黑模式补偿**：暗色背景上的浅色文字视觉上显得更细，需要更多呼吸空间。请在暗黑模式下将正常的 `line-height` 增加 `0.05 - 0.1`。

## 2. 字体选择与配对

- **避免滥用的默认字体**：不要过度依赖 Inter, Roboto, Open Sans, Lato, Montserrat。它们会让设计显得平庸。
  - 替代 Inter：Instrument Sans, Plus Jakarta Sans, Outfit
  - 替代 Roboto：Onest, Figtree, Urbanist
  - 替代 Open Sans：Source Sans 3, Nunito Sans, DM Sans
  - 编辑/高级感：Fraunces, Newsreader, Lora
- **系统字体**：`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` 加载快、可读性高，在性能优先于个性的 App 中是极佳的选择。
- **配对原则**：
  - 很多时候你**不需要**第二种字体。单一字体家族的不同字重通常比两种竞争的字体更能建立清晰的层级。
  - 如果必须配对，要在多个维度上形成对比：衬线 + 无衬线（结构对比）、几何 + 人文（性格对比）、压缩展示 + 宽大正文（比例对比）。
  - **切忌**：搭配两种相似但不完全相同的字体（如两种几何无衬线字体）。

## 3. Web 字体加载优化

防止布局偏移（Layout Shift）和内容跳动（FOUT/FOIT）：

```css
/* 1. 使用 font-display: swap 确保文本可见 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}

/* 2. 匹配 fallback 指标以最小化偏移 (可使用 Fontaine 工具自动计算) */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 105%;        
  ascent-override: 90%;     
  descent-override: 20%;    
  line-gap-override: 10%;   
}

body {
  font-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;
}
```

## 4. 现代 Web 排版技巧

### 流式排版 (Fluid Type) vs 固定比例 (Fixed Scale)

- **流式排版 (`clamp`)**：适用于营销页或内容页的主标题和展示文本，使其随视口平滑缩放。使用中间值（如 `5vw + 1rem`）控制缩放率，并添加 rem 偏移防止在小屏幕上塌陷至 0。
- **固定比例 (`rem`)**：适用于 App UI、仪表盘和数据密集型界面。不建议在产品 UI 中使用流式排版，因为容器布局需要空间可预测性。正文也应保持固定比例。

### OpenType 特性

利用这些特性提升细节质感：

```css
/* 数据表对齐（等宽数字） */
.data-table { font-variant-numeric: tabular-nums; }

/* 正确的斜杠分数 */
.recipe-amount { font-variant-numeric: diagonal-fractions; }

/* 缩写使用小型大写字母 */
abbr { font-variant-caps: all-small-caps; }

/* 在代码中禁用连字 */
code { font-variant-ligatures: none; }

/* 显式启用字距调整（Kerning） */
body { font-kerning: normal; }
```

## 5. 排版系统架构与无障碍

- **语义化 Token**：命名 Token 时应基于语义（如 `--text-body`, `--text-heading`），而不是具体数值（如 `--font-size-16`）。Token 系统应包含字体栈、尺寸比例、字重、行高和字间距。
- **无障碍（A11y）**：切勿禁用缩放（`user-scalable=no` 会破坏无障碍体验）。如果布局在 200% 缩放时崩溃，请修复布局而不是禁用缩放。

