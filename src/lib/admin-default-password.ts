// lib/admin-default-password.ts

// Mot de passe par défaut utilisé quand un admin réinitialise le compte d'un
// utilisateur, ou en crée un nouveau directement. Configurable via la
// variable d'environnement DEFAULT_RESET_PASSWORD (côté serveur uniquement,
// ne jamais préfixer NEXT_PUBLIC_).
//
// ⚠️ Compromis de sécurité assumé (demandé explicitement) : ce mot de passe
// est partagé par tous les comptes fraîchement créés/réinitialisés jusqu'à
// ce que la personne le change elle-même. Toute personne connaissant cette
// valeur pourrait se connecter à un compte réinitialisé avant que son
// titulaire ne le fasse. Pensez à définir DEFAULT_RESET_PASSWORD avec une
// valeur propre à votre déploiement (pas la valeur par défaut ci-dessous),
// et à terme, à envisager de forcer un changement de mot de passe à la
// première connexion.
export function getDefaultResetPassword(): string {
  return process.env.DEFAULT_RESET_PASSWORD || "Esgis@Reset2026";
}
