// app/(admin)/manage-matieres/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MatiereClientTable } from "./MatiereClientTable";
import { MatiereProfile } from "@/components/admin/matieres/columns";

async function getMatieres(): Promise<MatiereProfile[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("matiere")
    .select("*")
    .order("nom_matiere");

  if (error) {
    console.error("Erreur lors de la récupération des matières:", error);
    return [];
  }
  return data as MatiereProfile[];
}

export default async function ManageMatieresPage() {
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

  const matieres = await getMatieres();

  const handleRefreshData = async () => {
    "use server";
    redirect("/manage-matieres");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 mt-4">Gestion des Matières</h1>
      <MatiereClientTable
        data={matieres}
        onMatiereChangedAction={handleRefreshData}
      />
    </div>
  );
}
