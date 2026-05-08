import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createZip() {
  const zip = new AdmZip();
  
  // Add directories and files manually to avoid zipping node_modules or large dist folders
  const includeFolders = ["app", "android-architecture", ".github"];
  const includeFiles = ["build.gradle", "settings.gradle", "proguard-rules.pro", "CMakeLists.txt", "v2-tactical.md"];

  includeFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
      zip.addLocalFolder(folder, folder);
    }
  });

  includeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      zip.addLocalFile(file);
    } else {
      // For any loose Kotlin files in the root that shouldn't be there, let's grab them
      const files = fs.readdirSync(".");
      files.forEach(f => {
          if(f.endsWith(".kt") || f.endsWith(".md") || f.endsWith(".sh")) {
              try {
                  zip.addLocalFile(f);
              } catch(e) {}
          }
      });
    }
  });
  
  // Also get the root loose .kt files 
  const files = fs.readdirSync(".");
  files.forEach(f => {
      if(f.endsWith(".kt") || f.endsWith(".md") || f.endsWith(".sh") || f.endsWith(".yaml")) {
          try {
              zip.addLocalFile(f);
          } catch(e) {}
      }
  });

  const outputDir = path.join(__dirname, "../public");
  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "Mirage-Android-Project.zip");
  
  zip.writeZip(outputPath);
  console.log("Zip created successfully at " + outputPath);
}

createZip().catch(console.error);
