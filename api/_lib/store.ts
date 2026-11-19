export interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  hit(key: string, windowSeconds: number): Promise<number>;
  push(key: string, value: string, keep: number): Promise<void>;
  range(key: string, count: number): Promise<string[]>;
  remove(key: string, value: string): Promise<void>;
}

type Command = (string | number)[];

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function redisStore(url: string, token: string): Store {
  const call = async (path: string, body: unknown) => {
    const response = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`redis ${response.status}`);
    return response.json();
  };
  const run = async <T>(command: Command): Promise<T> => ((await call("", command)) as { result: T }).result;
  const pipeline = async (commands: Command[]) => (await call("/pipeline", commands)) as { result: unknown }[];

  return {
    get: (key) => run<string | null>(["GET", key]),
    async set(key, value, ttlSeconds) {
      await run(ttlSeconds ? ["SET", key, value, "EX", ttlSeconds] : ["SET", key, value]);
    },
    async del(key) {
      await run(["DEL", key]);
    },
    async hit(key, windowSeconds) {
      const [count] = await pipeline([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds, "NX"]
      ]);
      return Number(count.result);
    },
    async push(key, value, keep) {
      await pipeline([
        ["LPUSH", key, value],
        ["LTRIM", key, 0, keep - 1]
      ]);
    },
    range: (key, count) => run<string[]>(["LRANGE", key, 0, count - 1]),
    async remove(key, value) {
      await run(["LREM", key, 0, value]);
    }
  };
}

interface MemoryState {
  values: Map<string, { value: string; expires: number }>;
  lists: Map<string, string[]>;
}

function memoryStore(): Store {
  const global = globalThis as { __uplinkMemory?: MemoryState };
  const state = (global.__uplinkMemory ??= { values: new Map(), lists: new Map() });
  const read = (key: string) => {
    const entry = state.values.get(key);
    if (entry && entry.expires < Date.now()) state.values.delete(key);
    return state.values.get(key)?.value ?? null;
  };
  const list = (key: string): string[] => state.lists.get(key) ?? [];

  return {
    get: async (key) => read(key),
    async set(key, value, ttlSeconds) {
      state.values.set(key, { value, expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity });
    },
    async del(key) {
      state.values.delete(key);
    },
    async hit(key, windowSeconds) {
      const count = Number(read(key) ?? 0) + 1;
      const expires = state.values.get(key)?.expires ?? Date.now() + windowSeconds * 1000;
      state.values.set(key, { value: String(count), expires });
      return count;
    },
    async push(key, value, keep) {
      state.lists.set(key, [value, ...list(key)].slice(0, keep));
    },
    range: async (key, count) => list(key).slice(0, count),
    async remove(key, value) {
      state.lists.set(
        key,
        list(key).filter((item) => item !== value)
      );
    }
  };
}

export function getStore(): Store | null {
  const config = redisConfig();
  if (config) return redisStore(config.url, config.token);
  return process.env.VERCEL ? null : memoryStore();
}
