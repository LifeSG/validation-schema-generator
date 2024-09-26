import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
import { ERROR_MESSAGES } from "../shared";

export interface IUnitNumberFieldValidationRule extends IValidationRule {
	unitNumberFormat?: boolean | undefined;
}

export interface IUnitNumberFieldSchema<V = undefined>
	extends IFieldSchemaBase<"unit-number-field", V, IUnitNumberFieldValidationRule> {}

export const unitNumberField: IFieldGenerator<IUnitNumberFieldSchema> = (id, { validation }) => {
	const unitNumberRule = validation?.find((rule) => "unitNumberFormat" in rule);

	return {
		[id]: {
			yupSchema: Yup.string().matches(/^([a-zA-Z0-9]{1,3}-[a-zA-Z0-9]{1,5})$/, {
				excludeEmptyString: true,
				message: unitNumberRule?.errorMessage || ERROR_MESSAGES.UNIT_NUMBER.INVALID,
			}),
			validation,
		},
	};
};
