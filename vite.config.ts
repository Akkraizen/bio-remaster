import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import * as path from "node:path";
import packageJson from "./package.json";
import { bootConfig } from "./src/config/boot.ts";

const BOOT_CONFIG_PLACEHOLDER = "__BOOT_CONFIG__";

function bootConfigPlugin(): Plugin {
  return {
    name: "boot-config",
    transformIndexHtml(html) {
      if (!html.includes(BOOT_CONFIG_PLACEHOLDER))
        throw new Error(
          `index.html is missing the ${BOOT_CONFIG_PLACEHOLDER} placeholder`
        );
      return html.replace(BOOT_CONFIG_PLACEHOLDER, JSON.stringify(bootConfig));
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), bootConfigPlugin()],
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
  }
});
