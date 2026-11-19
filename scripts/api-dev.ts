import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin, type ViteDevServer } from "vite";

type Handler = (request: Request) => Response | Promise<Response>;

const FUNCTION_NAME = /^[a-z][a-z0-9-]*$/;

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

function toHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers))
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  return headers;
}

async function handle(server: ViteDevServer, req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (!url.pathname.startsWith("/api/")) return next();

  const name = url.pathname.slice("/api/".length).replace(/\/$/, "");
  if (!FUNCTION_NAME.test(name)) return next();

  let module: Record<string, unknown>;
  try {
    module = await server.ssrLoadModule(`/api/${name}.ts`);
  } catch (error) {
    if (String(error).includes("Failed to load url")) {
      res.statusCode = 404;
      return res.end("not found");
    }
    throw error;
  }

  const method = (req.method ?? "GET").toUpperCase();
  const handler = module[method] as Handler | undefined;
  if (typeof handler !== "function") {
    res.statusCode = 405;
    return res.end("method not allowed");
  }

  const body = method === "GET" || method === "HEAD" ? undefined : await readBody(req);
  const response = await handler(new Request(url, { method, headers: toHeaders(req), body }));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function apiDevPlugin(): Plugin {
  return {
    name: "api-dev",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value;

      server.middlewares.use((req, res, next) => {
        handle(server, req, res, next).catch((error) => {
          server.config.logger.error(`[api] ${req.url}: ${error instanceof Error ? error.stack : error}`);
          if (!res.headersSent) res.statusCode = 500;
          res.end("internal error");
        });
      });
    }
  };
}
