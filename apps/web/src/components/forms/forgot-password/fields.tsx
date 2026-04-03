"use client";

import { Button } from "@coco-kit/ui/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldError as FieldErrorComponent,
} from "@coco-kit/ui/components/ui/field";
import { Input } from "@coco-kit/ui/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof schema>;

export const ForgotPasswordFields = () => {
  const emailId = useId();
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ForgotPasswordValues) {
    form.clearErrors("root");

    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Couldn't send reset link",
      });
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-[1.25rem] border border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
        If an account exists for{" "}
        <span className="font-medium text-foreground">
          {form.getValues("email")}
        </span>
        , you'll get a password reset link shortly.
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <FieldErrorComponent errors={errors.root ? [errors.root] : []} />

      <FieldGroup>
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
            />
          </FieldContent>

          {!errors.email && (
            <FieldDescription>
              Enter your email and we'll send a reset link
            </FieldDescription>
          )}

          <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <MailIcon data-icon="inline-start" />
        {isSubmitting ? "Sending link..." : "Send reset link"}
      </Button>
    </form>
  );
};
