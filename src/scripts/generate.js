// src/scripts/generate.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const name = process.argv[2]; // e.g., lfm

if (!name) {
  console.error("❌ Please provide a module name: npm run generate Folder Name");
  process.exit(1);
}

const folderName = `${name}`;
const folderPath = path.join(__dirname, "..", "modules", folderName);

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const files = [
  `${name}.validation.ts`,
  `${name}.controller.ts`,
  `${name}.service.ts`,
  `${name}.routes.ts`,
  `${name}.model.ts`,
  `${name}.interface.ts`,
];

files.forEach((file) => {
  const filePath = path.join(folderPath, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `// ${file}\n`);
    console.log(`✅ Created: ${filePath}`);
  }
});
