const { execSync } = require("child_process");
const fs = require("fs");

function saveHiddenFile(path, content) {
  fs.writeFileSync(path, content);
  try {
    execSync(`attrib +h "${path}"`);
  } catch (err) {
    // falhou em ocultar, mas não impede o resto do fluxo
  }
}

function hideExistingFile(path) {
  try {
    execSync(`attrib +h "${path}"`);
  } catch { }
}

module.exports = { saveHiddenFile, hideExistingFile };
