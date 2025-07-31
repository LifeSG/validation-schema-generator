import isEmpty from "lodash/isEmpty";
import * as Yup from "yup";
import { ICustomFieldSchemaBase, IValidationRule, TComponentSchema, jsonToSchema } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

interface IArrayFieldValidationRule extends IValidationRule {
	/** for customising error message when one section is invalid */
	valid?: boolean | undefined;
}

export interface IArrayFieldSchema<V = undefined>
	extends ICustomFieldSchemaBase<"array-field", V, IArrayFieldValidationRule> {
	fieldSchema: Record<string, TComponentSchema>;
}

export const arrayField: IFieldGenerator<IArrayFieldSchema> = (id, { fieldSchema, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const schema = jsonToSchema({ section: { uiType: "section", children: fieldSchema } });

	return {
		[id]: {
			yupSchema: Yup.array()
				.of(schema)
				.test(
					"is-empty-array",
					isRequiredRule?.errorMessage || ERROR_MESSAGES.ARRAY_FIELD.REQUIRED,
					(value) => {
						if (!value || !isRequiredRule?.required) return true;

						return value.length > 0 && value.some((item) => !isEmpty(item));
					}
				),
			validation,
		},
	};
};
