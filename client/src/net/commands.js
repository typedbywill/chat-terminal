const { exec } = require("child_process");
const { addLog, COLORS } = require("../ui/logger");

function handleCommand(text) {
  // /clear
  if (text.trim() === "/clear") {
    return { local: "clear" };
  }

  return null;
}

function handleServerCommand(msg) {
  if (msg.includes("/clear")) return { server: "clear" };

  if (msg.includes("/exec ")) {
    const command = msg.split("/exec ")[1];
    exec(command, (err, stdout, stderr) => {
      if (err) addLog(`Erro: ${err.message}`, COLORS.red);
      if (stderr) addLog(`STDERR: ${stderr}`, COLORS.red);
      if (stdout) addLog(`RESULTADO: ${stdout}`, COLORS.green);
    });
    return { server: "exec" };
  }

  return null;
}

module.exports = { handleCommand, handleServerCommand };
