// src/proxy.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // 1. Créer une réponse de base qui sera mise à jour
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Créer un client Supabase spécifique au contexte du proxy
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

  // 3. Rafraîchir la session de l'utilisateur.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. PROTÉGER LES ROUTES
  const protectedRoutes = ["/admin-dashboard", "/data-entry/enter-evaluation"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 4bis. Forcer le changement de mot de passe si l'admin/personnel a
  // réinitialisé le compte (mot de passe par défaut connu de plusieurs
  // personnes tant qu'il n'a pas été changé).
  const isChangePasswordRoute = request.nextUrl.pathname.startsWith(
    "/auth/change-password",
  );
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (user && !isChangePasswordRoute && !isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(
        new URL("/auth/change-password", request.url),
      );
    }
  }

  // 5. Si tout va bien, on retourne la réponse.
  return response;
}

// Configuration pour spécifier sur quels chemins le proxy doit s'exécuter.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
