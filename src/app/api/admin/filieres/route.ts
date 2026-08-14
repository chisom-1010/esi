// app/api/admin/filieres/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403 },
    );
  }

  return null;
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: { nom_filiere?: string; niveau?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_filiere, niveau } = body;

  if (!nom_filiere || nom_filiere.trim().length < 2) {
    return NextResponse.json(
      { error: "Le nom de la filière doit contenir au moins 2 caractères." },
      { status: 400 },
    );
  }
  if (!niveau || niveau.trim().length < 1) {
    return NextResponse.json(
      { error: "Le niveau est requis." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("filiere")
    .insert([{ nom_filiere: nom_filiere.trim(), niveau: niveau.trim() }])
    .select()
    .single();

  if (error) {
    console.error("Erreur création filière:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, filiere: data }, { status: 201 });
}
