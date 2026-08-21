"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangePasswordForm } from "@/app/auth/change-password/ChangePasswordForm";

export function PasswordChangeButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="border rounded-4xl cursor-pointer">
          Changer Votre Mot de Passe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer votre mot de passe</DialogTitle>
          <DialogDescription>
            Entrez votre nouveau mot de passe ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm onSuccessAction={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
