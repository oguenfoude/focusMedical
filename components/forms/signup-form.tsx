"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, Upload } from "lucide-react";
import { signUp } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/i18n/types";

export function SignupForm({ dict }: { dict: Dictionary }) {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [clinicData, setClinicData] = useState({
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(signUp, {
    error: "",
    fields: {},
  });

  function handleStep1Next(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep(2);
  }

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
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{dict.auth.createYourAccount}</h1>
            <p className="text-muted-foreground font-medium">{dict.auth.setUpClinic}</p>
          </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
            1
          </div>
          <div className={`h-0.5 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-border"}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            2
          </div>
        </div>

        {state.error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2">
            {state.error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Next} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="fullName" className="text-sm font-semibold text-foreground/80">{dict.auth.fullName} *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={step1Data.fullName}
                onChange={(e) => setStep1Data({ ...step1Data, fullName: e.target.value })}
                placeholder="Dr. Ahmed Benali"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">{dict.auth.email} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={step1Data.email}
                onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                placeholder="you@example.com"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">{dict.auth.password} *</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={step1Data.password}
                onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                placeholder={dict.common.minLength} 
                className="h-12" 
                required 
                minLength={6}
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80">{dict.auth.phone}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={step1Data.phone}
                onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
                placeholder="0555 12 34 56"
                className="h-12"
              />
            </div>
            <Button type="submit" className="h-12 w-full font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2">
              {dict.auth.nextClinicDetails}
            </Button>
          </form>
        ) : (
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="fullName" value={step1Data.fullName} />
            <input type="hidden" name="email" value={step1Data.email} />
            <input type="hidden" name="password" value={step1Data.password} />
            <input type="hidden" name="phone" value={step1Data.phone} />

            <div className="space-y-2.5">
              <Label htmlFor="clinicName" className="text-sm font-semibold text-foreground/80">{dict.auth.clinicName} *</Label>
              <Input
                id="clinicName"
                name="clinicName"
                value={clinicData.clinicName}
                onChange={(e) => setClinicData({ ...clinicData, clinicName: e.target.value })}
                placeholder="e.g. Focus Medical Clinic"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="clinicAddress" className="text-sm font-semibold text-foreground/80">{dict.auth.clinicAddress}</Label>
              <Input
                id="clinicAddress"
                name="clinicAddress"
                value={clinicData.clinicAddress}
                onChange={(e) => setClinicData({ ...clinicData, clinicAddress: e.target.value })}
                placeholder="e.g. 123 Rue Didouche Mourad, Algiers"
                className="h-12"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="clinicPhone" className="text-sm font-semibold text-foreground/80">{dict.auth.clinicPhone}</Label>
              <Input
                id="clinicPhone"
                name="clinicPhone"
                type="tel"
                value={clinicData.clinicPhone}
                onChange={(e) => setClinicData({ ...clinicData, clinicPhone: e.target.value })}
                placeholder="e.g. 021 23 45 67"
                className="h-12"
              />
            </div>
            <div className="space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
              <Label className="text-sm font-semibold text-foreground/80">{dict.auth.clinicLogoOptional}</Label>
              <input 
                ref={fileInputRef}
                id="logo" 
                name="logo" 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-full min-w-0 rounded-xl border border-dashed border-border bg-muted/30 px-4 items-center gap-3 hover:bg-muted/50 hover:border-primary/50 transition-colors"
              >
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {logoFile ? logoFile.name : dict.auth.chooseLogo}
                </span>
              </button>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 rounded-xl"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="h-4 w-4 me-1" />
                {dict.auth.back}
              </Button>
              <Button type="submit" className="h-12 flex-1 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5" disabled={isPending}>
                {isPending ? dict.auth.creatingAccount : dict.auth.createAccountButton}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm font-medium text-muted-foreground">
          {dict.auth.hasAccount}{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
            {dict.auth.signInLink}
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
