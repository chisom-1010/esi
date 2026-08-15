// app/api/admin/enseignements/[id]/evaluations-export/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

type EvaluationDetailRow = {
  fiche_id: string;
  date_soumission: string | null;
  categorie: string | null;
  critere: string | null;
  reponse: string | null;
  points: number | null;
  commentaire: string | null;
};

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
  const { id: enseignementId } = await params;

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

  // 2. Récupérer le contexte de l'enseignement (pour le nom du fichier) et
  // le détail des évaluations, via le client service role.
  const serviceClient = createSupabaseServiceRoleClient();

  const { data: enseignement, error: enseignementError } = await serviceClient
    .from("enseignement")
    .select(
      "id, matiere:matiere_id(nom_matiere), filiere:filiere_id(nom_filiere, niveau), enseignant:enseignant_id(nom_complet), annee_academique:annee_academique_id(nom_annee)",
    )
    .eq("id", enseignementId)
    .single();

  if (enseignementError || !enseignement) {
    return NextResponse.json(
      { error: "Enseignement introuvable." },
      { status: 404 },
    );
  }

  const { data: rows, error: rpcError } = await serviceClient.rpc(
    "get_enseignement_evaluation_details",
    { p_enseignement_id: enseignementId },
  );

  if (rpcError) {
    console.error(
      "Erreur RPC get_enseignement_evaluation_details:",
      rpcError,
    );
    return NextResponse.json(
      {
        error: `Erreur lors de la récupération des évaluations : ${rpcError.message}`,
      },
      { status: 500 },
    );
  }

  const columns = [
    { key: "date_soumission", label: "Date de soumission" },
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

  // Ligne d'en-tête récapitulative (matière / enseignant / filière / année),
  // suivie d'une ligne vide puis du tableau détaillé.
  const enseignant = (enseignement as any).enseignant?.nom_complet || "N/A";
  const matiere = (enseignement as any).matiere?.nom_matiere || "N/A";
  const filiere = (enseignement as any).filiere?.nom_filiere || "N/A";
  const niveau = (enseignement as any).filiere?.niveau || "";
  const annee = (enseignement as any).annee_academique?.nom_annee || "N/A";

  const summaryLine = `Enseignement;${escapeCsvField(matiere)};Enseignant;${escapeCsvField(
    enseignant,
  )};Filière;${escapeCsvField(`${filiere} ${niveau}`.trim())};Année;${escapeCsvField(annee)}`;

  const csvBody = toCsv(formattedRows, columns);
  const csvWithBom = "\uFEFF" + summaryLine + "\r\n\r\n" + csvBody;

  const safeName = slugify(`${matiere}_${enseignant}`);
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
