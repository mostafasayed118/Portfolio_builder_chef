import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

const rl = createInterface({ input: stdin, output: stdout });

try {
  const password = await rl.question("Enter admin password: ");
  const confirm = await rl.question("Confirm password: ");

  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log("\nYour bcrypt hash (paste into ADMIN_PASSWORD_HASH in .env.local):\n");
  console.log(hash);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
} finally {
  rl.close();
}
