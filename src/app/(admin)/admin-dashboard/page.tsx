// app/(admin)/dashboard/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, BookOpen, Edit, BarChart } from "lucide-react";
import { OverviewBarChart } from "@/components/charts/OverviewBarChart"; // Importer le graphique
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

async function getDashboardStats() {
  const supabase = createSupabaseServiceRoleClient(); // ✅ Client avec rôle de service

  // Comptage des enseignants
  const { count: teachersCount } = await supabase
    .from("enseignant")
    .select("*", { count: "exact", head: true });

  // Comptage des évaluations
  const { count: formsCount } = await supabase
    .from("ficheevaluationetudiant")
    .select("*", { count: "exact", head: true });

  // Comptage des utilisateurs
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Récupération des enseignants avec leurs scores moyens (via RPC)
  const { data: topTeachers, error } = await supabase.rpc("get_top_teachers", {
    limit: 5,
  });

  if (error) {
    console.error("Erreur lors de la récupération des enseignants:", error);
    return {
      teachers: teachersCount ?? 0,
      evaluations: formsCount ?? 0,
      users: usersCount ?? 0,
      topTeachers: [
        { name: "Prof. A", score: 18.5 },
        { name: "Prof. B", score: 17.8 },
        { name: "Prof. C", score: 17.5 },
        { name: "Prof. D", score: 16.9 },
        { name: "Prof. E", score: 16.2 },
      ],
    };
  }

  return {
    teachers: teachersCount ?? 0,
    evaluations: formsCount ?? 0,
    users: usersCount ?? 0,
    topTeachers: topTeachers.map((teacher: any) => ({
      name: teacher.nom_complet,
      score: parseFloat(teacher.score_moyen.toFixed(1)),
    })),
  };
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();
  const stats = await getDashboardStats(supabase);

  return (
    <div>
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Tableau de Bord
      </h2>

      {/* --- Cartes de Statistiques --- */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
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
              Cette année académique
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d'Enseignants
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d'Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Dans le système</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne Générale
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16.8 / 20</div>{" "}
            {/* Dummy Data */}
            <p className="text-xs text-muted-foreground">
              Basée sur les dernières évaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Section Graphiques & Actions Rapides --- */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Graphique */}
        <OverviewBarChart
          data={stats.topTeachers}
          title="Top 5 Enseignants (Score Moyen)"
          description="Basé sur les évaluations de cette année."
        />

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
