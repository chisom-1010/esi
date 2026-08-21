"use client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Les comptes sont créés par le personnel de saisie / Directeur Pédagogique,
// qui communique un mot de passe par défaut physiquement dans
// l'établissement. Il n'y a donc pas d'auto-réinitialisation par email : la
// personne doit s'adresser directement à l'administration pour obtenir une
// réinitialisation (voir "Gestion des Utilisateurs" côté admin).
export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            La réinitialisation ne se fait pas en ligne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Adressez-vous au Directeur Pédagogique de votre établissement
            pour la réinitialisation de votre mot de passe.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
