import Image from "next/image";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 relative overflow-hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center p-12 shadow-2xl z-10">
        {/* Decorative background elements */}
        <div className="absolute top-0 start-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="absolute -top-[20%] -start-[10%] w-[70%] h-[70%] rounded-full bg-accent/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[20%] -end-[10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />

        <div className="relative z-10 max-w-md text-center text-primary-foreground">
          <div className="mb-8 mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl transition-transform hover:scale-105 p-2">
            <Image src="/logo.svg" alt="FocusClinic Logo" width={80} height={80} className="rounded-2xl" />
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight drop-shadow-sm">FocusClinic</h1>
          <p className="text-xl text-primary-foreground/80 font-medium">
            {dictionary.auth.sidePanelSubtitle}
          </p>
        </div>
      </div>
      <div className="flex w-full relative items-center justify-center p-6 lg:w-1/2 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-background to-secondary/30 z-0" />
        <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {children}
        </div>
      </div>
    </div>
  );
}
