import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const path = fileURLToPath(import.meta.url);

export default defineConfig({
  root: join(dirname(path), "client"),
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "version-file-handler",
      configureServer(server) {
        // Handle version.json requests directly
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith("/version.json")) {
            try {
              const versionPath = join(dirname(path), "version.json");
              const content = fs.readFileSync(versionPath, "utf8");

              res.setHeader("Content-Type", "application/json");
              res.setHeader(
                "Cache-Control",
                "no-cache, no-store, must-revalidate",
              );
              res.end(content);
              return;
            } catch (error) {
              console.error("Error serving version.json:", error);
            }
          }
          next();
        });

        console.log("✓ Version file handler middleware configured");
      },
      writeBundle() {
        const versionPath = join(dirname(path), "version.json");
        const destPath = join(dirname(path), "dist/version.json");
        fs.copyFileSync(versionPath, destPath);
        console.log("✓ Copied version.json to dist folder");
      },
    },
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
