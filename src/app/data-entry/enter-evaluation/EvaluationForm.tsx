// app/data-entry/enter-evaluation/EvaluationForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Définir les types basés sur ce que la page serveur envoie
type EnseignementType = {
  id: string;
  anneeacademique: { nom_annee: string };
  matiere: { nom_matiere: string };
  enseignant: { nom_complet: string };
  classe: { nom_classe: string; niveau: string };
};
type OptionType = { id: string; libelle: string; points: number };
type CritereType = {
  id: string;
  texte_critere: string;
  type_critere: string;
  is_active: boolean;
};
type CategorieType = {
  id: string;
  nom_categorie: string;
  critereevaluation: CritereType[];
};

interface EvaluationFormProps {
  enseignements: EnseignementType[];
  categories: CategorieType[];
  options: OptionType[];
}

export function EvaluationForm({
  enseignements,
  categories,
  options,
}: EvaluationFormProps) {
  const [selectedEnseignement, setSelectedEnseignement] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, string>>({}); // { [critereId]: optionId }
  const [commentaire, setCommentaire] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const allCriteria = categories.flatMap((cat) => cat.critereevaluation);

  const handleResponseChange = (critereId: string, optionId: string) => {
    setResponses((prev) => ({ ...prev, [critereId]: optionId }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Validation
    if (!selectedEnseignement) {
      toast.error("Veuillez sélectionner un enseignement à évaluer.");
      setIsLoading(false);
      return;
    }
    const answeredCriteriaCount = Object.keys(responses).length;
    if (answeredCriteriaCount < allCriteria.length) {
      toast.error(
        `Veuillez répondre à tous les ${allCriteria.length} critères. ${answeredCriteriaCount} répondu(s).`,
      );
      setIsLoading(false);
      return;
    }

    // Préparer les données pour l'API (format JSONB attendu)
    const responsesPayload = Object.entries(responses).map(
      ([critereId, optionId]) => ({
        critere_id: critereId,
        option_reponse_id: optionId,
      }),
    );

    try {
      const response = await fetch("/api/evaluation/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enseignementId: selectedEnseignement,
          responses: responsesPayload,
          commentaire: commentaire,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Échec de la soumission du formulaire.",
        );
      }

      toast.success("Évaluation soumise avec succès !");
      // Réinitialiser le formulaire ou rediriger
      setSelectedEnseignement("");
      setResponses({});
      setCommentaire("");
      // router.push('/dashboard'); // Ou une autre page
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Section Sélection Enseignement --- */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection de l'Enseignement</CardTitle>
          <CardDescription>
            Choisissez l'enseignant, la matière et la classe que vous évaluez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="enseignement-select">Enseignement</Label>
          <Select
            value={selectedEnseignement}
            onValueChange={setSelectedEnseignement}
            required
          >
            <SelectTrigger id="enseignement-select">
              <SelectValue placeholder="Sélectionnez un enseignement..." />
            </SelectTrigger>
            <SelectContent>
              {enseignements.map((ens) => (
                <SelectItem key={ens.id} value={ens.id}>
                  {`${ens.enseignant.nom_complet} - ${ens.matiere.nom_matiere} - ${ens.classe.nom_classe} (${ens.anneeacademique.nom_annee})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* --- Section Critères --- */}
      {categories.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle>{cat.nom_categorie}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {cat.critereevaluation.map((critere) => (
              <div
                key={critere.id}
                className="p-4 border rounded-md shadow-sm bg-background"
              >
                <Label className="font-semibold block mb-3">
                  {critere.texte_critere}
                </Label>
                <RadioGroup
                  value={responses[critere.id] || ""}
                  onValueChange={(value) =>
                    handleResponseChange(critere.id, value)
                  }
                  className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6"
                  required
                >
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={opt.id}
                        id={`${critere.id}-${opt.id}`}
                      />
                      <Label
                        htmlFor={`${critere.id}-${opt.id}`}
                        className="cursor-pointer"
                      >
                        {opt.libelle} ({opt.points} pts)
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* --- Section Commentaire --- */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires Additionnels</CardTitle>
          <CardDescription>
            Vos remarques et suggestions sont importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Écrivez vos commentaires ici..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* --- Bouton Soumission --- */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Soumission en cours..." : "Soumettre l'Évaluation"}
        </Button>
      </div>
    </form>
  );
}
