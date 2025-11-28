const InputHandler = require("./input");

const input = new InputHandler("> ");

input.on("message", (msg) => {
  // enviar para o servidor
});

input.on("command", (cmd) => {
  if (cmd === "/clear") {
    // limpar logs
  }
});

input.on("exit", () => {
  process.exit(0);
});
