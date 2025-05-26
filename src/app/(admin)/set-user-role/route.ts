// app/api/admin/set-user-role/route.ts
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // <<== On n'importe PAS ReadonlyRequestCookies ici
import { createClient } from "@supabase/supabase-js";

// Client Supabase Service Role (inchangé)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function POST(request: Request) {
  const cookieStore = cookies();

  // 1. Créer UN client Supabase (contexte utilisateur) CORRECTEMENT configuré
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Utiliser 'as any' pour contourner le typage et l'erreur 'Promise' / 'cannot find name'
          // Ceci suppose que cookieStore a bien une méthode .get() à l'exécution.
          return (cookieStore as any).get(name)?.value; // <<== LIGNE MODIFIÉE ICI
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value, ...options });
          } catch (error) {
            /* Ignorer */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value: "", ...options });
          } catch (error) {
            /* Ignorer */
          }
        },
      },
    },
  );

  // --- LE RESTE DE VOTRE CODE EST INCHANGÉ ---
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // ... (suite de votre logique) ...
  } catch (err: any) {
    console.error("Erreur API set-user-role:", err);
    const errorMessage = err.message || "Une erreur interne est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
