// app/api/admin/students/bulk-import/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getDefaultResetPassword } from "@/lib/admin-default-password";

const ESGIS_EMAIL_REGEX = /^[a-z]+(\.[a-z]+)+@esgis\.org$/i;

type ImportRow = {
  nom_complet: string;
  email: string;
  filiere_id: string;
  annee_academique_id: string;
};

type ImportResult = {
  email: string;
  status: "created" | "error";
  message?: string;
};

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "data_entry_personnel") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs et au personnel de saisie." },
      { status: 403 },
    );
  }

  let body: { rows?: ImportRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "Aucune ligne à importer." },
      { status: 400 },
    );
  }
  if (rows.length > 500) {
    return NextResponse.json(
      { error: "Maximum 500 étudiants par import." },
      { status: 400 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const defaultPassword = getDefaultResetPassword("etudiant");
  const results: ImportResult[] = [];

  // Traitement séquentiel : l'API admin Supabase ne supporte pas les
  // insertions groupées, et ça permet un rapport ligne par ligne exploitable
  // par l'admin (500 lignes max, donc temps d'exécution raisonnable).
  for (const row of rows) {
    const email = row.email?.trim();
    const nomComplet = row.nom_complet?.trim();
    const filiereId = row.filiere_id?.trim();
    const anneeAcademiqueId = row.annee_academique_id?.trim();

    if (!email || !ESGIS_EMAIL_REGEX.test(email)) {
      results.push({
        email: email || "(vide)",
        status: "error",
        message: "Email invalide (format attendu: prenom.nom@esgis.org).",
      });
      continue;
    }
    if (!nomComplet || nomComplet.length < 2) {
      results.push({ email, status: "error", message: "Nom complet invalide." });
      continue;
    }
    if (!filiereId) {
      results.push({ email, status: "error", message: "Filière manquante." });
      continue;
    }
    if (!anneeAcademiqueId) {
      results.push({
        email,
        status: "error",
        message: "Année académique manquante.",
      });
      continue;
    }

    const { data: created, error: createError } =
      await serviceClient.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          nom_complet: nomComplet,
          filiere_id: filiereId,
          annee_academique_id: anneeAcademiqueId,
        },
      });

    if (createError || !created.user) {
      results.push({
        email,
        status: "error",
        message: createError?.message || "Échec de la création.",
      });
      continue;
    }

    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({
        role: "etudiant",
        nom_complet: nomComplet,
        filiere_id: filiereId,
        annee_academique_id: anneeAcademiqueId,
        must_change_password: true,
      })
      .eq("id", created.user.id);

    if (profileError) {
      results.push({
        email,
        status: "error",
        message: `Compte créé mais profil non finalisé: ${profileError.message}`,
      });
      continue;
    }

    results.push({ email, status: "created" });
  }

  const createdCount = results.filter((r) => r.status === "created").length;
  const errorCount = results.length - createdCount;

  return NextResponse.json({
    success: true,
    createdCount,
    errorCount,
    defaultPassword,
    results,
  });
}
