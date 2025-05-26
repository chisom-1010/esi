// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // Nécessite Next.js App Router
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

// Client pour les Server Components, Server Actions, et Route Handlers
export async function createSupabaseServerClient() {
  // Récupère l'objet cookies. Si l'erreur 'Promise' persiste,
  // C'est ICI que le problème se situe (contexte d'appel incorrect).
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Vérifie si cookieStore est une Promise, ce qui n'est pas supporté ici.
          if (cookieStore instanceof Promise) {
            throw new Error(
              "cookieStore is a Promise. Did you forget to use 'await' when calling cookies()?",
            );
          }
          // S'il est ReadonlyRequestCookies, ceci devrait fonctionner.
          return (
            cookieStore as {
              get: (name: string) => { value: string } | undefined;
            }
          ).get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Tente de définir le cookie.
            // On utilise 'as any' pour contourner le typage 'Readonly'
            // car dans les contextes d'écriture (Server Actions, Route Handlers),
            // l'objet cookies() *permet* .set().
            (cookieStore as any).set({ name, value, ...options });
          } catch (error) {
            // L'erreur se produit typiquement si on essaie d'écrire depuis un Server Component.
            // Peut être ignoré si le middleware gère le rafraîchissement de session.
            console.warn(
              `Failed to set cookie '${name}' (likely in a Server Component context):`,
              error,
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Tente de supprimer le cookie (en le définissant comme vide).
            // On utilise 'as any' pour la même raison que .set().
            (cookieStore as any).set({ name, value: "", ...options });
          } catch (error) {
            // L'erreur se produit typiquement si on essaie d'écrire depuis un Server Component.
            console.warn(
              `Failed to remove cookie '${name}' (likely in a Server Component context):`,
              error,
            );
          }
        },
      },
    },
  );
}

// Client Supabase avec la clé de SERVICE (inchangé)
export function createSupabaseServiceRoleClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé de service !
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
