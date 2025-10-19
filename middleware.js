import { NextResponse } from "next/server";

const COOKIE_NAME = "ubz_auth";
const TTL_MS = 1000 * 60 * 60 * 48; // 48 hours
const LOGIN_PATH = "/api/login";

function isBypassed(url) {
  const { pathname } = url;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.startsWith("/vercel.svg")
  )
    return true;
  return false;
}

export function middleware(req) {
  const url = new URL(req.url);
  if (isBypassed(url)) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const now = Date.now();

  if (cookie) {
    const lastOk = Number(cookie);
    if (!Number.isNaN(lastOk) && now - lastOk < TTL_MS) {
      return NextResponse.next();
    }
  }

  const redirectUrl = encodeURIComponent(url.pathname + url.search);
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Protected</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;background:#0f1724;
       font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#e6eef8}
  .card{width:100%;max-width:360px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));
        border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.35);padding:20px}
  h1{margin:0 0 6px 0;font-size:18px;font-weight:800}
  p{margin:0 0 12px 0;color:#9aa4b2;font-size:13px}
  input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);color:#e6eef8;font-size:14px;outline:none}
  .row{display:flex;gap:10px;align-items:center;margin-top:12px}
  button{flex:1;padding:10px 12px;border-radius:10px;border:0;cursor:pointer;font-weight:800;color:white;
         background:linear-gradient(90deg,#4f46e5,#06b6d4);box-shadow:0 6px 18px rgba(79,70,229,.25)}
  .muted{border:1px solid rgba(255,255,255,.12);background:transparent;color:#9aa4b2}
</style></head>
<body>
  <form class="card" method="post" action="${LOGIN_PATH}">
    <h1>Enter Password</h1>
    <p>Access required. You’ll be asked again every 2 days.</p>
    <input type="password" name="password" placeholder="Password" autofocus />
    <input type="hidden" name="redirect" value="${redirectUrl}" />
    <div class="row">
      <button type="submit">Unlock</button>
      <button type="button" class="muted" onclick="document.querySelector('input[name=password]').value=''">Cancel</button>
      <p>for password ask <a href="https://www.instagram.com/i4m_4so/" style="color: gold; font-size: large;">Aso Karzan</a></p>
    </div>
  </form>
</body></html>`;

  return new NextResponse(html, {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const config = { matcher: ["/((?!_next).*)"] };
