"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, ArrowLeft } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

export function ResetPasswordForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, isPending] = useActionState(resetPassword, {
    error: "",
    success: false,
  });

  return (
    <>
      <Link href="/" className="fixed top-6 start-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-md" title={dict.common.back}>
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="glass-card rounded-[2rem] p-8 sm:p-10 w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -me-10 -mt-10" />

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:hidden mb-4">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{dict.auth.resetPassword}</h1>
            <p className="text-sm text-muted-foreground">{dict.auth.resetPasswordSubtitle}</p>
          </div>

        {state.success ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <MailCheck className="mx-auto mb-3 h-10 w-10 text-green-600" />
              <p className="font-medium text-green-800">{dict.auth.checkEmail}</p>
              <p className="mt-1 text-sm text-green-600">
                {dict.auth.resetEmailSent}
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="h-11 w-full">
                {dict.auth.backToSignIn}
              </Button>
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            {state.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">{dict.auth.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={isPending}>
              {isPending ? dict.auth.sending : dict.auth.sendResetLink}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {dict.auth.rememberPassword}{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            {dict.auth.signInLink}
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
