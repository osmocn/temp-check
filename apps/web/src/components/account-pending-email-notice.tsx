"use client";

type Props = {
  email: string;
};

export function PendingEmailNotice({ email }: Props) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-3 text-sm">
      <p className="text-muted-foreground">Pending email</p>

      <p className="mt-1 font-medium">{email}</p>

      <p className="mt-1 text-muted-foreground">
        Check your current inbox to approve this change.
      </p>
    </div>
  );
}
