import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reinitialiser le mot de passe",
  description: "Recevez un lien pour reinitialiser votre mot de passe.",
};

export default async function ResetPasswordPage() {
  const dictionary = await getDictionary();

  return <ResetPasswordForm dict={dictionary} />;
}
