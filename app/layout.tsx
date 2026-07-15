import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FocusClinic — Gestion de Cabinet Medical",
    template: "%s | FocusClinic",
  },
  description:
    "La plateforme moderne pour gerer votre clinique, patients, rendez-vous et ordonnances. Concu pour les medecins et secretaires en Algerie.",
  keywords: [
    "cabinet medical",
    "gestion patients",
    "ordonnances",
    "rendez-vous medicaux",
    "clinique",
    "medecin",
    "secretaire",
    "Algerie",
  ],
  authors: [{ name: "FocusClinic" }],
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: "FocusClinic",
    title: "FocusClinic — Gestion de Cabinet Medical",
    description:
      "La plateforme moderne pour gerer votre clinique, patients, rendez-vous et ordonnances.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusClinic — Gestion de Cabinet Medical",
    description:
      "La plateforme moderne pour gerer votre clinique, patients, rendez-vous et ordonnances.",
  },
  icons: {
    icon: "/logo.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
