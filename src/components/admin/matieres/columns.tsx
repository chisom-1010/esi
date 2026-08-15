// components/admin/matieres/columns.tsx
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

export type MatiereProfile = {
  id: string;
  nom_matiere: string;
  code_matiere: string | null;
  created_at: string;
};

export function createMatiereColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (matiere: MatiereProfile) => void;
  onDelete: (matiere: MatiereProfile) => void;
}): ColumnDef<MatiereProfile>[] {
  return [
    {
      accessorKey: "nom_matiere",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Matière
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "code_matiere",
      header: "Code",
      cell: ({ row }) => <div>{row.original.code_matiere || "N/A"}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const matiere = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(matiere)}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(matiere)}
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
