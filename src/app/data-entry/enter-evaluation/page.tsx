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

export default async function EnterEvaluationPage() {
  console.log("\n--- [EnterEvaluationPage] Début Rendu Serveur ---");
  // Note: Si votre fonction createSupabaseServerClient n'est plus async, vous pouvez retirer le 'await'
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return <div>Erreur Critique: Client Supabase non créé.</div>;
  }

  // --- 1. Vérification de l'utilisateur et de son profil ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Accès Refusé</AlertTitle>
        <AlertDescription>Vous devez être connecté.</AlertDescription>
      </Alert>
    );
  }

  // Note: La fonction RPC 'get_enseignements_for_user' utilise déjà auth.uid()
  // pour récupérer le profil, donc cette étape n'est plus strictement nécessaire
  // pour cette fonction, mais elle reste utile pour afficher des messages ou pour d'autres logiques.
  console.log(`[EnterEvaluationPage] Utilisateur connecté trouvé: ${user.id}`);

  // --- 2. Appel aux Fonctions RPC pour récupérer toutes les données ---
  const { data: enseignements, error: enseignementsError } = await supabase.rpc(
    "get_enseignements_for_user",
  );

  const { data: formStructure, error: formStructureError } =
    await supabase.rpc("get_form_structure");

  // --- 3. Gestion des Erreurs et des Données Vides ---
  if (enseignementsError || formStructureError) {
    console.error("Erreur RPC (Enseignements):", enseignementsError);
    console.error("Erreur RPC (Structure Formulaire):", formStructureError);
    return (
      <Alert variant="destructive" className="m-8">
        <AlertTitle>Erreur de Récupération des Données</AlertTitle>
        <AlertDescription>
          Impossible de charger les données depuis la base de données via RPC.
        </AlertDescription>
      </Alert>
    );
  }

  const categories = formStructure?.categories || [];
  const options = formStructure?.options || [];

  if (!categories.length || !options.length) {
    return (
      <Card className="m-8 border-red-500">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-500">
            Erreur de Configuration
          </CardTitle>
          <CardDescription>
            Impossible de charger les critères ou options via RPC. Vérifiez la
            fonction `get_form_structure` et les données dans les tables.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  if (!enseignements || !enseignements.length) {
    return (
      <Card className="m-8 border-yellow-500">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-yellow-600">
            Aucun Enseignement
          </CardTitle>
          <CardDescription>
            Aucun enseignement n'a été trouvé pour votre profil. Si vous êtes
            étudiant, vérifiez que vous êtes bien assigné à une classe contenant
            des cours.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // --- 4. Rendu du Formulaire ---
  console.log(
    "[EnterEvaluationPage] Toutes les données ont été chargées via RPC. Rendu du formulaire...",
  );
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
