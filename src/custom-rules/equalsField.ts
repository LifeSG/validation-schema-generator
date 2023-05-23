import { addRule } from "../schema-generator";
import isEqual from "lodash/isEqual";

export const equalsField = () =>
	addRule("mixed", "equalsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				return isEqual(values?.sort(), fn.parent[`${matches}`]?.sort());
			default:
				return isEqual(values, fn.parent[`${matches}`]);
		}
	});
