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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [duplicatingEnseignement, setDuplicatingEnseignement] =
    useState<Enseignement | null>(null);
  const [duplicateAnneeId, setDuplicateAnneeId] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);

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
        `/api/admin/enseignements/${deletingEnseignement.id}`,
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

  const handleConfirmDuplicate = async () => {
    if (!duplicatingEnseignement || !duplicateAnneeId) return;

    setIsDuplicating(true);
    try {
      const { error } = await createSupabaseBrowserClient()
        .from("enseignement")
        .insert([
          {
            enseignant_id: duplicatingEnseignement.enseignant_id,
            matiere_id: duplicatingEnseignement.matiere_id,
            filiere_id: duplicatingEnseignement.filiere_id,
            annee_academique_id: duplicateAnneeId,
            volume_horaire_prevu: duplicatingEnseignement.volume_horaire_prevu,
          },
        ]);

      if (error) throw error;

      toast.success("Enseignement dupliqué avec succès.");
      setDuplicatingEnseignement(null);
      setDuplicateAnneeId("");
      onEnseignementAddedAction();
    } catch (err: any) {
      console.error("Erreur lors de la duplication:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const columns = useMemo(
    () =>
      createEnseignementColumns({
        onEdit: (enseignement) => setEditingEnseignement(enseignement),
        onDelete: (enseignement) => setDeletingEnseignement(enseignement),
        onDuplicate: (enseignement) => {
          setDuplicatingEnseignement(enseignement);
          setDuplicateAnneeId("");
        },
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
            <EnseignementForm
              onSuccessAction={handleFormSuccess}
              enseignants={enseignants}
              matieres={matieres}
              filieres={filieres}
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
              type="button"
              variant="outline"
              onClick={() => setEditingEnseignement(null)}
            >
              Annuler
            </Button>
            <Button type="submit" form="enseignement-form">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplication vers une autre année académique */}
      <Dialog
        open={!!duplicatingEnseignement}
        onOpenChange={(open) => !open && setDuplicatingEnseignement(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dupliquer cet enseignement</DialogTitle>
            <DialogDescription>
              Crée un nouvel enseignement avec le même enseignant, la même
              matière et la même filière ("
              {duplicatingEnseignement?.matiere?.nom_matiere}" -{" "}
              {duplicatingEnseignement?.enseignant?.nom_complet}"), pour une
              autre année académique.
            </DialogDescription>
          </DialogHeader>
          <Select value={duplicateAnneeId} onValueChange={setDuplicateAnneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez l'année académique cible" />
            </SelectTrigger>
            <SelectContent>
              {anneesAcademiques
                .filter(
                  (a) => a.id !== duplicatingEnseignement?.annee_academique_id,
                )
                .map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nom_annee}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDuplicatingEnseignement(null)}
              disabled={isDuplicating}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDuplicate}
              disabled={!duplicateAnneeId || isDuplicating}
            >
              {isDuplicating ? "Duplication..." : "Dupliquer"}
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
              {deletingEnseignement?.enseignant?.nom_complet}" sera supprimé.
              Si des évaluations y sont déjà associées, la suppression sera
              refusée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingEnseignement(null)}
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
