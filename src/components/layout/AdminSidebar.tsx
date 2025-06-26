// components/layout/AdminSidebar.tsx
import Link from "next/link";
import { Home, Users, BarChart2 } from "lucide-react"; // Exemples d'icônes

export function AdminSidebar() {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
        >
          ESI - Prix Ens.
        </Link>
        <ul className="mt-6">
          <li className="relative px-6 py-3">
            <Link
              href="/admin-dashboard"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Home className="w-5 h-5" />
              <span className="ml-4">Tableau de Bord</span>
            </Link>
          </li>
          <li className="relative px-6 py-3">
            <Link
              href="/user-management"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Users className="w-5 h-5" />
              <span className="ml-4">Gestion Utilisateurs</span>
            </Link>
          </li>
          <li className="relative px-6 py-3">
            <Link
              href="/reports"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <BarChart2 className="w-5 h-5" />
              <span className="ml-4">Rapports & Stats</span>
            </Link>
          </li>
          {/* Ajoutez d'autres liens ici (Gestion des Saisies, etc.) */}
        </ul>
      </div>
    </aside>
  );
}
