import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IErrorFieldValidationRule {
	error?: boolean | undefined;
	errorMessage?: string | undefined;
	when?: never;
}

export interface IErrorFieldSchema extends Pick<IFieldSchemaBase<"error-field">, "showIf" | "uiType"> {
	validation?: IErrorFieldValidationRule[] | undefined;
	[otherOptions: string]: unknown;
}

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
