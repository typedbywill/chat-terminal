// client.js
const readline = require("readline");
const { applyMatrixTheme } = require("./src/ui/matrix");
const { parseArgs } = require("./src/core/arguments");
const { generateSecret } = require("./src/core/encryption");
const { loadConfig, saveConfig } = require("./src/core/config");
const { setReadline } = require("./src/ui/logger");
const { startConnection } = require("./src/net/connection");
const { createMasterPassword, masterPasswordExists, verifyMasterPassword } = require("./src/core/localAuth");

applyMatrixTheme();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

setReadline(rl);

function askMasterPasswordThen(callback) {
  rl.question("Senha de acesso: ", (pwd) => {
    if (!verifyMasterPassword(pwd)) {
      console.log("Senha incorreta!");
      return askMasterPasswordThen(callback);
    }
    callback();
  });
}

function setupMasterPassword(callback) {
  rl.question("Crie uma senha de acesso: ", (pwd1) => {
    rl.question("Repita a senha: ", (pwd2) => {
      if (pwd1 !== pwd2) {
        console.log("As senhas não coincidem.");
        return setupMasterPassword(callback);
      }
      createMasterPassword(pwd1);
      console.log("Senha criada com sucesso.");
      callback();
    });
  });
}

function askNew() {
  rl.question("Seu nome: ", (name) => {
    rl.question("Senha: ", (key) => {
      rl.question("Servidor (host:port): ", (addr) => {
        const [host, port] = addr.split(":");
        const SECRET = generateSecret(key);
        saveConfig({ name, key, host, port });
        startConnection(name, host, port, SECRET, rl);
      });
    });
  });
}

function runApp() {
  const params = parseArgs();

  if (params.host && params.port && params.name && params.key) {
    const SECRET = generateSecret(params.key);
    saveConfig(params);
    startConnection(params.name, params.host, params.port, SECRET, rl);
    return;
  }

  const last = loadConfig();
  if (last) {
    rl.question("Usar as mesmas configurações? (s/n): ", (a) => {
      if (a.toLowerCase() === "s") {
        const SECRET = generateSecret(last.key);
        startConnection(last.name, last.host, last.port, SECRET, rl);
      } else {
        askNew();
      }
    });
  } else {
    askNew();
  }
}

function main() {
  if (!masterPasswordExists()) {
    console.log("Nenhuma senha configurada. Vamos criar uma.");
    return setupMasterPassword(runApp);
  }

  askMasterPasswordThen(runApp);
}

main();
