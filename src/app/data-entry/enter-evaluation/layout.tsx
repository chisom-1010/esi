// app/data-entry/enter-evaluation/layout.tsx
import { createServerClient } from "@supabase/ssr"; // Ou votre client serveur @supabase/ssr
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { EtudiantHeader } from "@/components/layout/EtudiantHeader";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getUserRoleServer(supabase: any): Promise<string | null> {
  // ... (Votre fonction existante pour récupérer le rôle)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role || user.user_metadata?.role || null;
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const role = await getUserRoleServer(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen h-dvh bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Barre Latérale Admin - cachée sur mobile */}

      {role === "admin" ? <AdminSidebar /> : null}

      {/* Contenu Principal */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        {/* En-tête */}
        {role === "admin" ? (
          <AdminHeader userEmail={user?.email} />
        ) : (
          <EtudiantHeader userEmail={user?.email} />
        )}
        {/* Espace de Contenu */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
