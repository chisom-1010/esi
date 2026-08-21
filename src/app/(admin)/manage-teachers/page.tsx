import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TeacherClientTable } from "./TeacherClientTable";

// Fonction pour récupérer la liste des enseignants via RPC
async function getTeachers() {
  // Utiliser le client de service est plus sûr pour les opérations d'admin
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_all_teachers");

  if (error) {
    console.error("Erreur RPC get_all_teachers:", error);
    return [];
  }
  return data;
}

async function getTeacherAverages() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_teacher_averages");

  if (error) {
    console.error("Erreur RPC get_teacher_averages:", error);
    return [];
  }
  return data;
}

export default async function ManageTeachersPage() {
  // 1. Sécuriser la page : seuls les admins peuvent y accéder
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

  // 2. Récupérer les données
  const [teachers, averages] = await Promise.all([
    getTeachers(),
    getTeacherAverages(),
  ]);

  const averagesById = new Map<string, any>(
    (averages || []).map((a: any) => [a.enseignant_id, a]),
  );
  const teachersWithAverages = (teachers || []).map((t: any) => ({
    ...t,
    nombre_evaluations: averagesById.get(t.id)?.nombre_evaluations ?? 0,
    note_moyenne: averagesById.get(t.id)?.note_moyenne ?? null,
    pourcentage_moyen: averagesById.get(t.id)?.pourcentage_moyen ?? null,
  }));

  const handleRefreshData = async () => {
    "use server";
    redirect("/manage-teachers");
  };

  // 3. Rendre la page avec les données
  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Gestion des Enseignants
      </h1>
      <TeacherClientTable data={teachersWithAverages} />
    </div>
  );
}
