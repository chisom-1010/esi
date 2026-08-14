// app/api/admin/set-user-role/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

const ALLOWED_ROLES = ["admin", "data_entry_personnel", "etudiant"];

export async function POST(request: Request) {
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

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403 },
    );
  }

  let body: { targetUserId?: string; newRole?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { targetUserId, newRole } = body;

  if (!targetUserId || !newRole || !ALLOWED_ROLES.includes(newRole)) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 },
    );
  }

  // Empêcher un admin de se rétrograder lui-même par erreur (risque de se
  // retrouver bloqué hors des pages admin au milieu de l'opération).
  if (targetUserId === user.id && newRole !== "admin") {
    return NextResponse.json(
      { error: "Vous ne pouvez pas modifier votre propre rôle." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour du rôle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, profile: data });
}
