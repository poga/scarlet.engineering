const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { rssPlugin } = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rssPlugin);

  // Ignore docs directory from template processing (plans, not blog content)
  eleventyConfig.ignores.add("docs/**");
  // Authoring guide, not a page
  eleventyConfig.ignores.add("press/README.md");
  // Post template for authors to copy, not a page
  eleventyConfig.ignores.add("blog/posts/_template.md");

  // Pass through existing static files untouched
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("scarlet-engineering-design-system.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.svg");
  // publish design plans only; keep internal superpowers specs off the site
  eleventyConfig.addPassthroughCopy("docs/plans");
  eleventyConfig.addPassthroughCopy("blog/images");
  eleventyConfig.addPassthroughCopy("press/assets");

  // Blog post collection sorted by date descending, drafts excluded
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/posts/**/*.md")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  // WebP thumbnails at build time so the index avoids multi-MB source images
  eleventyConfig.addAsyncShortcode("thumbnail", async (src, alt, className) => {
    const source = src.replace(/^https?:\/\/scarlet\.engineering/, "").replace(/^\//, "");
    const metadata = await Image(source, {
      widths: [160, 320, 480, 800],
      formats: ["webp"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
    });
    return Image.generateHTML(metadata, {
      alt,
      class: className,
      sizes: "(max-width: 480px) calc(100vw - 32px), 160px",
      loading: "lazy",
      decoding: "async",
    });
  });

  eleventyConfig.addFilter("dateDisplay", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  // Bundle each kit's assets into a downloadable .zip (static host can't zip live)
  eleventyConfig.on("eleventy.after", () => {
    const dataDir = path.join(__dirname, "press", "data");
    const assetsRoot = path.join(__dirname, "press", "assets");
    const outRoot = path.join(__dirname, "_site", "press", "assets");
    if (!fs.existsSync(dataDir)) return;
    for (const file of fs.readdirSync(dataDir)) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(/\.json$/, "");
      if (!fs.existsSync(path.join(assetsRoot, slug))) continue;
      const outZip = path.join(outRoot, `${slug}.zip`);
      fs.mkdirSync(outRoot, { recursive: true });
      fs.rmSync(outZip, { force: true });
      try {
        execFileSync("zip", ["-r", "-q", "-X", outZip, slug], { cwd: assetsRoot });
      } catch (err) {
        console.warn(`[press] skipped ${slug}.zip — is the 'zip' binary installed?`);
      }
    }
  });

  return {
    // Only process Markdown, Nunjucks, and Liquid templates
    // This prevents existing HTML files from being processed as templates
    templateFormats: ["md", "njk", "liquid"],
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
};
