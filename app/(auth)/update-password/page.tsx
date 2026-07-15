import { getDictionary } from "@/lib/i18n/get-dictionary";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export default async function UpdatePasswordPage() {
  const dictionary = await getDictionary();

  return <UpdatePasswordForm dict={dictionary} />;
}
