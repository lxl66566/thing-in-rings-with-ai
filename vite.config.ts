import { defineConfig, type UserConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

const _default_1: UserConfig = defineConfig({
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
export default _default_1;
