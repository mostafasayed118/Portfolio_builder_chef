import { writeFileSync } from "fs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GENERATED PASSWORD — RECORD THIS VALUE SECURELY
const password = crypto.randomBytes(16).toString("hex");
const hash = bcrypt.hashSync(password, 12);
const secret = crypto.randomBytes(32).toString("hex");
const convexSecret = crypto.randomBytes(32).toString("hex");

const content = `# Deployment used by npx convex dev
CONVEX_DEPLOYMENT=dev:reliable-deer-270

NEXT_PUBLIC_CONVEX_URL=https://reliable-deer-270.convex.cloud

NEXT_PUBLIC_CONVEX_SITE_URL=https://reliable-deer-270.convex.site

# Auth
ADMIN_USERNAME=mohamedabo
ADMIN_PASSWORD_HASH=${hash}
SESSION_SECRET=${secret}
ADMIN_CONVEX_SECRET=${convexSecret}
`;

writeFileSync(".env.local", content, "utf8");

console.log("Verified hash:", bcrypt.compareSync(password, hash) ? "PASS" : "FAIL");
console.log("Generated password:", password);
console.log("Username: mohamedabo");
console.log("");
console.log("env.local written. Restart dev server now.");
