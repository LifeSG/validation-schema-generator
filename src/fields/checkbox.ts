import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface ICheckboxSchema<V = undefined> extends IFieldSchemaBase<"checkbox", V> {}

export const checkbox: IFieldGenerator<ICheckboxSchema> = (id, { validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.array()
				.of(Yup.string())
				.test(
					"is-empty-array",
					isRequiredRule?.errorMessage || ERROR_MESSAGES.COMMON.REQUIRED_OPTION,
					(value) => {
						if (!value || !isRequiredRule?.required) return true;

						return value.length > 0;
					}
				),
			validation,
		},
	};
};
