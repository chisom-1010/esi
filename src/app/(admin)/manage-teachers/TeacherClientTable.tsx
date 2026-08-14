"use client";

import { DataTable } from "@/components/data-table";
import { createColumns, Teacher } from "./Columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { TeacherForm } from "@/components/TeacherForm";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface TeacherClientTableProps {
  data: Teacher[];
  onTeacherAdded?: () => void;
}

export function TeacherClientTable({
  data,
  onTeacherAdded,
}: TeacherClientTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>(data);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSuccess = () => {
    if (onTeacherAdded) {
      onTeacherAdded();
    }
  };

  const handleEditFormSuccess = () => {
    setEditingTeacher(null);
    if (onTeacherAdded) {
      // Rafraîchit la liste depuis le serveur (même callback que pour l'ajout)
      onTeacherAdded();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/teachers/${deletingTeacher.id}/delete-teacher`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      setTeachers((current) =>
        current.filter((t) => t.id !== deletingTeacher.id),
      );
      toast.success(`"${deletingTeacher.nom_complet}" a été supprimé.`);
      setDeletingTeacher(null);
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l'enseignant:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: (teacher) => setEditingTeacher(teacher),
        onDelete: (teacher) => setDeletingTeacher(teacher),
      }),
    [],
  );
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Liste des Enseignants
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="border rounded-4xl cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Enseignant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Nouvel Enseignant</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter un
                enseignant au système.
              </DialogDescription>
            </DialogHeader>
            <TeacherForm
              onSuccess={handleFormSuccess}
              onSuccessAction={handleFormSuccess}
            />
            <DialogFooter>
              *{" "}
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
                form="teacher-form"
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        filterColumn="nom_complet"
        filterPlaceholder="Rechercher par nom..."
      />

      {/* Édition d'un enseignant */}
      <Dialog
        open={!!editingTeacher}
        onOpenChange={(open) => !open && setEditingTeacher(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'enseignant</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "{editingTeacher?.nom_complet}
              ".
            </DialogDescription>
          </DialogHeader>
          {editingTeacher && (
            <TeacherForm
              onSuccess={handleEditFormSuccess}
              onSuccessAction={handleEditFormSuccess}
              initialData={{
                id: editingTeacher.id,
                nom_complet: editingTeacher.nom_complet,
                email: editingTeacher.email || "",
              }}
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTeacher(null)}
            >
              Annuler
            </Button>
            <Button type="submit" form="teacher-form">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingTeacher}
        onOpenChange={(open) => !open && setDeletingTeacher(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet enseignant ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. "{deletingTeacher?.nom_complet}" sera
              supprimé de la base de données.
              {deletingTeacher && deletingTeacher.nombre_cours > 0 && (
                <span className="block mt-2 text-red-600">
                  Attention : cet enseignant a {deletingTeacher.nombre_cours}{" "}
                  cours associé(s). La suppression sera refusée tant que ces
                  enseignements ne sont pas retirés ou réassignés.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTeacher(null)}
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
