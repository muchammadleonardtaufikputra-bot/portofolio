// link-stats — penghitung kunjungan + log anonim untuk linktree Leon.
// ---------------------------------------------------------------------------
// CARA DEPLOY (Cloudflare dashboard, ~5 menit):
// 1. Buka dash.cloudflare.com -> Workers & Pages -> Create -> Create Worker
//    -> beri nama "leon-links-stats" -> Deploy.
// 2. Edit code: hapus isi worker, paste seluruh file ini -> Deploy.
// 3. Buat KV: Storage & Databases -> KV -> Create namespace "LINK_STATS".
// 4. Bind KV ke worker: buka worker -> Settings -> Variables -> Add binding
//    -> Variable name: LINK_STATS, KV namespace: LINK_STATS -> Deploy.
// 5. Tambah password: Settings -> Variables -> Add variable (secret):
//    STATS_PASSWORD = password yang kamu pilih untuk melihat statistik.
// 6. Kirim URL worker (https://leon-links-stats.<subdomain>.workers.dev)
//    ke Muse, biar dipasang ke halaman linktree + stats.
// ---------------------------------------------------------------------------
// PRIVASI: IP pengunjung tidak pernah disimpan. Yang disimpan hanya hash
// IP + tanggal (untuk menghitung pengunjung unik harian), negara/kota
// kasar dari Cloudflare, perangkat, browser, dan sumber kunjungan.
// Nama pengunjung tidak bisa diketahui — mereka tidak login ke halaman ini.

const MAX_LOG = 200; // simpan 200 kunjungan terakhir
const DEDUPE_TTL = 600; // 10 menit: refresh dalam jangka ini tidak dihitung lagi

const dayStr = (d) => d.toISOString().slice(0, 10);

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseUA(ua) {
  ua = ua || "";
  let device = "Desktop";
  if (/iPad/i.test(ua)) device = "iPad";
  else if (/iPhone|iPod/i.test(ua)) device = "iPhone";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Mobile|Phone/i.test(ua)) device = "HP";
  let browser = "Lainnya";
  if (/Instagram/i.test(ua)) browser = "Instagram";
  else if (/WhatsApp/i.test(ua)) browser = "WhatsApp";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";
  return { device, browser };
}

function sourceFrom(ref) {
  if (!ref) return "Langsung";
  try {
    const h = new URL(ref).hostname.toLowerCase();
    if (h.includes("instagram.com")) return "Instagram";
    if (h.includes("facebook.com")) return "Facebook";
    if (h.includes("tiktok.com")) return "TikTok";
    if (h.includes("google.")) return "Google";
    if (h.includes("github.io") || h.includes("github.com")) return "GitHub";
    return h;
  } catch {
    return "Langsung";
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

async function pushLog(env, entry) {
  const log = JSON.parse((await env.LINK_STATS.get("log")) || "[]");
  log.unshift(entry);
  await env.LINK_STATS.put("log", JSON.stringify(log.slice(0, MAX_LOG)));
}

async function handleTrack(req, env) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const link =
    typeof body.link === "string" && body.link ? body.link.slice(0, 40) : null;

  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const hash = (await sha256Hex(ip + "|" + dayStr(new Date()))).slice(0, 16);
  const cf = req.cf || {};
  const ua = req.headers.get("User-Agent") || "";
  const { device, browser } = parseUA(ua);
  const source = sourceFrom(req.headers.get("Referer") || "");
  const entry = {
    t: Date.now(),
    country: cf.country || "-",
    city: cf.city || "-",
    device,
    browser,
    source,
    link,
  };

  if (link) {
    // Klik link keluar: hitung per link + catat di log (tidak menambah total kunjungan).
    const key = "click:" + link.replace(/[^a-z0-9-]/gi, "").toLowerCase();
    const cur = parseInt((await env.LINK_STATS.get(key)) || "0", 10) || 0;
    await env.LINK_STATS.put(key, String(cur + 1));
    await pushLog(env, entry);
    return json({ ok: true, counted: false });
  }

  // Kunjungan halaman: abaikan kalau hash yang sama sudah tercatat < 10 menit.
  const seenKey = "seen:" + hash;
  if (await env.LINK_STATS.get(seenKey)) return json({ ok: true, counted: false });
  await env.LINK_STATS.put(seenKey, "1", { expirationTtl: DEDUPE_TTL });

  const total = (parseInt((await env.LINK_STATS.get("total")) || "0", 10) || 0) + 1;
  await env.LINK_STATS.put("total", String(total));

  const dk = "d:" + dayStr(new Date());
  const day = JSON.parse((await env.LINK_STATS.get(dk)) || '{"views":0,"uniques":[]}');
  day.views += 1;
  if (!day.uniques.includes(hash)) day.uniques.push(hash);
  await env.LINK_STATS.put(dk, JSON.stringify(day), { expirationTtl: 60 * 60 * 24 * 40 });

  await pushLog(env, entry);
  return json({ ok: true, counted: true, total });
}

async function handleCount(env) {
  const total = parseInt((await env.LINK_STATS.get("total")) || "0", 10) || 0;
  return json({ total });
}

async function handleStats(req, env) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!env.STATS_PASSWORD || key !== env.STATS_PASSWORD) {
    return json({ error: "unauthorized" }, 401);
  }
  const total = parseInt((await env.LINK_STATS.get("total")) || "0", 10) || 0;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const v = JSON.parse(
      (await env.LINK_STATS.get("d:" + dayStr(d))) || '{"views":0,"uniques":[]}'
    );
    days.push({ date: dayStr(d), views: v.views, uniques: v.uniques.length });
  }
  const log = JSON.parse((await env.LINK_STATS.get("log")) || "[]");
  const clicks = {};
  const list = await env.LINK_STATS.list({ prefix: "click:" });
  for (const item of list.keys) {
    clicks[item.name.slice(6)] =
      parseInt((await env.LINK_STATS.get(item.name)) || "0", 10) || 0;
  }
  return json({ total, days, clicks, recent: log.slice(0, 50) });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
    if (url.pathname === "/track" && req.method === "POST") return handleTrack(req, env);
    if (url.pathname === "/count") return handleCount(env);
    if (url.pathname === "/stats") return handleStats(req, env);
    return json({
      ok: true,
      service: "leon-links-stats",
      endpoints: ["POST /track", "GET /count", "GET /stats?key=..."],
    });
  },
};
