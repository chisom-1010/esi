"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 1. Add TypeScript interface for the component props
interface ChangePasswordFormProps {
  onSuccessAction?: () => void; // Optional (?) so the form can still be used without it
}

// 2. Destructure the prop in the function arguments
export function ChangePasswordForm({
  onSuccessAction,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec du changement de mot de passe.");
      }

      toast.success("Mot de passe changé avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 3. Trigger the dialog close if the prop is provided
      if (onSuccessAction) {
        onSuccessAction();
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Changer mon mot de passe</CardTitle>
        <CardDescription>
          Si l'administration vous a communiqué un mot de passe par défaut,
          changez-le dès votre première connexion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">
              Confirmer le nouveau mot de passe
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Changement..." : "Changer le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
