"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import type { UserRole } from "@/lib/auth/helpers";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarCheck,
  Settings,
  Pill,
  DollarSign,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Logo } from "@/components/logo";
import type { Dictionary } from "@/lib/i18n/types";

const secretaryLinks = (dict: Dictionary) => [
  { href: "/secretary", label: dict.navigation.dashboard, icon: LayoutDashboard },
  { href: "/secretary/patients", label: dict.navigation.patients, icon: Users },
  { href: "/secretary/reservations", label: dict.navigation.reservations, icon: CalendarDays },
  { href: "/secretary/schedule", label: dict.navigation.schedule, icon: CalendarCheck },
];

const doctorLinks = (dict: Dictionary) => [
  { href: "/doctor", label: dict.navigation.dashboard, icon: LayoutDashboard },
  { href: "/doctor/patients", label: dict.navigation.patients, icon: Users },
  { href: "/doctor/reservations", label: dict.navigation.reservations, icon: CalendarDays },
  { href: "/doctor/medications", label: dict.navigation.medications, icon: Pill },
  { href: "/doctor/finances", label: dict.navigation.finances, icon: DollarSign },
  { href: "/doctor/settings", label: dict.navigation.settings, icon: Settings },
];

interface NavSidebarProps {
  role: UserRole;
  fullName: string;
  dict: Dictionary;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function NavSidebar({ role, fullName, dict, mobileOpen, onMobileClose }: NavSidebarProps) {
  const pathname = usePathname();
  const links = role === "doctor" ? doctorLinks(dict) : secretaryLinks(dict);
  const storageKey = `sidebar-collapsed-${role}`;
  const [sidebarState, setSidebarState] = useState({ collapsed: false, mounted: false });

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarState({ collapsed: stored === "true", mounted: true });
  }, [storageKey]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleCollapse() {
    const next = !sidebarState.collapsed;
    setSidebarState((prev) => ({ ...prev, collapsed: next }));
    localStorage.setItem(storageKey, String(next));
  }

  function handleLinkClick() {
    if (onMobileClose) onMobileClose();
  }

  const isCollapsed = sidebarState.mounted && sidebarState.collapsed;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 pt-5 pb-2 ${isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}`}>
        <button
          onClick={toggleCollapse}
          className={`flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
            isCollapsed
              ? "h-11 w-11 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm"
              : "h-11 w-11 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm hover:shadow-md hover:from-primary/15 hover:to-primary/10"
          }`}
          title={isCollapsed ? dict.common.expandSidebar : dict.common.collapseSidebar}
        >
          <Logo className="w-7 h-7" />
        </button>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-lg font-extrabold tracking-tight text-foreground block leading-tight">FocusClinic</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">{role === "doctor" ? dict.auth.doctor : dict.auth.secretary}</span>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            title={dict.common.collapseSidebar}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isCollapsed && (
          <div className="flex justify-center mb-3">
            <button
              onClick={toggleCollapse}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={dict.common.expandSidebar}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              title={isCollapsed ? link.label : undefined}
              className={`flex items-center rounded-xl transition-all duration-150 group relative ${
                isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } text-sm font-semibold ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              }`} />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
              {isActive && !isCollapsed && (
                <div className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-e-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        {/* User section */}
        <div className={`border-t border-border/40 ${isCollapsed ? "px-3 py-3" : "px-4 py-3"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {fullName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-foreground leading-tight">{fullName}</p>
              </div>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className={`flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 group ${
                  isCollapsed ? "h-9 w-9" : "h-8 w-8"
                }`}
                title={dict.common.signOut}
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex h-screen flex-col border-e border-border/40 bg-card/80 backdrop-blur-sm relative z-20 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative flex h-full w-72 flex-col border-e border-border/40 bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
