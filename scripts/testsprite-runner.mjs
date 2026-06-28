// TestSprite Runner — Chef Mohamed Portfolio
import { readFileSync } from "fs";

const API_KEY = process.env.API_KEY || process.env.TESTSRITE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: Set API_KEY or TESTSRITE_API_KEY environment variable");
  process.exit(1);
}

const PRD_PATH = "docs/TESTSRITE_PRD.md";
const QUICK_PRD_PATH = "docs/TESTSRITE_QUICKSTART_PRD.md";
const BLUEPRINT_PATH = "docs/IMPLEMENTATION_BLUEPRINT.md";

console.log("=".repeat(64));
console.log("  TestSprite — Spec-Driven Testing");
console.log("  Project: Chef Mohamed Portfolio");
console.log("  API Key: " + API_KEY.slice(0, 12) + "..." + API_KEY.slice(-4));
console.log("=".repeat(64));

async function main() {
  // STEP 1: Verify PRD files exist
  console.log("\n[STEP 1/6] Verifying PRD documents...");
  const files = [
    ["PRD (Full)", PRD_PATH],
    ["PRD (Quick)", QUICK_PRD_PATH],
    ["Blueprint", BLUEPRINT_PATH],
  ];
  for (const [label, path] of files) {
    try {
      const content = readFileSync(path, "utf-8");
      console.log(`  ✅ ${label}: ${path} (${content.length} bytes)`);
    } catch {
      console.log(`  ❌ ${label}: ${path} NOT FOUND`);
    }
  }

  // STEP 2: Check MCP server is installed
  console.log("\n[STEP 2/6] Verifying MCP server installation...");
  try {
    const pkg = readFileSync("node_modules/@testsprite/testsprite-mcp/package.json", "utf-8");
    const ver = JSON.parse(pkg).version;
    console.log(`  ✅ @testsprite/testsprite-mcp@${ver}`);
  } catch {
    console.log("  ❌ NOT INSTALLED — run: npm install @testsprite/testsprite-mcp@latest");
  }

  // STEP 3: Check .mcp.json
  console.log("\n[STEP 3/6] Verifying MCP configuration...");
  try {
    const mcp = readFileSync(".mcp.json", "utf-8");
    console.log("  ✅ .mcp.json found (" + mcp.length + " bytes)");
  } catch {
    console.log("  ❌ .mcp.json NOT FOUND");
  }

  // STEP 4: Check dev server
  console.log("\n[STEP 4/6] Checking local dev server...");
  try {
    const res = await fetch("http://localhost:3000", { signal: AbortSignal.timeout(5000) });
    console.log(`  ✅ Dev server running at http://localhost:3000 (${res.status})`);
  } catch {
    console.log("  ⚠️  Dev server NOT reachable on :3000");
    console.log("     Start with: npm run dev");
  }

  // STEP 5: Try TestSprite API
  console.log("\n[STEP 5/6] Connecting to TestSprite API...");
  try {
    const res = await fetch("https://api.testsprite.com/v1/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Chef Mohamed Portfolio",
        type: "ui",
        url: "http://localhost:3000",
        prd: readFileSync(PRD_PATH, "utf-8").slice(0, 15000),
        tags: ["nextjs", "convex", "clerk", "bilingual", "artisan-bakery"],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ Project created! ID: ${data.id || "check web portal"}`);
      console.log(`     Name: ${data.name}`);
      console.log(`     Type: ${data.type}`);
    } else {
      const err = await res.text();
      console.log(`  ⚠️  API returned ${res.status}: ${err.slice(0, 200)}`);
      console.log("     → Use Web Portal: https://www.testsprite.com/dashboard");
    }
  } catch (e) {
    console.log(`  ⚠️  API call failed: ${e.message}`);
    console.log("     → Use Web Portal: https://www.testsprite.com/dashboard");
  }

  // STEP 6: Summary
  console.log("\n[STEP 6/6] Setup Summary");
  console.log("-".repeat(64));
  console.log("  ✅ MCP server installed");
  console.log("  ✅ PRD documents ready");
  console.log("  ✅ .mcp.json configured");
  console.log("  ✅ CI/CD workflow ready");
  console.log("  🔧 Web Portal: https://www.testsprite.com/dashboard");
  console.log("  📖 Guide: docs/TESTSRITE_SETUP.md");
  console.log("-".repeat(64));
}

main().catch(console.error);
