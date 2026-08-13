// components/layout/AdminSidebar.tsx
import Link from "next/link";
import { Home, Users, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <Link
          href="/admin-dashboard"
          className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200"
        >
          SYS - Eval
        </Link>
        <ul className="mt-6">
          <li className="relative px-6 py-1">
            <Link
              href="/admin-dashboard"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <Button
                type="button"
                className="cursor-pointer color-black border rounded-4xl w-full"
              >
                <Home className="w-5 h-5" />
                <span className="ml-4">Tableau de Bord</span>
              </Button>
            </Link>
          </li>

          <li className="relative px-6 py-1">
            <Link
              href="/user-management"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Button
                type="button"
                className="cursor-pointer color-black border rounded-4xl w-full"
              >
                <Users className="w-5 h-5" />
                <span className="ml-4">Gestion Utilisateurs</span>
              </Button>
            </Link>
          </li>

          <li className="relative px-6 py-1">
            <Link
              href="/reports"
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Button
                type="button"
                className="cursor-pointer color-black border rounded-4xl w-full"
              >
                <BarChart2 className="w-5 h-5" />
                <span className="ml-4">Rapports & Stats</span>
              </Button>
            </Link>
          </li>
          {/* Ajoutez d'autres liens ici (Gestion des Saisies, etc.) */}
        </ul>
      </div>
    </aside>
  );
}
