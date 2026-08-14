// app/(admin)/manage-matieres/MatiereClientTable.tsx
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
  createMatiereColumns,
  MatiereProfile,
} from "@/components/admin/matieres/columns";
import { MatiereForm } from "@/components/admin/matieres/MatiereForm";

interface MatiereClientTableProps {
  data: MatiereProfile[];
  onMatiereChangedAction: () => void;
}

export function MatiereClientTable({
  data,
  onMatiereChangedAction,
}: MatiereClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<MatiereProfile | null>(
    null,
  );
  const [deletingMatiere, setDeletingMatiere] =
    useState<MatiereProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    onMatiereChangedAction();
  };

  const handleEditFormSuccess = () => {
    setEditingMatiere(null);
    onMatiereChangedAction();
  };

  const handleConfirmDelete = async () => {
    if (!deletingMatiere) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/matieres/${deletingMatiere.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      toast.success(`"${deletingMatiere.nom_matiere}" a été supprimée.`);
      setDeletingMatiere(null);
      onMatiereChangedAction();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la matière:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createMatiereColumns({
        onEdit: (matiere) => setEditingMatiere(matiere),
        onDelete: (matiere) => setDeletingMatiere(matiere),
      }),
    [],
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Liste des Matières
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Matière
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Nouvelle Matière</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter une
                matière.
              </DialogDescription>
            </DialogHeader>
            <MatiereForm onSuccessAction={handleFormSuccess} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" form="matiere-form">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="nom_matiere"
        filterPlaceholder="Rechercher par nom..."
      />

      {/* Édition d'une matière */}
      <Dialog
        open={!!editingMatiere}
        onOpenChange={(open) => !open && setEditingMatiere(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la matière</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "
              {editingMatiere?.nom_matiere}".
            </DialogDescription>
          </DialogHeader>
          {editingMatiere && (
            <MatiereForm
              onSuccessAction={handleEditFormSuccess}
              initialData={editingMatiere}
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingMatiere(null)}
            >
              Annuler
            </Button>
            <Button type="submit" form="matiere-form">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog
        open={!!deletingMatiere}
        onOpenChange={(open) => !open && setDeletingMatiere(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette matière ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. "{deletingMatiere?.nom_matiere}"
              sera supprimée. Si des enseignements y sont encore associés, la
              suppression sera refusée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingMatiere(null)}
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
