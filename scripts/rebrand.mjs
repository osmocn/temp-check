#!/usr/bin/env node
/**
 * Rebrand the monorepo to a new npm scope and display name.
 * Runs as a dry run by default — pass --apply to write changes.
 *
 * Usage:
 *   node scripts/rebrand.mjs --scope <scope> --name "<Display Name>" [--handle "<@handle>"] [--apply]
 *
 * Examples:
 *   node scripts/rebrand.mjs --scope my-app --name "My App"           # preview
 *   node scripts/rebrand.mjs --scope my-app --name "My App" --apply   # write
 *
 * Options:
 *   --scope   New npm scope (without @). Packages become @<scope>/*.   e.g. my-app
 *   --name    New display name shown in the UI and metadata.            e.g. "My App"
 *   --handle  Navbar logo handle (defaults to @<scope>).               e.g. "@myapp"
 *   --apply   Write changes to disk and run pnpm install (default: dry run).
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// ── Current branding ──────────────────────────────────────────────────────────

const CURRENT = {
  scope: "coco-kit",       // npm scope: @coco-kit/*
  rootName: "coco-kit",    // root package.json name field
  displayName: "Coco Kit", // siteConfig.name + metadata title
  handle: "@coco",         // siteConfig.handle (navbar logo)
};

// ── Arg parsing ───────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);

  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--")
      ? args[i + 1]
      : null;
  };

  const scope = get("--scope");
  const name = get("--name");
  const handle = get("--handle") ?? (scope ? `@${scope}` : null);
  const dry = !args.includes("--apply");

  if (!scope || !name) {
    console.error([
      "",
      "  Usage:",
      '    node scripts/rebrand.mjs --scope <scope> --name "<name>" [--handle "<handle>"] [--apply]',
      "",
      "  --scope   new npm scope (no @),  e.g.  my-app",
      '  --name    new display name,      e.g.  "My App"',
      "  --handle  navbar handle,         e.g.  @myapp  (defaults to @<scope>)",
      "  --apply   write changes to disk (default is dry run)",
      "",
    ].join("\n"));
    process.exit(1);
  }

  return { scope, name, handle, dry };
}

// ── File walker ───────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".turbo", "dist", "build", ".cache",
]);

function walk(dir, include) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      results.push(...walk(full, include));
    } else if (include(entry)) {
      results.push(full);
    }
  }

  return results;
}

// ── Replace helper ────────────────────────────────────────────────────────────

function replaceInFile(filePath, from, to, dry) {
  const src = readFileSync(filePath, "utf8");
  const out = src.replaceAll(from, to);
  if (src === out) return false;
  if (!dry) writeFileSync(filePath, out, "utf8");
  return true;
}

function rel(filePath) {
  return filePath.replace(ROOT, ".").replace(/\\/g, "/");
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function stepSources(scope, dry) {
  console.log("1/5  Source files — updating @" + CURRENT.scope + "/ imports...");
  const files = walk(ROOT, (name) =>
    [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(extname(name)),
  );
  let n = 0;
  for (const f of files) {
    if (replaceInFile(f, `@${CURRENT.scope}/`, `@${scope}/`, dry)) {
      console.log(`       ~ ${rel(f)}`);
      n++;
    }
  }
  console.log(`       ${n} file(s) ${dry ? "would update" : "updated"}`);
}

function stepPackageJson(scope, dry) {
  console.log("\n2/5  package.json files — updating names and deps...");
  const files = walk(ROOT, (name) => name === "package.json");
  let n = 0;
  for (const f of files) {
    // Scoped deps: "@coco-kit/" → "@<scope>/"
    const a = replaceInFile(f, `@${CURRENT.scope}/`, `@${scope}/`, dry);
    // Root package name: "coco-kit" → "<scope>" (exact JSON value match)
    const b = replaceInFile(
      f,
      `"name": "${CURRENT.rootName}"`,
      `"name": "${scope}"`,
      dry,
    );
    if (a || b) {
      console.log(`       ~ ${rel(f)}`);
      n++;
    }
  }
  console.log(`       ${n} file(s) ${dry ? "would update" : "updated"}`);
}

function stepComponentsJson(scope, dry) {
  console.log("\n3/5  components.json — updating shadcn alias paths...");
  const f = join(ROOT, "packages", "ui", "components.json");
  if (!existsSync(f)) {
    console.log("       (not found, skipped)");
    return;
  }
  if (replaceInFile(f, `@${CURRENT.scope}/`, `@${scope}/`, dry)) {
    console.log(`       ~ ${rel(f)}`);
  } else {
    console.log("       (no changes needed)");
  }
}

function stepSiteConfig(name, handle, dry) {
  console.log("\n4/5  site.ts — updating display branding...");
  const f = join(ROOT, "apps", "web", "src", "config", "site.ts");
  if (!existsSync(f)) {
    console.log("       (not found, skipped)");
    return;
  }
  // Replace display name (hits name field + title.default + title.template)
  const a = replaceInFile(f, CURRENT.displayName, name, dry);
  // Replace handle (quoted to avoid partial matches)
  const b = replaceInFile(f, `"${CURRENT.handle}"`, `"${handle}"`, dry);
  if (a || b) {
    console.log(`       ~ ${rel(f)}`);
  } else {
    console.log("       (no changes needed)");
  }
}

function stepInstall(dry) {
  console.log("\n5/5  Regenerating lockfile...");
  if (dry) {
    console.log("       (skipped in dry run)");
    return;
  }
  execSync("pnpm install", { cwd: ROOT, stdio: "inherit" });
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const { scope, name, handle, dry } = parseArgs();

  console.log(
    dry ? "\n[dry run] No files will be written.\n" : "\nRebranding monorepo...\n",
  );
  console.log(`  scope   @${CURRENT.scope}/* → @${scope}/*`);
  console.log(`  name    "${CURRENT.displayName}" → "${name}"`);
  console.log(`  handle  "${CURRENT.handle}" → "${handle}"`);
  console.log("");

  stepSources(scope, dry);
  stepPackageJson(scope, dry);
  stepComponentsJson(scope, dry);
  stepSiteConfig(name, handle, dry);
  stepInstall(dry);

  console.log(
    dry
      ? "\n[dry run] Done. Run without --dry to apply.\n"
      : `\nDone. Rebranded to @${scope} / "${name}".\n`,
  );
}

main();
