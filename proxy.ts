// NOTE: proxy.ts creates its own inline Supabase client because the proxy layer
// runs before the request context is fully available. It also calls getAuthUser()
// which creates a second Supabase client internally — this is a known inefficiency.
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase unreachable — allow through for unprotected routes, redirect for protected
  }
  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/secretary") || pathname.startsWith("/doctor");

  if (!isProtected) return response;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const authUser = await getAuthUser();

  if (!authUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "no_clinic");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/secretary") && authUser.role !== "secretary") {
    return NextResponse.redirect(new URL("/doctor", request.url));
  }

  if (pathname.startsWith("/doctor") && authUser.role !== "doctor") {
    return NextResponse.redirect(new URL("/secretary", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
