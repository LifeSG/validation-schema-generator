import { addRule } from "../schema-generator";
import isEqual from "lodash/isEqual";

export const equalsField = () =>
	addRule("mixed", "equalsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				if (Array.isArray(values) && Array.isArray(fn.parent[`${matches}`])) {
					const a = [...values].sort();
					const b = [...fn.parent[`${matches}`]].sort();
					return isEqual(a, b);
				}
				return isEqual(values, fn.parent[`${matches}`]);
			default:
				return isEqual(values, fn.parent[`${matches}`]);
		}
	});

export const notEqualsField = () =>
	addRule("mixed", "notEqualsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				if (Array.isArray(values) && Array.isArray(fn.parent[`${matches}`])) {
					const a = [...values].sort();
					const b = [...fn.parent[`${matches}`]].sort();
					return !isEqual(a, b);
				}
				return !isEqual(values, fn.parent[`${matches}`]);
			default:
				return !isEqual(values, fn.parent[`${matches}`]);
		}
	});
