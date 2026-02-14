module.exports = function(eleventyConfig) {
  // Ignore docs directory from template processing (plans, not blog content)
  eleventyConfig.ignores.add("docs/**");

  // Pass through existing static files untouched
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("scarlet-engineering-design-system.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("docs");
  eleventyConfig.addPassthroughCopy("blog/images");

  // Blog post collection sorted by date descending
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/posts/**/*.md").sort((a, b) => b.date - a.date);
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
