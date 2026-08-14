// app/api/admin/annees-academiques/route.ts
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

  let body: { nom_annee?: string; date_debut?: string; date_fin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_annee, date_debut, date_fin } = body;

  if (!nom_annee || nom_annee.trim().length < 4) {
    return NextResponse.json(
      { error: "Le nom de l'année académique est invalide." },
      { status: 400 },
    );
  }
  if (!date_debut || !date_fin) {
    return NextResponse.json(
      { error: "Les dates de début et de fin sont requises." },
      { status: 400 },
    );
  }
  if (new Date(date_fin) <= new Date(date_debut)) {
    return NextResponse.json(
      { error: "La date de fin doit être postérieure à la date de début." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("anneeacademique")
    .insert([{ nom_annee: nom_annee.trim(), date_debut, date_fin }])
    .select()
    .single();

  if (error) {
    console.error("Erreur création année académique:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, anneeAcademique: data },
    { status: 201 },
  );
}
