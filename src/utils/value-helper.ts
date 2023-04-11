import lodashIsEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";

export namespace ValueHelper {
	/**
	 * empty check that is applicable to numbers too
	 */
	export const isEmpty = (value: unknown) => (!isNumber(value) ? lodashIsEmpty(value) : isNil(value));
}
