import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold text-blue-600">
            ESI - Prix de l'Enseignement
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              Accueil
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              Évaluations
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              Rapports
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              Contact
            </Link>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            {/* Icône menu mobile (à compléter avec Lucide) */}
          </Button>
        </div>
      </div>
    </header>
  );
}
