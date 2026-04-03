"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailPasswordAuthSchema,
  type EmailPasswordAuth,
} from "@coco-kit/zod/schema";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Button } from "@coco-kit/ui/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldError as FieldErrorComponent,
} from "@coco-kit/ui/components/ui/field";
import { Input } from "@coco-kit/ui/components/ui/input";

import { PasswordField } from "../../auth-ui";

export function LoginFields() {
  const emailId = useId();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<EmailPasswordAuth>({
    resolver: zodResolver(emailPasswordAuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: EmailPasswordAuth) {
    form.clearErrors("root");

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/account",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Invalid email or password",
      });
      return;
    }

    // success → switch state
    setIsRedirecting(true);

    router.replace("/account");
  }

  const isBusy = isSubmitting || isRedirecting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <FieldErrorComponent errors={errors.root ? [errors.root] : []} />

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor={emailId}>Email address</FieldLabel>

        <FieldContent>
          <Input
            id={emailId}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            {...form.register("email")}
            disabled={isBusy}
          />
        </FieldContent>

        {!errors.email && (
          <FieldDescription>Use the email you signed up with</FieldDescription>
        )}

        <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
      </Field>

      <PasswordField
        registration={form.register("password")}
        error={errors.password}
        showForgotPassword
        disabled={isBusy}
      />

      <Button type="submit" disabled={isBusy} className="w-full">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing you in...
          </span>
        ) : isRedirecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            You're In, Redirecting...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
