// app/api/admin/filieres/[id]/route.ts
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
  const { id: filiereId } = await params;

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
    .update({ nom_filiere: nom_filiere.trim(), niveau: niveau.trim() })
    .eq("id", filiereId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour filière:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Filière introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, filiere: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: filiereId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  const serviceClient = createSupabaseServiceRoleClient();

  // Bloquer la suppression si des enseignements référencent encore cette
  // filière (même logique protectrice que pour enseignant/enseignement).
  const { count, error: countError } = await serviceClient
    .from("enseignement")
    .select("id", { count: "exact", head: true })
    .eq("filiere_id", filiereId);

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
        error: `Impossible de supprimer: ${count} enseignement(s) sont encore associés à cette filière.`,
      },
      { status: 409 },
    );
  }

  const { error, count: deletedCount } = await serviceClient
    .from("filiere")
    .delete({ count: "exact" })
    .eq("id", filiereId);

  if (error) {
    console.error("Erreur suppression filière:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deletedCount) {
    return NextResponse.json(
      { error: "Filière introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
