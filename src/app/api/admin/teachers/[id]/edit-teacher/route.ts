// app/api/admin/teachers/[id]/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

// Vérifie que l'appelant est connecté et administrateur.
// Retourne une NextResponse d'erreur à renvoyer directement si ce n'est pas
// le cas, ou null si tout est en ordre.
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
  const { id: teacherId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  let body: { nom_complet?: string; email?: string; telephone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_complet, email, telephone } = body;

  if (!nom_complet || nom_complet.trim().length < 2) {
    return NextResponse.json(
      { error: "Le nom complet doit contenir au moins 2 caractères." },
      { status: 400 },
    );
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("enseignant")
    .update({
      nom_complet: nom_complet.trim(),
      email: email.trim(),
      ...(telephone ? { telephone } : {}),
    })
    .eq("id", teacherId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour enseignant:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Enseignant introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, teacher: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: teacherId } = await params;

  const authError = await requireAdmin();
  if (authError) return authError;

  // Appeler le RPC de suppression (bloque si des cours sont encore liés)
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
