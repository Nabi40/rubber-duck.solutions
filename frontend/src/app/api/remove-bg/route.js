// Server-only: proxy to Django remove-bg API
const getBackendBase = () =>
  process.env.BACKEND_URL?.replace(/\/$/, "") || "https://backend.rubber-duck.solutions";

const getPublicBase = () =>
  (process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API ||
    process.env.BACKEND_URL ||
    "https://backend.rubber-duck.solutions").replace(/\/$/, "");

const toPublicMediaUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    const marker = "/media/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return rawUrl;
    const mediaPath = parsed.pathname.slice(idx + marker.length);
    if (!mediaPath) return rawUrl;
    const publicBase = getPublicBase();
    const suffix = `${mediaPath}${parsed.search || ""}`;
    return `${publicBase}/api/media/${suffix}`;
  } catch {
    return rawUrl;
  }
};

export async function POST(request) {
  const backendBase = getBackendBase();
  const backendUrl = `${backendBase}/api/remove-bg/`;

  try {
    const formData = await request.formData();
    const res = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type") || "";
    const body = await res.text();

    if (!res.ok) {
      return new Response(body, {
        status: res.status,
        statusText: res.statusText,
        headers: { "content-type": contentType },
      });
    }

    // Rewrite image url to same-origin so client can fetch without CORS
    if (contentType.includes("application/json")) {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return new Response(body, {
          status: res.status,
          headers: { "content-type": contentType },
        });
      }
      data.url = toPublicMediaUrl(data.url);
      if (data.results && Array.isArray(data.results)) {
        data.results = data.results.map((r) => {
          r.url = toPublicMediaUrl(r.url);
          return r;
        });
      }
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(body, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (e) {
    console.error("[api/remove-bg] proxy error:", e);
    return new Response(
      JSON.stringify({ error: "Backend unavailable", detail: String(e.message) }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
