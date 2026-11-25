const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadPress, PressDataError, PRESS_DIRS } = require("../press/lib/presskits");

const ROOT = path.join(__dirname, "..");
const HAN = /\p{Script=Han}/u;
const temps = [];
const out = path.join(ROOT, "_site");

function tempDir(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temps.push(dir);
  return dir;
}

before(async () => {
  const mod = await import("@11ty/eleventy");
  const Eleventy = mod.Eleventy || mod.default;
  process.chdir(ROOT);
  fs.rmSync(path.join(out, "press"), { recursive: true, force: true });
  await new Eleventy(".", undefined, { quietMode: true, configPath: ".eleventy.js" }).write();
});

after(() => {
  for (const dir of temps) fs.rmSync(dir, { recursive: true, force: true });
});

function pressPages() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "assets") walk(full);
      if (entry.isFile() && entry.name === "index.html") {
        const url = `/${path.relative(out, dir).split(path.sep).join("/")}/`;
        found.push({ url, html: fs.readFileSync(full, "utf8") });
      }
    }
  };
  walk(path.join(out, "press"));
  return found;
}

function read(url) {
  return fs.readFileSync(path.join(out, url, "index.html"), "utf8");
}

function pageLang(html) {
  return html.match(/<html lang="([^"]+)">/)[1];
}

function alternates(html) {
  return [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https:\/\/scarlet\.engineering([^"]+)">/g)]
    .map(([, lang, url]) => ({ lang, url }))
    .filter((alt) => alt.lang !== "x-default");
}

function visibleText(html) {
  return html
    .slice(html.indexOf("<body>"))
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<(\w+)[^>]*\slang="[^"]*"[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]+>/g, " ");
}

test("every press page links to each translation, and each translation links back", () => {
  const pages = pressPages();
  assert.ok(pages.some((p) => pageLang(p.html) !== "en"), "the build writes a translated press page");
  for (const page of pages) {
    const lang = pageLang(page.html);
    const alts = alternates(page.html);
    if (alts.length === 0) continue;
    assert.ok(alts.some((a) => a.url === page.url && a.lang === lang), `${page.url} lists itself as ${lang}`);
    for (const alt of alts) {
      const target = read(alt.url);
      assert.equal(pageLang(target), alt.lang, `${alt.url} is written in ${alt.lang}`);
      assert.ok(
        alternates(target).some((a) => a.url === page.url && a.lang === lang),
        `${alt.url} links back to ${page.url}`,
      );
    }
  }
});

test("an English press page shows no Chinese outside the language switcher", () => {
  const english = pressPages().filter((p) => pageLang(p.html) === "en");
  assert.ok(english.length > 0);
  for (const page of english) {
    assert.doesNotMatch(visibleText(page.html), HAN, page.url);
  }
});

test("a zh-TW press page labels every section and copy button in Chinese", () => {
  const chinese = pressPages().filter((p) => pageLang(p.html) === "zh-TW");
  assert.ok(chinese.length > 0);
  for (const page of chinese) {
    const headings = [...page.html.matchAll(/<h2>([^<]*)<\/h2>/g)].map((m) => m[1]);
    const buttons = [...page.html.matchAll(/data-copied-label="([^"]*)">([^<]*)<\/button>/g)].flatMap((m) => [m[1], m[2]]);
    for (const label of [...headings, ...buttons]) {
      assert.match(label, HAN, `${page.url}: "${label}"`);
    }
  }
});

function fixture({ kit, en, dropUi }) {
  const dir = tempDir("press-fixture-");
  const dataDir = path.join(dir, "data");
  const localesDir = path.join(dir, "locales");
  fs.cpSync(PRESS_DIRS.localesDir, localesDir, { recursive: true });
  if (dropUi) {
    const file = path.join(localesDir, `${dropUi.locale}.json`);
    const locale = JSON.parse(fs.readFileSync(file, "utf8"));
    delete locale.ui[dropUi.key];
    fs.writeFileSync(file, JSON.stringify(locale));
  }
  fs.mkdirSync(path.join(dataDir, "demo"), { recursive: true });
  fs.writeFileSync(path.join(dataDir, "demo", "kit.json"), JSON.stringify(kit));
  fs.writeFileSync(path.join(dataDir, "demo", "en.json"), JSON.stringify(en));
  return { dataDir, localesDir };
}

test("text written into kit.json stops the build and names the field", () => {
  const dirs = fixture({ kit: { title: "Demo", tagline: "A demo." }, en: {} });
  assert.throws(() => loadPress(dirs), (err) => err instanceof PressDataError && /"tagline" belongs in a locale file/.test(err.message));
});

test("a locale without one of the UI strings stops the build and names the string", () => {
  const dirs = fixture({ kit: { title: "Demo" }, en: { tagline: "A demo." }, dropUi: { locale: "zh-TW", key: "copied" } });
  assert.throws(() => loadPress(dirs), (err) => err instanceof PressDataError && /missing ui strings: copied/.test(err.message));
});
