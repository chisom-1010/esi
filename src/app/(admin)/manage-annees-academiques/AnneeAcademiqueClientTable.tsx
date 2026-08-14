// app/(admin)/manage-annees-academiques/AnneeAcademiqueClientTable.tsx
"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createAnneeAcademiqueColumns,
  AnneeAcademiqueProfile,
} from "@/components/admin/annees-academiques/columns";
import { AnneeAcademiqueForm } from "@/components/admin/annees-academiques/AnneeAcademiqueForm";

interface AnneeAcademiqueClientTableProps {
  data: AnneeAcademiqueProfile[];
  onAnneeAcademiqueChangedAction: () => void;
}

export function AnneeAcademiqueClientTable({
  data,
  onAnneeAcademiqueChangedAction,
}: AnneeAcademiqueClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnee, setEditingAnnee] =
    useState<AnneeAcademiqueProfile | null>(null);
  const [deletingAnnee, setDeletingAnnee] =
    useState<AnneeAcademiqueProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    onAnneeAcademiqueChangedAction();
  };

  const handleEditFormSuccess = () => {
    setEditingAnnee(null);
    onAnneeAcademiqueChangedAction();
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnee) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/annees-academiques/${deletingAnnee.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      toast.success(`"${deletingAnnee.nom_annee}" a été supprimée.`);
      setDeletingAnnee(null);
      onAnneeAcademiqueChangedAction();
    } catch (err: any) {
      console.error(
        "Erreur lors de la suppression de l'année académique:",
        err,
      );
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createAnneeAcademiqueColumns({
        onEdit: (annee) => setEditingAnnee(annee),
        onDelete: (annee) => setDeletingAnnee(annee),
      }),
    [],
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Liste des Années Académiques
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Année
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Nouvelle Année Académique</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter une année
                académique.
              </DialogDescription>
            </DialogHeader>
            <AnneeAcademiqueForm onSuccessAction={handleFormSuccess} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" form="annee-academique-form">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="nom_annee"
        filterPlaceholder="Rechercher par nom..."
      />

      {/* Édition d'une année académique */}
      <Dialog
        open={!!editingAnnee}
        onOpenChange={(open) => !open && setEditingAnnee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'année académique</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "{editingAnnee?.nom_annee}".
            </DialogDescription>
          </DialogHeader>
          {editingAnnee && (
            <AnneeAcademiqueForm
              onSuccessAction={handleEditFormSuccess}
              initialData={editingAnnee}
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingAnnee(null)}
            >
              Annuler
            </Button>
            <Button type="submit" form="annee-academique-form">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog
        open={!!deletingAnnee}
        onOpenChange={(open) => !open && setDeletingAnnee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette année académique ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. "{deletingAnnee?.nom_annee}" sera
              supprimée. Si des enseignements y sont encore associés, la
              suppression sera refusée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingAnnee(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
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
