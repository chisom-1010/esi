// app/auth/sign-up/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignUpForm from "@/components/sign-up-form"; // Assurez-vous que ce chemin est correct
import { redirect } from "next/navigation";

// Type pour les filières (anciennement nommé "classe" côté front, corrigé
// pour correspondre à la vraie table "filiere" / colonne profiles.filiere_id)
type FiliereType = {
  id: string;
  nom_filiere: string;
  niveau: string;
};

// Fonction pour récupérer les filières
async function getFilieres(): Promise<FiliereType[]> {
  const supabase = await createSupabaseServerClient();
  // On utilise createSupabaseServerClient même si RLS permet anon,
  // c'est une bonne pratique pour les Server Components.
  const { data, error } = await supabase
    .from("filiere")
    .select("id, nom_filiere, niveau")
    .order("niveau")
    .order("nom_filiere");

  if (error) {
    console.error("Erreur de récupération des filières:", error);
    return [];
  }
  return data;
}

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();

  // Vérifier si l'utilisateur est déjà connecté
  const {
    data: { session },
  } = await supabase.auth.getSession();
  /*  if (session) {
    redirect("/dashboard"); // Rediriger s'il est déjà loggé
    }*/

  const filieres = await getFilieres();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignUpForm filieres={filieres} />
      </div>
    </div>
  );
}
