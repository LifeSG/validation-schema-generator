const path = require("path");

module.exports = {
	target: "node",
	mode: "production",
	entry: path.resolve(__dirname, "src/index.ts"),
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
		library: "validation-schema-generator",
		libraryTarget: "umd",
	},
	resolve: {
		extensions: [".ts", ".js"],
		modules: [__dirname, "node_modules"],
	},
	module: {
		rules: [
			{
				oneOf: [
					{
						test: /\.ts$/,
						exclude: /node_modules/,
						use: [
							{
								loader: "ts-loader",
								options: {
									configFile: "tsconfig.build.json",
								},
							},
						],
					},
				],
			},
		],
	},
};
