// app/(admin)/user-management/UserManagementClient.tsx
"use client";

import * as React from "react";
import {
  createUserColumns,
  type UserProfile,
} from "@/components/admin/users/columns";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner"; // Assurez-vous d'avoir installé et configuré Sonner ou un équivalent

interface UserManagementClientProps {
  users: UserProfile[];
}

export function UserManagementClient({ users }: UserManagementClientProps) {
  // Utiliser un état pour les données permet une mise à jour dynamique après changement de rôle
  const [data, setData] = React.useState<UserProfile[]>(users);

  // Fonction pour gérer le changement de rôle (appel API)
  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "data_entry_personnel",
  ) => {
    // Confirmation
    if (
      !confirm(
        `Voulez-vous vraiment changer le rôle de cet utilisateur en '${newRole}' ?`,
      )
    ) {
      return;
    }

    // Mettre à jour l'API
    try {
      const response = await fetch("/api/admin/set-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la mise à jour du rôle.");
      }

      // Mettre à jour l'état local pour refléter le changement instantanément
      setData((currentData) =>
        currentData.map((user) =>
          user.user_id === userId ? { ...user, role: newRole } : user,
        ),
      );
      toast.success("Le rôle a été mis à jour avec succès !");
    } catch (err: any) {
      console.error("Erreur lors du changement de rôle:", err);
      toast.error(`Erreur : ${err.message}`);
    }
  };

  // Créer les colonnes en passant le handler.
  // Utiliser React.useMemo pour éviter de recréer les colonnes à chaque rendu,
  // sauf si `handleRoleChange` change (ce qui ne devrait pas arriver souvent ici,
  // mais c'est une bonne pratique).
  const columns = React.useMemo(() => createUserColumns(handleRoleChange), []);

  return (
    <div className="w-full">
      {/* On utilise notre composant DataTable générique */}
      <DataTable
        columns={columns}
        data={data}
        filterColumn="email" // On spécifie la colonne à filtrer
        filterPlaceholder="Filtrer par email..." // On personnalise le placeholder
      />
    </div>
  );
}
