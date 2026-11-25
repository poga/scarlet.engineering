# Press kits

Data-driven press kits for Scarlet Engineering games. Each kit is a folder of
JSON files plus a folder of assets. Eleventy builds one press-ready page per
game, per language. A page is always in one language: English text and
Traditional Chinese text never share a page.

## Layout

```
press/
  locales/<locale>.json        UI strings for one language (labels, buttons, hints)
  data/<slug>/kit.json         Data that is the same in every language
  data/<slug>/<locale>.json    All of the kit's text in one language
  assets/<slug>/               Images, video, and logos
```

Each `data/<slug>/<locale>.json` becomes one page:

| File | URL |
|---|---|
| `data/brews-and-kings/en.json` | `/press/brews-and-kings/` |
| `data/brews-and-kings/zh-TW.json` | `/press/zh-tw/brews-and-kings/` |

English (`en`) is the default language: its pages have no language prefix, and
every kit needs an `en.json`. Each language also gets its own index
(`/press/`, `/press/zh-tw/`) that lists only the kits written in it. Pages link
to their other languages with a language switcher and `hreflang` tags.

## Add a new game

1. **Create the kit folder.** Copy `data/brews-and-kings/` to
   `data/<your-slug>/`. The folder name is the URL: `data/witchwater/` becomes
   `/press/witchwater/`.

2. **Drop in assets.** Create `assets/<your-slug>/` and add your key art, logo,
   icon, and screenshots. Reference each by filename in `kit.json`.

3. **Fill in the fields.** Every section is optional: leave a field out and its
   section does not render.

   `kit.json` holds only data that does not change with language:

   | Field | What it is |
   |---|---|
   | `title`, `developer` | Game and studio names |
   | `basedIn` | Two-letter region code, such as `"TW"`. Each page shows it in its own language |
   | `languages` | Language codes the game supports, such as `["en", "zh-Hant"]`. Each page shows them in its own language |
   | `platforms` | Platform names |
   | `website`, `pressContact` | Links journalists need |
   | `keyArt` | Hero image filename (used for the page and social preview) |
   | `trailer` | One of `youtube` (video id), `embedUrl`, or `file` (local); plus optional `download` and `cover` (thumbnail image) |
   | `screenshots`, `logos` | Arrays of filenames in your asset folder |
   | `videos` | Array of `{ file, gif }` gameplay clips; `gif` is an optional GIF version |
   | `social` | `{ "Discord": "https://…" }` |

   `<locale>.json` holds all of the text, in that one language:

   | Field | What it is |
   |---|---|
   | `tagline` | One-line hook |
   | `releaseDate`, `price` | Fact sheet text, such as `"2027"` or `"2027 年"` |
   | `descriptionShort`, `descriptionLong` | Copy-paste blurbs (long is an array of paragraphs) |
   | `copy` | More copy-paste texts, each its own section: array of `{ title, paragraphs }` (e.g. Press, Steam page); a `{ "heading": "…" }` item in `paragraphs` is a subheading |
   | `features` | Bullet list |
   | `buyLinks`, `additionalLinks` | `{ label, url, note }`; the URL can differ per language (e.g. a Steam link with `?l=tchinese`) |
   | `awards`, `quotes` | Optional sections |
   | `about`, `credits`, `monetizationNote` | Studio text |
   | `captions` | `{ "<asset filename>": "caption" }`: video labels and image alt text |
   | `title`, `keyArt` | Optional: override `kit.json` for this language, such as a localized logo or key art |

   The build stops with an error that names the file and field when text is in
   `kit.json`, when shared data is in a locale file, or when a field name is
   unknown.

4. **Build.** `npm run build` (or `npm run dev`). On every build, each asset
   folder is zipped to `/press/assets/<slug>.zip` for the "Download all" button.
   This needs the `zip` command on the build machine (preinstalled on macOS and
   the GitHub Actions runner). `npm test` builds the site and checks that no
   page mixes languages.

## Translate a kit

Add `data/<slug>/<locale>.json` with the same fields as `en.json`, written in
that language. The page, the index, and the language switcher appear on the
next build. Fields you leave out do not render: the page never falls back to
English.

## Add a language

Add `locales/<locale>.json`, where `<locale>` is a language tag such as `ja` or
`zh-TW`. It needs `name` (the language's own name, shown in the switcher),
`ogLocale` (such as `ja_JP`), and `ui` with every key in `locales/en.json`.
The build stops and lists the keys if any are missing. UI strings can hold
`{placeholders}`, such as `"{title} Press Kit"`; keep each placeholder in the
translation.

## Studio logo

`assets/studio/scarlet-engineering-logo.png` appears on every kit page and in
every kit's zip. Replace that file to update the studio logo everywhere.

## Asset tips for press

- **Screenshots:** 1920×1080 or 1280×720 PNG, no UI debug overlays.
- **Logo:** transparent PNG and/or SVG.
- **Key art:** 16:9, headline-ready.
- The "Download all assets" zip and per-image download links mean a writer can
  grab everything for a post in well under a minute.
