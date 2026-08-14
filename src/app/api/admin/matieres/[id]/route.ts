// app/api/admin/matieres/[id]/route.ts
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
  const { id: matiereId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  let body: { nom_matiere?: string; code_matiere?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_matiere, code_matiere } = body;

  if (!nom_matiere || nom_matiere.trim().length < 2) {
    return NextResponse.json(
      { error: "Le nom de la matière doit contenir au moins 2 caractères." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("matiere")
    .update({
      nom_matiere: nom_matiere.trim(),
      code_matiere: code_matiere ? code_matiere.trim() : null,
    })
    .eq("id", matiereId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour matière:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Matière introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, matiere: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: matiereId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  const serviceClient = createSupabaseServiceRoleClient();

  const { count, error: countError } = await serviceClient
    .from("enseignement")
    .select("id", { count: "exact", head: true })
    .eq("matiere_id", matiereId);

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
        error: `Impossible de supprimer: ${count} enseignement(s) sont encore associés à cette matière.`,
      },
      { status: 409 },
    );
  }

  const { error, count: deletedCount } = await serviceClient
    .from("matiere")
    .delete({ count: "exact" })
    .eq("id", matiereId);

  if (error) {
    console.error("Erreur suppression matière:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deletedCount) {
    return NextResponse.json(
      { error: "Matière introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
