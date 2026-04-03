import { Button } from "@coco-kit/ui/components/ui/button";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/forms/account";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthSession } from "@/lib/auth-session";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-sm text-muted-foreground">
          This information will be displayed publicly so be careful what you
          share.
        </p>
      </div>
      <div className="max-w-lg">
        <AccountForm user={user} />
      </div>
    </div>
  );
}
