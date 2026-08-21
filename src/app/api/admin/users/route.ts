// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getDefaultResetPassword } from "@/lib/admin-default-password";

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

  let body: { nom_complet?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_complet, email } = body;

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
  const defaultPassword = getDefaultResetPassword("admin");

  // Pas de "filiere_id" dans les métadonnées : le trigger
  // enforce_student_email_domain_trigger ne s'applique donc pas ici, un
  // admin peut être créé avec n'importe quelle adresse email.
  const { data: created, error: createError } =
    await serviceClient.auth.admin.createUser({
      email: email.trim(),
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { nom_complet: nom_complet.trim() },
    });

  if (createError || !created.user) {
    console.error("Erreur création admin:", createError);
    return NextResponse.json(
      { error: createError?.message || "Échec de la création du compte." },
      { status: 500 },
    );
  }

  // Le trigger handle_new_user() a créé la ligne "profiles" avec
  // role='etudiant' par défaut ; on la corrige explicitement en 'admin'.
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({ role: "admin", nom_complet: nom_complet.trim(), must_change_password: true })
    .eq("id", created.user.id);

  if (profileError) {
    console.error(
      "Compte créé mais échec de la mise à jour du rôle:",
      profileError,
    );
    return NextResponse.json(
      { error: `Compte créé mais rôle non assigné: ${profileError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: { id: created.user.id, email, nom_complet },
      defaultPassword,
    },
    { status: 201 },
  );
}
