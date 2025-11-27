const net = require("net");
const crypto = require("crypto");
const readline = require("readline");
const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");

// ===================== CONFIGURAÇÕES ======================
const SECRET = crypto.createHash('sha256').update('minha_senha_segura').digest();
const ALGO = "aes-256-gcm";
const MAX_LOG_LINES = 60;
const LOG_FILE = path.join(__dirname, "mensagens.log");

// ===================== FUNÇÕES DE LOG ======================
function saveLogToFile(msg) {
  fs.appendFile(LOG_FILE, msg + "\n", (err) => {
    if (err) console.error("Erro ao salvar log:", err);
  });
}

const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

let logBuffer = [];
const events = new EventEmitter();

function timestamp() {
  return `${COLORS.gray}[${new Date().toLocaleTimeString()}]${COLORS.reset}`;
}

function addLog(msg, color = COLORS.green) {
  const line = `${timestamp()} ${color}${msg}${COLORS.reset}`;
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
  redraw();

  const plainLine = `${new Date().toISOString()} ${msg}`;
  saveLogToFile(plainLine);
}

function redraw() {
  console.clear();
  console.log(`${COLORS.cyan}=== MENSAGENS DO SERVIDOR ===${COLORS.reset}`);
  for (const line of logBuffer) console.log(line);
  console.log(`\n${COLORS.yellow}=== VOCÊ ===${COLORS.reset}`);
  rl.prompt(true);
}

// ===================== ENCRYPT / DECRYPT =====================
function encrypt(msg) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(msg), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(buffer) {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const text = buffer.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, SECRET, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(text), decipher.final()]);
}

// ===================== INTERFACE =====================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ===================== VARIÁVEIS =====================
let connected = false;
let activeSocket = null; // socket do cliente atual
let serverName = "";

// Listener de entrada do usuário
rl.setPrompt("> ");
rl.on("line", (text) => {
  if (!text.trim()) return rl.prompt();
  if (!activeSocket) {
    addLog("Nenhum cliente conectado.", COLORS.red);
    return rl.prompt();
  }

  const payload = encrypt(Buffer.from(`${serverName}: ${text}\n`));
  activeSocket.write(payload);
  addLog(`Você: ${text}`, COLORS.yellow);
  rl.prompt();
});

// ===================== SERVIDOR =====================
rl.question("Nome do servidor: ", (name) => {
  serverName = name;

  const server = net.createServer((socket) => {
    if (connected) {
      socket.write(encrypt(Buffer.from("Servidor ocupado, tente mais tarde.\n")));
      socket.end();
      return;
    }

    connected = true;
    activeSocket = socket;

    addLog("Cliente conectado.", COLORS.green);
    events.emit("notification", "Nova conexão!");

    socket.on("data", (data) => {
      try {
        const msg = decrypt(data).toString().trim();
        addLog(`Cliente: ${msg}`, COLORS.cyan);
        events.emit("notification", `Nova mensagem: ${msg}`);
      } catch {
        addLog("Mensagem inválida ou corrompida", COLORS.red);
        socket.end();
      }
    });

    socket.on("end", () => {
      addLog("Cliente desconectado.", COLORS.red);
      connected = false;
      activeSocket = null;
    });

    socket.on("error", (err) => {
      addLog(`Erro na conexão: ${err.message}`, COLORS.red);
      connected = false;
      activeSocket = null;
    });
  });

  server.listen(5888, () => {
    addLog(`Servidor '${serverName}' aguardando conexão na porta 5888...`, COLORS.green);
  });
});

// ===================== NOTIFICAÇÕES =====================
events.on("notification", (msg) => {
  process.stdout.write('\x07'); // beep
});
