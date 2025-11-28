const net = require("net");
const { encrypt, decrypt } = require("../core/encryption");
const { addLog, clearLogs, COLORS } = require("../ui/logger");
const { handleServerCommand } = require("./commands");

const RECONNECT_DELAY = 5000;

function startConnection(name, host, port, SECRET, rl) {
  let socket = net.createConnection({ host, port }, () => {
    addLog(`Conectado a ${host}:${port}`, COLORS.green);
    const hello = encrypt(Buffer.from(`${name} entrou no chat.\n`), SECRET);
    socket.write(hello);
  });

  const onData = (data) => {
    try {
      const msg = decrypt(data, SECRET).toString().trim();

      const cmd = handleServerCommand(msg);
      if (cmd?.server === "clear") {
        clearLogs();
        return;
      }

      addLog(`SERVER: ${msg}`, COLORS.cyan);

    } catch (err) {
      addLog("Mensagem inválida ou corrompida", COLORS.red);
    }
  };

  const onEnd = () => {
    addLog("Conexão encerrada pelo servidor.", COLORS.red);
    cleanupAndReconnect();
  };

  const onError = (err) => {
    addLog(`Erro: ${err.message}`, COLORS.red);
    cleanupAndReconnect();
  };

  const onLine = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return rl.prompt();

    const payload = encrypt(Buffer.from(`${name}: ${trimmed}\n`), SECRET);
    socket.write(payload);

    addLog(`Você: ${trimmed}`, COLORS.yellow);
    rl.prompt();
  };

  socket.on("data", onData);
  socket.on("end", onEnd);
  socket.on("error", onError);

  rl.setPrompt("> ");
  rl.on("line", onLine);

  function cleanupAndReconnect() {
    try {
      socket.removeListener("data", onData);
      socket.removeListener("end", onEnd);
      socket.removeListener("error", onError);
      socket.destroy();
    } catch (_) { }

    rl.removeListener("line", onLine);

    addLog(`Tentando reconectar em ${RECONNECT_DELAY / 1000} segundos...`, COLORS.yellow);
    setTimeout(() => startConnection(name, host, port, SECRET, rl), RECONNECT_DELAY);
  }
}

module.exports = { startConnection };
