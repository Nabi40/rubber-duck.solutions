// Server-only: never exposed to the client
const getBackendBase = () =>
  process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

export async function POST(request) {
  const backendBase = getBackendBase();
  const backendUrl = `${backendBase}/api/passport-stamp/`;
  const requestOrigin = new URL(request.url).origin;

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
      if (data.sheet_url && typeof data.sheet_url === "string") {
        const mediaBase = `${backendBase}/media/`;
        if (data.sheet_url.startsWith(mediaBase)) {
          const path = data.sheet_url.slice(mediaBase.length);
          data.sheet_url = `${requestOrigin}/api/media/${path}`;
        }
      }
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
