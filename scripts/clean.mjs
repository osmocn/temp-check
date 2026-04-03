#!/usr/bin/env node
// Removes build and dev artifacts from the monorepo.
// Cross-platform: works on macOS, Linux, and Windows.

import { readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TARGETS = new Set([".turbo", "node_modules", "dist", ".next", ".cache"]);

const repoRoot = resolve(fileURLToPath(import.meta.url), "../..");

let removed = 0;

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry);

    if (TARGETS.has(entry)) {
      try {
        rmSync(full, { recursive: true, force: true });
        console.log(`  rm ${full.replace(repoRoot, ".")}`);
        removed++;
      } catch (err) {
        console.error(`  ! failed to remove ${full}: ${err.message}`);
      }
      // Don't descend into removed dir
      continue;
    }

    try {
      if (statSync(full).isDirectory()) walk(full);
    } catch {
      // skip unreadable entries
    }
  }
}

console.log(`Cleaning: ${repoRoot}\n`);
walk(repoRoot);
console.log(
  `\nDone. Removed ${removed} director${removed === 1 ? "y" : "ies"}.`,
);
