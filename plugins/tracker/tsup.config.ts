import { defineConfig } from "tsup"
import type { Plugin } from "esbuild"

const scssPlugin: Plugin = {
  name: "scss-text",
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async (args) => {
      const sass = await import("sass")
      return { contents: sass.compile(args.path).css, loader: "text" }
    })
  },
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
  splitting: false,
  outDir: "dist",
  platform: "node",
  external: ["preact", "preact/hooks", "preact/jsx-runtime"],
  esbuildOptions(options) {
    options.jsx = "automatic"
    options.jsxImportSource = "preact"
  },
  esbuildPlugins: [scssPlugin],
})
