import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import * as Yup from "yup";
import { Assign, ObjectShape, TypeOfShape } from "yup/lib/object";
import { AnyObject } from "yup/lib/types";
import { ICheckboxSchema, IRadioSchema } from "../fields";
import { ERROR_MESSAGES } from "../shared";
import { getFieldSortOrder } from "./field-sort";
import { TComponentSchema, TRenderRules, TSectionsSchema, TYupSchemaType } from "./types";
import { YupHelper } from "./yup-helper";

type TFieldsWithShownRule = Record<string, { childIds: string[]; sourceIds: string[][] }>;

/**
 * Remove conditionally rendered fields from yup schema if the conditions are not fulfilled
 * This works by mutating the schema fields passed via the Yup context
 * In order to preserve the original Yup schema, the full schema is stored in the Yup metadata at the time of creation
 * @param sections JSON representation of the fields
 * @param formValues Values in the form
 * @param yupContext Yup schema context
 * @returns Always return true
 */
export const parseConditionalRenders = (
	sections: TSectionsSchema,
	formValues: TypeOfShape<Assign<ObjectShape, ObjectShape>>,
	yupContext: Yup.TestContext<AnyObject>
) => {
	const fieldsWithShownRule: TFieldsWithShownRule = {};
	yupContext.schema.withMutation((schema: Yup.ObjectSchema<Assign<ObjectShape, ObjectShape>>) => {
		let yupSchema: ObjectShape = yupContext.schema.clone().describe().meta.schema;
		Object.values(sections).forEach((section) => {
			yupSchema = parseChildrenConditionalRenders(section.children, yupSchema, formValues, fieldsWithShownRule);
		});
		yupSchema = parseShownRule(sections, yupSchema, fieldsWithShownRule);
		schema.shape(yupSchema);
	});
	return true;
};

/**
 * Check if fields that depend on the shown rule can be rendered
 * @param sections JSON representation of the fields
 * @param yupSchema Generated Yup schema object
 * @param fieldsWithShownRule Fields with shown rule and the corresponding dependencies
 * @returns Yup schema containing only fields that pass shown rule
 */
const parseShownRule = (
	sections: TSectionsSchema,
	yupSchema: ObjectShape,
	fieldsWithShownRule: TFieldsWithShownRule
) => {
	const parsedYupSchema = { ...yupSchema };

	const order = getFieldSortOrder(sections);

	Object.entries(fieldsWithShownRule)
		.sort(([fieldIdA], [fieldIdB]) => order[fieldIdA] - order[fieldIdB])
		.forEach(([fieldId, meta]) => {
			const notShown = meta.sourceIds.every((rules) => {
				if (rules.length) {
					return rules.some((id) => !parsedYupSchema[id] || parsedYupSchema[id].describe().meta?.hidden);
				}
				return false;
			});
			if (notShown) {
				const hiddenFieldIdList = [fieldId, ...meta.childIds];
				hiddenFieldIdList.forEach((hiddenFieldId) => {
					parsedYupSchema[hiddenFieldId] = Yup.mixed()
						.meta({ hidden: true })
						.test("empty", ERROR_MESSAGES.UNSPECIFIED_FIELD(hiddenFieldId), (value) => value === undefined);
				});
			}
		});

	return parsedYupSchema;
};

/**
 * Recursively loop through every children to check if it can render every field
 * @param childrenSchema children JSON schema
 * @param yupSchema Generated Yup schema object
 * @param formValues Values in the form
 * @param fieldsWithShownRule Stores fields that depend on the shown rule
 * @returns Yup schema containing only fields that can passed conditional rendering
 */
