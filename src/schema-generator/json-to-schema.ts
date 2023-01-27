import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { generateFieldConfigs } from "../fields";
import { CONDITIONS, IConditionalValidationRule, TCondition, TFieldValidation, TFields, TYupSchemaType } from "./types";

/**
 * Constructs the entire Yup schema from JSON
 * @param fields JSON representation of the fields
 * @returns Yup schema ready to be used by FrontendEngine
 */
export const jsonToSchema = <V = undefined>(fields: TFields<V>) => {
	const yupSchema: ObjectShape = {};
	const fieldConfigs = generateFieldConfigs(fields);
	Object.entries(fieldConfigs).forEach(([id, { yupSchema: yupFieldSchema, validation }]) => {
		yupSchema[id] = mapRules(yupFieldSchema, validation || []);
	});
	return Yup.object().shape(yupSchema);
};

/**
 * Initialises a Yup schema according to the type provided
 * @param type The schema type
 * @returns yupSchema that corresponds to the validation type
 */
const mapSchemaType = (type: TYupSchemaType) => {
	switch (type) {
		case "string":
			return Yup.string().typeError("Only string values are allowed");
		case "number":
			return Yup.number().typeError("Only number values are allowed");
		case "boolean":
			return Yup.boolean().typeError("Only boolean values are allowed");
		case "array":
			return Yup.array().typeError("Only array values are allowed");
		case "object":
			return Yup.object().typeError("Only object values are allowed");
		default:
			console.warn(`unhandled schema type for ${type}`);
			return Yup.mixed();
	}
};

/**
 * Adds Yup validation and constraints based on specified rules
 * @param yupSchema Yup schema that was previously created from specified validation type
 * @param rules An array of validation rules to be mapped against validation type (e.g. a string schema might contain { maxLength: 255 })
 * @returns yupSchema with added constraints and validations
 */
const mapRules = (yupSchema: Yup.AnySchema, rules: TFieldValidation): Yup.AnySchema => {
	rules.forEach((rule) => {
		const condition = Object.keys(rule).filter((k) => CONDITIONS.includes(k as TCondition))?.[0] as TCondition;

		switch (true) {
			case rule.required:
				yupSchema = yupSchema.required(rule.errorMessage || "This field is required");
				break;
			case !!rule.email:
			case !!rule.url:
			case !!rule.uuid:
			case !!rule.positive:
			case !!rule.negative:
			case !!rule.integer:
				yupSchema = (yupSchema as unknown)[condition](rule.errorMessage);
				break;
			case rule.length > 0:
			case rule.min > 0:
			case rule.max > 0:
			case !!rule.lessThan:
			case !!rule.moreThan:
				yupSchema = (yupSchema as unknown)[condition](rule[condition], rule.errorMessage);
				break;
			case !!rule.matches:
				{
					const matches = rule.matches.match(/\/(.*)\/([a-z]+)?/);
					yupSchema = (yupSchema as Yup.StringSchema).matches(
						new RegExp(matches[1], matches[2]),
						rule.errorMessage
					);
				}
				break;
		}
	});

	return yupSchema;
};
