import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const rootDir = dirname(fileURLToPath(import.meta.url));
const skillFilePath = join(rootDir, "../../.trae/skills/vc-markdown/SKILL.md");
const cssFilePath = join(
  rootDir,
  "../../.trae/skills/vc-markdown/reference/markdown.css",
);
const envFilePaths = [
  join(rootDir, "../../.env"),
  join(rootDir, ".env"),
  join(rootDir, "../vc-markdown-editor-copy/.env"),
];
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

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
      (value.startsWith('"') && value.endsWith('"')) ||
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
      data?.error?.message || data?.message || `请求失败 (${resp.status})`;
    throw new Error(msg);
  }

  return (
    data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ""
  );
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = requestUrl.pathname;

  if ((request.method === "GET" || request.method === "HEAD") && pathname === "/vc-markdown/markdown.css") {
    try {
      const css = await readFile(cssFilePath, "utf-8");
      response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : css);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
    return;
  }

  if (request.method === "POST" && pathname === "/api/generate") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", async () => {
      try {
        await ensureEnvLoaded();
        const parsed = JSON.parse(body || "{}");
        const prompt = String(parsed.prompt || "").trim();

        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = process.env.OPENAI_BASE_URL;
        const model = process.env.OPENAI_MODEL_ID || process.env.OPENAI_MODEL;

        if (!prompt) {
          response.writeHead(400, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "Prompt 不能为空" }));
          return;
        }
        if (!apiKey) {
          response.writeHead(500, { "content-type": "application/json" });
          response.end(
            JSON.stringify({ error: "未检测到 OPENAI_API_KEY，请检查 .env 配置" }),
          );
          return;
        }
        if (!baseURL) {
          response.writeHead(500, { "content-type": "application/json" });
          response.end(
            JSON.stringify({ error: "未检测到 OPENAI_BASE_URL，请检查 .env 配置" }),
          );
          return;
        }
        if (!model) {
          response.writeHead(500, { "content-type": "application/json" });
          response.end(
            JSON.stringify({ error: "未检测到 OPENAI_MODEL_ID，请检查 .env 配置" }),
          );
          return;
        }

        const normalizedBase = baseURL.replace(/\/+$/, "");
        const endpoint = `${normalizedBase}/chat/completions`;
        const skillText = await readFile(skillFilePath, "utf-8");
        const content = await requestModel({
          endpoint,
          apiKey,
          model,
          prompt,
          skillText,
        });

        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            content,
            skillInfo: {
              sha256: sha256Short(skillText),
              length: skillText.length,
            },
            model,
          }),
        );
      } catch (err) {
        response.writeHead(500, { "content-type": "application/json" });
        response.end(
          JSON.stringify({ error: err?.message || "生成失败" }),
        );
      }
    });
    return;
  }

  try {
    // IMPORTANT: path.join treats a leading "/" segment as absolute and drops rootDir.
    const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const absolutePath = normalize(join(rootDir, safePath));

    if (!absolutePath.startsWith(rootDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const file = await readFile(absolutePath);
    const type = contentTypes[extname(absolutePath)] || "application/octet-stream";
    response.writeHead(200, { "content-type": type });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`VC-Markdown Agent Page running at http://${host}:${port}`);
});
