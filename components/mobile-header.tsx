"use client";

import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

export function MobileHeader({
  onMenuToggle,
  isOpen,
}: {
  onMenuToggle: () => void;
  isOpen: boolean;
}) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:hidden">
      <button
        onClick={onMenuToggle}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="flex items-center gap-2">
        <Logo className="w-6 h-6" />
        <span className="text-lg font-bold tracking-tight text-foreground">FocusClinic</span>
      </div>
    </div>
  );
}
