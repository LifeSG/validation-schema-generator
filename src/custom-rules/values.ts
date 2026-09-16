import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isBoolean from "lodash/isBoolean";
import { IDaysRangeRule, IWhitespaceRule, addRule } from "../schema-generator";
import { MAX_MATCHES_INPUT_LENGTH } from "../shared";
import { DateTimeHelper, RegexHelper, ValueHelper } from "../utils";

export const filled = () => addRule("mixed", "filled", (value) => !ValueHelper.isEmpty(value));
export const empty = () => addRule("mixed", "empty", (value) => ValueHelper.isEmpty(value));
export const equals = () =>
	addRule("mixed", "equals", (value, match) => !ValueHelper.isEmpty(value) && isEqual(value, match));
export const notEquals = () =>
	addRule("mixed", "notEquals", (value, match) => !ValueHelper.isEmpty(value) && !isEqual(value, match));
export const notMatches = () =>
	addRule("string", "notMatches", (value: string, regex: string) => {
		if (ValueHelper.isEmpty(value) || typeof regex !== "string") {
			return true;
		}
		const pattern = RegexHelper.compile(regex);
		if (!pattern) return true;
		// cap tested value length to bound worst-case regex backtracking cost (ReDoS mitigation)
		if (value.length > MAX_MATCHES_INPUT_LENGTH) {
			return false;
		}
		return !pattern.test(value);
	});
/** @deprecated use `whitespace` */
export const noWhitespaceOnly = () =>
	addRule("string", "noWhitespaceOnly", (value: string, noWhitespaceOnly: boolean) => {
		if (ValueHelper.isEmpty(value) || !noWhitespaceOnly) {
			return true;
		}
		return /\S/.test(value);
	});
export const whitespace = () =>
	addRule("string", "whitespace", (value: string, whitespace: IWhitespaceRule) => {
		if (
			ValueHelper.isEmpty(value) ||
			!whitespace ||
			(typeof whitespace === "object" && !isBoolean(whitespace.noLeadingOrTrailingWhitespace))
		) {
			return true;
		}
		if (typeof whitespace === "object" && !whitespace.noLeadingOrTrailingWhitespace) {
			return /\S/.test(value);
		}
		return /^(?!\s+$)(?!\s).*(?<!\s)$/.test(value);
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
