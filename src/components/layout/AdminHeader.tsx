// components/layout/ AdminHeader.tsx;
import { LogoutButton } from "@/components/logout-button";
import BackButton from "@/components/BackButton";

export function AdminHeader({ userEmail }: { userEmail: string | undefined }) {
  return (
    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* ajouter un bouton pour ouvrir/fermer la sidebar sur mobile */}
        <div className="cursor-ponter">
          <BackButton />
        </div>
        <div>Administrateur</div>
        <div>Connecté en tant que: {userEmail}</div>
        <div className="cursor-pointer">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
