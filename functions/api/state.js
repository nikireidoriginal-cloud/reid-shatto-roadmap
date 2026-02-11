// GET /api/state — load persisted milestone state
export async function onRequestGet(context) {
  const state = await context.env.ROADMAP_STATE.get("roadmap-state", "json");
  return new Response(JSON.stringify(state || {}), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// PUT /api/state — save milestone state
export async function onRequestPut(context) {
  const body = await context.request.json();
  await context.env.ROADMAP_STATE.put("roadmap-state", JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// OPTIONS /api/state — CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
