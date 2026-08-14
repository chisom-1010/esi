// app/(admin)/manage-annees-academiques/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { AnneeAcademiqueClientTable } from "./AnneeAcademiqueClientTable";
import { AnneeAcademiqueProfile } from "@/components/admin/annees-academiques/columns";

async function getAnneesAcademiques(): Promise<AnneeAcademiqueProfile[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("anneeacademique")
    .select("*")
    .order("date_debut", { ascending: false });

  if (error) {
    console.error(
      "Erreur lors de la récupération des années académiques:",
      error,
    );
    return [];
  }
  return data as AnneeAcademiqueProfile[];
}

export default async function ManageAnneesAcademiquesPage() {
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

  const anneesAcademiques = await getAnneesAcademiques();

  const handleRefreshData = async () => {
    "use server";
    redirect("/manage-annees-academiques");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 mt-4">
        Gestion des Années Académiques
      </h1>
      <AnneeAcademiqueClientTable
        data={anneesAcademiques}
        onAnneeAcademiqueChangedAction={handleRefreshData}
      />
    </div>
  );
}
