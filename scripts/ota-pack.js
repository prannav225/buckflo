import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

console.log("📦 Starting Custom OTA Packer...");

// 1. Read package.json version
const pkgStr = fs.readFileSync(path.join(rootDir, "package.json"), "utf8");
const pkg = JSON.parse(pkgStr);
const version = pkg.version;

// 2. Generate version.json in the dist folder
console.log(`📝 Generating version.json for version ${version}...`);
fs.writeFileSync(
  path.join(distDir, "version.json"),
  JSON.stringify({ version, timestamp: Date.now() })
);

// 3. Zip the dist folder contents
console.log(`🗜 Zipping OTA payload to dist/update.zip...`);
try {
  // We navigate to dist and zip everything, excluding any existing update.zip
  execSync("cd dist && zip -r update.zip . -x update.zip", {
    stdio: "inherit",
    cwd: rootDir,
  });
  console.log("✅ OTA Pack successful!");
  console.log(`🌐 File will be hosted at: <your-vercel-url>/update.zip`);
} catch (err) {
  console.error("❌ Failed to create update.zip", err);
  process.exit(1);
}
