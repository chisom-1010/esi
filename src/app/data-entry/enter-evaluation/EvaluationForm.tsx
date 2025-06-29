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

// Définir les types basés sur ce que le serveur envoie
type EnseignementType = {
  id: string;
  anneeacademique: { nom_annee: string } | null;
  matiere: { nom_matiere: string } | null;
  enseignant: { nom_complet: string } | null;
  classe: { nom_classe: string; niveau: string } | null;
};
type OptionType = { id: string; libelle: string; points: number };
type CritereType = { id: string; texte_critere: string };
// <<< CORRIGÉ : Le type CategorieType doit aussi gérer la possibilité d'un critereevaluation null
type CategorieType = {
  id: string;
  nom_categorie: string;
  critereevaluation: CritereType[] | null;
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
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [commentaire, setCommentaire] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Filtre les critères "null" pour un décompte correct
  const allCriteria = categories.flatMap((cat) => cat.critereevaluation || []);

  const handleResponseChange = (critereId: string, optionId: string) => {
    setResponses((prev) => ({ ...prev, [critereId]: optionId }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    console.log("La fonction handleSubmit a été déclenchée !");

    if (!selectedEnseignement) {
      toast.error("Veuillez sélectionner un enseignement à évaluer.");
      setIsLoading(false);
      return;
    }
    if (Object.keys(responses).length < allCriteria.length) {
      toast.error(
        `Veuillez répondre à tous les ${allCriteria.length} critères.`,
      );
      setIsLoading(false);
      return;
    }

    const responsesPayload = Object.entries(responses).map(
      ([critereId, optionId]) => ({
        critere_id: critereId,
        option_reponse_id: optionId,
        points: selectedOption ? selectedOption.points : 0,
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
        throw new Error(result.error || "Échec de la soumission.");
      }
      toast.success("Évaluation soumise avec succès !");
      setSelectedEnseignement("");
      setResponses({});
      setCommentaire("");
      router.refresh(); // Rafraîchit la page pour vider le formulaire
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validEnseignements = enseignements.filter(
    (ens) => ens.enseignant && ens.matiere && ens.classe && ens.anneeacademique,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Section Sélection Enseignement --- */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection de l'Enseignement</CardTitle>
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
              {/* Utiliser la liste filtrée validEnseignements */}
              {validEnseignements.map((ens) => (
                <SelectItem key={ens.id} value={ens.id}>
                  {`${ens.enseignant?.nom_complet || "N/A"} - ${ens.matiere?.nom_matiere || "N/A"} - ${ens.classe?.nom_classe || "N/A"} (${ens.anneeacademique?.nom_annee || "N/A"})`}
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
            {/* <<< CORRECTION ICI : Utiliser (cat.critereevaluation || []) pour éviter l'erreur .map sur null */}
            {(cat.critereevaluation || []).map((critere) => (
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
            {/* Gérer le cas où il n'y a aucun critère pour une catégorie */}
            {(!cat.critereevaluation || cat.critereevaluation.length === 0) && (
              <p className="text-sm text-muted-foreground">
                Aucun critère d'évaluation pour cette catégorie.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* --- Section Commentaire --- */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires Additionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Écrivez vos remarques et suggestions ici..."
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
