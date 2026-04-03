"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AuthSessionResponse } from "@coco-kit/zod/schema";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { getEmailVerificationCallbackURL } from "@/lib/email-verification";

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
export type AccountUser = NonNullable<AuthSessionResponse>["user"];

export type Notice = {
  message: string;
  tone: "error" | "info" | "success";
} | null;

// ---------------------------------------------------------------------------
// Payload helpers — parse untyped API response fields safely
// ---------------------------------------------------------------------------

function pickString(payload: unknown, key: string, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    key in payload &&
    typeof (payload as Record<string, unknown>)[key] === "string"
  ) {
    return (payload as Record<string, unknown>)[key] as string;
  }
  return fallback;
}

function pickBoolean(
  payload: unknown,
  key: string,
  fallback: boolean,
): boolean {
  if (
    payload &&
    typeof payload === "object" &&
    key in payload &&
    typeof (payload as Record<string, unknown>)[key] === "boolean"
  ) {
    return (payload as Record<string, unknown>)[key] as boolean;
  }
  return fallback;
}

function pickStringOrNull(
  payload: unknown,
  key: string,
  fallback: string | null,
): string | null {
  if (payload && typeof payload === "object" && key in payload) {
    const v = (payload as Record<string, unknown>)[key];
    if (typeof v === "string" || v === null) return v;
  }
  return fallback;
}

function pickBooleanOrNull(
  payload: unknown,
  key: string,
): boolean | null {
  if (payload && typeof payload === "object" && key in payload) {
    const v = (payload as Record<string, unknown>)[key];
    if (typeof v === "boolean" || v === null) return v;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Notice resolver — maps callback search params to a notice message
// ---------------------------------------------------------------------------

function resolveSearchParamNotice(params: {
  emailChangeError: string | null;
  emailChanged: string | null;
  registered: string | null;
  verificationEmailSent: string | null;
}): Notice {
  const { emailChangeError, emailChanged, registered, verificationEmailSent } =
    params;

  if (emailChangeError === "email-in-use") {
    return {
      message: "That email is no longer available. Try a different address.",
      tone: "error",
    };
  }
  if (emailChangeError) {
    return {
      message: "We couldn't complete the email change from that link.",
      tone: "error",
    };
  }
  if (emailChanged === "1" && verificationEmailSent === "0") {
    return {
      message:
        "Email updated, but we couldn't send the verification email. Use resend verification.",
      tone: "info",
    };
  }
  if (emailChanged === "1") {
    return {
      message: "Email updated. Verify your new email address to finish.",
      tone: "success",
    };
  }
  if (registered === "1" && verificationEmailSent === "0") {
    return {
      message:
        "Account created, but we couldn't send the verification email. Use resend verification.",
      tone: "info",
    };
  }
  if (registered === "1") {
    return {
      message: "Account created. Verify your email address to finish.",
      tone: "success",
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAccountForm(user: AccountUser) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState({
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
  });
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
    },
  });

  // Load pending email on mount
  useEffect(() => {
    let cancelled = false;

    async function loadPendingEmail() {
      const response = await apiClient.api.account["pending-email"].$get();
      const payload = await response.json().catch(() => null);

      if (!response.ok || cancelled) return;

      setPendingEmail(pickStringOrNull(payload, "pendingEmail", null));
    }

    void loadPendingEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle callback search params (email change, registration, etc.)
  useEffect(() => {
    const emailChangeError = searchParams.get("emailChangeError");
    const emailChanged = searchParams.get("emailChanged");
    const registered = searchParams.get("registered");
    const verificationEmailSent = searchParams.get("verificationEmailSent");

    if (!emailChangeError && !emailChanged && !registered) return;

    const resolved = resolveSearchParamNotice({
      emailChangeError,
      emailChanged,
      registered,
      verificationEmailSent,
    });
    if (resolved) setNotice(resolved);

    router.replace("/account", { scroll: false });
  }, [router, searchParams]);

  async function onSubmit(values: AccountFormValues) {
    form.clearErrors("root");
    setNotice(null);

    const nextName = values.name.trim();
    const nextEmail = values.email.trim();
    const isNameChanged = nextName !== profile.name;
    const isEmailChanged = nextEmail !== profile.email;
    let savedName = profile.name;

    if (!isNameChanged && !isEmailChanged) {
      setNotice({ message: "No changes to save yet.", tone: "info" });
      return;
    }

    if (isNameChanged) {
      const { error } = await authClient.updateUser({ name: nextName });

      if (error) {
        form.setError("root", {
          message: error.message ?? "Failed to update your profile.",
        });
        return;
      }

      savedName = nextName;
      setProfile((current) => ({ ...current, name: nextName }));
    }

    if (isEmailChanged) {
      const response = await apiClient.api.account["change-email"].$post({
        json: {
          newEmail: nextEmail,
          callbackURL: "/account",
          verificationCallbackURL: getEmailVerificationCallbackURL(),
        },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        form.reset({ email: profile.email, name: savedName });
        form.setError("root", {
          message:
            pickString(payload, "message", "") ||
            (isNameChanged
              ? "Display name updated, but we couldn't start your email change."
              : "Failed to start your email change."),
        });
        return;
      }

      const currentEmail = pickString(payload, "currentEmail", profile.email);
      const emailVerified = pickBoolean(
        payload,
        "emailVerified",
        profile.emailVerified,
      );
      const nextPendingEmail = pickStringOrNull(payload, "pendingEmail", nextEmail);
      const verificationEmailSent = pickBooleanOrNull(
        payload,
        "verificationEmailSent",
      );

      setProfile((current) => ({ ...current, email: currentEmail, emailVerified }));
      setPendingEmail(nextPendingEmail);
      form.reset({ email: currentEmail, name: savedName });

      if (currentEmail === nextEmail) {
        setNotice({
          message:
            verificationEmailSent === false
              ? "Email updated, but we couldn't send the verification email. Use resend verification."
              : "Email updated. Verify your new email address to finish.",
          tone: verificationEmailSent === false ? "info" : "success",
        });
        return;
      }
    }

    form.reset({ email: profile.email, name: savedName });

    setNotice({
      message:
        isNameChanged && isEmailChanged
          ? "Profile updated. Check your current email to approve the change."
          : isEmailChanged
            ? "Check your current email to approve the change."
            : "Profile updated successfully.",
      tone: "success",
    });
  }

  async function handleResendVerification() {
    setNotice(null);
    form.clearErrors("root");
    setIsResendingVerification(true);

    const response = await apiClient.api.account["send-verification-email"].$post({
      json: { callbackURL: getEmailVerificationCallbackURL() },
    });
    const payload = await response.json().catch(() => null);

    setIsResendingVerification(false);

    if (!response.ok) {
      setNotice({
        message:
          pickString(payload, "message", "") ||
          "Failed to resend the verification email.",
        tone: "error",
      });
      return;
    }

    setNotice({
      message: `Verification email sent to ${profile.email}.`,
      tone: "success",
    });
  }

  return {
    form,
    profile,
    pendingEmail,
    notice,
    isResendingVerification,
    onSubmit,
    handleResendVerification,
  };
}
