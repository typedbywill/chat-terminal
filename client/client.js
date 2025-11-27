const net = require("net");
const crypto = require("crypto");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// ===================== CONFIGURAÇÕES ======================
const CONFIG_FILE = path.join(__dirname, "config.json");
const SECRET = crypto.createHash('sha256').update('minha_senha_segura').digest();
const ALGO = "aes-256-gcm";
const MAX_LOG_LINES = 60;
const RECONNECT_DELAY = 5000; // 5 segundos

// Cores ANSI
const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

// Buffer de mensagens
let logBuffer = [];

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

// ===================== FUNÇÕES DE INTERFACE =====================
function timestamp() {
  return `${COLORS.gray}[${new Date().toLocaleTimeString()}]${COLORS.reset}`;
}

function addLog(msg, color = COLORS.green) {
  const line = `${timestamp()} ${color}${msg}${COLORS.reset}`;
  logBuffer.push(line);

  if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
  redraw();
}

function redraw() {
  console.clear();
  console.log(`${COLORS.cyan}=== MENSAGENS DO SERVIDOR ===${COLORS.reset}`);
  for (const line of logBuffer) console.log(line);
  console.log(`\n${COLORS.yellow}=== VOCÊ ===${COLORS.reset}`);
  rl.prompt(true);
}

// ===================== INPUT DO USUÁRIO =====================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askConfigAndConnect() {
  const useLast = fs.existsSync(CONFIG_FILE) ? true : false;

  const proceedWithLastConfig = () => {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    startConnection(config.name, config.host, config.port);
  };

  if (useLast) {
    rl.question("Usar as mesmas configurações de antes? (s/n): ", (answer) => {
      if (answer.toLowerCase() === 's') {
        proceedWithLastConfig();
      } else {
        askNewConfig();
      }
    });
  } else {
    askNewConfig();
  }
}

function askNewConfig() {
  rl.question("Seu nome: ", (name) => {
    rl.question("Servidor (ex: 192.168.0.50:5888): ", (addr) => {
      const [host, port] = addr.split(":");
      if (!host || !port) {
        console.log("Endereço inválido.");
        process.exit(1);
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ name, host, port: Number(port) }));
      startConnection(name, host, Number(port));
    });
  });
}

// ===================== CONEXÃO TCP =====================
function startConnection(name, host, port) {
  let socket = net.createConnection({ host, port }, () => {
    addLog(`Conectado a ${host}:${port}`, COLORS.green);
    const hello = encrypt(Buffer.from(`${name} entrou no chat.\n`));
    socket.write(hello);
  });

  socket.on("data", (data) => {
    try {
      const msg = decrypt(data).toString().trim();
      addLog(`SERVER: ${msg}`, COLORS.cyan);
    } catch {
      addLog("Mensagem inválida ou corrompida", COLORS.red);
    }
  });

  socket.on("end", () => {
    addLog("Conexão encerrada pelo servidor.", COLORS.red);
    attemptReconnect(name, host, port);
  });

  socket.on("error", (err) => {
    addLog(`Erro: ${err.message}`, COLORS.red);
    attemptReconnect(name, host, port);
  });

  // Entrada contínua
  rl.setPrompt("> ");
  rl.on("line", (text) => {
    if (!text.trim()) return rl.prompt();
    const payload = encrypt(Buffer.from(`${name}: ${text}\n`));
    socket.write(payload);
    addLog(`Você: ${text}`, COLORS.yellow);
    rl.prompt();
  });
}

function attemptReconnect(name, host, port) {
  addLog(`Tentando reconectar em ${RECONNECT_DELAY / 1000} segundos...`, COLORS.yellow);
  setTimeout(() => startConnection(name, host, port), RECONNECT_DELAY);
}

// ===================== INÍCIO =====================
askConfigAndConnect();
