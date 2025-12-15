import { equalsField, notEqualsField } from "./equals-field";
import { excludes } from "./excludes";
import { includes } from "./includes";
import { uen } from "./uen";
import { uinfin } from "./uinfin";
import { beyondDays, empty, equals, filled, notEquals, notMatches, noWhitespaceOnly, withinDays } from "./values";

/**
 * applies inbuilt custom rules
 */
export const applyCustomRules = () => {
	excludes();
	includes();
	uinfin();
	uen();
	empty();
	equals();
	filled();
	notEquals();
	noWhitespaceOnly();
	notMatches();
	equalsField();
	notEqualsField();
	withinDays();
	beyondDays();
};
