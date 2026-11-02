import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface INumericFieldSchema<V = undefined> extends IFieldSchemaBase<"numeric-field", V> {}

/**
 * counts decimal places from the string form, accounting for exponent notation (e.g. 1e-7, 1.5e-7)
 */
const countDecimalPlaces = (value: number): number => {
	const match = /^-?\d+(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(value));
	if (!match) return 0;
	return Math.max(0, (match[1]?.length ?? 0) - Number(match[2] ?? 0));
};

export const numericField: IFieldGenerator<INumericFieldSchema> = (id, { validation }) => {
	let schema = Yup.number();

	validation?.forEach((rule) => {
		if (!isNaN(rule.decimals)) {
			schema = schema.test(
				"decimals",
				rule.errorMessage || ERROR_MESSAGES.NUMERIC.INVALID_DECIMALS(rule.decimals),
				(value) => {
					if (value === undefined || value === null) return true;
					return countDecimalPlaces(value) <= rule.decimals;
				}
			);
		}
	});

	return {
		[id]: { yupSchema: schema, validation },
	};
};
