"use client";

import { DataTable } from "@/components/data-table"; // Assurez-vous que ce chemin est correct
import { columns, Teacher } from "./Columns";
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
import { useState } from "react";

interface TeacherClientTableProps {
  data: Teacher[];
  onTeacherAdded?: () => void;
}

export function TeacherClientTable({
  data,
  onTeacherAdded,
}: TeacherClientTableProps) {
  const handleFormSuccess = () => {
    if (onTeacherAdded) {
      onTeacherAdded();
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Liste des Enseignants
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
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
            <p className="py-4 text-center">
              Le formulaire d'ajout sera placé ici.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" form="teacher-form">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="nom_complet"
        filterPlaceholder="Rechercher par nom..."
      />
    </div>
  );
}
