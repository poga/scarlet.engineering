const fs = require("fs");
const path = require("path");

const DEFAULT_LOCALE = "en";
const SHARED_FILE = "kit.json";

const SHARED_FIELDS = new Set([
  "title", "developer", "basedIn", "platforms", "languages", "website", "pressContact",
  "keyArt", "trailer", "screenshots", "videos", "logos", "social",
]);
const LOCALE_FIELDS = new Set([
  "title", "keyArt", "tagline", "releaseDate", "price", "descriptionShort", "descriptionLong",
  "copy", "features", "buyLinks", "additionalLinks", "awards", "quotes", "about", "credits",
  "monetizationNote", "captions",
]);
const VIDEO_FIELDS = new Set(["file", "gif"]);
const LOCALE_META = ["name", "ogLocale", "ui"];

class PressDataError extends Error {}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new PressDataError(`${file}: ${err.message}`);
  }
}

function fill(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

function segment(locale) {
  return locale === DEFAULT_LOCALE ? "" : `${locale.toLowerCase()}/`;
}

function indexUrl(locale) {
  return `/press/${segment(locale)}`;
}

function kitUrl(slug, locale) {
  return `/press/${segment(locale)}${slug}/`;
}

function loadLocales(localesDir) {
  const codes = fs.readdirSync(localesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort((a, b) => (a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b)));
  if (!codes.includes(DEFAULT_LOCALE)) {
    throw new PressDataError(`${localesDir}: ${DEFAULT_LOCALE}.json is required`);
  }
  const locales = new Map();
  for (const code of codes) {
    const file = path.join(localesDir, `${code}.json`);
    const [canonical] = Intl.getCanonicalLocales(code);
    if (canonical !== code) {
      throw new PressDataError(`${file}: name the file ${canonical}.json`);
    }
    const data = readJson(file);
    const missing = LOCALE_META.filter((key) => !(key in data));
    if (missing.length) {
      throw new PressDataError(`${file}: missing ${missing.join(", ")}`);
    }
    locales.set(code, { code, name: data.name, ogLocale: data.ogLocale, ui: data.ui, file });
  }
  const keys = Object.keys(locales.get(DEFAULT_LOCALE).ui);
  for (const locale of locales.values()) {
    const missing = keys.filter((key) => !(key in locale.ui));
    const extra = Object.keys(locale.ui).filter((key) => !keys.includes(key));
    if (missing.length || extra.length) {
      const parts = [];
      if (missing.length) parts.push(`missing ui strings: ${missing.join(", ")}`);
      if (extra.length) parts.push(`ui strings not in ${DEFAULT_LOCALE}.json: ${extra.join(", ")}`);
      throw new PressDataError(`${locale.file}: ${parts.join("; ")}`);
    }
  }
  return locales;
}

function checkFields(file, data, allowed, elsewhere, elsewhereName) {
  for (const key of Object.keys(data)) {
    if (allowed.has(key)) continue;
    if (elsewhere.has(key)) {
      throw new PressDataError(`${file}: "${key}" belongs in ${elsewhereName}`);
    }
    throw new PressDataError(`${file}: unknown field "${key}"`);
  }
}

function checkShared(file, shared) {
  checkFields(file, shared, SHARED_FIELDS, LOCALE_FIELDS, "a locale file such as en.json");
  for (const video of shared.videos || []) {
    checkFields(file, video, VIDEO_FIELDS, new Set(["label"]), "captions in a locale file");
  }
  for (const code of shared.languages || []) {
    try {
      Intl.getCanonicalLocales(code);
    } catch {
      throw new PressDataError(`${file}: "${code}" in languages is not a language code`);
    }
  }
  if (shared.basedIn && !/^[A-Z]{2}$/.test(shared.basedIn)) {
    throw new PressDataError(`${file}: basedIn must be a two-letter region code such as "TW"`);
  }
}

function loadKit(dataDir, slug, locales) {
  const dir = path.join(dataDir, slug);
  const sharedFile = path.join(dir, SHARED_FILE);
  if (!fs.existsSync(sharedFile)) {
    throw new PressDataError(`${dir}: ${SHARED_FILE} is required`);
  }
  const shared = readJson(sharedFile);
  checkShared(sharedFile, shared);
  const content = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== SHARED_FILE)) {
    const code = file.replace(/\.json$/, "");
    const localeFile = path.join(dir, file);
    if (!locales.has(code)) {
      throw new PressDataError(`${localeFile}: no press locale "${code}", add press/locales/${code}.json first`);
    }
    const data = readJson(localeFile);
    checkFields(localeFile, data, LOCALE_FIELDS, SHARED_FIELDS, SHARED_FILE);
    content[code] = data;
  }
  if (!content[DEFAULT_LOCALE]) {
    throw new PressDataError(`${dir}: ${DEFAULT_LOCALE}.json is required`);
  }
  return { slug, shared, content };
}

