import { equalsField, notEqualsField } from "./equals-field";
import { excludes } from "./excludes";
import { includes } from "./includes";
import { uinfin } from "./uinfin";
import { beyondDays, empty, equals, filled, notEquals, notMatches, withinDays } from "./values";

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
	notEqualsField();
	withinDays();
	beyondDays();
};
