const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { rssPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rssPlugin);

  // Ignore docs directory from template processing (plans, not blog content)
  eleventyConfig.ignores.add("docs/**");
  // Authoring guide, not a page
  eleventyConfig.ignores.add("press/README.md");

  // Pass through existing static files untouched
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("scarlet-engineering-design-system.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("docs");
  eleventyConfig.addPassthroughCopy("blog/images");
  eleventyConfig.addPassthroughCopy("press/assets");

  // Blog post collection sorted by date descending
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/posts/**/*.md").sort((a, b) => b.date - a.date);
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
