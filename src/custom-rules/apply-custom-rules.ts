import { equalsField } from "./equals-field";
import { excludes } from "./excludes";
import { includes } from "./includes";
import { uinfin } from "./uinfin";
import { empty, equals, filled, notEquals, notMatches, withinDays } from "./values";

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
	notMatches();
	equalsField();
	withinDays();
};
