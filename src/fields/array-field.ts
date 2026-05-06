import isEmpty from "lodash/isEmpty";
import * as Yup from "yup";
import type { ICustomFieldSchemaBase, IValidationRule, TComponentSchema } from "../schema-generator/types";
import { ERROR_MESSAGES } from "../shared";
import { TFieldsConfig, TSchemaGenerator } from "./types";

export interface IArrayFieldUniqueRule {
	field: string;
	errorMessage?: string | undefined;
}

interface IArrayFieldValidationRule extends IValidationRule {
	/** for customising error message when one section is invalid */
	valid?: boolean | undefined;
	/** Specify child fields that must be unique across all array items, with a custom error message per field. */
	unique?: IArrayFieldUniqueRule[] | undefined;
}

export interface IArrayFieldSchema<V = undefined>
	extends ICustomFieldSchemaBase<"array-field", V, IArrayFieldValidationRule> {
	fieldSchema: Record<string, TComponentSchema>;
}

export const arrayField = (
	id: string,
	{ fieldSchema, validation }: IArrayFieldSchema,
	generateSchema: TSchemaGenerator
): TFieldsConfig<IArrayFieldSchema> => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const uniqueRule = validation?.find((rule) => "unique" in rule) as IArrayFieldValidationRule | undefined;

	// Create fresh schema instance per array item to prevent mutation conflicts during parallel async validation
	const itemSchema = Yup.lazy(() => generateSchema({ section: { uiType: "section", children: fieldSchema } }));

	let yupSchema = Yup.array(itemSchema).test(
		"is-empty-array",
		isRequiredRule?.errorMessage || ERROR_MESSAGES.ARRAY_FIELD.REQUIRED,
		(value) => {
			if (!value || !isRequiredRule?.required) return true;

			return value.length > 0 && value.some((item) => !isEmpty(item));
		}
	);

	if (uniqueRule?.unique?.length) {
		yupSchema = yupSchema.test(
			"unique-items",
			uniqueRule?.errorMessage || ERROR_MESSAGES.ARRAY_FIELD.UNIQUE,
			(value) => {
				if (!value) return true;

				const errors: Record<string, string>[] = [];
				let hasError = false;

				uniqueRule.unique.forEach(({ field, errorMessage }) => {
					const fieldValues = value.map((item) => item?.[field]);

					fieldValues.forEach((val, idx) => {
						if (!val) return;
						const isDuplicate = fieldValues.findIndex((v) => v === val) !== idx;
						if (isDuplicate) {
							errors[idx] = {
								...errors[idx],
								[field]: errorMessage || ERROR_MESSAGES.ARRAY_FIELD.UNIQUE,
							};
							hasError = true;
						}
					});
				});

				return !hasError;
			}
		);
	}

	return {
		[id]: {
			yupSchema,
			validation,
		},
	};
};
