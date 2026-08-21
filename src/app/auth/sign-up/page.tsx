// app/auth/sign-up/page.tsx
//
// L'auto-inscription publique est désactivée : les comptes étudiants sont
// désormais créés par le personnel de saisie / Directeur Pédagogique via
// "Gestion des Étudiants" (import CSV ou ajout unitaire), avec un mot de
// passe par défaut communiqué physiquement dans l'établissement.
import { redirect } from "next/navigation";

export default function SignUpPage() {
  redirect("/auth/login");
}
