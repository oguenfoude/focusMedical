import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SignupForm } from "@/components/forms/signup-form";

export default async function SignupPage() {
  const dictionary = await getDictionary();

  return <SignupForm dict={dictionary} />;
}
