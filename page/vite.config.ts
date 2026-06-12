import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootPackageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
) as { version: string };

export default defineConfig({
  plugins: [react()],
  base: "/",
  define: {
    __PACKAGE_VERSION__: JSON.stringify(rootPackageJson.version),
  },
});
