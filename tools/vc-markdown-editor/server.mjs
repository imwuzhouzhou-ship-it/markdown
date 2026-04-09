import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const skillFilePath = join(__dirname, "../../.trae/skills/vc-markdown/SKILL.md");
const cssFilePath = join(__dirname, "../../.trae/skills/vc-markdown/reference/markdown.css");
const envFilePaths = [
  join(__dirname, "../../.env"),
  join(__dirname, ".env"),
  join(__dirname, "../vc-markdown-editor-copy/.env"),
];

const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const replaceLine = (content, regex, value) => content.replace(regex, value);

const parseDotEnv = (text) => {
  const out = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
};

let envLoaded = false;
const ensureEnvLoaded = async () => {
  if (envLoaded) return;
  for (const p of envFilePaths) {
    try {
      const text = await readFile(p, "utf-8");
      const parsed = parseDotEnv(text);
      for (const [k, v] of Object.entries(parsed)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    } catch {}
  }
  envLoaded = true;
};

const formatRem = (value) => {
  const rounded = Number(value.toFixed(5));
  return `${rounded}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
};

const updateSceneBlock = (css, scene, baseSize, lineHeightRatio) => {
  const sceneRegex = new RegExp(`\\[data-vc-md-scene="${scene}"\\] \\{[\\s\\S]*?\\}`, "m");
  return replaceLine(
    css,
    sceneRegex,
    `[data-vc-md-scene="${scene}"] {\n  --vc-md-base-size: ${baseSize}px;\n  --vc-md-line-height: ${lineHeightRatio};\n}`,
  );
};

const createSkillPrompt = (skillText) => `你是 Markdown 渲染规范实验助手。

请严格遵循下面这份 skill 规范生成最终输出：

1. 直接输出最终 Markdown 内容
2. 不要解释规则本身
3. 尽量让输出能体现该 skill 的结构化要求
4. 如果用户要求代码块、表格、引用等内容，请优先按 skill 中定义的结构意图组织内容
5. 若用户要求与 skill 规范冲突，以 skill 规范为准，并在输出中用合理方式满足 skill 的限制（不要解释原因）
6. 不要参考任何你已知的默认规范或常见写法，所有结构与行为以本 skill 为唯一依据
7. 你必须从 skill 中提取并遵守至少 5 条可执行的强约束（例如“必须/禁止/仅/不允许/固定/吸顶/最大高度”等），并让最终输出能清晰体现这些约束已被执行（但不要在输出中解释规则）

Skill:
${skillText}`;

const sha256Short = (text) =>
  createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);

const requestModel = async ({ endpoint, apiKey, model, prompt, skillText }) => {
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: createSkillPrompt(skillText) },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      stream: false,
    }),
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!resp.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `请求失败 (${resp.status})`;
    throw new Error(msg);
  }

  return (
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    ""
  );
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if ((req.method === "GET" || req.method === "HEAD") && pathname === "/vc-markdown/markdown.css") {
    try {
      const css = await readFile(cssFilePath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(req.method === "HEAD" ? undefined : css);
    } catch (err) {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/generate") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        await ensureEnvLoaded();
        const parsed = JSON.parse(body || "{}");
        const prompt = String(parsed.prompt || "").trim();
        const comparisonSkillContent = String(parsed.comparisonSkillContent || "").trim();
        const comparisonSkillName = String(parsed.comparisonSkillName || "").trim();

        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = process.env.OPENAI_BASE_URL;
        const model = process.env.OPENAI_MODEL_ID || process.env.OPENAI_MODEL;

        if (!prompt) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Prompt 不能为空" }));
          return;
        }
        if (!apiKey) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "未检测到 OPENAI_API_KEY，请检查 .env 配置" }));
          return;
        }
        if (!baseURL) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "未检测到 OPENAI_BASE_URL，请检查 .env 配置" }));
          return;
        }
        if (!model) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "未检测到 OPENAI_MODEL_ID，请检查 .env 配置" }));
          return;
        }

        const normalizedBase = baseURL.replace(/\/+$/, "");
        const endpoint = `${normalizedBase}/chat/completions`;
        const currentSkillContent = await readFile(skillFilePath, "utf-8");
        const baselineResult = await requestModel({
          endpoint,
          apiKey,
          model,
          prompt,
          skillText: currentSkillContent,
        });

        let comparisonResult = "";
        if (comparisonSkillContent) {
          comparisonResult = await requestModel({
            endpoint,
            apiKey,
            model,
            prompt,
            skillText: comparisonSkillContent,
          });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          baselineResult,
          comparisonResult,
          baselineLabel: "当前 Skill",
          comparisonLabel: comparisonSkillName || "",
          baselineSkillInfo: {
            sha256: sha256Short(currentSkillContent),
            length: currentSkillContent.length,
          },
          comparisonSkillInfo: comparisonSkillContent
            ? {
                sha256: sha256Short(comparisonSkillContent),
                length: comparisonSkillContent.length,
              }
            : null,
        }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err?.message || "生成失败" }));
      }
    });
    return;
  }

  // API Endpoint: Save configuration to SKILL.md
  if (req.method === "POST" && pathname === "/api/save") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const config = JSON.parse(body);
        let skillContent = await readFile(skillFilePath, "utf-8");
        let cssContent = await readFile(cssFilePath, "utf-8");

        const scenarioRegex = /\| \*\*默认场景 \(Chat\)\*\* \| \*\*16px\*\* \| 1rem = 16px \| ([\d\.]+rem) \([\d\.]+px\) \|/;
        const newChatLine = `| **默认场景 (Chat)** | **16px** | 1rem = 16px | ${config.lineHeightRatio}rem (${(16 * config.lineHeightRatio).toFixed(1)}px) |`;
        skillContent = replaceLine(skillContent, scenarioRegex, newChatLine);

        const h1Regex = /\| h1 \| [\d\.]+px \| [\d\.]+px \| [\d\.]+ \/ [\d\.]+ \| [\d\.]+ \/ [\d\.]+ \| 600 \|/;
        const newH1 = `| h1 | ${(16 * config.h1Ratio).toFixed(1)}px | ${(16 * config.h1Ratio * config.hLineHeight).toFixed(1)}px | ${config.h1Ratio} / ${config.hLineHeight} | 1.03 / ${config.spacingRatio} | 600 |`;
        skillContent = replaceLine(skillContent, h1Regex, newH1);

        cssContent = replaceLine(cssContent, /--vc-md-base-size:\s*[^;]+;/, `--vc-md-base-size: ${config.baseSize}px;`);
        cssContent = replaceLine(cssContent, /--vc-md-line-height:\s*[^;]+;/, `--vc-md-line-height: ${config.lineHeightRatio};`);
        cssContent = replaceLine(cssContent, /--vc-md-text:\s*var\(--foreground,\s*[^)]+\);/, `--vc-md-text: var(--foreground, ${config.foreground});`);
        cssContent = replaceLine(cssContent, /--vc-md-muted:\s*var\(--muted-foreground,\s*[^)]+\);/, `--vc-md-muted: var(--muted-foreground, ${config.mutedForeground});`);
        cssContent = replaceLine(cssContent, /--vc-md-border:\s*var\(--border,\s*[^)]+\);/, `--vc-md-border: var(--border, ${config.borderColor});`);
        cssContent = replaceLine(cssContent, /--vc-md-surface-muted:\s*var\(--muted,\s*[^)]+\);/, `--vc-md-surface-muted: var(--muted, ${config.surfaceMuted});`);
        cssContent = replaceLine(cssContent, /--vc-md-primary:\s*var\(--primary,\s*[^)]+\);/, `--vc-md-primary: var(--primary, ${config.primaryColor});`);
        cssContent = replaceLine(cssContent, /--vc-md-p-space:\s*[^;]+;/, `--vc-md-p-space: ${formatRem(config.spacingRatio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h1-size:\s*[^;]+;/, `--vc-md-h1-size: ${formatRem(config.h1Ratio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h1-line:\s*[^;]+;/, `--vc-md-h1-line: ${config.hLineHeight};`);
        cssContent = replaceLine(cssContent, /--vc-md-h1-margin-top:\s*[^;]+;/, `--vc-md-h1-margin-top: ${formatRem(config.h1Ratio * 0.75)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h1-margin-bottom:\s*[^;]+;/, `--vc-md-h1-margin-bottom: ${formatRem(config.spacingRatio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h2-size:\s*[^;]+;/, `--vc-md-h2-size: ${formatRem(config.h2Ratio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h2-line:\s*[^;]+;/, `--vc-md-h2-line: ${config.hLineHeight};`);
        cssContent = replaceLine(cssContent, /--vc-md-h2-margin-top:\s*[^;]+;/, `--vc-md-h2-margin-top: ${formatRem(config.h2Ratio * 0.75)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h2-margin-bottom:\s*[^;]+;/, `--vc-md-h2-margin-bottom: ${formatRem(config.spacingRatio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h3-size:\s*[^;]+;/, `--vc-md-h3-size: ${formatRem(config.h3Ratio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h3-line:\s*[^;]+;/, `--vc-md-h3-line: ${config.hLineHeight};`);
        cssContent = replaceLine(cssContent, /--vc-md-h3-margin-top:\s*[^;]+;/, `--vc-md-h3-margin-top: ${formatRem(config.h3Ratio * 0.75)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h3-margin-bottom:\s*[^;]+;/, `--vc-md-h3-margin-bottom: ${formatRem(config.spacingRatio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h4-size:\s*[^;]+;/, `--vc-md-h4-size: ${formatRem(config.h46Ratio)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h4-line:\s*[^;]+;/, `--vc-md-h4-line: ${config.hLineHeight};`);
        cssContent = replaceLine(cssContent, /--vc-md-h4-margin-top:\s*[^;]+;/, `--vc-md-h4-margin-top: ${formatRem(config.h46Ratio * 0.75)}rem;`);
        cssContent = replaceLine(cssContent, /--vc-md-h4-margin-bottom:\s*[^;]+;/, `--vc-md-h4-margin-bottom: ${formatRem(config.spacingRatio)}rem;`);
        cssContent = updateSceneBlock(cssContent, config.scenario, config.baseSize, config.lineHeightRatio);

        await writeFile(skillFilePath, skillContent, "utf-8");
        await writeFile(cssFilePath, cssContent, "utf-8");
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          files: {
            skill: skillFilePath,
            css: cssFilePath,
          },
        }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
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
  console.log(`VC-Markdown Editor running at http://${host}:${port}`);
});
