import * as Yup from "yup";
import { ERROR_MESSAGES } from "../shared";
import {
	CONDITIONS,
	IConditionalValidationRule,
	IRenderRule,
	IValidationRule,
	TCondition,
	TYupSchemaType,
} from "./types";

interface ICombinedRule extends IRenderRule, IValidationRule {}

/**
 * Helper functions to parse JSON schema to Yup schema
 */
export namespace YupHelper {
	const customConditions: string[] = [];

	/**
	 * Initialises a Yup schema according to the type provided
	 * @param type The schema type
	 * @returns yupSchema that corresponds to the validation type
	 */
	export const mapSchemaType = (type: TYupSchemaType) => {
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
			case "mixed":
				return Yup.mixed();
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
	export const mapRules = (yupSchema: Yup.AnySchema, rules: ICombinedRule[]): Yup.AnySchema => {
		rules.forEach((rule) => {
			const condition = Object.keys(rule).filter((k) => CONDITIONS.includes(k as TCondition))?.[0] as TCondition;

			switch (true) {
				case rule.required:
					yupSchema = yupSchema.required(rule.errorMessage || "This field is required");
					break;
				case !!rule.email:
					yupSchema = (yupSchema as Yup.StringSchema).email(
						rule.errorMessage || ERROR_MESSAGES.EMAIL.INVALID
					);
					break;
				case !!rule.url:
				case !!rule.uuid:
				case !!rule.positive:
				case !!rule.negative:
				case !!rule.integer:
					try {
						yupSchema = (yupSchema as unknown)[condition](rule.errorMessage);
					} catch (error) {
						console.error(`error applying "${condition}" condition to ${yupSchema.type} schema`);
					}
					break;
				case rule.length > 0:
				case rule.min > 0:
				case rule.max > 0:
				case !!rule.lessThan:
				case !!rule.moreThan:
					try {
						yupSchema = (yupSchema as unknown)[condition](rule[condition], rule.errorMessage);
					} catch (error) {
						console.error(`error applying "${condition}" condition to ${yupSchema.type} schema`);
					}
					break;
				case !!rule.matches:
					{
						const matches = rule.matches.match(/\/(.*)\/([a-z]+)?/);
						try {
							yupSchema = (yupSchema as Yup.StringSchema).matches(
								new RegExp(matches[1], matches[2]),
								rule.errorMessage
							);
						} catch (error) {
							console.error(`error applying "${condition}" condition to ${yupSchema.type} schema`);
						}
					}
					break;
				case !!rule.when:
					{
						Object.keys(rule.when).forEach((fieldId) => {
							const isRule = rule.when[fieldId].is;
							const thenRule = mapRules(
								YupHelper.mapSchemaType(yupSchema.type as TYupSchemaType),
								rule.when[fieldId].then
							);
							const otherwiseRule =
								rule.when[fieldId].otherwise &&
								mapRules(
									YupHelper.mapSchemaType(yupSchema.type as TYupSchemaType),
									rule.when[fieldId].otherwise
								);

							if (Array.isArray(isRule) && (isRule as unknown[]).every((r) => typeof r === "object")) {
								yupSchema = yupSchema.when(fieldId, (value: unknown) => {
									const localYupSchema = mapRules(
										rule.when[fieldId].yupSchema.clone(),
										isRule as IConditionalValidationRule[]
									);
									let fulfilled = false;
									try {
										localYupSchema.validateSync(value);
										fulfilled = true;
									} catch (error) {}

									return fulfilled ? thenRule : otherwiseRule;
								});
							} else {
								yupSchema = yupSchema.when(fieldId, {
									is: isRule,
									then: thenRule,
									otherwise: otherwiseRule,
								});
							}
						});
					}
					break;
			}

			// for custom defined rules
			const customRuleKey = Object.keys(rule).filter((k) =>
				customConditions.includes(k as TCondition)
			)?.[0] as TCondition;
			if (customRuleKey) {
				if ((yupSchema as unknown)[customRuleKey]) {
					yupSchema = (yupSchema as unknown)[customRuleKey](rule[customRuleKey], rule.errorMessage);
				} else {
					console.error(`error applying "${customRuleKey}" condition to ${yupSchema.type} schema`);
				}
			}
		});

		return yupSchema;
	};

	/**
	 * Declare custom Yup schema rule
	 * @param type The schema type
	 * @param name Name of the rule
	 * @param fn Validation function, it must return a boolean
	 */
	export const addRule = (
		type: TYupSchemaType | "mixed",
		name: string,
		fn: (value: unknown, arg: unknown, context: Yup.TestContext) => boolean
	) => {
		if (customConditions.includes(name)) {
			console.error(`the validation condition "${name}" is not added because it already exists!`);
			return;
		}
		customConditions.push(name);
		Yup.addMethod<Yup.AnySchema>(Yup[type], name, function (arg: unknown, errorMessage: string) {
			return this.test({
				name,
				message: errorMessage,
				test: (value, testContext) => fn(value, arg, testContext),
			});
		});
	};
}
