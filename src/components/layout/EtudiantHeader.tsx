// components/layout/AdminHeader.tsx
// (Implémentation basique - à étoffer avec un menu déroulant pour le profil, etc.)
import { LogoutButton } from "@/components/logout-button";
import { PasswordChangeButton } from "@/components/PasswordChangeButton";

export function EtudiantHeader({
  userEmail,
}: {
  userEmail: string | undefined;
}) {
  return (
    <header className="z-10 py-3 sm:py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 h-full px-4 sm:px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* Vous pouvez ajouter un bouton pour ouvrir/fermer la sidebar sur mobile */}
        <div className="font-semibold text-sm sm:text-base">Etudiant</div>

        <div className="text-xs sm:text-sm text-center sm:text-left truncate max-w-full sm:max-w-xs">
          Connecté en tant que: <span className="font-medium">{userEmail}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="cursor-pointer">
            <LogoutButton />
          </div>
          <div className="cursor-pointer">
            <PasswordChangeButton />
          </div>
        </div>
      </div>
    </header>
  );
}
