module.exports = async () => ({
	rootDir: "..",
	moduleFileExtensions: ["tsx", "ts", "js"],
	testMatch: ["<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)"],
	transform: {
		".(js|ts|jsx|tsx)$": "ts-jest",
	},
	maxConcurrency: 10,
	collectCoverageFrom: [
		"<rootDir>/src/**/*.{js,jsx,ts,tsx}",
		// Generic exclusions
		"!**/__tests__/**/*",
		"!**/{I,i}ndex.*",
	],
	coverageDirectory: "<rootDir>/coverage",
	coverageReporters: ["text"],
	moduleNameMapper: {
		"src/(.*)": "<rootDir>/src/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/jest.setup.ts"],
	verbose: true,
	bail: true,
	reporters: ["default", ["jest-junit", { outputName: "junit.xml" }]],
});
