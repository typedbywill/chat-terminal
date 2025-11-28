const crypto = require("crypto");

const ALGO = "aes-256-gcm";

function generateSecret(password) {
  return crypto.createHash("sha256").update(password).digest();
}

function encrypt(msg, SECRET) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(msg), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(buffer, SECRET) {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const text = buffer.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, SECRET, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(text), decipher.final()]);
}

module.exports = { generateSecret, encrypt, decrypt };
