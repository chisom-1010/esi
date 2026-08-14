// components/admin/annees-academiques/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AnneeAcademiqueProfile = {
  id: string;
  nom_annee: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function createAnneeAcademiqueColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (annee: AnneeAcademiqueProfile) => void;
  onDelete: (annee: AnneeAcademiqueProfile) => void;
}): ColumnDef<AnneeAcademiqueProfile>[] {
  return [
    {
      accessorKey: "nom_annee",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Année Académique
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "date_debut",
      header: "Début",
      cell: ({ row }) => <div>{formatDate(row.original.date_debut)}</div>,
    },
    {
      accessorKey: "date_fin",
      header: "Fin",
      cell: ({ row }) => <div>{formatDate(row.original.date_fin)}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const annee = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(annee)}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(annee)}
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
