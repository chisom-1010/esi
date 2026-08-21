// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetUserId } = await params;

    // 1. Vérifier que l'appelant est connecté et administrateur
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

    // 2. Empêcher un admin de se supprimer lui-même (risque de se retrouver
    // sans aucun compte admin restant, ou déconnecté au milieu de l'opération)
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceRoleClient();

    // 3. Supprimer le compte d'authentification (source de vérité). Ceci
    // supprime généralement la ligne "profiles" liée par cascade, mais on
    // nettoie explicitement ensuite au cas où la cascade ne serait pas
    // configurée sur ce projet.
    const { error: authError } =
      await serviceClient.auth.admin.deleteUser(targetUserId);

    if (authError) {
      console.error("Erreur suppression utilisateur (auth):", authError);
      const status = authError.message?.toLowerCase().includes("not found")
        ? 404
        : 500;
      return NextResponse.json({ error: authError.message }, { status });
    }

    const { error: profileError } = await serviceClient
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileError) {
      // L'utilisateur n'existe déjà plus côté auth à ce stade ; on log
      // l'erreur mais on ne fait pas échouer la requête pour ça.
      console.error(
        "Erreur nettoyage profil après suppression auth:",
        profileError,
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Filet de sécurité : garantit une réponse JSON même en cas d'exception
    // non prévue (sinon Next.js renvoie une page HTML générique, qui casse
    // le `response.json()` côté client avec "Unexpected token '<'").
    console.error("Erreur inattendue DELETE /api/admin/users/[id]:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne inattendue." },
      { status: 500 },
    );
  }
}
