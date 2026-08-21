"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Définir le type de données pour un enseignant, correspondant à la sortie de la RPC
export type Teacher = {
  id: string;
  nom_complet: string;
  email: string | null;
  created_at: string;
  nombre_cours: number;
  nombre_evaluations?: number;
  note_moyenne?: number | null;
  pourcentage_moyen?: number | null;
};

// createColumns prend des handlers en paramètre, sur le même principe que
// createUserColumns dans user-management, pour pouvoir gérer l'état (toast,
// dialogues, rafraîchissement de la liste) depuis TeacherClientTable.
export function createColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}): ColumnDef<Teacher>[] {
  return [
    {
      accessorKey: "nom_complet",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Nom Complet
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.original.email || "N/A"}</div>,
    },
    {
      accessorKey: "nombre_cours",
      header: "Nombre de Cours",
    },
    {
      id: "note_moyenne",
      header: "Note Moyenne",
      cell: ({ row }) => {
        const { pourcentage_moyen, nombre_evaluations } = row.original;
        if (pourcentage_moyen === null || pourcentage_moyen === undefined) {
          return (
            <span className="text-sm text-muted-foreground">
              Pas encore évalué
            </span>
          );
        }
        const variant =
          pourcentage_moyen >= 70
            ? "default"
            : pourcentage_moyen >= 50
              ? "secondary"
              : "destructive";
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant as any}>{pourcentage_moyen}%</Badge>
            <span className="text-xs text-muted-foreground">
              ({nombre_evaluations} éval.)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date d'Ajout",
      cell: ({ row }) => {
        // Formate la date pour une meilleure lisibilité
        return new Date(row.original.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(teacher)}>
                  Modifier l'enseignant
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(teacher)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
