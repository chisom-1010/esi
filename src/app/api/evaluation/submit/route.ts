// app/api/evaluation/submit/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      );
    }

    const { enseignementId, responses, commentaire } = await request.json();

    if (!enseignementId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Données de formulaire invalides." },
        { status: 400 },
      );
    }

    // Appeler la fonction RPC (sans p_saisi_par_id)
    const { data: newFicheId, error: rpcError } = await supabase.rpc(
      "create_evaluation_fiche",
      {
        p_enseignement_id: enseignementId,
        p_commentaire: commentaire,
        p_reponses: responses,
      },
    );

    if (rpcError) {
      console.error("Erreur RPC create_evaluation_fiche:", rpcError);
      // Renvoyer un message plus clair si l'évaluation existe déjà
      if (rpcError.message.includes("Vous avez déjà soumis")) {
        return NextResponse.json(
          {
            error:
              "Vous avez déjà soumis une évaluation pour cet enseignement.",
          },
          { status: 409 },
        ); // 409 Conflict
      }
      return NextResponse.json(
        { error: `Erreur lors de la soumission : ${rpcError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Évaluation soumise avec succès !", ficheId: newFicheId },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Erreur API submit-evaluation:", err);
    return NextResponse.json(
      { error: err.message || "Une erreur interne est survenue." },
      { status: 500 },
    );
  }
}
