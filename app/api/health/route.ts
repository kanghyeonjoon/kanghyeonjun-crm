import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return Response.json(
      { status: "degraded", database: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
          }),
      },
    });
    const { data, error } = await client.rpc("crm_health");
    const ok = !error && data === "crm_v1";
    return Response.json(
      {
        status: ok ? "ok" : "degraded",
        database: ok ? "connected" : "unavailable",
      },
      { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "degraded", database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
