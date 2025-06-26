// app/(admin)/dashboard/page.tsx
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, BookOpen, Edit, BarChart } from "lucide-react";
import { OverviewBarChart } from "@/components/charts/OverviewBarChart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Fonction pour récupérer toutes les statistiques du tableau de bord
async function getDashboardData() {
  const supabase = createSupabaseServiceRoleClient();

  // Utiliser Promise.all pour lancer les deux appels RPC en parallèle
  const [statsData, topTeachersData] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.rpc("get_top_teachers", { limit_count: 5 }),
  ]);

  // Gestion des erreurs
  if (statsData.error) {
    console.error("Erreur RPC get_dashboard_stats:", statsData.error);
  }
  if (topTeachersData.error) {
    console.error("Erreur RPC get_top_teachers:", topTeachersData.error);
  }

  // Traitement des données et retour
  return {
    stats: statsData.data || { evaluations: 0, enseignants: 0, users: 0 },
    topTeachers:
      topTeachersData.data?.map((teacher: any) => ({
        name: teacher.nom_complet,
        score: teacher.score_moyen
          ? parseFloat(teacher.score_moyen.toFixed(1))
          : 0,
      })) ?? [],
  };
}

export default async function AdminDashboardPage() {
  // 1. Sécuriser la page : vérifier que l'utilisateur est un admin connecté
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

  // 2. Récupérer les statistiques
  const { stats, topTeachers } = await getDashboardData();

  return (
    <div>
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Tableau de Bord
      </h2>

      {/* --- Cartes de Statistiques --- */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {/* Carte Évaluations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d'Évaluations
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.evaluations}</div>
            <p className="text-xs text-muted-foreground">
              Fiches soumises au total
            </p>
          </CardContent>
        </Card>
        {/* Carte Enseignants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d'Enseignants
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enseignants}</div>
            <p className="text-xs text-muted-foreground">Enseignants actifs</p>
          </CardContent>
        </Card>
        {/* Carte Utilisateurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d'Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Étudiants et admins</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Section Graphiques & Actions Rapides --- */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Graphique */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top 5 Enseignants (Score Moyen / 20)</CardTitle>
            <CardDescription>
              Basé sur toutes les évaluations soumises.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewBarChart
              data={topTeachers}
              title="Top 5 Enseignants"
              description="Score moyen sur 20"
            />
          </CardContent>
        </Card>

        {/* Actions Rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux sections importantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/data-entry/enter-evaluation" passHref>
              <Button className="w-full">Nouvelle Saisie d'Évaluation</Button>
            </Link>
            <Link href="/user-management" passHref>
              <Button variant="outline" className="w-full">
                Gérer les Utilisateurs
              </Button>
            </Link>
            <Link href="/reports" passHref>
              <Button variant="outline" className="w-full">
                Voir tous les Rapports
              </Button>
            </Link>
            <Link href="/manage-teachings" passHref>
              <Button variant="secondary" className="w-full">
                Gérer les Enseignements
              </Button>
            </Link>
            <Link href="/manage-teachers" passHref>
              <Button variant="secondary" className="w-full">
                Gérer les Enseignants
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
