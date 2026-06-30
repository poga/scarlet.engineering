const fs = require("fs");
const path = require("path");

// Each press/data/<slug>.json becomes one presskit page; slug comes from the filename.
module.exports = function() {
  const dir = path.join(__dirname, "..", "press", "data");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const slug = f.replace(/\.json$/, "");
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      return { slug, ...data };
    })
    .sort((a, b) => (a.title || a.slug).localeCompare(b.title || b.slug));
};
