// components/columns.tsx
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

// --- DÉBUT DES TYPES ---
export interface Enseignant {
  id: string; // uuid
  nom_complet: string; // text
  email: string; // text
  created_at: string; // timestampz
}

export interface Matiere {
  id: string; // uuid
  nom_matiere: string; // text
  code_matiere: string | null; // text (nullable from screenshot)
  created_at: string; // timestampz
}

// Correspond à la table réelle "filiere" (colonne enseignement.filiere_id).
export interface Filiere {
  id: string; // uuid
  nom_filiere: string; // text
  niveau: string; // text
  created_at: string; // timestampz
}

export interface AnneeAcademique {
  id: string; // uuid
  nom_annee: string; // text
  date_debut: string; // date
  date_fin: string; // date
  created_at: string; // timestampz
}

export interface Enseignement {
  id: string; // uuid
  enseignant_id: string; // uuid (FK)
  matiere_id: string; // uuid (FK)
  filiere_id: string; // uuid (FK) — anciennement nommé "classe_id" côté front, corrigé pour matcher la BDD
  annee_academique_id: string; // uuid (FK)
  volume_horaire_prevu: number; // int4
  created_at: string; // timestampz
  enseignant?: Enseignant;
  matiere?: Matiere;
  filiere?: Filiere;
  annee_academique?: AnneeAcademique;
}
// --- FIN DES TYPES ---

// createEnseignementColumns prend des handlers en paramètre (même principe
// que createColumns dans manage-teachers) pour brancher "Modifier" et
// "Supprimer" depuis EnseignementClientTable.
export function createEnseignementColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (enseignement: Enseignement) => void;
  onDelete: (enseignement: Enseignement) => void;
}): ColumnDef<Enseignement>[] {
  return [
    {
      accessorKey: "matiere",
      header: "Matière",
      cell: ({ row }) => (
        <div>{row.original.matiere?.nom_matiere || "N/A"}</div>
      ),
    },
    {
      accessorKey: "enseignant",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Enseignant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>{row.original.enseignant?.nom_complet || "N/A"}</div>
      ),
    },
    {
      accessorKey: "filiere",
      header: "Filière",
      cell: ({ row }) => (
        <div>{row.original.filiere?.nom_filiere || "N/A"}</div>
      ),
    },
    {
      accessorKey: "filiere.niveau",
      header: "Niveau",
      cell: ({ row }) => <div>{row.original.filiere?.niveau || "N/A"}</div>,
    },
    {
      accessorKey: "annee_academique",
      header: "Année Académique",
      cell: ({ row }) => (
        <div>{row.original.annee_academique?.nom_annee || "N/A"}</div>
      ),
    },
    {
      accessorKey: "volume_horaire_prevu",
      header: "Volume Horaire (h)",
      cell: ({ row }) => <div>{row.getValue("volume_horaire_prevu")}h</div>,
    },
    {
      accessorKey: "created_at",
      header: "Créé le",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const enseignement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(enseignement.id)}
              >
                Copier l'ID de l'enseignement
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = `/api/admin/teachings/${enseignement.id}/evaluations-export`)
                }
              >
                Voir les détails (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(enseignement)}>
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(enseignement)}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
