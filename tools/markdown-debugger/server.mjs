import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url, `http://${request.headers.host}`).pathname;
    const safePath = requestPath === "/" ? "/index.html" : requestPath;
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
  console.log(`Markdown Style Lab running at http://${host}:${port}`);
});
