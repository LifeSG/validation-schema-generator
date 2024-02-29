import * as Yup from "yup";
import { IFieldSchemaBase, TComponentSchema } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

interface IOption {
	label: string;
	value: string;
	children?: Record<string, TComponentSchema>;
}
export interface ICheckboxSchema<V = undefined> extends IFieldSchemaBase<"checkbox", V> {
	options: IOption[];
}

export const checkbox: IFieldGenerator<ICheckboxSchema> = (id, { options, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.array()
				.of(Yup.string())
				.test(
					"is-empty-array",
					isRequiredRule?.errorMessage || ERROR_MESSAGES.COMMON.REQUIRED_OPTION,
					(values) => {
						if (!values || !isRequiredRule?.required) return true;

						return values.length > 0;
					}
				)
				.test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (values) => {
					if (!values || !values.length) return true;

					return (
						values.filter((value) => options.find((option) => option.value === value)).length ===
						values.length
					);
				}),
			validation,
		},
	};
};
