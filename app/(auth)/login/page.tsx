import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous a votre tableau de bord FocusClinic.",
};

export default async function LoginPage() {
  const dictionary = await getDictionary();

  return <LoginForm dict={dictionary} />;
}
