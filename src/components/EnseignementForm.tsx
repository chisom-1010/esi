// components/EnseignementForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // Assurez-vous que le chemin est correct pour votre client Supabase côté client
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Enseignant, Matiere, Classe, AnneeAcademique } from "./columns"; // Importer les types définis

// Définir le schéma Zod pour la validation du formulaire d'enseignement
const formSchema = z.object({
  enseignant_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner un enseignant valide." }),
  matiere_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner une matière valide." }),
  classe_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner une classe valide." }),
  annee_academique_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner une année académique valide." }),
  volume_horaire_prevu: z.coerce
    .number()
    .min(1, {
      message: "Le volume horaire prévu doit être d'au moins 1 heure.",
    })
    .max(1000, {
      message: "Le volume horaire ne doit pas dépasser 1000 heures.",
    }),
});

export type EnseignementFormValues = z.infer<typeof formSchema>;

interface EnseignementFormProps {
  onSuccessAction: () => void; // Callback pour fermer le dialogue ou rafraîchir les données
  enseignants: Enseignant[];
  matieres: Matiere[];
  classes: Classe[];
  anneesAcademiques: AnneeAcademique[];
}

export function EnseignementForm({
  onSuccessAction,
  enseignants,
  matieres,
  classes,
  anneesAcademiques,
}: EnseignementFormProps) {
  const form = useForm<EnseignementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enseignant_id: "",
      matiere_id: "",
      classe_id: "",
      annee_academique_id: "",
      volume_horaire_prevu: 0,
    },
  });

  async function onSubmit(values: EnseignementFormValues) {
    try {
      const { data, error } = await createSupabaseBrowserClient()
        .from("enseignement") // Le nom de votre table des enseignements
        .insert([
          {
            enseignant_id: values.enseignant_id,
            matiere_id: values.matiere_id,
            classe_id: values.classe_id,
            annee_academique_id: values.annee_academique_id,
            volume_horaire_prevu: values.volume_horaire_prevu,
          },
        ])
        .select(); // Pour récupérer les données insérées

      if (error) {
        throw error;
      }

      console.log("Enseignement ajouté avec succès:", data);

      toast("Enseignement ajouté!", {
        description: "Le nouvel enseignement a été ajouté avec succès.",
      });

      form.reset();
      onSuccessAction();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'enseignement:", error.message);
      toast("Erreur lors de l'ajout", {
        description:
          error.message ||
          "Une erreur inattendue est survenue lors de l'ajout de l'enseignement.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        id="enseignement-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Sélecteur Enseignant */}
        <FormField
          control={form.control}
          name="enseignant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enseignant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un enseignant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enseignants.map((enseignant) => (
                    <SelectItem key={enseignant.id} value={enseignant.id}>
                      {enseignant.nom_complet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sélecteur Matière */}
        <FormField
          control={form.control}
          name="matiere_id"
          render={({ field }) => (
            <FormItem>
              EnseugnementFormEnseugnementForm
              <FormLabel>Matière</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une matière" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.nom_matiere}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sélecteur Classe */}
        <FormField
          control={form.control}
          name="classe_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une classe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom_classe} ({classe.niveau})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sélecteur Année Académique */}
        <FormField
          control={form.control}
          name="annee_academique_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année Académique</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une année académique" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {anneesAcademiques.map((annee) => (
                    <SelectItem key={annee.id} value={annee.id}>
                      {annee.nom_annee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champ Volume Horaire */}
        <FormField
          control={form.control}
          name="volume_horaire_prevu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume Horaire Prévu</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Le bouton de soumission est dans le DialogFooter */}
      </form>
    </Form>
  );
}
