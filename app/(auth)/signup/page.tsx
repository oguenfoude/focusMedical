import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SignupForm } from "@/components/forms/signup-form";

export const metadata: Metadata = {
  title: "Creer un compte",
  description: "Creez votre clinique et commencez a gerner vos patients.",
};

export default async function SignupPage() {
  const dictionary = await getDictionary();

  return <SignupForm dict={dictionary} />;
}
