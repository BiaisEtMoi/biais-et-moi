import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

// Custom plugin to rebuild IAT bundle when source files change
function iatBundlePlugin() {
  let isBuilding = false;

  async function buildBundle() {
    if (isBuilding) return;
    isBuilding = true;

    console.log("Building IAT bundle...");
    try {
      const rjsPath = path.join(__dirname, "node_modules", ".bin", "r.js");
      const configPath = path.join(__dirname, "build.config.js");
      await execAsync(`"${rjsPath}" -o "${configPath}"`, { cwd: __dirname });
      console.log("✓ IAT bundle built successfully");
    } catch (error) {
      console.error("✗ Failed to build IAT bundle:", error);
    } finally {
      isBuilding = false;
    }
  }

  return {
    name: "iat-bundle",

    // Build on server start
    async buildStart() {
      await buildBundle();
    },

    // Rebuild on file changes
    async handleHotUpdate({ file }: { file: string }) {
      if (file.includes("iat-script.js") || file.includes("iat5.js")) {
        console.log("IAT source changed, rebuilding bundle...");
        await buildBundle();
      }
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), iatBundlePlugin()],
  server: {
    fs: {
      // Allow serving files from bower_components
      allow: [".."],
    },
  },
});
