import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import runBuiltFiles from "./vite-run-built";

export default defineConfig({
	plugins: [dts(), runBuiltFiles()],
	build: {
		sourcemap: "inline",
		lib: {
			entry: "./src/main.ts",
			formats: ["es"],
			fileName: "main",
		},
	},
	optimizeDeps: {
		exclude: ["*"], // exclude all modules from being bundled
	},
});
