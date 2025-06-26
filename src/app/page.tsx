// app/page.tsx
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { Mail, Users, BarChart, FileText } from "lucide-react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  // Déterminer le lien principal en fonction du statut et du rôle de l'utilisateur
  let primaryActionHref = "/auth/login"; // Par défaut pour les visiteurs
  if (user) {
    if (profile?.role === "etudiant") {
      primaryActionHref = "/data-entry/enter-evaluation"; // Lien pour les étudiants
    } else {
      primaryActionHref = "/admin-dashboard"; // Lien pour les admins/personnel
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* En-tête dynamique */}
      <Header />

      {/* Section héro */}
      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Système d'Évaluation des Enseignements
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une plateforme simple et efficace pour collecter, analyser et
            valoriser les évaluations des enseignements au sein de votre
            établissement.
          </p>
          <div className="mt-8">
            <Link href={primaryActionHref}>
              <Button size="lg">
                {user ? "Accéder à mon espace" : "Commencer l'évaluation"}
              </Button>
            </Link>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section id="features" className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Fonctionnalités Clés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Évaluations Structurées"
                description="Collectez les feedbacks des étudiants via des formulaires clairs et personnalisables."
              />
              <FeatureCard
                icon={<BarChart className="h-8 w-8 text-primary" />}
                title="Statistiques et Rapports"
                description="Générez des classements et analyses par enseignant, matière ou classe en temps réel."
              />
              <FeatureCard
                icon={<Mail className="h-8 w-8 text-primary" />}
                title="Notifications & Suivi"
                description="Soyez notifié des nouvelles évaluations et suivez facilement le taux de participation."
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8 text-primary" />}
                title="Historique des Données"
                description="Accédez aux archives pour comparer les performances et observer les tendances sur plusieurs années."
              />
            </div>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Prêt à transformer votre processus d'évaluation ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Connectez-vous pour donner votre avis ou pour consulter les
              tableaux de bord analytiques.
            </p>
            <div className="flex justify-center items-center space-x-4">
              {user ? (
                <Link href="/admin-dashboard">
                  <Button>Mon Tableau de bord</Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button>Se connecter</Button>
                </Link>
              )}

              {/* Le bouton des rapports ne s'affiche que pour les admins/personnel */}
              {(profile?.role === "admin" ||
                profile?.role === "data_entry_personnel" ||
                profile?.role === "etudiant") && (
                <Link href="/reports">
                  <Button variant="secondary">
                    Voir les rapports détaillés
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} ESI-Eval | Développé avec Passion
      </footer>
    </div>
  );
}
