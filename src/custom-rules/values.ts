import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { addRule, IDaysRangeRule } from "../schema-generator";
import { ValueHelper } from "../utils";
import { DateTimeHelper } from "../utils";

export const filled = () => addRule("mixed", "filled", (value) => !ValueHelper.isEmpty(value));
export const empty = () => addRule("mixed", "empty", (value) => ValueHelper.isEmpty(value));
export const equals = () =>
	addRule("mixed", "equals", (value, match) => !ValueHelper.isEmpty(value) && isEqual(value, match));
export const notEquals = () =>
	addRule("mixed", "notEquals", (value, match) => !ValueHelper.isEmpty(value) && !isEqual(value, match));
export const withinDays = () =>
	addRule("mixed", "withinDays", (value: string, withinDays: IDaysRangeRule) => {
		if (isEmpty(value)) return true;
		return DateTimeHelper.checkWithinDays(value, withinDays);
	});
