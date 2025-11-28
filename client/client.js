const readline = require("readline");
const { applyMatrixTheme } = require("./src/ui/matrix");
const { parseArgs } = require("./src/core/arguments");
const { generateSecret } = require("./src/core/encryption");
const { loadConfig, saveConfig } = require("./src/core/config");
const { setReadline } = require("./src/ui/logger");
const { startConnection } = require("./src/net/connection");

applyMatrixTheme();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

setReadline(rl);

function main() {
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
}

main();
