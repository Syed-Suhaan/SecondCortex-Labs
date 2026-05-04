#!/usr/bin/env node

const path = require("node:path");

const loadConfigModule = require("next/dist/server/config");
const { startServer } = require("next/dist/server/lib/start-server");
const { setGlobal } = require("next/dist/trace/shared");
const { PHASE_DEVELOPMENT_SERVER } = require("next/dist/shared/lib/constants");
const nextPackage = require("next/package.json");

const loadConfig = loadConfigModule.default || loadConfigModule;
const dir = path.resolve(__dirname, "..");
const port = Number.parseInt(process.env.PORT || "3002", 10);
const hostname = process.env.HOSTNAME || undefined;

process.env.NODE_ENV ||= "development";
process.env.NEXT_RUNTIME ||= "nodejs";
process.env.__NEXT_VERSION ||= nextPackage.version;

async function main() {
  const config = await loadConfig(PHASE_DEVELOPMENT_SERVER, dir);

  setGlobal("phase", PHASE_DEVELOPMENT_SERVER);
  setGlobal("distDir", path.join(dir, config.distDir || ".next"));

  await startServer({
    dir,
    port,
    hostname,
    allowRetry: false,
    isDev: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
