import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface INumericFieldSchema<V = undefined> extends IFieldSchemaBase<"numeric-field", V> {}

export const numericField: IFieldGenerator<INumericFieldSchema> = (id, { validation }) => {
	let schema = Yup.number();

	validation?.forEach((rule) => {
		if (!isNaN(rule.decimals)) {
			schema = schema.test(
				"decimals",
				rule.errorMessage || ERROR_MESSAGES.NUMERIC.INVALID_DECIMALS(rule.decimals),
				(value) => {
					if (value === undefined || value === null) return true;
					const decimalStr = String(value).split(".")[1];
					return !decimalStr || decimalStr.length <= rule.decimals;
				}
			);
		}
	});

	return {
		[id]: { yupSchema: schema, validation },
	};
};
