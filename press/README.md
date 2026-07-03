# Press kits

Data-driven press kits for Scarlet Engineering games. Each kit is one JSON file
plus a folder of assets — Eleventy builds a polished, press-ready page per game.

## Add a new game

1. **Copy the data file.** Duplicate `data/brews-and-kings.json` to
   `data/<your-slug>.json`. The filename is the URL: `data/witchwater.json`
   becomes `/press/witchwater/`.

2. **Drop in assets.** Create `assets/<your-slug>/` and add your key art, logo,
   icon, and screenshots. Reference each by filename in the data file.

3. **Fill in the fields.** Edit your data file. Every section is optional — leave
   a field empty or delete it and that section simply won't render. Fields:

   | Field | What it is |
   |---|---|
   | `title`, `tagline` | Game name and one-line hook |
   | `developer`, `basedIn`, `releaseDate`, `platforms`, `price`, `languages` | Fact sheet rows |
   | `website`, `pressContact` | Links journalists need |
   | `keyArt` | Hero image filename (used for the page and social preview) |
   | `descriptionShort`, `descriptionLong` | Copy-paste blurbs (long is an array of paragraphs) |
   | `features` | Bullet list |
   | `trailer` | One of `youtube` (video id), `embedUrl`, or `file` (local); plus optional `download` |
   | `screenshots`, `logos` | Arrays of filenames in your asset folder |
   | `awards`, `quotes`, `additionalLinks`, `buyLinks` | Optional sections |
   | `about`, `credits`, `social`, `monetizationNote` | Studio + contact |

4. **Build.** `npm run build` (or `npm run dev`). On every build, each asset
   folder is zipped to `/press/assets/<slug>.zip` for the "Download all" button —
   this needs the `zip` command on the build machine (preinstalled on macOS and
   the GitHub Actions runner).

## Asset tips for press

- **Screenshots:** 1920×1080 or 1280×720 PNG, no UI debug overlays.
- **Logo:** transparent PNG and/or SVG.
- **Key art:** 16:9, headline-ready.
- The "Download all assets" zip and per-image download links mean a writer can
  grab everything for a post in well under a minute.
