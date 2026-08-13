// app/api/admin/teachers/[id]/evaluations-export/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

type EvaluationDetailRow = {
  fiche_id: string;
  date_soumission: string | null;
  matiere: string | null;
  filiere: string | null;
  annee_academique: string | null;
  categorie: string | null;
  critere: string | null;
  reponse: string | null;
  points: number | null;
  commentaire: string | null;
};

// Le CSV utilise le point-virgule comme séparateur (standard pour Excel en
// configuration régionale française) et échappe les champs contenant des
// guillemets, points-virgules ou retours à la ligne.
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[;"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[],
): string {
  const headerLine = columns.map((c) => escapeCsvField(c.label)).join(";");
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCsvField(row[c.key])).join(";"),
  );
  return [headerLine, ...dataLines].join("\r\n");
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: teacherId } = await params;

  // 1. Vérifier que l'utilisateur est connecté et est bien administrateur
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

  // 2. Récupérer les données via le client service role (bypass RLS pour l'export admin)
  const serviceClient = createSupabaseServiceRoleClient();

  const { data: teacher, error: teacherError } = await serviceClient
    .from("enseignant")
    .select("nom_complet")
    .eq("id", teacherId)
    .single();

  if (teacherError || !teacher) {
    return NextResponse.json(
      { error: "Enseignant introuvable." },
      { status: 404 },
    );
  }

  const { data: rows, error: rpcError } = await serviceClient.rpc(
    "get_teacher_evaluation_details",
    { p_enseignant_id: teacherId },
  );

  if (rpcError) {
    console.error("Erreur RPC get_teacher_evaluation_details:", rpcError);
    return NextResponse.json(
      {
        error: `Erreur lors de la récupération des évaluations : ${rpcError.message}`,
      },
      { status: 500 },
    );
  }

  const columns = [
    { key: "date_soumission", label: "Date de soumission" },
    { key: "matiere", label: "Matière" },
    { key: "filiere", label: "Filière" },
    { key: "annee_academique", label: "Année académique" },
    { key: "categorie", label: "Catégorie" },
    { key: "critere", label: "Critère" },
    { key: "reponse", label: "Réponse" },
    { key: "points", label: "Points" },
    { key: "commentaire", label: "Commentaire" },
    { key: "fiche_id", label: "ID Fiche" },
  ];

  const formattedRows = ((rows as EvaluationDetailRow[]) || []).map((r) => ({
    ...r,
    date_soumission: r.date_soumission
      ? new Date(r.date_soumission).toLocaleString("fr-FR")
      : "",
  }));

  const csvBody = toCsv(formattedRows, columns);
  // Ajout du BOM UTF-8 pour qu'Excel affiche correctement les accents
  const csvWithBom = "\uFEFF" + csvBody;

  const safeName = slugify(teacher.nom_complet || "enseignant");
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `evaluations_${safeName}_${dateStamp}.csv`;

  return new NextResponse(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
