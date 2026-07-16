"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="h-12 px-8 font-semibold"
      onClick={() => router.back()}
    >
      <ArrowLeft className="me-2 h-4 w-4" />
      {label}
    </Button>
  );
}
