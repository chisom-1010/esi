// components/EnseignementClientTable.tsx
"use client";

import { columns } from "@/components/columns"; // Importer les colonnes des enseignements
import { DataTable } from "@/components/data-table"; // Assurez-vous que ce chemin est correct
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import {
  AnneeAcademique,
  Classe,
  Enseignant,
  Enseignement,
  Matiere,
} from "./columns"; // Importer les types
import { EnseignementForm } from "./EnseignementForm"; // Importer le nouveau formulaire d'enseignement
import { redirect } from "next/navigation";

interface EnseignementClientTableProps {
  data: Enseignement[]; // Les données d'enseignements (avec jointures)
  enseignants: Enseignant[];
  matieres: Matiere[];
  classes: Classe[];
  anneesAcademiques: AnneeAcademique[];
  // Callback pour rafraîchir les données après ajout
  onEnseignementAddedAction: () => void;
}

export function EnseignementClientTable({
  data,
  enseignants,
  matieres,
  classes,
  anneesAcademiques,
  onEnseignementAddedAction,
}: EnseignementClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false); // Fermer le dialogue après succès
    onEnseignementAddedAction(); // Appeler le callback pour rafraîchir la liste
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Gestion des Enseignements
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Enseignement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un Nouvel Enseignement</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter un
                enseignement.
              </DialogDescription>
            </DialogHeader>
            {/* Passer toutes les listes de données au formulaire */}
            <EnseignementForm
              onSuccessAction={handleFormSuccess}
              enseignants={enseignants}
              matieres={matieres}
              classes={classes}
              anneesAcademiques={anneesAcademiques}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" form="enseignement-form">
                Ajouter
              </Button>{" "}
              {/* Associe le bouton au formulaire par ID */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="matiere" // Exemple de colonne pour la recherche
        filterPlaceholder="Rechercher par matière..."
      />
    </div>
  );
}
