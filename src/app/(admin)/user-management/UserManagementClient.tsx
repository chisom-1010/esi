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
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreateAdminForm,
  type CreateAdminFormValues,
} from "@/components/admin/users/CreateAdminForm";

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
  const [resettingUser, setResettingUser] =
    React.useState<UserProfile | null>(null);
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetResultPassword, setResetResultPassword] = React.useState<
    string | null
  >(null);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = React.useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [newAdminPassword, setNewAdminPassword] = React.useState<
    string | null
  >(null);

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

  const handleConfirmReset = async () => {
    if (!resettingUser) return;

    setIsResetting(true);
    try {
      const response = await fetch(
        `/api/admin/users/${resettingUser.user_id}/reset-password`,
        { method: "POST" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la réinitialisation.");
      }

      setResetResultPassword(result.defaultPassword);
      toast.success("Mot de passe réinitialisé.");
    } catch (err: any) {
      console.error("Erreur lors de la réinitialisation:", err);
      toast.error(err.message || "Une erreur est survenue.");
      setResettingUser(null);
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetDialog = () => {
    setResettingUser(null);
    setResetResultPassword(null);
  };

  const handleCreateAdmin = async (values: CreateAdminFormValues) => {
    setIsCreatingAdmin(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la création.");
      }

      setData((current) => [
        {
          user_id: result.user.id,
          nom_complet: result.user.nom_complet,
          email: result.user.email,
          role: "admin",
          created_at: new Date().toISOString(),
        },
        ...current,
      ]);
      setNewAdminPassword(result.defaultPassword);
      toast.success("Administrateur créé.");
    } catch (err: any) {
      console.error("Erreur lors de la création de l'admin:", err);
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const closeCreateAdminDialog = () => {
    setIsCreateAdminOpen(false);
    setNewAdminPassword(null);
  };

  // Créer les colonnes en passant les handlers.
  const columns = React.useMemo(
    () =>
      createUserColumns({
        onRoleChange: handleRoleChange,
        onDelete: (u) => setDeletingUser(u),
        onResetPassword: (u) => setResettingUser(u),
      }),
    [],
  );

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Administrateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Administrateur</DialogTitle>
              <DialogDescription>
                {newAdminPassword
                  ? "Compte créé. Communiquez ce mot de passe temporaire à l'administrateur."
                  : "Crée directement un compte avec le rôle admin, sans passer par l'auto-inscription."}
              </DialogDescription>
            </DialogHeader>
            {newAdminPassword ? (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium mb-1">Mot de passe temporaire :</p>
                <code className="text-base">{newAdminPassword}</code>
                <p className="mt-2 text-muted-foreground">
                  Ce mot de passe ne sera plus affiché après fermeture de
                  cette fenêtre. Invitez la personne à le changer dès sa
                  première connexion.
                </p>
              </div>
            ) : (
              <CreateAdminForm onSubmitAction={handleCreateAdmin} />
            )}
            <DialogFooter>
              {newAdminPassword ? (
                <Button type="button" onClick={closeCreateAdminDialog}>
                  Fermer
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateAdminOpen(false)}
                    disabled={isCreatingAdmin}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    form="create-admin-form"
                    disabled={isCreatingAdmin}
                  >
                    {isCreatingAdmin ? "Création..." : "Créer"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="email"
        filterPlaceholder="Filtrer par email..."
      />

      {/* Confirmation de suppression */}
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

      {/* Réinitialisation de mot de passe */}
      <Dialog
        open={!!resettingUser}
        onOpenChange={(open) => !open && closeResetDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe ?</DialogTitle>
            <DialogDescription>
              {resetResultPassword
                ? "Mot de passe réinitialisé. Communiquez-le à la personne concernée."
                : `Le mot de passe de "${resettingUser?.email || resettingUser?.nom_complet}" sera remplacé par le mot de passe par défaut de l'établissement.`}
            </DialogDescription>
          </DialogHeader>
          {resetResultPassword && (
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-medium mb-1">Mot de passe :</p>
              <code className="text-base">{resetResultPassword}</code>
            </div>
          )}
          <DialogFooter>
            {resetResultPassword ? (
              <Button type="button" onClick={closeResetDialog}>
                Fermer
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResettingUser(null)}
                  disabled={isResetting}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                >
                  {isResetting ? "Réinitialisation..." : "Réinitialiser"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
