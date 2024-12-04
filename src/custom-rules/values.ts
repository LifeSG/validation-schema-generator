import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { IDaysRangeRule, addRule } from "../schema-generator";
import { DateTimeHelper, ValueHelper } from "../utils";

export const filled = () => addRule("mixed", "filled", (value) => !ValueHelper.isEmpty(value));
export const empty = () => addRule("mixed", "empty", (value) => ValueHelper.isEmpty(value));
export const equals = () =>
	addRule("mixed", "equals", (value, match) => !ValueHelper.isEmpty(value) && isEqual(value, match));
export const notEquals = () =>
	addRule("mixed", "notEquals", (value, match) => !ValueHelper.isEmpty(value) && !isEqual(value, match));
export const withinDays = () =>
	addRule("string", "withinDays", (value: string, withinDays: IDaysRangeRule) => {
		if (isEmpty(value)) return true;
		return DateTimeHelper.checkWithinDays(value, withinDays);
	});
export const beyondDays = () =>
	addRule("string", "beyondDays", (value: string, beyondDays: IDaysRangeRule) => {
		if (isEmpty(value)) return true;
		return DateTimeHelper.checkBeyondDays(value, beyondDays);
	});
