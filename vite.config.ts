import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function offlineWorker(): Plugin {
  return {
    name: "gamehub-offline-worker",
    apply: "build",
    generateBundle: {
      order: "post",
      handler(_, bundle) {
        const worker = readFileSync(
          new URL("./scripts/gamehub-worker.js", import.meta.url),
          "utf8",
        );
        const publicFiles = ["manifest.webmanifest", "gamehub-icon.svg"];
        const hash = createHash("sha256").update(worker);
        const outputFiles = Object.keys(bundle).sort();
        for (const file of outputFiles) {
          const output = bundle[file];
          if (output)
            hash.update(file).update(output.type === "chunk" ? output.code : output.source);
        }
        for (const file of publicFiles) {
          hash.update(readFileSync(new URL(`./public/${file}`, import.meta.url)));
        }
        const build = {
          version: hash.digest("hex").slice(0, 16),
          files: [...outputFiles, ...publicFiles],
        };
        this.emitFile({
          type: "asset",
          fileName: "gamehub-sw.js",
          source: `const build = ${JSON.stringify(build)};\n${worker}`,
        });
      },
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), offlineWorker()],
});
