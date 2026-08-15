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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Enseignant,
  Matiere,
  Filiere,
  AnneeAcademique,
  Enseignement,
} from "./columns";

// Définir le schéma Zod pour la validation du formulaire d'enseignement
const formSchema = z.object({
  enseignant_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner un enseignant valide." }),
  matiere_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner une matière valide." }),
  filiere_id: z
    .string()
    .uuid({ message: "Veuillez sélectionner une filière valide." }),
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
  filieres: Filiere[];
  anneesAcademiques: AnneeAcademique[];
  /** Si fourni, le formulaire passe en mode édition (PATCH au lieu d'un insert). */
  initialData?: Enseignement;
}

export function EnseignementForm({
  onSuccessAction,
  enseignants,
  matieres,
  filieres,
  anneesAcademiques,
  initialData,
}: EnseignementFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<EnseignementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enseignant_id: initialData?.enseignant_id ?? "",
      matiere_id: initialData?.matiere_id ?? "",
      filiere_id: initialData?.filiere_id ?? "",
      annee_academique_id: initialData?.annee_academique_id ?? "",
      volume_horaire_prevu: initialData?.volume_horaire_prevu ?? 0,
    },
  });

  async function onSubmit(values: EnseignementFormValues) {
    try {
      if (isEditMode) {
        const response = await fetch(
          `/api/admin/teachings/${initialData!.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Échec de la mise à jour.");
        }

        toast("Enseignement modifié!", {
          description: "L'enseignement a été mis à jour avec succès.",
        });
        onSuccessAction();
        return;
      }

      const { data, error } = await createSupabaseBrowserClient()
        .from("enseignement")
        .insert([
          {
            enseignant_id: values.enseignant_id,
            matiere_id: values.matiere_id,
            filiere_id: values.filiere_id,
            annee_academique_id: values.annee_academique_id,
            volume_horaire_prevu: values.volume_horaire_prevu,
          },
        ])
        .select();

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
      console.error(
        isEditMode
          ? "Erreur lors de la modification de l'enseignement:"
          : "Erreur lors de l'ajout de l'enseignement:",
        error.message,
      );
      toast(
        isEditMode
          ? "Erreur lors de la modification"
          : "Erreur lors de l'ajout",
        {
          description: error.message || "Une erreur inattendue est survenue.",
        },
      );
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Matière</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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

        {/* Sélecteur Filière */}
        <FormField
          control={form.control}
          name="filiere_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filière</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une filière" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.nom_filiere} ({filiere.niveau}) 
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
              <Select onValueChange={field.onChange} value={field.value}>
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
