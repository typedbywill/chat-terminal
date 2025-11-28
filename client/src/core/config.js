const fs = require("fs");
const path = require("path");
const { saveHiddenFile } = require("./hiddenFile");

const CONFIG_FILE = path.join(process.cwd(), "config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
}

function saveConfig(data) {
  saveHiddenFile(CONFIG_FILE, JSON.stringify(data));
}

module.exports = { loadConfig, saveConfig, CONFIG_FILE };
