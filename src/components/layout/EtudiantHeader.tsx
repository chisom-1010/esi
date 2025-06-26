// components/layout/ AdminHeader.tsx;
// (Implémentation basique - à étoffer avec un menu déroulant pour le profil, etc.)
import { LogoutButton } from "@/components/logout-button";
export function EtudiantHeader({
  userEmail,
}: {
  userEmail: string | undefined;
}) {
  return (
    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* Vous pouvez ajouter un bouton pour ouvrir/fermer la sidebar sur mobile */}
        <div>Etudiant</div>
        <div>Connecté en tant que: {userEmail}</div>
        <div className="cursor-pointer">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
