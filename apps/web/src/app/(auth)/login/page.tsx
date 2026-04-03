import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";
import { LoginForm } from "@/components/forms/login";

export default async function LoginPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (session?.user) {
    redirect("/account");
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
