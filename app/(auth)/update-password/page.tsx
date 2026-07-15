import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export const metadata: Metadata = {
  title: "Mettre a jour le mot de passe",
  description: "Definissez un nouveau mot de passe pour votre compte.",
};

export default async function UpdatePasswordPage() {
  const dictionary = await getDictionary();

  return <UpdatePasswordForm dict={dictionary} />;
}
