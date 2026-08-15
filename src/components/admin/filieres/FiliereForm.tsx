// components/admin/filieres/FiliereForm.tsx
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
import { FiliereProfile } from "./columns";

const formSchema = z.object({
  nom_filiere: z.string().min(2, {
    message: "Le nom de la filière doit contenir au moins 2 caractères.",
  }),
  niveau: z
    .string()
    .min(1, { message: "Le niveau est requis (ex: L1, L2, L3, M1, M2)." }),
});

export type FiliereFormValues = z.infer<typeof formSchema>;

interface FiliereFormProps {
  onSuccessAction: () => void;
  initialData?: FiliereProfile;
}

export function FiliereForm({
  onSuccessAction,
  initialData,
}: FiliereFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<FiliereFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_filiere: initialData?.nom_filiere ?? "",
      niveau: initialData?.niveau ?? "",
    },
  });

  async function onSubmit(values: FiliereFormValues) {
    try {
      const url = isEditMode
        ? `/api/admin/filieres/${initialData!.id}`
        : "/api/admin/filieres";
      const method = isEditMode ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        // Duplicate (nom_filiere, niveau) pair
        if (response.status === 409) {
          form.setError("nom_filiere", {
            type: "manual",
            message: "Cette filière existe déjà pour ce niveau.",
          });
          form.setError("niveau", {
            type: "manual",
            message: "Cette filière existe déjà pour ce niveau.",
          });
          return;
        }

        throw new Error(
          result.error ||
            (isEditMode ? "Échec de la mise à jour." : "Échec de l'ajout."),
        );
      }

      toast(isEditMode ? "Filière modifiée!" : "Filière ajoutée!", {
        description: `"${values.nom_filiere}" a été ${
          isEditMode ? "mise à jour" : "ajoutée"
        } avec succès.`,
      });
      form.reset();
      onSuccessAction();
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Erreur lors de la modification de la filière:"
          : "Erreur lors de l'ajout de la filière:",
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
        id="filiere-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nom_filiere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la filière</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Génie Logiciel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="niveau"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau</FormLabel>
              <FormControl>
                <Input placeholder="Ex: L3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
