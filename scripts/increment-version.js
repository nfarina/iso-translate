import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFilePath = path.join(__dirname, "..", "version.json");

// Read the current version
const versionData = JSON.parse(fs.readFileSync(versionFilePath, "utf8"));
const currentVersion = versionData.version;

// Split version into parts
const versionParts = currentVersion.split(".");
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

// Increment patch version
const newPatch = patch + 1;
const newVersion = `${major}.${minor}.${newPatch}`;

// Update the version file
versionData.version = newVersion;
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

console.log(`Version incremented: ${currentVersion} -> ${newVersion}`);
