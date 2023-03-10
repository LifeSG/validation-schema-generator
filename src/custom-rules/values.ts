import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import { addRule } from "../schema-generator";

/**
 * empty check that is applicable to numbers too
 */
const isEmptyValue = (value: unknown) => (!isNumber(value) ? isEmpty(value) : isNil(value));

export const filled = () => addRule("mixed", "filled", (value) => !isEmptyValue(value));
export const empty = () => addRule("mixed", "empty", (value) => isEmptyValue(value));
export const equals = () => addRule("mixed", "equals", (value, match) => !isEmptyValue(value) && isEqual(value, match));
export const notEquals = () =>
	addRule("mixed", "notEquals", (value, match) => !isEmptyValue(value) && !isEqual(value, match));
