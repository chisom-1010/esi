// Move sign-up logic to a server route or action
// app/api/auth/sign-up/route.ts
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { email, password, nom_complet, classe_id } = await req.json();

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      nom_complet,
      classe_id,
    },
  });

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });

  return new Response("User created", { status: 200 });
}
