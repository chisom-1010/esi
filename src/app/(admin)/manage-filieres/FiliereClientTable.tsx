// app/(admin)/manage-filieres/FiliereClientTable.tsx
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
  createFiliereColumns,
  FiliereProfile,
} from "@/components/admin/filieres/columns";
import { FiliereForm } from "@/components/admin/filieres/FiliereForm";

interface FiliereClientTableProps {
  data: FiliereProfile[];
  onFiliereChangedAction: () => void;
}

export function FiliereClientTable({
  data,
  onFiliereChangedAction,
}: FiliereClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<FiliereProfile | null>(
    null,
  );
  const [deletingFiliere, setDeletingFiliere] =
    useState<FiliereProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    onFiliereChangedAction();
  };

  const handleEditFormSuccess = () => {
    setEditingFiliere(null);
    onFiliereChangedAction();
  };

  const handleConfirmDelete = async () => {
    if (!deletingFiliere) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/filieres/${deletingFiliere.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      toast.success(`"${deletingFiliere.nom_filiere}" a été supprimée.`);
      setDeletingFiliere(null);
      onFiliereChangedAction();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la filière:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createFiliereColumns({
        onEdit: (filiere) => setEditingFiliere(filiere),
        onDelete: (filiere) => setDeletingFiliere(filiere),
      }),
    [],
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Liste des Filières
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Filière
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Nouvelle Filière</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter une
                filière.
              </DialogDescription>
            </DialogHeader>
            <FiliereForm onSuccessAction={handleFormSuccess} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" form="filiere-form">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="nom_filiere"
        filterPlaceholder="Rechercher par nom..."
      />

      {/* Édition d'une filière */}
      <Dialog
        open={!!editingFiliere}
        onOpenChange={(open) => !open && setEditingFiliere(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la filière</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "
              {editingFiliere?.nom_filiere}".
            </DialogDescription>
          </DialogHeader>
          {editingFiliere && (
            <FiliereForm
              onSuccessAction={handleEditFormSuccess}
              initialData={editingFiliere}
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingFiliere(null)}
            >
              Annuler
            </Button>
            <Button type="submit" form="filiere-form">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog
        open={!!deletingFiliere}
        onOpenChange={(open) => !open && setDeletingFiliere(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette filière ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. "{deletingFiliere?.nom_filiere}"
              sera supprimée. Si des enseignements y sont encore associés, la
              suppression sera refusée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingFiliere(null)}
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
