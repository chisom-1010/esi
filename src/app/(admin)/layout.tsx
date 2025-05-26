// app/(admin)/layout.tsx
import { createServerClient } from "@supabase/ssr"; // Ou votre client serveur @supabase/ssr
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar"; // À créer
import { AdminHeader } from "@/components/layout/AdminHeader"; // À créer
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Assurez-vous d'utiliser votre helper configuré

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

  if (role !== "admin") {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre Latérale */}
      <AdminSidebar />

      {/* Contenu Principal */}
      <div className="flex flex-col flex-1 w-full">
        {/* En-tête */}
        <AdminHeader userEmail={user?.email} />

        {/* Espace de Contenu */}
        <main className="h-full overflow-y-auto">
          <div className="container px-6 py-8 mx-auto grid">
            {children} {/* C'est ici que vos pages admin s'afficheront */}
          </div>
        </main>
      </div>
    </div>
  );
}
