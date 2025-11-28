const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { saveHiddenFile } = require("./hiddenFile");

const AUTH_FILE = path.join(__dirname, "../../auth.json");

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 50000, 64, "sha512").toString("hex");
}

function createMasterPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);

  const content = JSON.stringify({ salt, hash }, null, 2);
  saveHiddenFile(AUTH_FILE, content);
}

function masterPasswordExists() {
  return fs.existsSync(AUTH_FILE);
}

function verifyMasterPassword(input) {
  const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
  const inputHash = hashPassword(input, data.salt);
  return inputHash === data.hash;
}

module.exports = {
  createMasterPassword,
  masterPasswordExists,
  verifyMasterPassword
};
