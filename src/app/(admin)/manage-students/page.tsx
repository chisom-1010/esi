// app/(admin)/manage-students/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { StudentClientTable } from "./StudentClientTable";

async function getStudents() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, nom_complet, filiere_id, filiere:filiere_id(nom_filiere, niveau), annee_academique_id, annee_academique:annee_academique_id(nom_annee)",
    )
    .eq("role", "etudiant")
    .order("nom_complet");

  if (error) {
    console.error("Erreur lors de la récupération des étudiants:", error);
    return [];
  }
  return data;
}

async function getFilieres() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("filiere")
    .select("id, nom_filiere, niveau")
    .order("niveau")
    .order("nom_filiere");

  if (error) {
    console.error("Erreur lors de la récupération des filières:", error);
    return [];
  }
  return data;
}

async function getAnneesAcademiques() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("anneeacademique")
    .select("id, nom_annee")
    .order("date_debut", { ascending: false });

  if (error) {
    console.error(
      "Erreur lors de la récupération des années académiques:",
      error,
    );
    return [];
  }
  return data;
}

export default async function ManageStudentsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Accessible aux admins ET au personnel de saisie (Directeur Pédagogique),
  // contrairement aux autres pages "manage-*" réservées aux seuls admins.
  if (profile?.role !== "admin" && profile?.role !== "data_entry_personnel") {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Accès Interdit</AlertTitle>
          <AlertDescription>
            Cette page est réservée aux administrateurs et au personnel de
            saisie.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const [students, filieres, anneesAcademiques] = await Promise.all([
    getStudents(),
    getFilieres(),
    getAnneesAcademiques(),
  ]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 mt-4">Gestion des Étudiants</h1>
      <StudentClientTable
        students={students as any}
        filieres={filieres}
        anneesAcademiques={anneesAcademiques}
      />
    </div>
  );
}
