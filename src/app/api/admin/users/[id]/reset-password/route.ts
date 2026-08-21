// app/api/admin/users/[id]/reset-password/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getDefaultResetPassword } from "@/lib/admin-default-password";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetUserId } = await params;

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

    const serviceClient = createSupabaseServiceRoleClient();

    // Le mot de passe par défaut dépend du rôle de l'utilisateur ciblé
    // (admin/personnel de saisie vs étudiant), pas de l'admin qui effectue
    // la réinitialisation.
    const { data: targetProfile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const defaultPassword = getDefaultResetPassword(targetProfile.role);

    const { error } = await serviceClient.auth.admin.updateUserById(
      targetUserId,
      { password: defaultPassword },
    );

    if (error) {
      console.error("Erreur réinitialisation mot de passe:", error);
      const status = error.message?.toLowerCase().includes("not found")
        ? 404
        : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", targetUserId);

    if (profileError) {
      // Le mot de passe est déjà réinitialisé à ce stade ; on log seulement,
      // pas d'échec bloquant pour ne pas laisser l'admin sans mot de passe
      // communicable.
      console.error(
        "Mot de passe réinitialisé mais flag must_change_password non posé:",
        profileError,
      );
    }

    return NextResponse.json({ success: true, defaultPassword });
  } catch (err: any) {
    console.error(
      "Erreur inattendue POST /api/admin/users/[id]/reset-password:",
      err,
    );
    return NextResponse.json(
      { error: err?.message || "Erreur interne inattendue." },
      { status: 500 },
    );
  }
}
