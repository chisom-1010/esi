import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { Mail, Users, BarChart, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <Header />

      {/* Section héro */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Système d'Évaluation des Enseignants
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gérez les évaluations des enseignants, compilez les données et générez
          des statistiques pour récompenser le meilleur enseignant de l'année.
        </p>
        <div className="mt-8">
          <Link href={"/auth/sign-up"} className="cursor-pointer">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Commencer l'évaluation
            </Button>
          </Link>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités clés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Évaluation des Enseignants"
              description="Collectez les feedbacks des étudiants via un formulaire structuré."
            />
            <FeatureCard
              icon={<BarChart className="h-8 w-8 text-green-600" />}
              title="Statistiques et Rapports"
              description="Générez des classements et des analyses par enseignant, classe ou niveau."
            />
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-purple-600" />}
              title="Notifications & Alertes"
              description="Recevez des alertes pour les évaluations en retard ou incomplètes."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-red-600" />}
              title="Historique des Données"
              description="Accédez à l'historique des évaluations pour comparer les performances sur plusieurs années."
            />
          </div>
        </div>
      </section>

      {/* Appels à l'action */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connectez-vous pour saisir les évaluations ou consulter les
            résultats.
          </p>
          <div className="space-x-4">
            <Link href={"/auth/sign-up"}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Se connecter
              </Button>
            </Link>
            <Button variant="outline">Voir les rapports</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} École Supérieure des Ingénieurs (ESI) |
        Tous droits réservés
      </footer>
    </div>
  );
}
