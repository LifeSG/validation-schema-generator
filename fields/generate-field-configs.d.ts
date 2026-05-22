import type { TCustomFieldSchema, TFieldSchema, TSectionsSchema } from "../schema-generator/types";
import { TFieldsConfig, TSchemaGenerator } from "./types";
/**
 * parse JSON schema by running each field through its respective field config generator
 *
 * each field config generator will return the formatted yup schema and validation config
 *
 * a field config generator may come up with multiple fields and change the validation config (e.g. chips with textarea)
 */
export declare const generateFieldConfigs: (sections: TSectionsSchema, generateSchema: TSchemaGenerator) => TFieldsConfig<TFieldSchema<undefined> | TCustomFieldSchema<undefined>>;
