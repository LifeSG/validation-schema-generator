import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { IFieldConfig, TFieldsConfig, generateFieldConfigs } from "../fields";
import { ObjectHelper } from "../utils";
import { parseConditionalRenders } from "./conditional-render";
import { ISectionSchema, RecursivePartial, TComponentSchema, TFieldSchema, TSectionsSchema } from "./types";
import { YupHelper } from "./yup-helper";

/**
 * Constructs the entire Yup schema from JSON
 * @param sections JSON representation of the fields
 * @returns Yup schema ready to be used by FrontendEngine
 */
export const jsonToSchema = <V = undefined>(
	sections: TSectionsSchema<V>,
	overrides?: RecursivePartial<Record<string, ISectionSchema | TComponentSchema>> | undefined
) => {
	const yupSchema: ObjectShape = {};
	const overriddenSections = overrideSchema(sections, overrides);
	const [fieldConfigs, whenPairIds] = parseWhenKeys(generateFieldConfigs(overriddenSections));
	Object.entries(fieldConfigs).forEach(([id, { yupSchema: yupFieldSchema, validation }]) => {
		yupSchema[id] = YupHelper.mapRules(yupFieldSchema, validation || []);
	});

	return Yup.object()
		.strict()
		.required()
		.shape(yupSchema, whenPairIds)
		.noUnknown()
		.meta({ schema: yupSchema })
		.test("conditional-render", undefined, (values, context) => parseConditionalRenders(sections, values, context));
};

export const overrideSchema = (
	schema: TSectionsSchema | Record<string, TComponentSchema>,
	overrides: RecursivePartial<Record<string, ISectionSchema | TComponentSchema>>
) => {
	if (isEmpty(overrides) || typeof schema === "string") return schema;

	const overriddenSchema = cloneDeep(schema);
	Object.keys(overriddenSchema).forEach((childId) => {
		const overrideEntry = ObjectHelper.getNestedValueByKey(overrides, childId, {
			searchIn: ["children"],
		});
		merge(overriddenSchema, overrideEntry);

		if (overriddenSchema[childId]?.children) {
			overriddenSchema[childId].children = overrideSchema(
				overriddenSchema[childId].children as Record<string, TComponentSchema>,
				overrides
			);
		}
	});

	return ObjectHelper.removeNil(overriddenSchema);
};

/**
 * Iterates through field configs to look for conditional validation rules (`when` condition)
 * For each conditional validation rule, it will refer to the source field to generate the corresponding yup schema
 * @param fieldConfigs config containing the yup schema and validation config on each field
 * @returns an aray containing the parsed field config and conditional field id pairs
 */
const parseWhenKeys = (
	fieldConfigs: TFieldsConfig<TFieldSchema<undefined>>
): [Record<string, IFieldConfig<TFieldSchema<undefined>>>, [string, string][]] => {
	const parsedFieldConfigs = { ...fieldConfigs };

	// Yup's escape hatch for cycling dependency error
	// this happens when 2 fields have conditional validation that rely on each other
	// typically used to ensure user fill in one of many fields
	// https://github.com/jquense/yup/issues/176#issuecomment-367352042
	const whenPairIds: [string, string][] = [];

	Object.entries(parsedFieldConfigs).forEach(([id, { validation }]) => {
		const notWhenRules = validation?.filter((rule) => !("when" in rule)) || [];
		const whenRules =
			validation
				?.filter((rule) => "when" in rule)
				.map((rule) => {
					const parsedRule = { ...rule };
					Object.keys(parsedRule.when).forEach((whenFieldId) => {
						whenPairIds.push([id, whenFieldId]);
						parsedRule.when[whenFieldId] = {
							...parsedRule.when[whenFieldId],
							yupSchema: parsedFieldConfigs[whenFieldId].yupSchema.clone(),
						};
					});
					return parsedRule;
				}) || [];
		parsedFieldConfigs[id].validation = [...notWhenRules, ...whenRules];
	});
	return [parsedFieldConfigs, whenPairIds];
};

export const _testExports = {
	parseWhenKeys,
};
