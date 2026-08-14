// app/api/admin/teachers/[id]/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: teacherId } = await params;

  // 1. Vérifier que l'utilisateur est connecté et est administrateur
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

  // 2. Appeler le RPC de suppression (bloque si des cours sont encore liés)
  const serviceClient = createSupabaseServiceRoleClient();
  const { error } = await serviceClient.rpc("delete_teacher", {
    p_enseignant_id: teacherId,
  });

  if (error) {
    console.error("Erreur RPC delete_teacher:", error);
    // Le RPC lève une exception métier lisible (ex: cours encore associés,
    // enseignant introuvable) -> on la renvoie telle quelle au client.
    const status = error.message?.includes("introuvable") ? 404 : 409;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ success: true });
}
