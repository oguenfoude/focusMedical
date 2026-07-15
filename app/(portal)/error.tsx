"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="glass-card max-w-lg w-full p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden border border-destructive/20 text-center">
        <div className="absolute top-0 end-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -me-10 -mt-10" />
        <div className="absolute bottom-0 start-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ms-10 -mb-10" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6 shadow-inner">
            <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
            Quelque chose s&apos;est mal passe
          </h1>

          <p className="text-muted-foreground font-medium mb-6">
            Une erreur inattendue s&apos;est produite lors du chargement de cette page.
          </p>

          <div className="w-full bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-8 text-start overflow-hidden">
            <p className="text-xs font-mono text-destructive break-words">
              {error.message || "Une erreur inconnue s'est produite"}
            </p>
          </div>

          <Button
            onClick={reset}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <RefreshCcw className="me-2 h-4 w-4" />
            Reessayer
          </Button>
        </div>
      </div>
    </div>
  );
}
