import type { Metadata } from "next";

export const siteConfig = {
  /** Short display name — used in sidebar, footer copyright */
  name: "Coco Kit",
  /** Navbar logo handle */
  handle: "@coco",
  /** Spreads directly into layout's `export const metadata` */
  metadata: {
    title: {
      default: "Coco Kit",
      template: "%s | Coco Kit",
    },
    description:
      "Auth, a typed Hono API, Drizzle + Postgres, and a shared shadcn UI library — wired together so you don't have to.",
  } satisfies Metadata,
} as const;
