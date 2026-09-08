import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: "care_excalidraw",
      filename: "remoteEntry.js",
      exposes: {
        "./manifest": "./src/manifest.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-i18next",
        "@tanstack/react-query",
        "raviger",
        "sonner",
      ],
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    target: "esnext",
    minify: true,
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: [],
      input: {
        main: "./src/index.tsx",
      },
      output: {
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // @base-ui/react's stores import the CommonJS-only
      // `use-sync-external-store` shim. Under @originjs/vite-plugin-federation,
      // a CJS `require("react")` is NOT rewritten to the shared (host) React,
      // so it binds to the remote's *bundled* React whose dispatcher is null:
      //   "Cannot read properties of null (reading 'useSyncExternalStore')"
      // Aliasing to ESM files that import React as a bare specifier lets
      // federation route them to the single shared instance.
      // Same fix as care_excalidraw_fe/vite.config.ts.
      "use-sync-external-store/shim/with-selector.js": path.resolve(
        __dirname,
        "./src/shims/with-selector.ts",
      ),
      "use-sync-external-store/shim/with-selector": path.resolve(
        __dirname,
        "./src/shims/with-selector.ts",
      ),
      "use-sync-external-store/shim/index.js": path.resolve(
        __dirname,
        "./src/shims/shim.ts",
      ),
      "use-sync-external-store/shim": path.resolve(
        __dirname,
        "./src/shims/shim.ts",
      ),
    },
  },
  preview: {
    port: 4173,
    allowedHosts: true,
    host: "0.0.0.0",
    cors: true,
  },
});
