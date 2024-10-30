import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "markdown.js",
      name: "MarkdownJS",
      fileName: (format) => `markdown.${format}.js`,
    }
  },
});
