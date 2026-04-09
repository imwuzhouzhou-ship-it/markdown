---
name: "typography-design"
description: "给定 base 字号，推导完整排版系统（字阶、行高、间距 token、中文补偿）。当用户需要建立排版规范、调整字号层级、生成 CSS 变量或优化界面排版时调用。"
---

# Typography Design Skill

给定一个 base 字号，本 Skill 负责推导出完整自洽的排版系统：字阶、行高、间距 token、中文补偿。

base 由调用方决定，不由 Skill 判断。参考选值：

| base | 适用场景 | 备注 |
| :--- | :--- | :--- |
| 16px | 内容阅读（博客、官网、文档） | 拿不准时默认选这个 |
| 14px | 任务操作（管理后台、表单、仪表盘） | |
| 12px | 密集工具（IDE、交易终端、监控大屏） | 仅面向专业用户 |

## 一、从 base 推导全套参数

### 1. 字阶（比例 r）

| base | 推荐比例 r |
| :--- | :--- |
| 16px | 1.333 |
| 14px | 1.25 |
| 12px | 1.2 |

各级字号 = base × r^n，取整到最近偶数 px：

| 层级 | 倍数 | 16px | 14px | 12px |
| :--- | :--- | :--- | :--- | :--- |
| 大标题 | ×2.0+ | 32px+ | 28px+ | 24px+ |
| H1 | ×1.375 | 22px | 20px | 17px |
| H2 | ×1.25 | 20px | 18px | 15px |
| H3 | ×1.125 | 18px | 16px | 14px |
| H4 / body | ×1.0 | 16px | 14px | 12px |
| 次要文字 | ×0.875 | 14px | 12px | 11px |
| 辅助标注 | ×0.75 | 12px | 11px | 10px |

*H4–body 同字号，靠字重区分层级（H4 用 600，body 用 400/500）。*

### 2. 行高

body line-height = base × 1.5 + 2px（取整）
heading line-height = base × 1.5

| base | body 行高 | heading 行高 |
| :--- | :--- | :--- |
| 16px | 26px | 24px |
| 14px | 23px | 21px |
| 12px | 20px | 18px |

**中文内容**：body line-height 在上述基础上额外 +0.15，即 16px→1.8、14px→1.75、12px→1.75。

### 3. 间距基准单位 1u

1u = base × 0.5（取最近 2 的幂次）

| base | 1u |
| :--- | :--- |
| 16px | 8px |
| 14px | 8px |
| 12px | 4px |

**间距倍数用途**：

| 倍数 | 16/14px 值 | 12px 值 | 用途 |
| :--- | :--- | :--- | :--- |
| 0.5u | 4px | 2px | 图标间距、badge 内边距 |
| 1u | 8px | 4px | 最小块间距、inline 元素间距 |
| 1.5u | 12px | 6px | input 内边距、小卡片内边距 |
| 2u | 16px | 8px | 段落间距、同组标准间距 |
| 3u | 24px | 12px | card padding、表单组间距 |
| 4u | 32px | 16px | 区块间距 |
| 6u | 48px | 24px | 章节分隔 |
| 8u | 64px | 32px | 页面顶部留白、Hero 间距 |

**原则**：同组内用 1u–2u，组间用 3u–4u，章节间用 6u–8u。

## 二、CSS 变量模板

调用时将 BASE、LH_BODY、LH_HEAD、U 替换为对应数值，直接输出可用代码：

```css
:root {
  /* 根字号 */
  font-size: calc(BASE / 16 * 100%);   /* 例：14px → 87.5% */

  /* 字阶 */
  --text-xs:   0.75rem;    /* 辅助标注 */
  --text-sm:   0.875rem;   /* 次要文字 */
  --text-base: 1rem;       /* body / H4 */
  --text-h3:   1.125rem;
  --text-h2:   1.25rem;
  --text-h1:   1.375rem;

  /* 行高 */
  --lh-body:    LH_BODY;   /* body line-height 比值 */
  --lh-heading: LH_HEAD;   /* heading line-height 比值 */

  /* 字重 */
  --fw-normal:  400;
  --fw-medium:  500;
  --fw-bold:    600;

  /* 间距 token（基准 1u = Upx） */
  --space-1:   calc(U * 0.5px);   /* 0.5u */
  --space-2:   calc(U * 1px);     /* 1u */
  --space-3:   calc(U * 1.5px);   /* 1.5u */
  --space-4:   calc(U * 2px);     /* 2u */
  --space-6:   calc(U * 3px);     /* 3u */
  --space-8:   calc(U * 4px);     /* 4u */
  --space-12:  calc(U * 6px);     /* 6u */
  --space-16:  calc(U * 8px);     /* 8u */
}
```

**组件间距速查（直接用 token 名）**：

| 场景 | token |
| :--- | :--- |
| Button padding 水平 / 垂直 | --space-4 / --space-2 |
| Input 内边距 | --space-3 |
| Form label → input 间距 | --space-1 |
| Form 组间距 | --space-6 |
| Card / Modal 内边距 | --space-6 / --space-8 |
| 列表行上下 padding | --space-2 |
| 页面左右内边距 | --space-8 ~ --space-12 |

## 三、字体

- **西文**：Plus Jakarta Sans、Instrument Sans、Outfit（避免 Inter / Roboto / Arial）。通常一种字体够用，靠字重建立层级。
- **中文系统字体栈**：
  ```css
  font-family: "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  ```
- **中英混排**：将英文字体放在中文字体前，自动优先匹配：
  ```css
  font-family: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", sans-serif;
  ```

## 四、可读性要点

- **行长**：西文正文 `max-width: 65ch`；中文正文 `max-width: 32em`（em ≈ 一个汉字宽度）
- **深色背景**：line-height 额外 +0.05~0.1，字色避免纯白，用 `rgba(255,255,255,0.87)`
- **数据对齐**：表格数字列加 `font-variant-numeric: tabular-nums`
- **响应式标题**：用 `clamp()` 缩放，正文保持固定 rem

## 五、禁止项

- 禁止 `user-scalable=no`
- 正文单位必须用 `rem/em`，禁止 `px`
- 同一项目字体不超过 2 种
- base 12px 仅用于专业工具界面，禁止用于面向普通用户的内容页
