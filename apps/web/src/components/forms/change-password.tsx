"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";

import { Button } from "@coco-kit/ui/components/ui/button";
import { FieldError as FieldErrorComponent } from "@coco-kit/ui/components/ui/field";
import { PasswordField } from "../auth-ui";

// ─── Schemas ────────────────────────────────────────────────────────────────

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

const setSchema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

type ChangeValues = z.infer<typeof changeSchema>;
type SetValues = z.infer<typeof setSchema>;

type Notice = { message: string; tone: "success" } | null;

// ─── Component ──────────────────────────────────────────────────────────────

export function ChangePasswordForm() {
  const [notice, setNotice] = useState<Notice>(null);
  // null = loading, true = has credential account, false = magic-link only
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);

  useEffect(() => {
    authClient.listAccounts().then(({ data, error }) => {
      if (error || !data) {
        // Only fill in the null slot; don't overwrite a value already set by onSetPassword
        setHasPassword((current) => current ?? true);
        return;
      }

      setHasPassword(
        (current) => current ?? data.some((a) => a.providerId === "credential"),
      );
    });
  }, []);

  // ── Change password form (existing password) ────────────────────────────
  const changeForm = useForm<ChangeValues>({
    resolver: zodResolver(changeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  async function onChangePassword(values: ChangeValues) {
    setNotice(null);
    changeForm.clearErrors("root");

    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: false,
    });

    if (error) {
      changeForm.setError("root", {
        message:
          error.code === "INVALID_PASSWORD"
            ? "Your current password is incorrect"
            : "Couldn't update password. Try again.",
      });
      return;
    }

    changeForm.reset();
    setNotice({ message: "Password updated successfully.", tone: "success" });
  }

  // ── Set password form (no existing password) ────────────────────────────
  const setForm = useForm<SetValues>({
    resolver: zodResolver(setSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  async function onSetPassword(values: SetValues) {
    setNotice(null);
    setForm.clearErrors("root");

    const response = await apiClient.api.account["set-password"].$post({
      json: { newPassword: values.newPassword },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setForm.setError("root", {
        message:
          (payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : null) ?? "Failed to set password. Try again.",
      });
      return;
    }

    setForm.reset();
    setNotice({ message: "Password set successfully. You can now sign in with email and password.", tone: "success" });
    setHasPassword(true);
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (hasPassword === null) {
    return <div className="h-52 animate-pulse rounded-[1.25rem] bg-muted/40" />;
  }

  // ── Set password ─────────────────────────────────────────────────────────

  if (!hasPassword) {
    const { formState: { errors, isSubmitting } } = setForm;

    return (
      <div className="space-y-5">
        <div className="rounded-[1.25rem] border border-border bg-muted/40 px-5 py-4 text-sm">
          <p className="font-medium text-foreground">No password set up yet</p>
          <p className="mt-1 text-muted-foreground">
            Your account uses magic link sign-in and doesn't have a password.
            Set one up to also sign in with email and password.
          </p>
          {!showSetForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowSetForm(true)}
            >
              Set password
            </Button>
          )}
        </div>

        {showSetForm && (
          <form
            onSubmit={setForm.handleSubmit(onSetPassword)}
            className="space-y-5"
            noValidate
          >
            <FieldErrorComponent errors={errors.root ? [errors.root] : []} />

            {notice && !errors.root && (
              <p className="rounded-[1.25rem] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                {notice.message}
              </p>
            )}

            <PasswordField
              label="New password"
              placeholder="Enter new password"
              registration={setForm.register("newPassword")}
              error={errors.newPassword}
              description="At least 8 characters"
            />

            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter new password"
              registration={setForm.register("confirmNewPassword")}
              error={errors.confirmNewPassword}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Setting password..." : "Set password"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  // ── Change password ──────────────────────────────────────────────────────

  const { formState: { errors, isSubmitting } } = changeForm;

  return (
    <form
      onSubmit={changeForm.handleSubmit(onChangePassword)}
      className="space-y-5"
      noValidate
    >
      <FieldErrorComponent errors={errors.root ? [errors.root] : []} />

      {notice && !errors.root && (
        <p className="rounded-[1.25rem] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {notice.message}
        </p>
      )}

      <PasswordField
        label="Current password"
        placeholder="Enter current password"
        registration={changeForm.register("currentPassword")}
        error={errors.currentPassword}
        description="Needed to confirm it's really you"
      />

      <PasswordField
        label="New password"
        placeholder="Enter new password"
        registration={changeForm.register("newPassword")}
        error={errors.newPassword}
        description="At least 8 characters"
      />

      <PasswordField
        label="Confirm new password"
        placeholder="Re-enter new password"
        registration={changeForm.register("confirmNewPassword")}
        error={errors.confirmNewPassword}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving changes..." : "Change password"}
      </Button>
    </form>
  );
}