const parseChildrenConditionalRenders = (
	childrenSchema: Record<string, TComponentSchema>,
	yupSchema: ObjectShape,
	formValues: TypeOfShape<Assign<ObjectShape, ObjectShape>>,
	fieldsWithShownRule: TFieldsWithShownRule
) => {
	let parsedYupSchema: ObjectShape = { ...yupSchema };

	const parseIfValidChildren = (children: Record<string, TComponentSchema>) => {
		if (!isEmpty(children) && isObject(children)) {
			parsedYupSchema = {
				...parseChildrenConditionalRenders(
					children as Record<string, TComponentSchema>,
					parsedYupSchema,
					formValues,
					fieldsWithShownRule
				),
			};
		}
	};

	Object.entries(childrenSchema).forEach(([id, componentSchema]) => {
		const { isValid, requiresShownRule, sourceIds } = canRender(
			componentSchema.showIf as TRenderRules[],
			parsedYupSchema,
			formValues
		);

		if (isValid) {
			if (requiresShownRule) {
				fieldsWithShownRule[id] = { childIds: listAllChildIds(componentSchema), sourceIds: sourceIds };
			}
			switch (componentSchema.uiType) {
				case "checkbox":
				case "radio":
					(componentSchema as ICheckboxSchema | IRadioSchema).options.forEach((option) => {
						parseIfValidChildren(option.children);
					});
					break;
				default:
					parseIfValidChildren(componentSchema.children as Record<string, TComponentSchema>);
					break;
			}
		} else {
			const hiddenFieldIdList = [id, ...listAllChildIds(componentSchema)];
			hiddenFieldIdList.forEach((hiddenFieldId) => {
				parsedYupSchema[hiddenFieldId] = Yup.mixed()
					.meta({ hidden: true })
					.test("empty", ERROR_MESSAGES.UNSPECIFIED_FIELD(hiddenFieldId), (value) => value === undefined);
			});
		}
	});
	return parsedYupSchema;
};

/**
 * Check if a set of render rules are valid
 * @param renderRules array of render rules to check against
 * @param yupSchema Generated Yup schema object
 * @param formValues Values in the form
 * @returns Whether the render rules pass
 */
const canRender = (
	renderRules: TRenderRules[],
	yupSchema: ObjectShape,
	formValues: TypeOfShape<Assign<ObjectShape, ObjectShape>>
) => {
	if (isEmpty(renderRules)) return { isValid: true, requiresShownRule: false, sourceIds: [] };

	const sourceIds = [];
	let isValid = false;
	let hasShownRule = false;
	let hasNonShownRule = false;
	renderRules.forEach((ruleGroup) => {
		if (hasNonShownRule) {
			return;
		}
		const shownRuleSourceFieldIds = [];
		const combinedSchema: Record<string, Yup.AnySchema> = {};
		Object.entries(ruleGroup).forEach(([sourceFieldId, rules]) => {
			const sourceYupSchemaDescription = yupSchema[sourceFieldId]?.describe();

			if (rules.find((rule) => rule.shown)) {
				shownRuleSourceFieldIds.push(sourceFieldId);
			}

			const sourceYupType = sourceYupSchemaDescription?.type as TYupSchemaType;
			if (sourceYupType) {
				let yupBaseSchema = YupHelper.mapSchemaType(sourceYupType);
				// this is to allow empty values in Yup.number schema
				if (sourceYupType === "number") {
					yupBaseSchema = yupBaseSchema
						.nullable()
						.transform((_, value: number) => (!isEmpty(value) ? +value : undefined));
				}
				combinedSchema[sourceFieldId] = YupHelper.mapRules(yupBaseSchema, rules);
			}
		});
		const renderSchema = Yup.object().shape(combinedSchema);
		try {
			renderSchema.validateSync(formValues);
			isValid = true;
			if (shownRuleSourceFieldIds.length) {
				sourceIds.push(shownRuleSourceFieldIds);
				hasShownRule = true;
			} else {
				hasNonShownRule = true;
			}
		} catch (error) {}
	});

	return { isValid, requiresShownRule: hasShownRule && !hasNonShownRule, sourceIds };
};

/**
 * Return all object keys by recursively looping through the object children
 * @param children Object to check against
 * @returns List of keys
 */
const listAllChildIds = (schema: TComponentSchema) => {
	if (!isNonEmptyObject(schema)) {
		return [];
	}

	const childIdList: string[] = [];

	// Handle special fields that render additional fields
	switch (schema.uiType) {
		case "checkbox":
		case "radio":
			(schema as ICheckboxSchema | IRadioSchema).options.forEach((option) => {
				const optionChildren = option["children"];
				if (isNonEmptyObject(optionChildren)) {
					Object.entries(optionChildren).forEach(([id, child]) => {
						childIdList.push(id);
						childIdList.push(...listAllChildIds(child));
					});
				}
			});
			break;
	}

	// Handle nested fields
	const children = schema["children"] as Record<string, TComponentSchema>;
	if (isNonEmptyObject(children)) {
		Object.entries(children).forEach(([id, child]) => {
			childIdList.push(id);
			childIdList.push(...listAllChildIds(child));
		});
	}

	return childIdList;
};

const isNonEmptyObject = (val: unknown) => !isEmpty(val) && isObject(val);
