// app/api/admin/students/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getDefaultResetPassword } from "@/lib/admin-default-password";

const ESGIS_EMAIL_REGEX = /^[a-z]+(\.[a-z]+)+@esgis\.org$/i;

// Autorisé pour un admin OU le personnel de saisie (Directeur Pédagogique),
// contrairement aux autres routes /api/admin/* réservées aux seuls admins.
export async function requireStaff(): Promise<
  { error: NextResponse } | { userId: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      ),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "data_entry_personnel") {
    return {
      error: NextResponse.json(
        {
          error:
            "Accès réservé aux administrateurs et au personnel de saisie.",
        },
        { status: 403 },
      ),
    };
  }

  return { userId: user.id };
}

export async function POST(request: Request) {
  const auth = await requireStaff();
  if ("error" in auth) return auth.error;

  let body: {
    nom_complet?: string;
    email?: string;
    filiere_id?: string;
    annee_academique_id?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const { nom_complet, email, filiere_id, annee_academique_id } = body;

  if (!nom_complet || nom_complet.trim().length < 2) {
    return NextResponse.json(
      { error: "Le nom complet doit contenir au moins 2 caractères." },
      { status: 400 },
    );
  }
  if (!email || !ESGIS_EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      {
        error:
          "Adresse email invalide (format attendu : prenom.nom@esgis.org).",
      },
      { status: 400 },
    );
  }
  if (!filiere_id) {
    return NextResponse.json(
      { error: "La filière est requise." },
      { status: 400 },
    );
  }
  if (!annee_academique_id) {
    return NextResponse.json(
      { error: "L'année académique est requise." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const defaultPassword = getDefaultResetPassword("etudiant");

  const { data: created, error: createError } =
    await serviceClient.auth.admin.createUser({
      email: email.trim(),
      password: defaultPassword,
      email_confirm: true,
      // La présence de "filiere_id" active le trigger
      // enforce_student_email_domain_trigger (validation @esgis.org) et
      // permet à handle_new_user() de préremplir profiles.filiere_id /
      // profiles.annee_academique_id.
      user_metadata: {
        nom_complet: nom_complet.trim(),
        filiere_id,
        annee_academique_id,
      },
    });

  if (createError || !created.user) {
    console.error("Erreur création étudiant:", createError);
    return NextResponse.json(
      { error: createError?.message || "Échec de la création du compte." },
      { status: 500 },
    );
  }

  // handle_new_user() crée déjà la ligne profiles avec role='etudiant' par
  // défaut ; on s'assure explicitement du rôle et des données.
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({
      role: "etudiant",
      nom_complet: nom_complet.trim(),
      filiere_id,
      annee_academique_id,
      must_change_password: true,
    })
    .eq("id", created.user.id);

  if (profileError) {
    console.error(
      "Compte créé mais échec de la mise à jour du profil:",
      profileError,
    );
    return NextResponse.json(
      { error: `Compte créé mais profil non finalisé: ${profileError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      student: { id: created.user.id, email: email.trim(), nom_complet },
      defaultPassword,
    },
    { status: 201 },
  );
}
