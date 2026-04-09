import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import 'dotenv/config';

// Initialize OpenAI client
// Note: In a real app, never hardcode API keys. Use environment variables (e.g. process.env.OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key", // Replace with your actual key or set env var
  baseURL: process.env.OPENAI_BASE_URL // Optional: for custom endpoints
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

const port = Number(process.env.PORT || 4174);
const host = "127.0.0.1";

  const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API Endpoint: Generate content
  if (req.method === "POST" && pathname === "/api/generate") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const { prompt } = JSON.parse(body);
        
        let generatedMarkdown = "";

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-dummy-key") {
          // Call actual LLM API
          // 适配火山引擎等自定义端点时，可能需要使用具体的模型端点 ID
          const modelId = process.env.OPENAI_MODEL_ID || "ep-20250218155909-fsw9f"; // Default to a valid deepseek or doubao model endpoint if available
          
          const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: modelId,
          });
          generatedMarkdown = completion.choices[0].message.content;
        } else {
          // Mock fallback if no API key is provided
          await new Promise(resolve => setTimeout(resolve, 1500));
          generatedMarkdown = `
# 针对你的问题：${prompt}

这是一段**AI生成**的实时响应内容（由于未检测到有效的 API Key，当前使用模拟数据）。

## 列表展示

以下是一些常见的设计原则：
1. **对比 (Contrast)**：确保前景与背景有足够的对比度。
2. **重复 (Repetition)**：保持设计元素的统一性。
3. **对齐 (Alignment)**：让页面元素有明确的视觉引导。
4. **亲密性 (Proximity)**：将相关的元素组织在一起。

## 代码示例

下面是一个简单的 React 组件，展示了如何使用 Hooks：

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

export default Counter;
\`\`\`

> 提示：在实际开发中，保持组件的单一职责非常重要。

## 表格展示

这里是一个简单的属性说明表：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`size\` | \`string\` | \`'md'\` | 组件的尺寸大小 |
| \`disabled\` | \`boolean\` | \`false\` | 是否禁用交互 |

如需了解更多，请参考 [设计规范文档](#)。
          `.trim();
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result: generatedMarkdown }));
      } catch (err) {
        console.error("API Error:", err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message || "Failed to generate content" }));
      }
    });
    return;
  }

  // Static File Serving
  try {
    const safePath = pathname === "/" ? "/index.html" : pathname;
    const absolutePath = normalize(join(rootDir, safePath));

    if (!absolutePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const file = await readFile(absolutePath);
    const type = contentTypes[extname(absolutePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`VC-Markdown Style Guide running at http://${host}:${port}`);
});
