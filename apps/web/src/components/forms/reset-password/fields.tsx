"use client";

import { Button } from "@coco-kit/ui/components/ui/button";
import {
  FieldGroup,
  FieldError as FieldErrorComponent,
} from "@coco-kit/ui/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "../../auth-ui";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof schema>;

export const ResetPasswordFields = ({ token }: { token: string }) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  const isBusy = isSubmitting || isRedirecting;

  async function onSubmit(values: ResetPasswordValues) {
    form.clearErrors("root");

    const { error } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token,
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Couldn't reset your password",
      });
      return;
    }

    setIsRedirecting(true);

    router.replace("/login?reset=1");
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <FieldErrorComponent errors={errors.root ? [errors.root] : []} />

      <FieldGroup>
        <PasswordField
          registration={form.register("newPassword")}
          error={errors.newPassword}
          label="New password"
          placeholder="Create a new password"
          description="Use at least 8 characters"
          disabled={isBusy}
        />

        <PasswordField
          registration={form.register("confirmPassword")}
          error={errors.confirmPassword}
          label="Confirm password"
          placeholder="Re-enter your password"
          description="Make sure both passwords match"
          disabled={isBusy}
        />
      </FieldGroup>

      <Button type="submit" disabled={isBusy} className="w-full">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Resetting password...
          </span>
        ) : isRedirecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Redirecting to sign in...
          </span>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
};
