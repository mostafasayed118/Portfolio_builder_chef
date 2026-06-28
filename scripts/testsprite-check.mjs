// TestSprite MCP Connection Check
import { spawn } from "node:child_process";

const API_KEY = process.env.API_KEY || process.env.TESTSRITE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: TESTSRITE_API_KEY not set");
  process.exit(1);
}

console.log(`API_KEY present: ${API_KEY.substring(0, 12)}...`);
console.log("Starting TestSprite MCP server...\n");

const cp = spawn(
  "npx",
  ["@testsprite/testsprite-mcp@latest", "server"],
  {
    env: { ...process.env, API_KEY },
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  }
);

let output = "";
cp.stdout.on("data", (d) => { output += d.toString(); });
cp.stderr.on("data", (d) => { output += d.toString(); });

cp.on("error", (e) => {
  console.error("spawn error:", e.message);
  process.exit(1);
});

setTimeout(() => {
  if (output.length > 0) {
    // Look for JSON-RPC or tool listings
    const lines = output.split("\n").filter(l => l.trim());
    console.log(`Received ${lines.length} lines of output:\n`);
    lines.slice(0, 30).forEach(l => console.log("  " + l.substring(0, 200)));
  } else {
    // Maybe it's waiting for MCP stdin - try writing initialize
    console.log("No output yet (server waiting for MCP handshake)");
    console.log("Writing MCP initialize request...\n");
    const init = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "opencode", version: "1.0.0" },
      },
    });
    cp.stdin.write(init + "\n");
  }

  setTimeout(() => {
    console.log("\n--- Full output ---\n");
    console.log(output.substring(0, 5000));
    cp.kill();
    process.exit(0);
  }, 4000);
}, 6000);
