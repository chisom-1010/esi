"use client"; // Must be a Client Component

import { useRouter } from "next/navigation";
import { CircleArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      size="lg"
      type="button"
      onClick={() => router.back()}
      className="cursor-pointer color-black border rounded-4xl"
    >
      <CircleArrowLeft />
    </Button>
  );
}
