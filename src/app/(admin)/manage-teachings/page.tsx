// app/manage/teachings/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { EnseignementClientTable } from "@/components/EnseignementClientTable";
// Importez les types définis pour vos entités
import {
  Enseignant,
  Matiere,
  Classe,
  AnneeAcademique,
  Enseignement,
} from "@/components/columns"; // Assurez-vous que le chemin est correct

// Fonction pour récupérer les enseignements via l'RPC (qui retourne maintenant JSONB avec jointures)
async function getEnseignements(): Promise<Enseignement[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_all_enseignements");

  if (error) {
    console.error("Erreur RPC get_all_enseignements:", error);
    return [];
  }
  // Le 'data' sera un tableau de JSONB, on le caste pour correspondre à l'interface Enseignement
  return data as Enseignement[];
}

// Fonctions pour récupérer les données des tables nécessaires pour les dropdowns du formulaire
async function getEnseignants(): Promise<Enseignant[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("enseignant").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des enseignants:", error);
    return [];
  }
  return data as Enseignant[];
}

async function getMatieres(): Promise<Matiere[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("matiere").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des matières:", error);
    return [];
  }
  return data as Matiere[];
}

async function getClasses(): Promise<Classe[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("classe").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des classes:", error);
    return [];
  }
  return data as Classe[];
}

async function getAnneesAcademiques(): Promise<AnneeAcademique[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("anneeacademique").select("*");
  if (error) {
    console.error(
      "Erreur lors de la récupération des années académiques:",
      error,
    );
    return [];
  }
  return data as AnneeAcademique[];
}

export default async function ManageTeachingsPage() {
  // Sécuriser la page : seuls les admins y ont accès
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

  if (profile?.role !== "admin") {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Accès Interdit</AlertTitle>
          <AlertDescription>
            Vous devez être administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Récupérer toutes les données nécessaires en parallèle
  const [enseignements, enseignants, matieres, classes, anneesAcademiques] =
    await Promise.all([
      getEnseignements(), // Données pour le tableau (via RPC)
      getEnseignants(), // Données pour les dropdowns
      getMatieres(), // Données pour les dropdowns
      getClasses(), // Données pour les dropdowns
      getAnneesAcademiques(), // Données pour les dropdowns
    ]);

  // Fonction Server Action pour rafraîchir la page (pour recharger les données après un ajout/modification)
  const handleRefreshData = async () => {
    "use server";
    redirect("/manage-teachings");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Gestion des Enseignements</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <EnseignementClientTable
          data={enseignements}
          enseignants={enseignants}
          matieres={matieres}
          classes={classes}
          anneesAcademiques={anneesAcademiques}
          onEnseignementAddedAction={handleRefreshData} // Passe la fonction de rafraîchissement au composant client
        />
      </div>
    </div>
  );
}
