// components/admin/users/columns.tsx
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
import { Badge } from "@/components/ui/badge";

// Type pour nos données utilisateur (basé sur get_users_list)
export type UserProfile = {
  user_id: string;
  nom_complet: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

// Fonction pour changer le rôle (sera passée en props)
type RoleChangeHandler = (
  userId: string,
  newRole: "admin" | "data_entry_personnel",
) => Promise<void>;

// Fonction pour générer les colonnes en passant le handler
export const createUserColumns = (
  handleRoleChange: RoleChangeHandler,
): ColumnDef<UserProfile>[] => [
  {
    accessorKey: "nom_complet",
    header: "Nom Complet",
    cell: ({ row }) => <div>{row.getValue("nom_complet") || "N/A"}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variant = role === "admin" ? "default" : "secondary";
      return (
        <Badge variant={variant} className="capitalize">
          {role || "N/A"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Création",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string | null;
      return <div>{date ? new Date(date).toLocaleDateString() : "N/A"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const currentRole = user.role;

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
              onClick={() => navigator.clipboard.writeText(user.user_id)}
            >
              Copier User ID
            </DropdownMenuItem>
            {currentRole !== "admin" && (
              <DropdownMenuItem
                onClick={() => handleRoleChange(user.user_id, "admin")}
              >
                Promouvoir Admin
              </DropdownMenuItem>
            )}
            {currentRole === "admin" && (
              <DropdownMenuItem
                onClick={() =>
                  handleRoleChange(user.user_id, "data_entry_personnel")
                }
              >
                Rétrograder Personnel Saisie
              </DropdownMenuItem>
            )}
            {/* Ajoutez d'autres actions (supprimer, désactiver...) ici */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
