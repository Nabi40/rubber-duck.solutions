// Server-only: proxy to Django remove-bg API
const getBackendBase = () =>
  process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

export async function POST(request) {
  const backendBase = getBackendBase();
  const backendUrl = `${backendBase}/api/remove-bg/`;
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
      const mediaBase = `${backendBase}/media/`;
      if (data.url && typeof data.url === "string" && data.url.startsWith(mediaBase)) {
        const path = data.url.slice(mediaBase.length);
        data.url = `${requestOrigin}/api/media/${path}`;
      }
      if (data.results && Array.isArray(data.results)) {
        data.results = data.results.map((r) => {
          if (r.url && typeof r.url === "string" && r.url.startsWith(mediaBase)) {
            const path = r.url.slice(mediaBase.length);
            r.url = `${requestOrigin}/api/media/${path}`;
          }
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
