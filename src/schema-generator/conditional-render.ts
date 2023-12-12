import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import * as Yup from "yup";
import { Assign, ObjectShape, TypeOfShape } from "yup/lib/object";
import { AnyObject } from "yup/lib/types";
import { YupHelper } from "./yup-helper";
import { TComponentSchema, TRenderRules, TSectionsSchema, TYupSchemaType } from "./types";
import { ERROR_MESSAGES } from "../shared";

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
	if (isEmpty(formValues)) return true;
	yupContext.schema.withMutation((schema: Yup.ObjectSchema<Assign<ObjectShape, ObjectShape>>) => {
		let yupSchema: ObjectShape = yupContext.schema.clone().describe().meta.schema;
		Object.values(sections).forEach((section) => {
			yupSchema = parseChildrenConditionalRenders(section.children, yupSchema, formValues);
		});
		schema.shape(yupSchema);
	});
	return true;
};

/**
 * Recursively loop through every children to check if it can render every field
 * @param childrenSchema children JSON schema
 * @param yupSchema Generated Yup schema object
 * @param formValues Values in the form
 * @returns Yup schema containing only fields that can passed conditional rendering
 */
const parseChildrenConditionalRenders = (
	childrenSchema: Record<string, TComponentSchema>,
	yupSchema: ObjectShape,
	formValues: TypeOfShape<Assign<ObjectShape, ObjectShape>>
) => {
	let parsedYupSchema: ObjectShape = { ...yupSchema };
	Object.entries(childrenSchema).forEach(([id, componentSchema]) => {
		if (canRender(componentSchema.showIf as TRenderRules[], yupSchema, formValues)) {
			if (!isEmpty(componentSchema.children) && isObject(componentSchema.children)) {
				parsedYupSchema = {
					...parseChildrenConditionalRenders(
						componentSchema.children as Record<string, TComponentSchema>,
						parsedYupSchema,
						formValues
					),
				};
			}
		} else {
			const hiddenFieldIdList = [id, ...listAllChildIds(componentSchema.children)];
			hiddenFieldIdList.forEach((hiddenFieldId) => {
				parsedYupSchema[hiddenFieldId] = Yup.mixed().test(
					"empty",
					ERROR_MESSAGES.UNSPECIFIED_FIELD(hiddenFieldId),
					(value) => value === undefined
				);
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
	if (isEmpty(renderRules)) return true;

	let isValid = false;
	renderRules.forEach((ruleGroup) => {
		if (!isValid) {
			const combinedSchema: Record<string, Yup.AnySchema> = {};
			Object.entries(ruleGroup).forEach(([sourceFieldId, rules]) => {
				const sourceYupSchema = yupSchema[sourceFieldId];
				const sourceYupType = sourceYupSchema?.describe()?.type as TYupSchemaType;
				if (!sourceYupType) {
					return;
				}

				let yupBaseSchema = YupHelper.mapSchemaType(sourceYupType);
				// this is to allow empty values in Yup.number schema
				if (sourceYupType === "number") {
					yupBaseSchema = yupBaseSchema
						.nullable()
						.transform((_, value: number) => (!isEmpty(value) ? +value : undefined));
				}
				combinedSchema[sourceFieldId] = YupHelper.mapRules(yupBaseSchema, rules);
			});
			const renderSchema = Yup.object().shape(combinedSchema);
			try {
				renderSchema.validateSync(formValues);
				isValid = true;
			} catch (error) {}
		}
	});

	return isValid;
};

/**
 * Return all object keys by recursively looping through the object children
 * @param children Object to check against
 * @returns List of keys
 */
const listAllChildIds = (children: unknown) => {
	const childIdList: string[] = [];
	if (isEmpty(children) || !isObject(children)) {
		return childIdList;
	}
	Object.entries(children).forEach(([id, child]) => {
		childIdList.push(id);
		if (child["children"]) {
			childIdList.push(...listAllChildIds(child["children"]));
		}
	});

	return childIdList;
};
