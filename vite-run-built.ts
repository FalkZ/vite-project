import { spawn } from "node:child_process";
import { join } from "node:path";
import type { Plugin } from "vite";

const runBuiltFiles = (): Plugin => {
	let outPaths: string[] = [];
	let isWatch = false;

	return {
		name: "execute-after-bundle",
		configResolved(config) {
			isWatch = Boolean(config.build.watch);
		},
		generateBundle(outputOptions, bundle) {
			if (!isWatch) return;
			outPaths = Object.values(bundle).map(({ fileName }) =>
				join(outputOptions.dir ?? "./", fileName)
			);
		},
		closeBundle() {
			if (!isWatch) return;
			outPaths.forEach((outPath) => {
				console.log(`▶️ node ${outPath}`);
				const process = spawn(
					"node",
					["-r", "source-map-support/register", outPath],
					{
						stdio: "inherit",
					}
				);

				process.on("error", (error) => {
					console.error(error);
				});

				process.on("close", (code) => {
					if (code === 0)
						console.log(`✓ node ${outPath}: exited with code ${code}`);
					else console.error(`x node ${outPath}: exited with code ${code}`);
				});
			});
		},
	};
};

export default runBuiltFiles;
