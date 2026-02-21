// Server-only: never exposed to the client
const getBackendBase = () =>
  process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

export async function POST(request) {
  const backendBase = getBackendBase();
  const backendUrl = `${backendBase}/api/passport-stamp/`;
  const requestOrigin = new URL(request.url).origin;

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

    // Rewrite sheet_url so the client never sees the backend origin
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
      headers: { "content-type": contentType },
    });
  } catch (e) {
    console.error("[api/passport-stamp] proxy error:", e);
    return new Response(
      JSON.stringify({ error: "Backend unavailable", detail: String(e.message) }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
