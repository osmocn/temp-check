import Link from "next/link";
import type { AuthSessionResponse } from "@coco-kit/zod/schema";
import { Button } from "@coco-kit/ui/components/ui/button";
import { User } from "lucide-react";
import { siteConfig } from "@/config/site";

export const navbarLinks = [{ href: "/", label: "Home" }] as const;

export default function Navbar({ session }: { session: AuthSessionResponse }) {
  return (
    <header className="fixed fade-bottom top-0 z-50 w-full border-b bg-background/5 h-16 backdrop-blur-lg">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center leading-none gap-x-8">
          <Link
            href="/"
            className="text-[17px] relative -top-px font-semibold tracking-tight text-foreground flex items-center"
          >
            {siteConfig.handle}
          </Link>

          {/* Center nav */}
          <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button asChild size="sm" className="h-8 px-3 text-sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                asChild
                size="icon-sm"
                variant="outline"
                className="h-8 px-3 text-sm"
              >
                <Link href="/account">
                  <User />
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Secondary */}
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 px-3 text-sm"
              >
                <Link href="/login">Log In</Link>
              </Button>

              {/* Primary */}
              <Button asChild size="sm" className="h-8 px-3 text-sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
