import { spawn } from "node:child_process";
import { join } from "node:path";
import type { Plugin } from "vite";

const runBuiltFiles = (): Plugin => {
	let outPaths: string[] = [];
	let isWatch = false;

	let lastProcess;
	let argsAfterDoubleDash;

	process.on("exit", () => {
		if (lastProcess) lastProcess.kill("SIGKILL");
	});

	return {
		name: "execute-after-bundle",
		configResolved(config) {
			const argsIndex = process.argv.indexOf("--");
			argsAfterDoubleDash =
				argsIndex !== -1 ? process.argv.slice(argsIndex + 1) : [];

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
				if (lastProcess) lastProcess.kill("SIGKILL");

				const stringCommand = `node ${outPath} ${argsAfterDoubleDash.join(
					" "
				)}`;

				console.log(`▶️ ${stringCommand}`);
				lastProcess = spawn(
					"node",
					[
						"-r",
						"source-map-support/register",
						outPath,
						...argsAfterDoubleDash,
					],
					{
						stdio: "inherit",
					}
				);

				lastProcess.on("error", (error) => {
					console.error(error);
				});

				lastProcess.on("close", (code) => {
					if (!code) return; // was killed
					if (code === 0)
						console.log(`✓ ${stringCommand}: exited with code ${code}`);
					if (code === 13) {
						console.error(`x ${stringCommand}: exited with code ${code}`);
						process.exit(13); // ctrl+c on child also exit the parent
					} else console.error(`x ${stringCommand}: exited with code ${code}`);
				});
			});
		},
	};
};

export default runBuiltFiles;
