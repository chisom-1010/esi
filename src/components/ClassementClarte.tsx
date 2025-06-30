// components/ClassementClarte.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // Assurez-vous que ce chemin est correct
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assurez-vous d'avoir ce composant (shadcn/ui)

interface ScoreData {
  enseignant_id: string;
  nom_complet: string;
  score_moyen: number;
}

export function ClassementClarte() {
  const [data, setData] = useState<ScoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient(); // Utilise le client côté client

      try {
        // Appel de la fonction RPC 'scores_clarte_par_enseignant'
        const { data: scores, error: rpcError } = await supabase.rpc(
          "scores_clarte_par_enseignant",
        );

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        setData(scores || []);
      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération des scores de clarté:",
          err,
        );
        setError(`Échec du chargement des données de clarté : ${err.message}`);
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
          <CardTitle>Classement Clarté (Moyenne sur 20)</CardTitle>
        </CardHeader>
        <CardContent>Chargement des données...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classement Clarté (Moyenne sur 20)</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classement Clarté (Moyenne sur 20)</CardTitle>
        </CardHeader>
        <CardContent>
          Aucune donnée d'évaluation pour la clarté disponible.
        </CardContent>
      </Card>
    );
  }

  // Calculer le score maximum pour la barre de progression (si vos scores sont sur 20)
  const maxScore = 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classement Clarté (Moyenne sur 20)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Basé sur les évaluations des étudiants.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.enseignant_id} className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="font-medium">{item.nom_complet}</p>
            </div>
            <div className="w-1/2">
              <Progress
                value={(item.score_moyen / maxScore) * 100}
                className="h-2"
              />
            </div>
            <span className="font-semibold text-right w-16">
              {item.score_moyen.toFixed(2)} / {maxScore}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
