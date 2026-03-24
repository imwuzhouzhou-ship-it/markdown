---
name: "typography-design"
description: "应用排版原则（垂直节奏、模块化字阶、可读性）。当用户需要设计 UI、调整字号、优化排版或创建排版系统时调用。"
---

# Typography Design Skill

这个 Skill 专注于网页和应用的排版设计，基于经典排版原则和现代 Web 标准。

## 核心原则 (Core Principles)

### 1. 垂直节奏 (Vertical Rhythm)
- 使用 **line-height** 作为所有垂直间距的基准单位。
- 所有间距（margin, padding, gap）应为 line-height 的倍数或分数，以建立潜意识的和谐感。

### 2. 模块化字阶 (Modular Scale & Hierarchy)
- **避免使用过多接近的字号**。使用清晰的 5 级字阶系统：
  - **xs (0.75rem / 12px)**: 说明文字、法律条文、元数据。
  - **sm (0.875rem / 14px)**: 次要 UI、侧边栏菜单。
  - **base (1rem / 16px)**: 主体正文、输入框文字。
  - **lg (1.25-1.5rem / 20-24px)**: 副标题、引导文字。
  - **xl+ (2-4rem / 32px+)**: 大标题、Hero 文本。
- 比例建议：1.25 (Major Third) 或 1.333 (Perfect Fourth)。

### 3. 可读性与度量 (Readability & Measure)
- **行长限制**：正文建议使用 `max-width: 65ch`，防止行过长导致阅读疲劳。
- **反转对比**：深底浅字时， perceived weight 会变轻，需增加 0.05-0.1 的 line-height 以提供更多呼吸空间。

## 字体选择与配对 (Selection & Pairing)

- **避免默认字体**：如 Inter, Roboto, Arial。推荐：Instrument Sans, Plus Jakarta Sans, Outfit。
- **单字体原则**：通常不需要第二种字体。通过多种字重 (Weight) 即可建立清晰层级。
- **对比原则**：如需配对，确保在多个维度上有对比（衬线体 + 无衬线体、几何体 + 人文体）。

## 现代 Web 排版技术

### 1. 响应式排版 (Fluid Type)
- 使用 `clamp()` 实现平滑缩放。
- **App UI**：使用固定 `rem` 字阶，确保空间预测性。
- **营销页**：标题可使用流式字体，正文建议保持固定。

### 2. OpenType 特性
- 数据对齐：`font-variant-numeric: tabular-nums;`
- 分数显示：`font-variant-numeric: diagonal-fractions;`
- 缩写：`font-variant-caps: all-small-caps;`

## 禁用清单 (Avoid)
- 严禁禁用缩放 (`user-scalable=no`)。
- 严禁对正文使用 `px` 单位，必须使用 `rem/em`。
- 正文字号严禁小于 `16px`。
- 严禁在同一项目使用超过 2-3 种字体。
- 严禁对正文使用装饰性强的字体。
