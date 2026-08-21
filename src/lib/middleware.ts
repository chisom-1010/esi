// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Créer une réponse de base qui sera mise à jour
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Créer un client Supabase spécifique au contexte du middleware
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

  // 3. Rafraîchir la session de l'utilisateur. C'est la partie principale du code que vous avez posté.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. PROTÉGER LES ROUTES - C'est la logique de ma suggestion précédente, ajoutée ici.
  // Définir les chemins que vous voulez protéger
  const protectedRoutes = ["/admin-dashboard", "/data-entry/enter-evaluation"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Si l'utilisateur n'est pas connecté ET qu'il essaie d'accéder à une page protégée...
  if (!user && isProtectedRoute) {
    // ...on le redirige vers la page de connexion correcte.
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 4bis. Forcer le changement de mot de passe si l'admin/personnel a
  // réinitialisé le compte (mot de passe par défaut connu de plusieurs
  // personnes tant qu'il n'a pas été changé).
  const isChangePasswordRoute =
    request.nextUrl.pathname.startsWith("/change-password");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (user && !isChangePasswordRoute && !isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }
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
