// components/EnseignementClientTable.tsx
"use client";

import { createEnseignementColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AnneeAcademique,
  Filiere,
  Enseignant,
  Enseignement,
  Matiere,
} from "./columns";
import { EnseignementForm } from "./EnseignementForm";

interface EnseignementClientTableProps {
  data: Enseignement[]; // Les données d'enseignements (avec jointures)
  enseignants: Enseignant[];
  matieres: Matiere[];
  filieres: Filiere[];
  anneesAcademiques: AnneeAcademique[];
  // Callback pour rafraîchir les données après ajout/modification/suppression
  onEnseignementAddedAction: () => void;
}

export function EnseignementClientTable({
  data,
  enseignants,
  matieres,
  filieres,
  anneesAcademiques,
  onEnseignementAddedAction,
}: EnseignementClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnseignement, setEditingEnseignement] =
    useState<Enseignement | null>(null);
  const [deletingEnseignement, setDeletingEnseignement] =
    useState<Enseignement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    onEnseignementAddedAction();
  };

  const handleEditFormSuccess = () => {
    setEditingEnseignement(null);
    onEnseignementAddedAction();
  };

  const handleConfirmDelete = async () => {
    if (!deletingEnseignement) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/teachings/${deletingEnseignement.id}/delete`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      toast.success("Enseignement supprimé.");
      setDeletingEnseignement(null);
      onEnseignementAddedAction();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l'enseignement:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createEnseignementColumns({
        onEdit: (enseignement) => setEditingEnseignement(enseignement),
        onDelete: (enseignement) => setDeletingEnseignement(enseignement),
      }),
    [],
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Gestion des Enseignements
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="border rounded-4xl cursor-pointer">
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
            <EnseignementForm
              onSuccessAction={handleFormSuccess}
              enseignants={enseignants}
              matieres={matieres}
              filieres={filieres}
              anneesAcademiques={anneesAcademiques}
            />
            <DialogFooter>
              <Button
                className="border rounded-4xl cursor-pointer"
                type="button"
                variant="destructive"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                className="border rounded-4xl cursor-pointer"
                type="submit"
                form="enseignement-form"
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="matiere"
        filterPlaceholder="Rechercher par matière..."
      />

      {/* Édition d'un enseignement */}
      <Dialog
        open={!!editingEnseignement}
        onOpenChange={(open) => !open && setEditingEnseignement(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'enseignement</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de cet enseignement.
            </DialogDescription>
          </DialogHeader>
          {editingEnseignement && (
            <EnseignementForm
              onSuccessAction={handleEditFormSuccess}
              enseignants={enseignants}
              matieres={matieres}
              filieres={filieres}
              anneesAcademiques={anneesAcademiques}
              initialData={editingEnseignement}
            />
          )}
          <DialogFooter>
            <Button
              className="border rounded-4xl cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setEditingEnseignement(null)}
            >
              Annuler
            </Button>
            <Button
              className="border rounded-4xl cursor-pointer"
              type="submit"
              form="enseignement-form"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog
        open={!!deletingEnseignement}
        onOpenChange={(open) => !open && setDeletingEnseignement(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet enseignement ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. L'enseignement de "
              {deletingEnseignement?.matiere?.nom_matiere}" par "
              {deletingEnseignement?.enseignant?.nom_complet}" sera supprimé. Si
              des évaluations y sont déjà associées, la suppression sera
              refusée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="border rounded-4xl cursor-pointer"
              type="button"
              variant="destructive"
              onClick={() => setDeletingEnseignement(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              className="border rounded-4xl cursor-pointer"
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
