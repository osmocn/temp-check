import { Users } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    href: "/admin/users" as const,
    icon: Users,
    label: "Users",
    description: "View, search, and manage all registered users.",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="border border-line bg-surface p-6 shadow-(--shadow)">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-deep">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Admin
          </h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-3 border border-line bg-surface p-5 shadow-(--shadow) transition-colors hover:bg-surface-strong"
            >
              <Icon className="size-5 text-accent-deep" />
              <div>
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
