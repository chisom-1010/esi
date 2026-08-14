// app/api/admin/enseignements/[id]/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

// Vérifie que l'appelant est connecté et administrateur.
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: enseignementId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  let body: {
    enseignant_id?: string;
    matiere_id?: string;
    filiere_id?: string;
    annee_academique_id?: string;
    volume_horaire_prevu?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const {
    enseignant_id,
    matiere_id,
    filiere_id,
    annee_academique_id,
    volume_horaire_prevu,
  } = body;

  for (const [key, value] of Object.entries({
    enseignant_id,
    matiere_id,
    filiere_id,
    annee_academique_id,
  })) {
    if (!value || !UUID_RE.test(value)) {
      return NextResponse.json(
        { error: `Champ invalide: ${key}.` },
        { status: 400 },
      );
    }
  }

  if (
    typeof volume_horaire_prevu !== "number" ||
    volume_horaire_prevu < 1 ||
    volume_horaire_prevu > 1000
  ) {
    return NextResponse.json(
      { error: "Le volume horaire doit être compris entre 1 et 1000." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("enseignement")
    .update({
      enseignant_id,
      matiere_id,
      filiere_id,
      annee_academique_id,
      volume_horaire_prevu,
    })
    .eq("id", enseignementId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour enseignement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Enseignement introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, enseignement: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: enseignementId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  const serviceClient = createSupabaseServiceRoleClient();

  // On bloque la suppression si des fiches d'évaluation existent déjà pour
  // cet enseignement, pour ne pas perdre silencieusement des données
  // d'évaluation soumises par les étudiants.
  const { count, error: countError } = await serviceClient
    .from("ficheevaluationetudiant")
    .select("id", { count: "exact", head: true })
    .eq("enseignement_id", enseignementId);

  if (countError) {
    console.error(
      "Erreur lors de la vérification des évaluations liées:",
      countError,
    );
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `Impossible de supprimer: ${count} évaluation(s) sont déjà associées à cet enseignement.`,
      },
      { status: 409 },
    );
  }

  const { error, count: deletedCount } = await serviceClient
    .from("enseignement")
    .delete({ count: "exact" })
    .eq("id", enseignementId);

  if (error) {
    console.error("Erreur suppression enseignement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deletedCount) {
    return NextResponse.json(
      { error: "Enseignement introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
