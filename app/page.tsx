import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Shield, Clock, Users, ArrowRight, FileText, Calendar, Lock, Pill, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Logo } from "@/components/logo";
import { getAuthUser } from "@/lib/auth/helpers";

export const metadata: Metadata = {
  title: "Gerez votre cabinet medical",
  description:
    "FocusClinic — La plateforme moderne pour gerer vos patients, rendez-vous et ordonnances medicales en Algerie.",
};

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
        {/* Hero Section */}
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

        {/* Stats Section */}
        <section className="relative border-t border-border/40 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "4600+", label: "Medicaments references" },
                { value: "2", label: "Roles (Medecin, Secretaire)" },
                { value: "100%", label: "Donnees securisees" },
                { value: "24/7", label: "Accessble en ligne" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
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
                icon={Calendar}
                title={dict.feature2Title}
                description={dict.feature2Desc}
              />
              <FeatureCard
                icon={Lock}
                title={dict.feature3Title}
                description={dict.feature3Desc}
              />
              <FeatureCard
                icon={FileText}
                title="Ordonnances Modernes"
                description="Redigez et imprimez des ordonnances A5 avec 4 templates professionnels. Generation PDF integree."
              />
              <FeatureCard
                icon={Pill}
                title="Referentiel Medicaments"
                description="Plus de 4600 medicaments du marche algerien. Recherche rapide par nom, DCI ou fabricant."
              />
              <FeatureCard
                icon={BarChart3}
                title="Suivi Financier"
                description="Enregistrez les paiements, suivez les revenus et consultez les resumees financiers du cabinet."
              />
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="relative border-t border-border/40 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Deux roles, une seule plateforme
              </h2>
              <p className="mt-4 text-lg text-muted-foreground font-medium">
                Chaque membre de l&apos;equipe a acces a ce dont il a besoin.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="glass-card rounded-2xl border border-border/50 p-8 hover:shadow-xl hover:shadow-primary/5 transition-all">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Medecin</h3>
                <ul className="space-y-2 text-muted-foreground font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Gestion complete des patients</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Consultations et ordonnances</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Referentiel de 4600+ medicaments</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Suivi des revenus et finances</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Gestion des secretaires</li>
                </ul>
              </div>
              <div className="glass-card rounded-2xl border border-border/50 p-8 hover:shadow-xl hover:shadow-primary/5 transition-all">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary mb-6">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Secretaire</h3>
                <ul className="space-y-2 text-muted-foreground font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> Gestion des patients</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> Prise de rendez-vous rapide</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> Emploi du temps hebdomadaire</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> Historique des consultations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> Interface intuitive et rapide</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative border-t border-border/40 py-24 bg-muted/10">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-6">
              Pret a moderniser votre cabinet ?
            </h2>
            <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
              Creez votre clinique en quelques minutes. Aucune carte bancaire requise.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-base shadow-xl shadow-primary/20 group">
                Commencer maintenant
                <ArrowRight className="ms-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
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
