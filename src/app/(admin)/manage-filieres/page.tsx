// app/(admin)/manage-filieres/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { FiliereClientTable } from "./FiliereClientTable";
import { FiliereProfile } from "@/components/admin/filieres/columns";

async function getFilieres(): Promise<FiliereProfile[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("filiere")
    .select("*")
    .order("niveau")
    .order("nom_filiere");

  if (error) {
    console.error("Erreur lors de la récupération des filières:", error);
    return [];
  }
  return data as FiliereProfile[];
}

export default async function ManageFilieresPage() {
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

  const filieres = await getFilieres();

  // Server Action pour rafraîchir la page après ajout/modification/suppression
  const handleRefreshData = async () => {
    "use server";
    redirect("/manage-filieres");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 mt-4">Gestion des Filières</h1>
      <FiliereClientTable
        data={filieres}
        onFiliereChangedAction={handleRefreshData}
      />
    </div>
  );
}
