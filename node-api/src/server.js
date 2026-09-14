import http from "node:http";

import pg from "pg";

// blitz.cloud sends visitors to the port the image declares with EXPOSE.
// 8080 works without root, which matters because apps never run as root there.
const port = Number(process.env.PORT ?? 8080);

// When you attach a database on blitz.cloud, DATABASE_URL is filled in for
// you. Without one the API still runs, it just has nowhere to keep notes.
const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  : null;

async function migrate() {
  if (!pool) return;
  await pool.query(`
    create table if not exists notes (
      id serial primary key,
      text text not null,
      created_at timestamptz not null default now()
    )
  `);
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 64_000) throw new Error("body too large");
  }
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, { hello: "from blitz.cloud", database: pool ? "connected" : "none" });
    }
    if (req.method === "GET" && url.pathname === "/healthz") {
      if (pool) await pool.query("select 1");
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/notes") {
      if (!pool) return send(res, 503, { error: "no database attached, set DATABASE_URL" });
      if (req.method === "GET") {
        const { rows } = await pool.query("select id, text, created_at from notes order by id desc limit 50");
        return send(res, 200, rows);
      }
      if (req.method === "POST") {
        const { text } = await readJson(req);
        if (typeof text !== "string" || !text.trim()) return send(res, 400, { error: "text is required" });
        const { rows } = await pool.query("insert into notes (text) values ($1) returning id, text, created_at", [text]);
        return send(res, 201, rows[0]);
      }
    }
    send(res, 404, { error: "not found" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: "something went wrong" });
  }
});

await migrate();
server.listen(port, () => console.log(`listening on :${port}`));

// Kubernetes stops a container with SIGTERM. Finish open requests, then exit.
process.on("SIGTERM", () => {
  server.close(async () => {
    await pool?.end();
    process.exit(0);
  });
});
