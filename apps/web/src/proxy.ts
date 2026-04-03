import { type NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";

const guestOnlyRoutes = ["/login", "/register"];
const protectedRoutes = ["/account", "/admin"];
const publicRoutes = ["/", "/forgot-password", "/email-verification"];

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isGuestOnlyRoute = matchesRoute(pathname, guestOnlyRoutes);
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isPublicRoute = matchesRoute(pathname, publicRoutes);

  if (!isGuestOnlyRoute && !isProtectedRoute && isPublicRoute) {
    return NextResponse.next();
  }

  if (!isGuestOnlyRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const session = await getAuthSession({ headers: request.headers });

  if (pathname.startsWith("/admin") && session?.user?.role !== "admin") {
    return NextResponse.rewrite(new URL("/_not-found", request.url));
  }

  if (session?.user && isGuestOnlyRoute) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if (!session?.user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
