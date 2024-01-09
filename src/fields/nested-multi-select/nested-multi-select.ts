import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { INestedMultiSelectSchema, TL1OptionProps, TNestedValues } from "./types";

export const nestedMultiSelect: IFieldGenerator<INestedMultiSelectSchema> = (id, { options, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.object()
				.test("is-required", isRequiredRule?.errorMessage || ERROR_MESSAGES.COMMON.REQUIRED_OPTION, (value) => {
					if (!isRequiredRule?.required) return true;
					return !!value && !!Object.keys(value).length;
				})
				.test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (values) => {
					const validateNestedValues = (options: TL1OptionProps[], nested: TNestedValues): boolean => {
						for (const key in nested) {
							const nestedValue = nested[key];
							const option = options.find((opt) => opt.key === key);

							if (!option) {
								return false;
							}

							if (typeof nestedValue === "string" && nestedValue !== option.value) {
								return false;
							}

							if (typeof nestedValue === "object") {
								if (!Object.keys(nestedValue).length) {
									return false;
								}
								const subOptions = option.subItems || [];
								const subItemsValid = validateNestedValues(subOptions, nestedValue);
								if (!subItemsValid) {
									return false;
								}
							}
						}

						// If all nested values match the options, return true
						return true;
					};

					return validateNestedValues(options, values);
				}),
			validation,
		},
	};
};
