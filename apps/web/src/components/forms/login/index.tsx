"use client";

import { useState } from "react";
import { FieldSeparator } from "@coco-kit/ui/components/ui/field";
import { MagicLinkForm } from "../magic-link";
import { LoginFields } from "./fields";
import {
  AuthContainer,
  AuthModeToggle,
  type ModeToggleProps,
} from "../../auth-ui";
import Link from "next/link";

export const LoginForm = () => {
  const [mode, setMode] = useState<ModeToggleProps["mode"]>("email-password");

  return (
    <AuthContainer
      title="Welcome back"
      subtitle={
        mode === "magic"
          ? "We'll send you a secure link to sign in."
          : "Enter your email and password to continue."
      }
    >
      <div className="flex flex-col gap-6">
        {mode === "email-password" ? <LoginFields /> : <MagicLinkForm />}

        <FieldSeparator>or</FieldSeparator>

        <AuthModeToggle mode={mode} onChange={setMode} />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
};