function facts(kit, locale) {
  const languageNames = new Intl.DisplayNames([locale], { type: "language" });
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const list = new Intl.ListFormat(locale, { style: "narrow", type: "conjunction" });
  return [
    { key: "developer", value: kit.developer },
    { key: "basedIn", value: kit.basedIn && regionNames.of(kit.basedIn) },
    { key: "releaseDate", value: kit.releaseDate },
    { key: "platforms", value: kit.platforms && list.format(kit.platforms) },
    { key: "price", value: kit.price },
    { key: "languages", value: kit.languages && list.format(kit.languages.map((code) => languageNames.of(code))) },
    { key: "website", value: kit.website, href: kit.website, external: true },
    { key: "pressContact", value: kit.pressContact, href: kit.pressContact && `mailto:${kit.pressContact}` },
  ].filter((fact) => fact.value);
}

function localeLink(locale, url, current) {
  return { locale: locale.code, name: locale.name, ogLocale: locale.ogLocale, url, current };
}

function loadPress({ dataDir, localesDir }) {
  const locales = loadLocales(localesDir);
  const segments = new Set([...locales.keys()].map((code) => code.toLowerCase()));
  const slugs = fs.existsSync(dataDir)
    ? fs.readdirSync(dataDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];
  for (const slug of slugs) {
    if (segments.has(slug)) {
      throw new PressDataError(`${path.join(dataDir, slug)}: "${slug}" is a locale path, rename the kit`);
    }
  }
  const kits = slugs.map((slug) => loadKit(dataDir, slug, locales));

  const pages = [];
  for (const { slug, shared, content } of kits) {
    const codes = [...locales.keys()].filter((code) => content[code]);
    for (const code of codes) {
      const locale = locales.get(code);
      const kit = { ...shared, ...content[code], captions: content[code].captions || {} };
      pages.push({
        slug,
        locale: code,
        ogLocale: locale.ogLocale,
        t: locale.ui,
        url: kitUrl(slug, code),
        defaultUrl: kitUrl(slug, DEFAULT_LOCALE),
        back: { url: indexUrl(code), label: locale.ui.allKits },
        alternates: codes.map((c) => localeLink(locales.get(c), kitUrl(slug, c), c === code)),
        assetBase: `/press/assets/${slug}`,
        kit,
        facts: facts(kit, code),
      });
    }
  }

  const indexCodes = [...locales.keys()].filter(
    (code) => code === DEFAULT_LOCALE || kits.some((k) => k.content[code]),
  );
  const indexes = indexCodes.map((code) => {
    const locale = locales.get(code);
    const entries = pages
      .filter((p) => p.locale === code)
      .map((p) => ({ slug: p.slug, url: p.url, title: p.kit.title, tagline: p.kit.tagline, keyArt: p.kit.keyArt, assetBase: p.assetBase }))
      .sort((a, b) => (a.title || a.slug).localeCompare(b.title || b.slug, code));
    return {
      locale: code,
      ogLocale: locale.ogLocale,
      t: locale.ui,
      url: indexUrl(code),
      defaultUrl: indexUrl(DEFAULT_LOCALE),
      back: { url: "/", label: locale.ui.home },
      alternates: indexCodes.map((c) => localeLink(locales.get(c), indexUrl(c), c === code)),
      kits: entries,
    };
  });

  return { defaultLocale: DEFAULT_LOCALE, slugs, pages, indexes };
}

const PRESS_DIRS = {
  dataDir: path.join(__dirname, "..", "data"),
  localesDir: path.join(__dirname, "..", "locales"),
};

module.exports = { loadPress, fill, PressDataError, PRESS_DIRS };
