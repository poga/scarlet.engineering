const { loadPress, PRESS_DIRS } = require("../press/lib/presskits");

module.exports = () => loadPress(PRESS_DIRS);
