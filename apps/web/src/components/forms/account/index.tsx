"use client";

import { Button } from "@coco-kit/ui/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@coco-kit/ui/components/ui/field";
import { Input } from "@coco-kit/ui/components/ui/input";
import { useId } from "react";
import type { Notice, AccountUser } from "./use-account-form";
import { useAccountForm } from "./use-account-form";
import { Loader2, Mail } from "lucide-react";

function NoticeBanner({ notice }: { notice: Notice }) {
  if (!notice) return null;

  const toneClasses =
    notice.tone === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : notice.tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
        : "border-border bg-muted/40-foreground";

  return (
    <p
      role={notice.tone === "error" ? "alert" : "status"}
      className={`rounded-[1.25rem] border px-4 py-3 text-sm ${toneClasses}`}
    >
      {notice.message}
    </p>
  );
}

type AccountFormProps = {
  user: AccountUser;
};

export function AccountForm({ user }: AccountFormProps) {
  const nameId = useId();
  const emailId = useId();

  const {
    form,
    profile,
    pendingEmail,
    notice,
    isResendingVerification,
    onSubmit,
    handleResendVerification,
  } = useAccountForm(user);

  const {
    formState: { errors, isSubmitting, isDirty },
  } = form;

  return (
    <article>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {errors.root?.message ? (
          <NoticeBanner
            notice={{ message: errors.root.message, tone: "error" }}
          />
        ) : null}

        {!errors.root?.message ? <NoticeBanner notice={notice} /> : null}

        <FieldGroup>
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor={nameId}>Display Name</FieldLabel>
            <Input
              id={nameId}
              placeholder="Your name"
              {...form.register("name")}
              aria-invalid={!!errors.name || undefined}
            />
            {errors.name ? (
              <FieldDescription>{errors.name.message}</FieldDescription>
            ) : (
              <FieldDescription>
                How your name appears across the app.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.email || undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-x-2">
                <FieldLabel htmlFor={emailId}>Email Address</FieldLabel>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    profile.emailVerified
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {profile.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              {!profile.emailVerified ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}

                  {isResendingVerification
                    ? "Sending..."
                    : "Resend verification"}
                </Button>
              ) : null}
            </div>
            <Input
              id={emailId}
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
              aria-invalid={!!errors.email || undefined}
            />
            {errors.email ? (
              <FieldDescription>{errors.email.message}</FieldDescription>
            ) : pendingEmail ? (
              <FieldDescription>
                We sent a confirmation link to your current inbox — approve it
                to switch to{" "}
                <span className="font-medium underline">{pendingEmail}</span>.
              </FieldDescription>
            ) : (
              <FieldDescription>
                Changing your email? We'll send a link to your current inbox to
                confirm before switching.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
          {isDirty ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({ email: profile.email, name: profile.name });
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
