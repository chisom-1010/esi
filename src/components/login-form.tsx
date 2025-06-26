// components/auth/LoginForm.tsx (ou selon votre structure)
"use client";

import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // <<== Assurez-vous que ce chemin est correct
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Définissez vos chemins de redirection ici pour une gestion centralisée
const REDIRECT_PATHS = {
  admin: "/admin/dashboard",
  data_entry_personnel: "/data-entry/enter-evaluation",
  etudiant: "/student-form", // Gardé pour l'exemple
  enseignant: "/teacher-dashboard", // Gardé pour l'exemple
  default: "/dashboard", // Chemin par défaut si aucun rôle ne correspond ou si profil absent
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient(); // Utilise votre helper client
    setIsLoading(true);
    setError(null);

    try {
      // 1. Tenter la connexion
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      // 2. Gérer les erreurs de connexion
      if (signInError) {
        console.error("Erreur de connexion:", signInError);
        setError("Email ou mot de passe invalide. Veuillez réessayer.");
        setIsLoading(false);
        return;
      }

      // 3. Vérifier si l'utilisateur est bien retourné
      if (!authData.user) {
        setError(
          "Impossible de récupérer les informations utilisateur après la connexion.",
        );
        setIsLoading(false);
        return;
      }

      // 4. Récupérer le profil et le rôle
      //    Note : Assurez-vous que RLS permet à l'utilisateur de lire son propre profil !
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single(); // .single() retourne un seul objet ou null/erreur

      if (profileError) {
        console.error("Erreur de récupération du profil:", profileError);
        setError(
          "Impossible de récupérer le rôle utilisateur. Redirection par défaut.",
        );
        router.push(REDIRECT_PATHS.default);
        router.refresh(); // Rafraîchit l'état côté serveur
        setIsLoading(false);
        return;
      }

      const userRole = profileData?.role;
      console.log("Rôle de l'utilisateur connecté :", userRole); // Pour débogage

      // 5. Rediriger selon le rôle
      let redirectPath = REDIRECT_PATHS.default; // Chemin par défaut

      if (userRole === "admin") {
        redirectPath = REDIRECT_PATHS.admin;
      } else if (userRole === "data_entry_personnel") {
        // <<== AJOUTÉ ICI
        redirectPath = REDIRECT_PATHS.data_entry_personnel;
      } else if (userRole === "etudiant") {
        redirectPath = REDIRECT_PATHS.etudiant;
      } else if (userRole === "enseignant") {
        redirectPath = REDIRECT_PATHS.enseignant;
      } else {
        console.warn(
          `Rôle non reconnu ('${userRole}') ou profil manquant. Redirection par défaut.`,
        );
      }

      router.push(redirectPath);
      router.refresh(); // Important pour mettre à jour les composants serveur
    } catch (error: unknown) {
      console.error("Erreur inattendue lors du login:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.",
      );
      setIsLoading(false); // Assurer que le chargement s'arrête en cas d'erreur inattendue
    }
    // Pas besoin de setIsLoading(false) ici car la redirection va changer de page
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Veuillez entrer votre email et mot de passe pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se Connecter"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Pas de compte ?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                S'inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
