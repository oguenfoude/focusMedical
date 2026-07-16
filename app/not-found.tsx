import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default async function NotFound() {
  const dict = await getDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 -start-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 -end-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-primary/10 overflow-hidden p-1">
            <Logo className="w-12 h-12" />
          </div>
        </div>

        {/* 404 */}
        <div className="glass-card rounded-[2rem] p-10 md:p-14 shadow-2xl border border-border/50 relative overflow-hidden">
          <div className="absolute -end-8 -top-8 h-24 w-24 rounded-full bg-primary/5" />
          <div className="absolute -start-8 -bottom-8 h-24 w-24 rounded-full bg-secondary/5" />

          <div className="relative z-10">
            <p className="text-8xl font-extrabold text-primary/20 select-none">404</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
              {dict.auth.pageNotFound}
            </h1>
            <p className="mt-4 text-muted-foreground font-medium leading-relaxed">
              {dict.auth.pageNotFoundDesc}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button className="h-12 px-8 font-semibold shadow-lg shadow-primary/20">
                  {dict.auth.goToLogin}
                </Button>
              </Link>
              <BackButton label={dict.common.back} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
