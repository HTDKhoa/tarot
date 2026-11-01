import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Bản demo tĩnh một file: không Supabase, không payOS, API chạy trong trình duyệt.
export default defineConfig({
  root: r("."),
  publicDir: false,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: r("../src/") },
      { find: /^next\/link$/, replacement: r("./shims/next-link.tsx") },
      { find: /^next\/dynamic$/, replacement: r("./shims/next-dynamic.tsx") },
      { find: /^server-only$/, replacement: r("./shims/empty.ts") },
    ],
    dedupe: ["react", "react-dom", "three"],
  },
  define: { "process.env": "{}" },
  build: { outDir: r("./dist"), emptyOutDir: true, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5000 },
});
