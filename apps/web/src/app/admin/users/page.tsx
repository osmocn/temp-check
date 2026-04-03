"use client";

import { buttonVariants } from "@coco-kit/ui/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@coco-kit/ui/components/ui/pagination";
import { cn } from "@coco-kit/ui/lib/utils";
import type { User } from "@coco-kit/zod/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const PAGE_SIZE = 10;

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3)
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function UsersContent() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    authClient.admin
      .listUsers({
        query: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message ?? "Failed to load users");
          return;
        }
        if (data) {
          setUsers(data.users as unknown as User[]);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const navLink = cn(
    buttonVariants({ variant: "ghost", size: "default" }),
    "gap-1 px-2.5",
  );
  const navDisabled = cn(navLink, "pointer-events-none opacity-50");

  return (
    <main className="min-h-screen bg-canvas px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="border border-line bg-surface p-6 shadow-(--shadow)">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-deep">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0 ? `${total} total` : ""}
          </p>
        </header>

        <section className="overflow-hidden border border-line bg-surface shadow-(--shadow)">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] border-b border-line px-6 py-3">
                {["Name", "Email", "Role", "Status", "Joined"].map((col) => (
                  <span
                    key={col}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {col}
                  </span>
                ))}
              </div>

              {/* User rows */}
              {users.map((user, i) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className={cn(
                    "grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] items-center px-6 py-4 text-sm transition-colors hover:bg-surface-strong",
                    i < users.length - 1 && "border-b border-line",
                  )}
                >
                  <span className="font-medium text-ink">{user.name}</span>
                  <span className="text-muted-foreground">{user.email}</span>
                  <span className="capitalize text-muted-foreground">
                    {user.role ?? "user"}
                  </span>
                  <span>
                    {user.banned ? (
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(user.createdAt))}
                  </span>
                </Link>
              ))}
            </>
          )}
        </section>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                {page > 1 ? (
                  <Link
                    href={`?page=${page - 1}`}
                    scroll={false}
                    className={navLink}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:block">Previous</span>
                  </Link>
                ) : (
                  <span className={navDisabled} aria-disabled>
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:block">Previous</span>
                  </span>
                )}
              </PaginationItem>

              {/* Page numbers */}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable ellipsis positions
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <Link
                      href={`?page=${p}`}
                      scroll={false}
                      className={cn(
                        buttonVariants({
                          variant: p === page ? "outline" : "ghost",
                          size: "icon",
                        }),
                      )}
                    >
                      {p}
                    </Link>
                  </PaginationItem>
                ),
              )}

              {/* Next */}
              <PaginationItem>
                {page < totalPages ? (
                  <Link
                    href={`?page=${page + 1}`}
                    scroll={false}
                    className={navLink}
                  >
                    <span className="hidden sm:block">Next</span>
                    <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span className={navDisabled} aria-disabled>
                    <span className="hidden sm:block">Next</span>
                    <ChevronRight className="size-4" />
                  </span>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense>
      <UsersContent />
    </Suspense>
  );
}
