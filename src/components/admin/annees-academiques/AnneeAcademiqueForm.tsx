// components/admin/annees-academiques/AnneeAcademiqueForm.tsx
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
import { AnneeAcademiqueProfile } from "./columns";

const formSchema = z
  .object({
    nom_annee: z
      .string()
      .min(4, { message: "Ex: 2025-2026." }),
    date_debut: z.string().min(1, { message: "La date de début est requise." }),
    date_fin: z.string().min(1, { message: "La date de fin est requise." }),
  })
  .refine((values) => new Date(values.date_fin) > new Date(values.date_debut), {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["date_fin"],
  });

export type AnneeAcademiqueFormValues = z.infer<typeof formSchema>;

interface AnneeAcademiqueFormProps {
  onSuccessAction: () => void;
  initialData?: AnneeAcademiqueProfile;
}

// Convertit une date ISO (avec heure) en "YYYY-MM-DD" pour <input type="date">
function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function AnneeAcademiqueForm({
  onSuccessAction,
  initialData,
}: AnneeAcademiqueFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<AnneeAcademiqueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_annee: initialData?.nom_annee ?? "",
      date_debut: toDateInputValue(initialData?.date_debut),
      date_fin: toDateInputValue(initialData?.date_fin),
    },
  });

  async function onSubmit(values: AnneeAcademiqueFormValues) {
    try {
      const url = isEditMode
        ? `/api/admin/annees-academiques/${initialData!.id}`
        : "/api/admin/annees-academiques";
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

      toast(isEditMode ? "Année académique modifiée!" : "Année académique ajoutée!", {
        description: `"${values.nom_annee}" a été ${
          isEditMode ? "mise à jour" : "ajoutée"
        } avec succès.`,
      });

      form.reset();
      onSuccessAction();
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Erreur lors de la modification de l'année académique:"
          : "Erreur lors de l'ajout de l'année académique:",
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
        id="annee-academique-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nom_annee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'année académique</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 2025-2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de début</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de fin</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
