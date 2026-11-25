// 25.11 — חיפוש גיפים לשיחות הצוות. המפתח של GIPHY נשמר ב-Netlify (GIPHY_KEY), לא בקוד.
// מחזיר רק מזהים של גיפים בדירוג "מתאים לכולם". כשנגמרת המכסה השעתית — { limit: true }.
const J = (o) => new Response(JSON.stringify(o), { headers: {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
} });

export default async (request) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 50);
  if (!q) return J({ ids: [] });
  const ref = request.headers.get("referer") || "";
  try { if (ref && new URL(ref).host !== url.host) return J({ error: "not allowed" }); } catch (e) { return J({ error: "not allowed" }); }
  const key = (Netlify.env.get("GIPHY_KEY") || "").replace(/\s+/g, "");
  if (!key) return J({ error: "no key" });
  const he = /[֐-׿]/.test(q);
  const api = "https://api.giphy.com/v1/gifs/search?api_key=" + encodeURIComponent(key) + "&q=" + encodeURIComponent(q) +
    "&limit=24&rating=g" + (he ? "&lang=he" : "&lang=en");
  let r;
  try { r = await fetch(api); } catch (e) { return J({ error: "net" }); }
  if (r.status === 429) return J({ limit: true });
  if (!r.ok) return J({ error: "giphy " + r.status });
  const x = await r.json();
  const ids = (x.data || []).map((g) => g.id).filter((id) => /^[A-Za-z0-9]{4,40}$/.test(id));
  return J({ ids });
};

export const config = { path: "/api/gif" };
