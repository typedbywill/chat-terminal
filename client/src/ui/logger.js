const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

let logBuffer = [];
let rl;
const MAX_LOG = 60;

function timestamp() {
  return `${COLORS.gray}[${new Date().toLocaleTimeString()}]${COLORS.reset}`;
}

function setReadline(ref) {
  rl = ref;
}

function addLog(msg, color = COLORS.green) {
  const line = `${timestamp()} ${color}${msg}${COLORS.reset}`;
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG) logBuffer.shift();
  redraw();
}

function redraw() {
  console.clear();
  console.log(`${COLORS.cyan}=== MENSAGENS DO SERVIDOR ===${COLORS.reset}`);
  for (const line of logBuffer) console.log(line);
  console.log(`\n${COLORS.yellow}=== VOCÊ ===${COLORS.reset}`);
  rl.prompt(true);
}

function clearLogs() {
  logBuffer.length = 0;
  redraw();
}

module.exports = { addLog, redraw, setReadline, clearLogs, COLORS };