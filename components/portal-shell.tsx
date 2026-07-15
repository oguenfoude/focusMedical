"use client";

import { useState } from "react";
import { NavSidebar } from "@/components/nav-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import type { UserRole } from "@/lib/auth/helpers";

export function PortalShell({
  role,
  fullName,
  dict,
  children,
}: {
  role: UserRole;
  fullName: string;
  dict: import("@/lib/i18n/types").Dictionary;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <NavSidebar
        role={role}
        fullName={fullName}
        dict={dict}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <MobileHeader
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          isOpen={mobileOpen}
        />
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
