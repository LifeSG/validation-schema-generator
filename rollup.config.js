import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

const plugins = [
	peerDepsExternal(), // Add the externals for me. [yup]
	nodeResolve({ browser: true }),
	commonjs(), // converts CommonJS to ES6 modules
	typescript({
		useTsconfigDeclarationDir: true,
		tsconfig: "tsconfig.json",
		tsconfigOverride: {
			// Override base tsconfig.json during build
			exclude: ["**/__tests__/**"],
		},
	}),
	json(),
	terser(), // Helps remove comments, whitespace or logging codes
];

export default {
	input: "src/index.ts",
	output: [
		{
			file: pkg.module,
			format: "esm",
			sourcemap: true,
			exports: "named",
		},
		{
			file: pkg.main,
			format: "cjs",
			sourcemap: true,
			exports: "named",
		},
	],
	plugins,
};
