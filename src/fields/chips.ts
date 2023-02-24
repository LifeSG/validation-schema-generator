import kebabCase from "lodash/kebabCase";
import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator, TFieldsConfig } from "./types";

export interface IOption {
	label: string;
	value: string;
}
export interface IChipsTextareaSchema<V = undefined> {
	label: string;
	validation?: (IValidationRule | V)[] | undefined;
	[otherOptions: string]: unknown;
}
export interface IChipsSchema<V = undefined> extends IFieldSchemaBase<"chips", V> {
	options: IOption[];
	textarea?: IChipsTextareaSchema<V> | undefined;
}

export const chips: IFieldGenerator<IChipsSchema> = (id, field) => {
	const { label, options, validation, textarea } = field;
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const fieldsConfig: TFieldsConfig<IChipsSchema> = {
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
				)
				.test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (values) => {
					if (!values || !values.length) return true;

					return (
						values.filter((value) => {
							return value === textarea?.label || options.find((option) => option.value === value);
						}).length === values.length
					);
				}),
			validation,
		},
	};

	// formats textarea validation as conditional validation because it can't tell when to validate (i.e. doesn't know if user picked chip to show textarea)
	let textareaValidation: IValidationRule = {};
	if (textarea?.label && textarea?.validation) {
		const textareaWithoutWhenRule = textarea?.validation?.filter((rule) => !("when" in rule));
		const textareaWhenRule = textarea?.validation?.find((rule) => "when" in rule);
		textareaValidation = {
			when: {
				...(textareaWhenRule?.when || {}),
				[id]: {
					is: [{ includes: [label] }],
					then: textareaWithoutWhenRule,
				},
			},
		};
		let textareaId = `${id}-textarea`;
		if (textarea?.label) textareaId = `${textareaId}-${kebabCase(textarea?.label)}`;
		fieldsConfig[textareaId] = {
			yupSchema: Yup.string(),
			validation: [textareaValidation],
		};
	}

	return fieldsConfig;
};
