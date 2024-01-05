import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";
import { has } from "lodash";
interface BaseOptionProps {
	label: string;
	key: string;
}

export type TNestedValues = IL1Value | IL2Value | IL3Value;
export interface IL1Value {
	[key: string]: IL2Value | string;
}
export interface IL2Value {
	[key: string]: IL3Value | string;
}
export interface IL3Value {
	[key: string]: string;
}
export interface TL1OptionProps extends BaseOptionProps {
	value: string;
	subItems?: TL2OptionProps[] | undefined;
}
export interface TL2OptionProps extends BaseOptionProps {
	value: string;
	subItems?: TL3OptionProps[] | undefined;
}
export interface TL3OptionProps extends BaseOptionProps {
	value: string;
	subItems?: undefined;
}

export interface INestedMultiSelectSchema<V = undefined> extends IFieldSchemaBase<"nested-multi-select", V> {
	options: TL1OptionProps[];
}

export const nestedMultiSelect: IFieldGenerator<INestedMultiSelectSchema> = (id, { options, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.object()
				.test("is-required", isRequiredRule?.errorMessage || ERROR_MESSAGES.COMMON.REQUIRED_OPTION, (value) => {
					if (!isRequiredRule?.required) return true;
					console.log(">>> ze value", value);
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
