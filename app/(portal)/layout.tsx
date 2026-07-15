import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/helpers";
import { PortalShell } from "@/components/portal-shell";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  const dictionary = await getDictionary();

  return (
    <PortalShell
      role={authUser.role}
      fullName={authUser.fullName}
      dict={dictionary}
    >
      {children}
    </PortalShell>
  );
}
