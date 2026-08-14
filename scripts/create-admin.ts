// scripts/create-admin.ts
//
// Script d'installation : crée le tout premier compte administrateur d'une
// nouvelle instance SYS-Eval (nouvelle installation Supabase, nouvel
// établissement client si vous revendez le projet). Il n'existe volontairement
// aucun moyen de devenir admin depuis l'interface web (ni auto-inscription,
// ni promotion sans admin existant) — ce script, exécuté une fois en ligne
// de commande avec la clé service role, est le seul point d'entrée.
//
// Usage:
//   bun run scripts/create-admin.ts --email=admin@esgis.org --nom="Nom Complet" [--password=...]
//
// Variables d'environnement requises (déjà présentes dans .env.local si le
// projet tourne normalement):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Si --password n'est pas fourni, un mot de passe temporaire est généré
// aléatoirement et affiché une seule fois dans le terminal : notez-le et
// communiquez-le à l'administrateur, qui devra le changer dès sa première
// connexion.

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  }
  return args;
}

function generateTemporaryPassword(): string {
  // 16 caractères hexadécimaux, largement suffisant pour un mot de passe
  // temporaire à usage unique communiqué de vive voix/par écrit.
  return randomBytes(12).toString("hex");
}

async function main() {
  const args = parseArgs();
  const email = args.email?.trim();
  const nomComplet = args.nom?.trim();
  const password = args.password || generateTemporaryPassword();
  const generatedPassword = !args.password;

  if (!email || !nomComplet) {
    console.error(
      "Usage: bun run scripts/create-admin.ts --email=admin@esgis.org --nom=\"Nom Complet\" [--password=...]",
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Variables d'environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Création du compte admin pour ${email}...`);

  // Important : on n'envoie PAS de "filiere_id" dans les métadonnées, pour
  // que le trigger enforce_student_email_domain_trigger ne restreigne pas
  // cet email au format prenom.nom@esgis.org (réservé aux étudiants).
  const { data: userData, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom_complet: nomComplet },
    });

  if (createError || !userData.user) {
    console.error(
      "Échec de la création du compte:",
      createError?.message || "Erreur inconnue.",
    );
    process.exit(1);
  }

  // Le trigger handle_new_user() insère déjà une ligne "profiles" avec
  // role='etudiant' par défaut. On la met à jour explicitement en 'admin'
  // pour ne pas dépendre du comportement futur de ce trigger.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin", nom_complet: nomComplet })
    .eq("id", userData.user.id);

  if (profileError) {
    console.error(
      "Le compte a été créé mais la mise à jour du rôle a échoué:",
      profileError.message,
    );
    console.error(
      `Corrigez manuellement: update profiles set role='admin' where id='${userData.user.id}';`,
    );
    process.exit(1);
  }

  console.log("\n✅ Compte administrateur créé avec succès.");
  console.log(`   Email : ${email}`);
  if (generatedPassword) {
    console.log(`   Mot de passe temporaire : ${password}`);
    console.log(
      "   ⚠️  Communiquez ce mot de passe une seule fois et invitez l'administrateur à le changer dès sa première connexion.",
    );
  } else {
    console.log("   Mot de passe : (celui fourni via --password)");
  }
}

main();
