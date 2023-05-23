import { addRule } from "../schema-generator";

const checkArraysAreEqual = (array1: unknown[], array2: unknown[]) => {
	if (array1.length === array2.length) {
		const array2Dummy = JSON.parse(JSON.stringify(array2));
		return array1.every((element) => {
			const array2IndexOf = array2Dummy.indexOf(element);
			if (array2IndexOf >= 0) {
				array2Dummy.splice(array2IndexOf, 1);
				return true;
			}
			return false;
		});
	}
	return false;
};

export const equalsField = () =>
	addRule("mixed", "equalsField", (values: unknown[], matches: unknown | unknown[], fn) => {
		switch (typeof values) {
			case "object":
				return checkArraysAreEqual(values, fn.parent[`${matches}`]);
			default:
				return fn.parent[`${matches}`] === values;
		}
	});
