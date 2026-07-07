module.exports = {
  layout: "blog/post.njk",
  eleventyComputed: {
    // draft posts skip output on production builds, but still preview via `npm run dev`
    permalink: (data) => {
      if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
        return false;
      }
      return `/blog/${data.page.fileSlug}/`;
    },
  },
};
