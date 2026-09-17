// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[MW]", request.nextUrl.pathname, "user:", user?.id ?? "aucun");

  const protectedRoutes = ["/admin-dashboard", "/data-entry/enter-evaluation"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const isChangePasswordRoute = request.nextUrl.pathname.startsWith(
    "/auth/change-password",
  );

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (user && !isChangePasswordRoute && !isAuthRoute) {
    console.log("[MW] TEST forcing redirect on", request.nextUrl.pathname);
    return NextResponse.redirect(new URL("/auth/change-password", request.url));
  }
  // 5. Si tout va bien, on retourne la réponse (avec les cookies potentiellement mis à jour).
  return response;
}

// Configuration pour spécifier sur quels chemins le middleware doit s'exécuter.
export const config = {
  matcher: [
    /*
     * Fait correspondre tous les chemins de requête sauf ceux qui commencent par :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (fichier favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
