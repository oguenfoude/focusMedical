import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const dictionary = await getDictionary();

  return <LoginForm dict={dictionary} />;
}
