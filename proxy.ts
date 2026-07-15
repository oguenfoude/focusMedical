import { getAuthUser } from "@/lib/auth/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/secretary") || pathname.startsWith("/doctor");

  if (!isProtected) return NextResponse.next({ request: { headers: request.headers } });

  const authUser = await getAuthUser();

  if (!authUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/secretary") && authUser.role !== "secretary") {
    return NextResponse.redirect(new URL("/doctor", request.url));
  }

  if (pathname.startsWith("/doctor") && authUser.role !== "doctor") {
    return NextResponse.redirect(new URL("/secretary", request.url));
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
