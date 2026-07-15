import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const dict = await getDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">{dict.auth.pageNotFound}</h1>
        <p className="mt-4 text-muted-foreground">{dict.auth.pageNotFoundDesc}</p>
        <Link href="/login" className="mt-8 inline-block">
          <Button>{dict.auth.goToLogin}</Button>
        </Link>
      </div>
    </div>
  );
}
