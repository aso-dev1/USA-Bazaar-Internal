import { serialize } from "cookie";

const COOKIE_NAME = "ubz_auth";
const TTL_SECONDS = 60 * 60 * 48; // 48 hours
const PASSWORD = process.env.PASSWORD ?? "akh";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const raw = await readRawBody(req);
  const params = new URLSearchParams(raw || "");
  const password = String(params.get("password") || "");
  const redirect = decodeURIComponent(String(params.get("redirect") || "/"));

  if (password !== PASSWORD) {
    return res.status(401).send(`<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Auth Failed</title></head>
<body style="font-family:system-ui;padding:20px;background:#0f1724;color:#e6eef8">
  <div style="max-width:480px;margin:0 auto">
    <h1 style="margin:0 0 8px 0">Incorrect password</h1>
    <p><a href="${redirect}" style="color:#a5b4fc;text-decoration:underline">Try again</a></p>
  </div>
</body></html>`);
  }

  const expires = new Date(Date.now() + TTL_SECONDS * 1000);
  const cookie = serialize(COOKIE_NAME, String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
    expires,
  });

  res.setHeader("Set-Cookie", cookie);
  res.writeHead(303, { Location: redirect || "/" });
  res.end();
}

export const config = { api: { bodyParser: false } };
