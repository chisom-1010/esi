// app/admin/user-management/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient, // <<< IMPORTER LE CLIENT DE SERVICE
} from "@/lib/supabase/server";
import { UserManagementClient } from "./UserManagementClient"; // Assurez-vous d'avoir ce composant client
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

async function getUsersList() {
  // <<< UTILISER LE CLIENT DE SERVICE POUR LES OPÉRATIONS ADMIN
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_users_list");

  if (error) {
    // Affiche l'erreur dans la console du serveur pour le débogage
    console.error("Erreur RPC get_users_list:", error);
    // Retourne un tableau vide en cas d'erreur pour ne pas faire planter la page
    return [];
  }

  return data;
}

export default async function UserManagementPage() {
  // Utiliser le client standard pour vérifier l'authentification et le rôle de l'utilisateur actuel
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login"); // Rediriger si non connecté
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Sécuriser la page pour que seuls les admins puissent y accéder
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

  const users = await getUsersList();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestion des Utilisateurs
      </h1>
      <UserManagementClient users={users} />
    </div>
  );
}
