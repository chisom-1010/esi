// components/auth/SignUpForm.tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js"; // Utilise votre helper client
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // Pour les notifications

type ClasseType = {
  id: string;
  nom_classe: string;
  niveau: string;
};

interface SignUpFormProps extends React.ComponentPropsWithoutRef<"div"> {
  classes: ClasseType[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function SignUpForm({
  classes,
  className,
  ...props
}: SignUpFormProps) {
  const [nomComplet, setNomComplet] = useState(""); // <<== AJOUTÉ
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classeId, setClasseId] = useState<string>(""); // <<== AJOUTÉ
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!classeId) {
      setError("Veuillez sélectionner votre classe.");
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user?.user_metadata);

    try {
      const { data, error: signUpError } = await (supabase as any).auth.signUp({
        email,
        password,
        options: {
          data: {
            nom_complet: nomComplet, // <<== ENVOYÉ
            classe_id: classeId, // <<== ENVOYÉ
          },
          // Optionnel: Si vous voulez rediriger vers une page de confirmation
          // emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Erreur d'inscription:", signUpError);
        setError(
          signUpError.message ||
            "Une erreur est survenue lors de l'inscription.",
        );
      } else if (data.user) {
        toast.success("Inscription réussie !", {
          description:
            "Veuillez vérifier votre email pour confirmer votre compte (si activé).",
        });
        // Rediriger vers la page de login ou une page d'attente
        router.push("/auth/login");
      } else {
        setError("Un problème est survenu. L'utilisateur n'a pas été créé.");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inscription Étudiant</CardTitle>
          <CardDescription>
            Créez votre compte pour évaluer vos enseignements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {/* Nom Complet */}
              <div className="grid gap-2">
                <Label htmlFor="nomComplet">Nom Complet</Label>
                <Input
                  id="nomComplet"
                  type="text"
                  placeholder="Prénom Nom"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {/* Email */}
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
              {/* Mot de passe */}
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6} // Recommandé par Supabase
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {/* Sélection Classe */}
              <div className="grid gap-2">
                <Label htmlFor="classe-select">Classe</Label>
                <Select
                  value={classeId}
                  onValueChange={setClasseId}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="classe-select">
                    <SelectValue placeholder="Sélectionnez votre classe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classe) => (
                      <SelectItem key={classe.id} value={classe.id}>
                        {`${classe.nom_classe} (${classe.niveau})`}
                      </SelectItem>
                    ))}
                    {classes.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">
                        Aucune classe trouvée.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Inscription..." : "S'inscrire"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Déjà un compte ?{" "}
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
