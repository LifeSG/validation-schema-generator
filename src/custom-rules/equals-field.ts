import { addRule } from "../schema-generator";
import isEqual from "lodash/isEqual";

export const equalsField = () =>
	addRule("mixed", "equalsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				return Array.isArray(values) && Array.isArray(fn.parent[`${matches}`])
					? isEqual(values?.sort(), fn.parent[`${matches}`]?.sort())
					: isEqual(values, fn.parent[`${matches}`]);
			default:
				return isEqual(values, fn.parent[`${matches}`]);
		}
	});
