// components/dashboard/MeilleurEnseignants.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // Assurez-vous que ce chemin est correct
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScoreData {
  enseignant_id: string;
  nom_complet: string;
  score_moyen: number;
}

export function MeilleurEnseignants() {
  const [data, setData] = useState<ScoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient();

      try {
        const { data: scores, error: rpcError } = await supabase.rpc(
          "scores_moyen_par_enseignant", // Nom de la fonction RPC
        );

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        // Optionnel: Limiter à 5 si la RPC ne le fait pas
        setData(((scores as ScoreData[]) || []).slice(0, 5));
      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération des meilleurs enseignants:",
          err,
        );
        setError(`Échec du chargement des données : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Enseignants (Score Moyen)</CardTitle>
        </CardHeader>
        <CardContent>Chargement des données...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Enseignants (Score Moyen)</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Enseignants (Score Moyen)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Basé sur toutes les évaluations soumises.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground">
            Aucune donnée disponible pour ce rapport.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enseignant</TableHead>
                <TableHead>Score Moyen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((teacher) => (
                <TableRow key={teacher.enseignant_id}>
                  <TableCell>{teacher.nom_complet}</TableCell>
                  <TableCell className="font-medium">
                    {parseFloat(teacher.score_moyen.toFixed(1))}/20
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
