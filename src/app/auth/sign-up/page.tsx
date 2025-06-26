// app/auth/sign-up/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignUpForm from "@/components/sign-up-form"; // Assurez-vous que ce chemin est correct
import { redirect } from "next/navigation";

// Type pour les classes
type ClasseType = {
  id: string;
  nom_classe: string;
  niveau: string;
};

// Fonction pour récupérer les classes
async function getClasses(): Promise<ClasseType[]> {
  const supabase = await createSupabaseServerClient();
  // On utilise createSupabaseServerClient même si RLS permet anon,
  // c'est une bonne pratique pour les Server Components.
  const { data, error } = await supabase
    .from("classe")
    .select("id, nom_classe, niveau")
    .order("niveau")
    .order("nom_classe");

  if (error) {
    console.error("Erreur de récupération des classes:", error);
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

  const classes = await getClasses();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignUpForm classes={classes} />
      </div>
    </div>
  );
}
