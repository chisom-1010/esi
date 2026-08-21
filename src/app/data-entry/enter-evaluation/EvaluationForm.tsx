// app/data-entry/enter-evaluation/EvaluationForm.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Définir les types basés sur ce que le serveur envoie
type EnseignementType = {
  id: string;
  anneeacademique: { nom_annee: string } | null;
  matiere: { nom_matiere: string } | null;
  enseignant: { nom_complet: string } | null;
  // La RPC get_enseignements_for_user renvoie cette clé sous le nom
  // "classe" (nom historique de la colonne de sortie), mais l'objet
  // contient en réalité nom_filiere/niveau (table réelle: "filiere").
  classe: { nom_filiere: string; niveau: string } | null;
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
  options: OptionType[]; // S'assurer que les options sont passées en props
  // IDs des enseignements déjà évalués par l'étudiant connecté, pour
  // afficher le badge "déjà évalué" / "à évaluer".
  evaluatedIds: string[];
}

function enseignementLabel(ens: EnseignementType) {
  return `${ens.enseignant?.nom_complet || "N/A"} - ${ens.matiere?.nom_matiere || "N/A"} - ${ens.classe?.nom_filiere || "N/A"} (${ens.anneeacademique?.nom_annee || "N/A"})`;
}

export function EvaluationForm({
  enseignements,
  categories,
  options,
  evaluatedIds,
}: EvaluationFormProps) {
  const [selectedEnseignement, setSelectedEnseignement] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [commentaire, setCommentaire] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();
  const critereRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const evaluatedIdSet = useMemo(() => new Set(evaluatedIds), [evaluatedIds]);

  // Filtre les critères "null" pour un décompte correct
  const allCriteria = categories.flatMap((cat) => cat.critereevaluation || []);
  const answeredCount = Object.keys(responses).length;
  const progressPercent =
    allCriteria.length > 0
      ? Math.round((answeredCount / allCriteria.length) * 100)
      : 0;

  const missingCriteria = allCriteria.filter((c) => !responses[c.id]);

  const handleResponseChange = (critereId: string, optionId: string) => {
    setResponses((prev) => ({ ...prev, [critereId]: optionId }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    if (!selectedEnseignement) {
      toast.error("Veuillez sélectionner un enseignement à évaluer.");
      return;
    }

    if (missingCriteria.length > 0) {
      const preview = missingCriteria
        .slice(0, 3)
        .map((c) => c.texte_critere)
        .join(" · ");
      const suffix =
        missingCriteria.length > 3
          ? ` (+ ${missingCriteria.length - 3} autre(s))`
          : "";
      toast.error(
        `${missingCriteria.length} critère(s) sans réponse : ${preview}${suffix}`,
      );
      // Fait défiler jusqu'au premier critère manquant, mis en évidence en
      // rouge ci-dessous grâce à hasAttemptedSubmit.
      const firstMissingEl = critereRefs.current[missingCriteria[0].id];
      firstMissingEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);

    const responsesPayload = Object.entries(responses).map(
      ([critereId, optionId]) => {
        const selectedOption = options.find((opt) => opt.id === optionId);
        return {
          critere_id: critereId,
          option_reponse_id: optionId,
          points: selectedOption ? selectedOption.points : 0,
        };
      },
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
      setHasAttemptedSubmit(false);
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
  const toEvaluateCount = validEnseignements.filter(
    (e) => !evaluatedIdSet.has(e.id),
  ).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Résumé "à évaluer" / "déjà évalué" --- */}
      <Card>
        <CardHeader>
          <CardTitle>Vos enseignements</CardTitle>
          <CardDescription>
            {toEvaluateCount} à évaluer sur {validEnseignements.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {validEnseignements.map((ens) => {
            const isEvaluated = evaluatedIdSet.has(ens.id);
            return (
              <div
                key={ens.id}
                className="flex items-center justify-between gap-2 text-sm py-1"
              >
                <span
                  className={cn(
                    isEvaluated && "text-muted-foreground line-through",
                  )}
                >
                  {enseignementLabel(ens)}
                </span>
                {isEvaluated ? (
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Évalué
                  </Badge>
                ) : (
                  <Badge className="gap-1 shrink-0">
                    <Circle className="h-3 w-3" /> À évaluer
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

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
              {validEnseignements.map((ens) => {
                const isEvaluated = evaluatedIdSet.has(ens.id);
                return (
                  <SelectItem
                    key={ens.id}
                    value={ens.id}
                    disabled={isEvaluated}
                  >
                    {enseignementLabel(ens)}
                    {isEvaluated ? " (déjà évalué)" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* --- Barre de progression --- */}
      {allCriteria.length > 0 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 px-1 border-b">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>
              {answeredCount} / {allCriteria.length} critères répondus
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>
      )}

      {/* --- Section Critères --- */}
      {categories.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle>{cat.nom_categorie}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* <<< CORRECTION ICI : Utiliser (cat.critereevaluation || []) pour éviter l'erreur .map sur null */}
            {(cat.critereevaluation || []).map((critere) => {
              const isMissing = hasAttemptedSubmit && !responses[critere.id];
              return (
                <div
                  key={critere.id}
                  ref={(el) => {
                    critereRefs.current[critere.id] = el;
                  }}
                  className={cn(
                    "p-4 border rounded-md shadow-sm bg-background",
                    isMissing && "border-red-500 ring-1 ring-red-500",
                  )}
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
                  {isMissing && (
                    <p className="text-sm text-red-600 mt-2">
                      Réponse requise pour ce critère.
                    </p>
                  )}
                </div>
              );
            })}
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
