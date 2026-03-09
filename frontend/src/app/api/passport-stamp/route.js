// Server-only: never exposed to the client
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
  const backendUrl = `${backendBase}/api/passport-stamp/`;

  try {
    const contentType = request.headers.get("content-type") || "";
    let backendOpts = { method: "POST" };
    if (contentType.includes("application/json")) {
      const json = await request.json();
      backendOpts.headers = { "Content-Type": "application/json" };
      backendOpts.body = JSON.stringify(json);
    } else {
      backendOpts.body = await request.formData();
    }
    const res = await fetch(backendUrl, backendOpts);

    const resContentType = res.headers.get("content-type") || "";
    const body = await res.text();

    if (!res.ok) {
      return new Response(body, {
        status: res.status,
        statusText: res.statusText,
        headers: { "content-type": resContentType },
      });
    }

    // Rewrite sheet_url so the client never sees the backend origin
    if (resContentType.includes("application/json")) {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return new Response(body, {
          status: res.status,
          headers: { "content-type": resContentType },
        });
      }
      data.sheet_url = toPublicMediaUrl(data.sheet_url);
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(body, {
      status: res.status,
      headers: { "content-type": resContentType },
    });
  } catch (e) {
    console.error("[api/passport-stamp] proxy error:", e);
    return new Response(
      JSON.stringify({
        error: "Backend unavailable",
        detail: String(e?.message || e),
        hint: "Is Django running on port 8000? Set BACKEND_URL in .env.local if it runs elsewhere.",
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
