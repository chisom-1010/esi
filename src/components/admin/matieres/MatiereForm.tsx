// components/admin/matieres/MatiereForm.tsx
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
import { MatiereProfile } from "./columns";

const formSchema = z.object({
  nom_matiere: z
    .string()
    .min(2, { message: "Le nom de la matière doit contenir au moins 2 caractères." }),
  code_matiere: z.string().optional(),
});

export type MatiereFormValues = z.infer<typeof formSchema>;

interface MatiereFormProps {
  onSuccessAction: () => void;
  initialData?: MatiereProfile;
}

export function MatiereForm({ onSuccessAction, initialData }: MatiereFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<MatiereFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_matiere: initialData?.nom_matiere ?? "",
      code_matiere: initialData?.code_matiere ?? "",
    },
  });

  async function onSubmit(values: MatiereFormValues) {
    try {
      const url = isEditMode
        ? `/api/admin/matieres/${initialData!.id}`
        : "/api/admin/matieres";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            (isEditMode ? "Échec de la mise à jour." : "Échec de l'ajout."),
        );
      }

      toast(isEditMode ? "Matière modifiée!" : "Matière ajoutée!", {
        description: `"${values.nom_matiere}" a été ${
          isEditMode ? "mise à jour" : "ajoutée"
        } avec succès.`,
      });

      form.reset();
      onSuccessAction();
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Erreur lors de la modification de la matière:"
          : "Erreur lors de l'ajout de la matière:",
        error.message,
      );
      toast(isEditMode ? "Erreur lors de la modification" : "Erreur lors de l'ajout", {
        description: error.message || "Une erreur inattendue est survenue.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        id="matiere-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nom_matiere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la matière</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Algorithmique" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code_matiere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ALG101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
