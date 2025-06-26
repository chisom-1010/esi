// components/Header.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";
import { GraduationCap } from "lucide-react";

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ESI-Eval</span>
          </Link>
          <nav>
            {user ? (
              <Link href="/admin-dashboard">
                <Button>Tableau de bord</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button>Se connecter</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
