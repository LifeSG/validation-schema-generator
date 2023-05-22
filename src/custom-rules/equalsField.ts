import { addRule } from "../schema-generator";

export const equalsField = () =>
	addRule("mixed", "equalsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				return JSON.stringify(values) === JSON.stringify(fn.parent[`${matches}`]);
			default:
				return fn.parent[`${matches}`] === values;
		}
	});
