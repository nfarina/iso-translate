import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
};
