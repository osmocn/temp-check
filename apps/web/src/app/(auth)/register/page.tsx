import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";
import { RegisterForm } from "@/components/forms/register";

export default async function RegisterPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (session?.user) {
    redirect("/account");
  }

  return (
    <div>
      <RegisterForm />
    </div>
  );
}
