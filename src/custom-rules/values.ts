import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import { addRule } from "../schema-generator";

/**
 * empty check that is applicable to numbers too
 */
const isEmptyValue = (value: unknown) => (!isNumber(value) ? isEmpty(value) : isNil(value));

addRule("mixed", "filled", (value) => !isEmptyValue(value));
addRule("mixed", "empty", (value) => isEmptyValue(value));
addRule("mixed", "equals", (value, match) => !isEmptyValue(value) && isEqual(value, match));
addRule("mixed", "notEquals", (value, match) => !isEmptyValue(value) && !isEqual(value, match));
