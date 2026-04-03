"use client";

import { Button } from "@coco-kit/ui/components/ui/button";
import type { User } from "@coco-kit/zod/schema";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-line bg-surface-strong p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.admin
      .listUsers({
        query: {
          filterField: "id",
          filterValue: userId,
          filterOperator: "eq",
          limit: 1,
        },
      })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message ?? "Failed to load user");
          return;
        }
        const found = data?.users?.[0];
        if (found) {
          setUser(found as unknown as User);
        } else {
          setError("User not found");
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <main className="min-h-screen bg-canvas px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="border border-line bg-surface p-6 shadow-(--shadow)">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-deep">
            Admin / Users
          </p>
          {loading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : (
            <>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {user?.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </>
          )}
          <div className="mt-5">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">← Back to users</Link>
            </Button>
          </div>
        </header>

        {user && (
          <section className="border border-line bg-surface p-6 shadow-(--shadow)">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ID" value={<span className="font-mono text-xs">{user.id}</span>} />
              <Field label="Name" value={user.name} />
              <Field label="Email" value={user.email} />
              <Field
                label="Email Verified"
                value={
                  user.emailVerified ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <Field label="Role" value={<span className="capitalize">{user.role ?? "user"}</span>} />
              <Field
                label="Status"
                value={
                  user.banned ? (
                    <span className="text-destructive">Banned</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  )
                }
              />
              {user.banned && user.banReason && (
                <Field label="Ban Reason" value={user.banReason} />
              )}
              {user.banned && user.banExpires && (
                <Field label="Ban Expires" value={formatDate(user.banExpires)} />
              )}
              {user.image && (
                <Field
                  label="Avatar"
                  value={
                    <img
                      src={user.image}
                      alt={user.name}
                      className="size-8 rounded-full object-cover"
                    />
                  }
                />
              )}
              <Field label="Joined" value={formatDate(user.createdAt)} />
              <Field label="Last Updated" value={formatDate(user.updatedAt)} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
