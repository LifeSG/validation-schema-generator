import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import pkg from "./package.json";

const plugins = [
	peerDepsExternal(), // Add the externals for me. [yup]
	nodeResolve({ browser: true }),
	commonjs(), // converts CommonJS to ES6 modules
	typescript({
		tsconfig: "tsconfig.json",
		compilerOptions: {
			noEmit: false,
			outDir: "dist",
		},
	}),
	json(),
	terser(), // Helps remove comments, whitespace or logging codes
];

export default {
	input: "src/index.ts",
	output: [
		{
			dir: "dist",
			entryFileNames: pkg.module,
			format: "esm",
			sourcemap: true,
			exports: "named",
		},
		{
			dir: "dist",
			entryFileNames: pkg.main,
			format: "cjs",
			sourcemap: true,
			exports: "named",
		},
	],
	plugins,
};
