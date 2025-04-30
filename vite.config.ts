import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), solidPlugin()],
  server: {
    port: 3000,
  },
  base: "/thing-in-rings-with-ai/",
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    include: ["solid-markdown > micromark", "solid-markdown > unified"], // https://github.com/andi23rosca/solid-markdown/issues/33
  },
});
