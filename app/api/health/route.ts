export function GET() {
  return Response.json({ status: "ok", application: "kanghyeonjun-crm", stage: "foundation", database: "not_connected" }, { headers: { "Cache-Control": "no-store" } });
}
