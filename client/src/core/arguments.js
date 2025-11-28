function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--host": params.host = args[i + 1]; i++; break;
      case "--port": params.port = Number(args[i + 1]); i++; break;
      case "--name": params.name = args[i + 1]; i++; break;
      case "--key": params.key = args[i + 1]; i++; break;
    }
  }

  return params;
}

module.exports = { parseArgs };
