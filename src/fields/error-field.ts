import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
import { ERROR_MESSAGES } from "../shared";

export interface IErrorFieldValidationRule extends IValidationRule {
	error?: boolean | undefined;
}

export interface IErrorFieldSchema extends IFieldSchemaBase<"error-field", undefined, IErrorFieldValidationRule> {}

export const errorField: IFieldGenerator<IErrorFieldSchema> = (id, field) => {
	const { validation } = field;
	const errorRule = validation?.find((rule) => "error" in rule);

	return {
		[id]: {
			yupSchema: Yup.mixed().test("fail", errorRule?.errorMessage || ERROR_MESSAGES.GENERIC.INVALID, () => false),
			validation: [],
		},
	};
};
