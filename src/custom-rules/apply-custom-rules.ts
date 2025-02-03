import { equalsField } from "./equals-field";
import { excludes } from "./excludes";
import { includes } from "./includes";
import { uinfin } from "./uinfin";
import { beyondDays, empty, equals, filled, notEquals, withinDays } from "./values";

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
	withinDays();
	beyondDays();
};
