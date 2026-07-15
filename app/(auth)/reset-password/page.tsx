import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default async function ResetPasswordPage() {
  const dictionary = await getDictionary();

  return <ResetPasswordForm dict={dictionary} />;
}
