// app/data-entry/enter-evaluation/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EvaluationForm } from "./EvaluationForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Fonction pour récupérer les enseignements (adaptée aux rôles)
async function getEnseignements(supabase: any, user: any, profile: any) {
  let query = supabase.from("Enseignement").select(`
        id, AnneeAcademique ( nom_annee ), Matiere ( nom_matiere ),
        Enseignant ( nom_complet ), Classe ( nom_classe, niveau )
    `);

  // Si l'utilisateur est un étudiant, filtrer par sa classe
  // !!! HYPOTHÈSE: Votre table 'profiles' a une colonne 'classe_id' pour les étudiants !!!
  // Si ce n'est pas le cas, cette partie ne fonctionnera pas pour les étudiants.
  if (profile?.role === "etudiant" && profile.classe_id) {
    query = query.eq("classe_id", profile.classe_id);
  } else if (profile?.role === "etudiant" && !profile.classe_id) {
    console.warn(`L'étudiant ${user.id} n'a pas de classe_id assigné.`);
    return []; // Ne rien retourner si l'étudiant n'a pas de classe
  }

  // Ajouter l'ordre pour tout le monde
  query = query
    .order("AnneeAcademique(nom_annee)", { ascending: false })
    .order("Classe(nom_classe)")
    .order("Matiere(nom_matiere)");

  const { data, error } = await query;

  if (error) {
    console.error("Erreur getEnseignements:", error);
    return [];
  }
  return data || [];
}

// Fonction pour récupérer les critères et options (inchangée)
async function getFormStructure(supabase: any) {
  // Récupérer les catégories de critères avec leurs critères associés
  const { data: categories } = await supabase
    .from("categoriecritere")
    .select(
      `
            id,
            nom_categorie,
            criteres:critere(
                id,
                intitule,
                ordre
            )
        `,
    )
    .order("ordre")
    .order("id", { referencedTable: "critere" });

  // Récupérer les options de réponse
  const { data: options } = await supabase
    .from("optionreponse")
    .select("*")
    .order("points");

  return { categories: categories || [], options: options || [] };
}

export default async function EnterEvaluationPage() {
  const supabase = await createSupabaseServerClient();

  // 1. VÉRIFIER LE CLIENT SUPABASE (IMPORTANT !)
  if (!supabase || typeof supabase.from !== "function") {
    return (
      <div className="text-red-600 p-8">
        Erreur Critique: Client Supabase non valide. Vérifiez .env.local et
        redémarrez.
      </div>
    );
  }

  // 2. Récupérer l'utilisateur ET son profil
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Accès Refusé</AlertTitle>
        <AlertDescription>
          Vous devez être connecté pour accéder à cette page.
        </AlertDescription>
      </Alert>
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, classe_id")
    .eq("id", user.id)
    .single();

  // 3. Récupérer les données
  const enseignements = await getEnseignements(supabase, user, profile);
  const { categories, options } = await getFormStructure(supabase);

  // 4. Gérer les erreurs de configuration / données vides
  if (!categories.length || !options.length) {
    return (
      <Card className="m-8 border-red-500">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-500">
            Erreur de Configuration
          </CardTitle>
          <CardDescription>
            Impossible de charger les critères ou options. Vérifiez la BDD.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  if (!enseignements.length) {
    return (
      <Card className="m-8 border-yellow-500">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-yellow-600">
            Aucun Enseignement
          </CardTitle>
          <CardDescription>
            Aucun enseignement n'a été trouvé pour votre profil ou pour cette
            période. Si vous êtes étudiant, vérifiez si vous êtes bien assigné à
            une classe.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Fiche d'Évaluation d'Enseignement
      </h1>
      <EvaluationForm
        enseignements={enseignements}
        categories={categories}
        options={options}
      />
    </div>
  );
}
