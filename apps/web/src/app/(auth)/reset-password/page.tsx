import { ResetPasswordForm } from "@/components/forms/reset-password";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
