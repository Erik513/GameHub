import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const businessRoot = join(projectRoot, "src", "business");
const sourceExtensions = new Set([".ts", ".tsx"]);
const forbiddenPackages = new Set(["react", "react-dom", "idb"]);
const forbiddenLayerSegments = ["/presentation/", "/data/", "/infrastructure/", "/app/", "/i18n/"];
const violations = [];

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(directory, entry.name);
      return entry.isDirectory() ? collectSourceFiles(entryPath) : [entryPath];
    }),
  );

  return nestedFiles.flat().filter((filePath) => sourceExtensions.has(extname(filePath)));
}

for (const filePath of await collectSourceFiles(businessRoot)) {
  const source = await readFile(filePath, "utf8");
  const imports = source.matchAll(/(?:import|export)\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g);

  for (const match of imports) {
    const importPath = match[1];
    if (!importPath) continue;

    const normalizedImport = importPath.replaceAll("\\", "/");
    const importsForbiddenPackage = [...forbiddenPackages].some(
      (packageName) =>
        normalizedImport === packageName || normalizedImport.startsWith(`${packageName}/`),
    );
    const importsOuterLayer = forbiddenLayerSegments.some((segment) =>
      normalizedImport.includes(segment),
    );

    if (importsForbiddenPackage || importsOuterLayer) {
      violations.push(`${relative(projectRoot, filePath)} imports ${importPath}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Business boundary violations detected:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Business boundary check passed.");
}
