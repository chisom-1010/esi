// app/api/admin/students/[id]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { requireStaff } from "../route";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;

  const auth = await requireStaff();
  if ("error" in auth) return auth.error;

  const serviceClient = createSupabaseServiceRoleClient();

  // On vérifie que le compte ciblé est bien un étudiant, pour éviter
  // qu'une route pensée pour "Gestion des Étudiants" (accessible au
  // personnel de saisie) ne serve à supprimer un compte admin.
  const { data: targetProfile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", studentId)
    .single();

  if (!targetProfile) {
    return NextResponse.json(
      { error: "Étudiant introuvable." },
      { status: 404 },
    );
  }
  if (targetProfile.role !== "etudiant") {
    return NextResponse.json(
      { error: "Ce compte n'est pas un compte étudiant." },
      { status: 400 },
    );
  }

  // Supprime le compte d'authentification (source de vérité) ; la ligne
  // "profiles" est supprimée par cascade (ON DELETE CASCADE vers auth.users).
  const { error: authError } =
    await serviceClient.auth.admin.deleteUser(studentId);

  if (authError) {
    console.error("Erreur suppression étudiant (auth):", authError);
    const status = authError.message?.toLowerCase().includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ error: authError.message }, { status });
  }

  return NextResponse.json({ success: true });
}
