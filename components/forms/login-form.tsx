"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { signIn } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/i18n/types";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, isPending] = useActionState(signIn, {
    error: "",
    fields: { email: "" },
  });
  const [email, setEmail] = useState(state.fields?.email ?? "");

  return (
    <>
      <Link href="/" className="fixed top-6 start-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-md" title={dict.common.back}>
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="glass-card rounded-[2rem] p-8 sm:p-10 w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -me-10 -mt-10" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-primary/10 lg:hidden mb-4 p-1">
              <Image src="/logo.svg" alt="FocusClinic Logo" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{dict.auth.welcomeBack}</h1>
            <p className="text-muted-foreground font-medium">{dict.auth.signInSubtitle}</p>
          </div>

        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2">
              {state.error}
            </div>
          )}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">{dict.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">{dict.auth.password}</Label>
              <Link href="/reset-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                {dict.auth.forgotPassword}
              </Link>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              className="h-12" 
              required 
            />
          </div>
          <Button type="submit" className="h-12 w-full font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5" disabled={isPending}>
            {isPending ? dict.auth.signingIn : dict.auth.signInButton}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-muted-foreground">
          {dict.auth.noAccount}{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors">
            {dict.auth.createAccount}
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
