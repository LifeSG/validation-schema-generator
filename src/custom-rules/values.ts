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
export const notMatches = () =>
	addRule("string", "notMatches", (value: string, regex: string) => {
		if (ValueHelper.isEmpty(value)) {
			return true;
		}
		const matches = regex.match(/\/(.*)\/([a-z]+)?/);
		const parsedRegex = new RegExp(matches[1], matches[2]);
		return !parsedRegex.test(value);
	});
export const noWhitespaceOnly = () =>
	addRule("string", "noWhitespaceOnly", (value: string, noWhitespaceOnly: boolean) => {
		if (ValueHelper.isEmpty(value) || !noWhitespaceOnly) {
			return true;
		}
		return /\S/.test(value);
	});
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
