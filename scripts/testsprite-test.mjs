// TestSprite: Create project + run tests for Chef Mohamed Portfolio
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("ERROR: API_KEY env var required");
  process.exit(1);
}

const PRD = readFileSync("docs/TESTSRITE_PRD.md", "utf-8");
const BLUEPRINT = readFileSync("docs/IMPLEMENTATION_BLUEPRINT.md", "utf-8");

console.log("=".repeat(60));
console.log("TestSprite — Spec-Driven Testing Setup");
console.log("Project: Chef Mohamed Portfolio");
console.log("API Key: " + API_KEY.substring(0, 12) + "...");
console.log("PRD size: " + PRD.length + " bytes");
console.log("Blueprint size: " + BLUEPRINT.length + " bytes");
console.log("=".repeat(60));

// MCP protocol interaction
async function callMcp() {
  return new Promise((resolve, reject) => {
    const cp = spawn("npx", ["@testsprite/testsprite-mcp@latest", "server"], {
      env: { ...process.env, API_KEY },
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let response = "";
    cp.stdout.on("data", (d) => { response += d.toString(); });
    cp.stderr.on("data", (d) => { response += d.toString(); });

    cp.on("error", (e) => reject(e));

    // Give it time to start, then send initialize
    setTimeout(() => {
      if (!response) {
        // Send MCP initialize
        const init = JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              resources: {},
              prompts: {},
            },
            clientInfo: { name: "opencode-cli", version: "1.0.0" },
          },
        });
        cp.stdin.write(init + "\n");
      }
    }, 2000);

    // Collect and finish
    const timer = setTimeout(() => {
      cp.kill();
      // Try the TestSprite API directly
      callTestSpriteAPI().then(resolve).catch(reject);
    }, 15000);

    cp.stdout.on("end", () => clearTimeout(timer));
  });
}

// Direct API call approach
async function callTestSpriteAPI() {
  const BASE = "https://api.testsprite.com/v1";
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  console.log("\n[1/4] Creating TestSprite project...\n");

  try {
    const createRes = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Chef Mohamed Portfolio",
        type: "ui",
        description: "Bilingual artisan bakery portfolio with admin CMS",
        url: "http://localhost:3000",
        prd: PRD.substring(0, 15000),
        tags: ["nextjs", "convex", "clerk", "bilingual", "artisan-bakery"],
      }),
    });

    const project = await createRes.json();
    console.log("  Project created:", project.id || project.name || JSON.stringify(project).substring(0, 200));
    return project;
  } catch (e) {
    console.log("  API error (may need web portal):", e.message);
    console.log("\n  → Please use the TestSprite Web Portal instead:");
    console.log("    1. Go to https://www.testsprite.com/dashboard");
    console.log("    2. Click 'Create Tests'");
    console.log("    3. Name: 'Chef Mohamed Portfolio'");
    console.log("    4. Upload PRD: docs/TESTSRITE_PRD.md");
    console.log("    5. URL: http://localhost:3000");
    console.log("    6. Auth: Clerk admin credentials");
    return null;
  }
}

callMcp()
  .then((r) => {
    console.log("\n" + "=".repeat(60));
    if (r) {
      console.log("✅ TestSprite project setup complete!");
    } else {
      console.log("ℹ️  Use TestSprite Web Portal for full setup guide.");
      console.log("   See docs/TESTSRITE_SETUP.md");
    }
    console.log("=".repeat(60));
  })
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  });
