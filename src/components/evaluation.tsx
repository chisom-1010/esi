"use client";
// components/EvaluationForm.tsx
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EvaluationForm = () => {
  const supabase = createClient();

  const { register, handleSubmit } = {
    register: () => ({}),
    handleSubmit: (fn: any) => (e: React.FormEvent) => {
      e.preventDefault();
      fn({});
    },
  }; // Placeholder to fix diagnostics if useForm is not available

  const onSubmit = async (data: any) => {
    await supabase.from("evaluations").insert([data]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Sections I à VIII avec champs radio */}
      <button type="submit">Soumettre</button>
    </form>
  );
};
