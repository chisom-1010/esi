// app/(admin)/user-management/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserManagementClient } from "./UserManagementClient";
import type { UserProfile } from "@/components/admin/users/columns";

async function getUsers(): Promise<UserProfile[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_users_list");

  if (error) {
    console.error("Erreur RPC get_users_list:", error);
    // Gérer l'erreur, peut-être retourner un tableau vide ou lancer une erreur
    // Si l'erreur est 'Accès refusé', cela signifie que l'appelant n'est pas admin,
    // mais le layout devrait déjà avoir géré cela.
    return [];
  }

  // Assurer que le type correspond bien à UserProfile
  return (data as UserProfile[]) || [];
}

export default async function UserManagementPage() {
  const usersData = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
      <UserManagementClient users={usersData} />
    </div>
  );
}
