import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { IFieldConfig, TFieldsConfig, generateFieldConfigs } from "../fields";
import { ObjectHelper } from "../utils";
import { parseConditionalRenders } from "./conditional-render";
import {
	ISectionSchema,
	RecursivePartial,
	TComponentSchema,
	TCustomFieldSchema,
	TFieldSchema,
	TFieldValidation,
	TSectionsSchema,
} from "./types";
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
		.test("conditional-render", undefined, (values, context) =>
			parseConditionalRenders(overriddenSections, values, context)
		);
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
 * @param fieldConfigs the entire config containing the yup schema and validation config of each field
 * @returns an array containing the parsed field config and conditional field id pairs
 */
const parseWhenKeys = (
	fieldConfigs: TFieldsConfig<TFieldSchema | TCustomFieldSchema>
): [Record<string, IFieldConfig<TFieldSchema | TCustomFieldSchema>>, [string, string][]] => {
	const parsedFieldConfigs = { ...fieldConfigs };
	// Yup's escape hatch for cycling dependency error
	// this happens when 2 fields have conditional validation that rely on each other
	// typically used to ensure user fill in one of many fields
	// https://github.com/jquense/yup/issues/176#issuecomment-367352042
	const whenPairIds: [string, string][] = [];

	Object.entries(parsedFieldConfigs).forEach(([id, { validation }]) => {
		const [parsedFieldConfig, fieldWhenPairIds] = addSchemaToWhenRules(id, fieldConfigs, validation);
		whenPairIds.push(...fieldWhenPairIds);
		parsedFieldConfigs[id].validation = parsedFieldConfig;
	});
	return [parsedFieldConfigs, whenPairIds];
};

/**
 * Recursively adds validation schema to each when rule, including nested ones
 * @param id id of the field with the when rule
 * @param fieldConfigs the entire config containing the yup schema and validation config of each field
 * @param fieldValidationConfig validation config of a single field
 * @returns an array containing the parsed field config and conditional field id pairs
 */
const addSchemaToWhenRules = (
	id: string,
	fieldConfigs: TFieldsConfig<TFieldSchema | TCustomFieldSchema>,
	fieldValidationConfig: TFieldValidation
): [TFieldValidation, [string, string][]] => {
	const whenPairIds: [string, string][] = [];
	const parsedFieldValidationConfig =
		fieldValidationConfig?.filter((fieldValidationConfig) => !("when" in fieldValidationConfig)) || [];
	fieldValidationConfig
		?.filter((fieldValidationConfig) => "when" in fieldValidationConfig)
		.forEach((fieldValidationConfig) => {
			const parsedConfig = { ...fieldValidationConfig };
			Object.keys(parsedConfig.when).forEach((whenFieldId) => {
				// when
				whenPairIds.push([id, whenFieldId]);
				parsedConfig.when[whenFieldId] = {
					...parsedConfig.when[whenFieldId],
					yupSchema: fieldConfigs[whenFieldId].yupSchema.clone(),
				};

				// then
				const [parsedThenRules, thenPairIds] = addSchemaToWhenRules(
					id,
					fieldConfigs,
					parsedConfig.when[whenFieldId].then
				);
				parsedConfig.when[whenFieldId].then = parsedThenRules;
				whenPairIds.push(...thenPairIds);
			});
			parsedFieldValidationConfig.push(parsedConfig);
		});
	return [parsedFieldValidationConfig, whenPairIds];
};

export const _testExports = {
	parseWhenKeys,
};
