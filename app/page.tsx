import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Logo } from "@/components/logo";
import { getAuthUser } from "@/lib/auth/helpers";

export default async function Home() {
  const authUser = await getAuthUser();
  if (authUser) {
    redirect(authUser.role === "doctor" ? "/doctor" : "/secretary");
  }

  const dictionary = await getDictionary();
  const dict = dictionary.landing;
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 -start-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 -end-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-6 py-5 lg:px-12 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md shadow-primary/10 overflow-hidden p-0.5">
            <Logo className="w-8 h-8" />
          </div>
          <span className="text-xl font-extrabold tracking-tight drop-shadow-sm">FocusClinic</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
              {dict.signIn}
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="font-semibold shadow-lg shadow-primary/20">
              {dict.getStarted}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-8 shadow-sm animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary me-2 animate-pulse"></span>
            {dict.badge}
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 animate-in slide-in-from-bottom-6 duration-700 fade-in">
            {dict.title1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm">{dict.title2}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground font-medium animate-in slide-in-from-bottom-8 duration-1000 fade-in">
            {dict.subtitle}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-1000 fade-in">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-xl shadow-primary/20 group">
                {dict.ctaStart}
                <ArrowRight className="ms-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-background/50 backdrop-blur-sm border-border/50">
                {dict.ctaLogin}
              </Button>
            </Link>
          </div>
        </section>

        <section className="relative border-t border-border/40 bg-muted/10 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <div className="mx-auto max-w-6xl px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {dict.featuresTitle}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground font-medium">
                {dict.featuresSubtitle}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title={dict.feature1Title}
                description={dict.feature1Desc}
              />
              <FeatureCard
                icon={Clock}
                title={dict.feature2Title}
                description={dict.feature2Desc}
              />
              <FeatureCard
                icon={Shield}
                title={dict.feature3Title}
                description={dict.feature3Desc}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-border/40 bg-background/80 backdrop-blur-xl py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 opacity-50 grayscale" />
            <span className="text-sm font-bold text-muted-foreground">FocusClinic</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium flex items-center gap-4">
            {dict.footerText}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border/50 p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
      <div className="absolute -end-10 -top-10 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
      <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
        <Icon className="h-7 w-7 transition-transform group-hover:scale-110" />
      </div>
      <h3 className="relative z-10 text-xl font-bold tracking-tight mb-3">{title}</h3>
      <p className="relative z-10 text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}
