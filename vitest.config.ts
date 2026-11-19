import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { imagetools } from "vite-imagetools";
import { cvPlugin } from "./scripts/cv-plugin.ts";
import * as path from "node:path";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [vue(), imagetools(), cvPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@style": path.resolve(__dirname, "./src/common/style"),
      "@assets": path.resolve(__dirname, "./src/assets/"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@views": path.resolve(__dirname, "./src/views")
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts", "api/**/*.test.ts"],
    restoreMocks: true
  }
});
