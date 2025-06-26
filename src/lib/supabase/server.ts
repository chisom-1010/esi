// lib/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // On n'importe plus ReadonlyRequestCookies explicitement
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

// ✅ Pour Server Components, Server Actions, Route Handlers
//    Version modifiée pour traiter cookies() comme si elle était asynchrone
//    ET SANS utiliser le type ReadonlyRequestCookies explicitement
export async function createSupabaseServerClient() {
  // Si TypeScript pense que cookies() retourne une Promesse, nous devons l'await ici.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          // Après 'await cookies()', cookieStoreFromHeaders devrait être la valeur résolue.
          // Si elle a une méthode .get(), cela devrait fonctionner.
          // Pour plus de sûreté, on ré-appelle 'await cookies()' ici aussi,
          // car le typage semble très instable dans votre environnement.
          const store = await cookies();
          return store.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            const store = await cookies();
            // Si 'store' a une méthode .set() à l'exécution (dans Server Actions/Route Handlers),
            // cela fonctionnera. Si TS se plaint encore, un cast `(store as any).set` pourrait être nécessaire.
            store.set(name, value, options);
          } catch (error) {
            console.warn(`Échec de la définition du cookie '${name}' :`, error);
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            const store = await cookies();
            store.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.warn(
              `Échec de la suppression du cookie '${name}' :`,
              error,
            );
          }
        },
      },
    },
  );
}

// ✅ Server Components (read-only) - Inchangé, ne dépend pas de ReadonlyRequestCookies
export default function createSupabaseReadOnlyClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    },
  );
}

// ✅ Service Role Client (admin) - Inchangé
export function createSupabaseServiceRoleClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
