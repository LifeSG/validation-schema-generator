import { equalsField } from "./equalsField";
import { excludes } from "./excludes";
import { includes } from "./includes";
import { uinfin } from "./uinfin";
import { empty, equals, filled, notEquals } from "./values";

/**
 * applies inbuilt custom rules
 */
export const applyCustomRules = () => {
	excludes();
	includes();
	uinfin();
	empty();
	equals();
	filled();
	notEquals();
	equalsField();
};
