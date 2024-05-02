import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import runBuiltFiles from "./vite-run-built";

export default defineConfig({
	plugins: [dts(), runBuiltFiles()],
	build: {
		target: "node21",
		sourcemap: "inline",
		lib: {
			entry: "./src/main.ts",
			formats: ["es"],
			fileName: "main",
		},
		ssr: true, // this is set so that vite doesn't complain about Node.js modules like fs, path, etc.
	},
	optimizeDeps: {
		exclude: ["*"], // exclude all modules from being bundled
	},
});
