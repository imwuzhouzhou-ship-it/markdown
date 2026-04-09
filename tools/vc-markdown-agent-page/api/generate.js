const { createHash } = require("node:crypto");

const skillText = `# Markdown 渲染组件规范

你是 Markdown 渲染规范实验助手。

输出要求：
- 只输出最终 Markdown 内容
- 不解释规则本身
- 保持结构化、可扫描
- 如果用户要求代码块、表格、引用等内容，优先用结构化形式组织

必须遵守的约束：
- 标题、正文、列表、引用之间保持清晰层级
- fenced code block 最终内容必须带语言标识
- 代码块内容要适合被转换为“Header + Actions + 行号 + 内容区”的结构
- 表格要有清晰列头，便于被转换为带标题栏和吸顶表头的结构
- 引用块要用于强调关键结论
- 列表尽量短句化、可扫描
- 不输出与需求无关的解释性文本`;

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }

  return JSON.parse(raw || "{}");
}

function createSkillPrompt(text) {
  return `你是 Markdown 渲染规范实验助手。

请严格遵循下面这份 skill 规范生成最终输出：

1. 直接输出最终 Markdown 内容
2. 不要解释规则本身
3. 尽量让输出能体现该 skill 的结构化要求
4. 如果用户要求代码块、表格、引用等内容，请优先按 skill 中定义的结构意图组织内容
5. 若用户要求与 skill 规范冲突，以 skill 规范为准，并在输出中用合理方式满足 skill 的限制
6. 所有结构与行为以本 skill 为唯一依据
7. 你必须从 skill 中提取并遵守至少 5 条可执行的强约束，并让最终输出能清晰体现这些约束已被执行

Skill:
${text}`;
}

function truncateText(text, maxLen) {
  const s = String(text ?? "");
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}...(truncated)`;
}

async function requestModel({ endpoint, apiKey, model, prompt }) {
  let response;
  try {
    response = await fetch(endpoint, {
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
  } catch (err) {
    // Vercel logs sometimes don't show; return a structured error for debugging via Network response.
    const e = new Error("上游接口请求失败（fetch failed）");
    e.kind = "FETCH_FAILED";
    e.detail = {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      cause: err?.cause ? String(err.cause) : undefined,
    };
    throw e;
  }

  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const message =
      (data && data.error && data.error.message) ||
      (data && data.message) ||
      `上游接口返回错误 (${response.status})`;
    const e = new Error(message);
    e.kind = "UPSTREAM_NOT_OK";
    e.detail = {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      bodySnippet: truncateText(rawText, 1200),
    };
    throw e;
  }

  return data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body?.prompt || "").trim();
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL_ID || process.env.OPENAI_MODEL;

    if (!prompt) {
      json(res, 400, { error: "Prompt 不能为空" });
      return;
    }

    if (!apiKey) {
      json(res, 500, { error: "未检测到 OPENAI_API_KEY，请检查 Vercel 环境变量" });
      return;
    }

    if (!baseURL) {
      json(res, 500, { error: "未检测到 OPENAI_BASE_URL，请检查 Vercel 环境变量" });
      return;
    }

    if (!model) {
      json(res, 500, { error: "未检测到 OPENAI_MODEL_ID，请检查 Vercel 环境变量" });
      return;
    }

    const endpoint = `${String(baseURL).replace(/\/+$/, "")}/chat/completions`;
    const content = await requestModel({
      endpoint,
      apiKey,
      model,
      prompt,
    });

    json(res, 200, {
      content,
      model,
      skillInfo: {
        sha256: createHash("sha256").update(skillText, "utf8").digest("hex").slice(0, 12),
        length: skillText.length,
      },
    });
  } catch (error) {
    json(res, 500, {
      error: error?.message || "生成失败",
      kind: error?.kind,
      detail: error?.detail,
    });
  }
};
