"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailPasswordAuthSchema,
  type EmailPasswordAuth,
} from "@coco-kit/zod/schema";

import { authClient } from "@/lib/auth-client";

import { Button } from "@coco-kit/ui/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldError as FieldErrorComponent,
} from "@coco-kit/ui/components/ui/field";
import { Input } from "@coco-kit/ui/components/ui/input";

export function MagicLinkForm() {
  const emailId = useId();
  const [sent, setSent] = useState(false);

  const form = useForm<Pick<EmailPasswordAuth, "email">>({
    resolver: zodResolver(emailPasswordAuthSchema.pick({ email: true })),
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: { email: string }) {
    form.clearErrors("root");

    const { error } = await authClient.signIn.magicLink({
      email: values.email,
      callbackURL: "/account",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Couldn’t send sign-in link",
      });
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 border rounded-md pt-6 pb-4 bg-muted/40">
        <h1 className="text-xl font-semibold">Check your email</h1>

        <p className="text-sm text-muted-foreground">
          We sent a sign-in link to{" "}
          <span className="font-medium underline">{form.getValues("email")}</span>
        </p>

        <Button type="button" variant="ghost" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </div>
    );
  }

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
          />
        </FieldContent>

        {!errors.email && (
          <FieldDescription>
            We’ll send you a secure sign-in link
          </FieldDescription>
        )}

        <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending link..." : "Send sign-in link"}
      </Button>
    </form>
  );
}
