import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  const host = request.nextUrl.hostname;
  const path = request.nextUrl.pathname;
  if (host === "crm.mongpd.com" && path === "/") return NextResponse.redirect(new URL("/workspace",request.url));
  if ((host === "mongpd.com" || host === "www.mongpd.com") && /^\/(workspace|login|pending)(\/|$)/.test(path)) {
    const dest=new URL(request.url); dest.hostname="crm.mongpd.com";dest.port="";dest.protocol="https:";
    return NextResponse.redirect(dest);
  }
  if (!/^\/(workspace|login|pending)(\/|$)/.test(path)) return NextResponse.next();
  let response = NextResponse.next({ request });
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return response;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/", "/workspace/:path*", "/login", "/pending"] };
