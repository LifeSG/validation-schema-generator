import { isEmpty } from "lodash";
import isEqual from "lodash/isEqual";
import { addRule, IWithinDaysRule } from "../schema-generator";
import { ValueHelper } from "../utils";
import { DateTimeHelper } from "../utils/date-time-helper";

export const filled = () => addRule("mixed", "filled", (value) => !ValueHelper.isEmpty(value));
export const empty = () => addRule("mixed", "empty", (value) => ValueHelper.isEmpty(value));
export const equals = () =>
	addRule("mixed", "equals", (value, match) => !ValueHelper.isEmpty(value) && isEqual(value, match));
export const notEquals = () =>
	addRule("mixed", "notEquals", (value, match) => !ValueHelper.isEmpty(value) && !isEqual(value, match));
export const withinDays = () =>
	addRule("mixed", "withinDays", (value: string, withinDays: IWithinDaysRule) => {
		if (isEmpty(value)) return true;
		return DateTimeHelper.checkWithinDays(value, withinDays);
	});
