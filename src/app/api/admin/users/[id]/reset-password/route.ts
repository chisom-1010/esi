// app/api/admin/users/[id]/reset-password/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getDefaultResetPassword } from "@/lib/admin-default-password";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: targetUserId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403 },
    );
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const defaultPassword = getDefaultResetPassword();

  const { error } = await serviceClient.auth.admin.updateUserById(
    targetUserId,
    { password: defaultPassword },
  );

  if (error) {
    console.error("Erreur réinitialisation mot de passe:", error);
    const status = error.message?.toLowerCase().includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ success: true, defaultPassword });
}
