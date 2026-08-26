// components/layout/ AdminHeader.tsx;
import { LogoutButton } from "@/components/logout-button";
import BackButton from "@/components/BackButton";

export function AdminHeader({ userEmail }: { userEmail: string | undefined }) {
  return (
    <header className="z-10 py-3 sm:py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 h-full px-4 sm:px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* ajouter un bouton pour ouvrir/fermer la sidebar sur mobile */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="cursor-pointer shrink-0">
            <BackButton />
          </div>
          <div className="font-semibold text-sm sm:text-base shrink-0">
            Administrateur
          </div>
        </div>
        <div className="text-xs sm:text-sm text-center sm:text-left truncate max-w-full sm:max-w-xs order-3 sm:order-none">
          Connecté en tant que:{" "}
          <span className="font-medium break-all sm:break-normal">
            {userEmail}
          </span>
        </div>
        <div className="cursor-pointer shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
