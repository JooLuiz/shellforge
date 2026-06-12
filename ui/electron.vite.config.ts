import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

const uiRootPath = path.dirname(fileURLToPath(import.meta.url));
const resourcesSourcePath = path.join(uiRootPath, "resources");
const resourcesOutputPath = path.join(uiRootPath, "out", "resources");

function copyResourcesPlugin(): Plugin {
  return {
    name: "copy-shell-forge-resources",
    closeBundle() {
      if (!existsSync(resourcesSourcePath)) {
        return;
      }

      mkdirSync(resourcesOutputPath, { recursive: true });
      cpSync(resourcesSourcePath, resourcesOutputPath, { recursive: true });
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyResourcesPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react()],
  },
});
