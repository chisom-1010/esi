// app/api/admin/annees-academiques/[id]/route.ts
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: anneeId } = await params;

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
    .update({ nom_annee: nom_annee.trim(), date_debut, date_fin })
    .eq("id", anneeId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour année académique:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Année académique introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, anneeAcademique: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: anneeId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  const serviceClient = createSupabaseServiceRoleClient();

  const { count, error: countError } = await serviceClient
    .from("enseignement")
    .select("id", { count: "exact", head: true })
    .eq("annee_academique_id", anneeId);

  if (countError) {
    console.error(
      "Erreur lors de la vérification des enseignements liés:",
      countError,
    );
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `Impossible de supprimer: ${count} enseignement(s) sont encore associés à cette année académique.`,
      },
      { status: 409 },
    );
  }

  const { error, count: deletedCount } = await serviceClient
    .from("anneeacademique")
    .delete({ count: "exact" })
    .eq("id", anneeId);

  if (error) {
    console.error("Erreur suppression année académique:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deletedCount) {
    return NextResponse.json(
      { error: "Année académique introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
