import Link from "next/link";
import { headers } from "next/headers";
import {
  Braces,
  KeyRound,
  Lock,
  Mail,
  MailCheck,
  Package,
  RefreshCcw,
  Shield,
} from "lucide-react";
import { Button } from "@coco-kit/ui/components/ui/button";
import Navbar from "@/components/navbar";
import { getAuthSession } from "@/lib/auth-session";

const authFeatures = [
  { icon: Lock, label: "Email & password" },
  { icon: Mail, label: "Magic links" },
  { icon: MailCheck, label: "Email verification" },
  { icon: KeyRound, label: "Forgot & reset password" },
  { icon: RefreshCcw, label: "Email address changes" },
  { icon: Shield, label: "Session management" },
] as const;

const stack = [
  "Next.js 16",
  "Hono",
  "Drizzle",
  "Postgres",
  "Zod v4",
  "React Email",
  "Turborepo",
  "pnpm workspaces",
  "Biome",
  "shadcn/ui",
  "Tailwind v4",
  "TypeScript",
] as const;

const steps = [
  {
    n: "01",
    title: "Clone and install",
    body: "pnpm install from the root. One lockfile, all apps.",
  },
  {
    n: "02",
    title: "Set your env",
    body: "Add your database URL and auth secret, run migrations.",
  },
  {
    n: "03",
    title: "Ship",
    body: "pnpm dev spins everything up. Change a file — it reloads.",
  },
] as const;

export default async function Home() {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <>
      <Navbar session={session} />

      <main className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center overflow-hidden px-6 pb-24 pt-32 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_65%)]"
          />
          <span className="relative mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Auth · API · UI · Monorepo
          </span>
          <h1 className="relative max-w-3xl bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl pb-5">
            Skip the setup.
            <br />
            Start building.
          </h1>
          <p className="relative mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Auth, a typed Hono API, Drizzle + Postgres, and a shared shadcn UI
            library — all wired together so you don’t waste time doing it
            yourself.
          </p>
          <div className="relative mt-8 flex items-center gap-3">
            <Button asChild size="lg" variant="glow">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/login">Sign in →</Link>
            </Button>
          </div>
        </section>

        {/* ── Bento ────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {/* Auth — wide card */}
            <div className="flex flex-col rounded-2xl border bg-card p-7 lg:col-span-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Authentication
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Auth that actually covers everything.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Most starters give you a login page and leave the rest to you.
                This one doesn’t. Magic links, email verification, password
                resets, changing emails — it’s all already working.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {authFeatures.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link href="/register">Try the auth →</Link>
                </Button>
              </div>
            </div>

            {/* Side cards */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <div className="flex flex-1 flex-col justify-between rounded-2xl border bg-card p-7">
                <Package className="size-5 text-muted-foreground" />
                <div className="mt-auto pt-10">
                  <h3 className="font-semibold">Monorepo from day one</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Shared UI, configs, and tooling across your apps without the
                    usual mess.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between rounded-2xl border bg-card p-7">
                <Braces className="size-5 text-muted-foreground" />
                <div className="mt-auto pt-10">
                  <h3 className="font-semibold">Type-safe end to end</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Your API, forms, and database all speak the same language.
                    No weird mismatches later.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps — full width */}
            <div className="overflow-hidden rounded-2xl border lg:col-span-5">
              <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {steps.map((s) => (
                  <div key={s.n} className="bg-card px-7 py-6">
                    <span className="font-mono text-xs text-muted-foreground/40">
                      {s.n}
                    </span>
                    <h3 className="mt-3 font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stack ────────────────────────────────────────── */}
        <section className="px-6 pt-12 pb-32">
          <div className="mx-auto max-w-4xl">
            <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Built with
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {stack.map((name) => (
                <span
                  key={name}
                  className="rounded-full border bg-muted/40 px-3.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="border-t bg-foreground px-6 py-24 text-background">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="bg-gradient-to-b from-background to-background/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Ready to build?
            </h2>
            <p className="mt-4 text-sm text-background/50">
              Create an account and begin with a setup that already handles the
              annoying parts.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Create an account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-background hover:bg-background/10 hover:text-background"
              >
                <Link href="/login">Sign in →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
