// components/TeacherForm.tsx
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // Import your Supabase client
import { toast } from "sonner";

const formSchema = z.object({
  nom_complet: z
    .string()
    .min(2, {
      message: "Le nom complet doit contenir au moins 2 caractères.",
    })
    .max(100, {
      // Adjusted max length based on typical names
      message: "Le nom complet ne doit pas dépasser 100 caractères.",
    }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  // If you decide to add a 'telephone' column to your 'enseignant' table,
  // this field is ready. Otherwise, you can remove it from schema and form.
  telephone: z.string().optional(),
});

// Define the type for the form data based on the schema
export type TeacherFormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
  onSuccess: () => void; // Callback to close dialog or refresh data on success
  // Removed initialData as the request is to "recreate" for new teacher.
  // If editing is needed, add initialData back and adjust onSubmit logic.
}

export function TeacherForm({
  onSuccessAction,
}: TeacherFormProps & { onSuccessAction: () => void }) {
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Default values for a new teacher
      nom_complet: "",
      email: "",
      telephone: "",
    },
  });

  // Handle form submission and interact with Supabase
  async function onSubmit(values: TeacherFormValues) {
    try {
      const { nom_complet, email, telephone } = values;

      // Insert data into the 'enseignant' table
      const { data, error } = await createSupabaseBrowserClient()
        .from("enseignant") // Your table name is 'enseignant'
        .insert([
          {
            nom_complet: nom_complet,
            email: email,
            // Only include telephone if you have the column in your table
            // and want to save it. If not, remove this line.
            ...(telephone && { telephone: telephone }),
          },
        ])
        .select(); // Use .select() to get the inserted data back, if needed

      if (error) {
        throw error;
      }

      console.log("Enseignant ajouté avec succès:", data);

      toast("Enseignant ajouté!", {
        description: `"${values.nom_complet}" a été ajouté avec succès à la base de données.`,
      });

      form.reset(); // Reset form fields after successful submission
      onSuccessAction(); // Call success callback, typically to close the dialog
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'enseignant:", error.message);
      toast("Erreur lors de l'ajout", {
        description:
          error.message ||
          "Une erreur inattendue est survenue lors de l'ajout de l'enseignant.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        id="teacher-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nom_complet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom Complet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: jean.dupont@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Render telephone field conditionally if you plan to add it to DB, or remove entirely */}
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: +228 90 00 00 00"
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* The submit button is expected in the DialogFooter,
            linked by form="teacher-form" to this form. */}
      </form>
    </Form>
  );
}
