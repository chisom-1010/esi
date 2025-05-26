// fichier: components/auth/SignUpForm.tsx (ou selon votre structure)
"use client";

import { cn } from "@/lib/utils"; // Assurez-vous que ce chemin est correct
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // Votre client Supabase
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

// Définir les rôles pertinents pour ce formulaire/système
// Assurez-vous que ces rôles correspondent à la contrainte `role_valide` dans votre table `profiles`
type AppRole = "data_entry_personnel";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [nomComplet, setNomComplet] = useState(""); // Renommé pour correspondre à `nom_complet`
  const [role, setRole] = useState<AppRole>("data_entry_personnel"); // Rôle par défaut
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient(); // Initialise le client Supabase
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    // AVERTISSEMENT DE SÉCURITÉ :
    // Permettre à un utilisateur de sélectionner le rôle 'admin' sur un formulaire d'inscription public
    // est une faille de sécurité majeure. L'attribution du rôle 'admin' devrait être
    // un processus contrôlé (par exemple, par un administrateur existant via une interface dédiée
    // ou manuellement dans la base de données).
    // Pour ce formulaire, considérez de ne permettre que 'data_entry_personnel' ou de supprimer la sélection de rôle
    // et d'attribuer un rôle par défaut, puis de le modifier via un processus d'administration.

    try {
      // 1. Inscription de l'utilisateur dans Supabase Auth
      // `options.data` sera stocké dans `auth.users.raw_user_meta_data`
      // Le déclencheur SQL `handle_new_user` (si actif) utilisera ces métadonnées.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // Redirection après confirmation email
          data: {
            nom_complet: nomComplet, // Assurez-vous que le trigger SQL utilise 'nom_complet'
            role: role, // Le trigger SQL utilisera ce rôle
          },
        },
      });

      if (authError) throw authError; // Gère les erreurs d'authentification (ex: utilisateur existant)
      if (!authData.user)
        throw new Error(
          "L'utilisateur n'a pas été créé dans le système d'authentification.",
        );

      // 2. Création/Mise à jour du profil dans la table `profiles`
      // Cette étape est cruciale si vous n'utilisez pas de trigger SQL ou si vous voulez
      // vous assurer que les données du profil sont à jour immédiatement avec les infos du formulaire.
      // `upsert` est utile car il créera le profil si l'ID n'existe pas (ce qui devrait être le cas
      // si le trigger n'a pas encore tourné ou n'est pas utilisé) ou le mettra à jour.
      // Le trigger `handle_new_user` (s'il est actif) insère déjà `id`, `role` et `nom_complet`
      // à partir de `raw_user_meta_data`. Cet upsert client peut donc être complémentaire
      // ou principal pour la gestion du profil.
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id, // L'ID de l'utilisateur authentifié
        nom_complet: nomComplet,
        role: role,
        // `email` n'est pas dans notre schéma `profiles` actuel. L'email principal est dans `auth.users`.
        // Si vous ajoutez une colonne `email` à `profiles`, vous pouvez l'inclure ici :
        // email: email,
        updated_at: new Date().toISOString(), // Met à jour manuellement `updated_at`
      });

      if (profileError) {
        // Si la création du profil échoue, l'utilisateur existe toujours dans `auth.users`.
        // Vous pourriez envisager une logique de compensation ici (ex: informer l'admin),
        // mais c'est complexe à gérer uniquement côté client.
        console.error(
          "Erreur lors de la création/mise à jour du profil:",
          profileError,
        );
        throw new Error(
          `L'utilisateur a été créé mais une erreur est survenue lors de la création du profil : ${profileError.message}`,
        );
      }

      // Redirection vers une page indiquant que l'inscription est réussie
      // et qu'une confirmation par email peut être nécessaire.
      router.push("/auth/sign-up-success"); // Ou une page de "Veuillez vérifier vos emails"
    } catch (error: unknown) {
      console.error("Erreur détaillée lors de l'inscription:", error);
      // Fournir des messages d'erreur plus conviviaux basés sur le type d'erreur Supabase
      if (error instanceof Error) {
        if (error.message.includes("User already registered")) {
          setError("Un compte existe déjà avec cet email.");
        } else if (
          error.message.includes("Password should be at least 6 characters")
        ) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Une erreur inconnue est survenue lors de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">S'inscrire</CardTitle>
          <CardDescription>
            Créer un nouveau compte pour l'application "Prix Annuel de
            l'Enseignement".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nom-complet">Nom et Prénom</Label>
                <Input
                  id="nom-complet"
                  type="text"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Répéter le Mot de Passe</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "S'inscrire"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
