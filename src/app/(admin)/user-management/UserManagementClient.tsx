// app/(admin)/user-management/UserManagementClient.tsx
"use client";

import * as React from "react";
import {
  createUserColumns,
  type UserProfile,
} from "@/components/admin/users/columns";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserManagementClientProps {
  users: UserProfile[];
}

export function UserManagementClient({ users }: UserManagementClientProps) {
  // Utiliser un état pour les données permet une mise à jour dynamique après changement de rôle
  const [data, setData] = React.useState<UserProfile[]>(users);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Fonction pour gérer le changement de rôle (appel API)
  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "data_entry_personnel" | "etudiant",
  ) => {
    if (
      !confirm(
        `Voulez-vous vraiment changer le rôle de cet utilisateur en '${newRole}' ?`,
      )
    ) {
      return;
    }

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

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/users/${deletingUser.user_id}`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }

      setData((current) =>
        current.filter((u) => u.user_id !== deletingUser.user_id),
      );
      toast.success(
        `"${deletingUser.email || deletingUser.nom_complet}" a été supprimé.`,
      );
      setDeletingUser(null);
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Créer les colonnes en passant les handlers.
  const columns = React.useMemo(
    () =>
      createUserColumns({
        onRoleChange: handleRoleChange,
        onDelete: (user) => setDeletingUser(user),
      }),
    [],
  );

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        filterColumn="email"
        filterPlaceholder="Filtrer par email..."
      />

      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive et supprime le compte "
              {deletingUser?.email || deletingUser?.nom_complet}" ainsi que
              son accès à l'application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUser(null)}
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
