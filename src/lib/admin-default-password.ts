// lib/admin-default-password.ts

// Mot de passe par défaut utilisé quand un admin réinitialise le compte d'un
// utilisateur, ou en crée un nouveau directement. Différencié par rôle
// (les admins et le personnel de saisie ne devraient pas partager le même
// mot de passe par défaut que les étudiants). Configurable via les
// variables d'environnement DEFAULT_ADMIN_PASSWORD / DEFAULT_STUDENT_PASSWORD
// (côté serveur uniquement, ne jamais préfixer NEXT_PUBLIC_).
//
// ⚠️ Compromis de sécurité assumé (demandé explicitement) : ce mot de passe
// est partagé par tous les comptes fraîchement créés/réinitialisés d'un même
// rôle jusqu'à ce que la personne le change elle-même. Toute personne
// connaissant cette valeur pourrait se connecter à un compte réinitialisé
// avant que son titulaire ne le fasse. Pensez à définir ces variables avec
// des valeurs propres à votre déploiement (pas les valeurs par défaut
// ci-dessous). C'est atténué par must_change_password, qui force un
// changement dès la première connexion.
export function getDefaultResetPassword(role?: string | null): string {
  if (role === "admin" || role === "data_entry_personnel") {
    return process.env.DEFAULT_ADMIN_PASSWORD || "EsgisAdmin@2026";
  }
  return process.env.DEFAULT_STUDENT_PASSWORD || "EsgisEtudiant@2026";
}
