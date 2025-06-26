import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Users, BookOpen, Award } from "lucide-react";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

// Fonction pour récupérer les données du rapport
async function getReportData() {
  const supabase = createSupabaseServiceRoleClient();

  // Exemple de requêtes pour les rapports
  const { data: topTeachers } = await supabase.rpc("get_top_teachers", {
    limit: 5,
  });
  const { data: clarityRanks } = await supabase.rpc("get_clarity_rankings", {
    limit: 5,
  });
  const { data: animatedCourses } = await supabase.rpc("get_animated_courses", {
    limit: 5,
  });

  return {
    topTeachers: topTeachers || [],
    clarityRanks: clarityRanks || [],
    animatedCourses: animatedCourses || [],
  };
}

export default async function ReportsPage() {
  const { topTeachers, clarityRanks, animatedCourses } = await getReportData();

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Rapports
      </h1>

      <Tabs defaultValue="top-teachers" className="space-y-4">
        {/* Liste des onglets */}
        <TabsList>
          <TabsTrigger value="top-teachers" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> Meilleurs Enseignants
          </TabsTrigger>
          <TabsTrigger
            value="clarity-ranks"
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" /> Classement Clarté
          </TabsTrigger>
          <TabsTrigger
            value="animated-courses"
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" /> Cours Animés
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="top-teachers">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Enseignants (Score Moyen)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Score Moyen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTeachers.map((teacher: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{teacher.nom_complet}</TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(teacher.score_moyen.toFixed(1))}/20
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clarity-ranks">
          <Card>
            <CardHeader>
              <CardTitle>Classement par Clarté du Cours</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Clarté</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clarityRanks.map((rank: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{rank.nom_complet}</TableCell>
                      <TableCell className="font-medium">
                        {rank.clarite_score}/20
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animated-courses">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Cours Animés</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matériel</TableHead>
                    <TableHead>Participation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animatedCourses.map((course: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{course.matiere}</TableCell>
                      <TableCell className="font-medium">
                        {course.participation_score}/20
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
