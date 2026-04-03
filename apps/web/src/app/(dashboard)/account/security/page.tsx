import { ChangePasswordForm } from "@/components/forms/change-password";
import { SignOutButton } from "@/components/sign-out-button";
import React from "react";

const page = () => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Password</h1>
        <p className="text-sm text-muted-foreground">
          Change your password, or set one if you signed up using a magic link.
        </p>
      </div>

      <div className="max-w-lg">
        <ChangePasswordForm />
      </div>

      <div className="border rounded-lg p-4 pt-3 border-destructive bg-destructive/5 max-w-lg">
        <div className="flex flex-col gap-1 mb-4">
          <h2 className="text-xl font-bold">Sign out</h2>
          <p className="text-sm text-muted-foreground">
            End your current session on this device.
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
};

export default page;
