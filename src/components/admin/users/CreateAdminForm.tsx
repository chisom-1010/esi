// components/admin/users/CreateAdminForm.tsx
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

const formSchema = z.object({
  nom_complet: z
    .string()
    .min(2, { message: "Le nom complet doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Adresse email invalide." }),
});

export type CreateAdminFormValues = z.infer<typeof formSchema>;

interface CreateAdminFormProps {
  onSubmitAction: (values: CreateAdminFormValues) => Promise<void>;
}

export function CreateAdminForm({ onSubmitAction }: CreateAdminFormProps) {
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom_complet: "", email: "" },
  });

  return (
    <Form {...form}>
      <form
        id="create-admin-form"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmitAction(values);
          form.reset();
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nom_complet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Yassine Hamadou" {...field} />
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
                <Input placeholder="admin@esgis.org" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
