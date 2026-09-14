// Post-build: encrypt the design system page in place so GitHub Pages serves
// it behind a password. Runs after Eleventy; see package.json "build".
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const PAGE = "scarlet-engineering-design-system.html";
const SITE = path.join(__dirname, "..", "_site");
const TEMPLATE = path.join(__dirname, "design-system-gate.html");
// Public salt, fixed so "remember me" survives redeploys.
const SALT = "6f2a9c4e1b8d7f0a3c5e9b1d2f4a6c8e";

const password = process.env.DESIGN_SYSTEM_PASSWORD;
const target = path.join(SITE, PAGE);

if (!fs.existsSync(target)) {
  console.warn(`[protect] ${PAGE} not found in _site, nothing to do`);
  process.exit(0);
}

if (!password) {
  if (process.env.CI) {
    console.error("[protect] DESIGN_SYSTEM_PASSWORD is not set; refusing to deploy the page unprotected");
    process.exit(1);
  }
  console.warn("[protect] DESIGN_SYSTEM_PASSWORD not set; local build leaves the page open");
  process.exit(0);
}

execFileSync(
  "npx",
  [
    "staticrypt", target,
    "--config", "false",
    "--salt", SALT,
    "--directory", SITE,
    "--remember", "30",
    "--short",
    "--template", TEMPLATE,
    "--template-title", "design system",
    "--template-instructions", "this page is for the studio and its collaborators.",
    "--template-placeholder", "password",
    "--template-button", "open",
    "--template-error", "wrong password.",
    "--template-remember", "remember for 30 days",
    "--template-toggle-show", "show password",
    "--template-toggle-hide", "hide password",
  ],
  { stdio: "inherit", env: { ...process.env, STATICRYPT_PASSWORD: password } }
);
console.log(`[protect] ${PAGE} encrypted`);
