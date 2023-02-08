import { TFieldSchema, TFields } from "../schema-generator";
import { TFieldsConfig } from "./types";
/**
 * parse JSON schema by running each field through its respective field config generator
 *
 * each field config generator will return the formatted yup schema and validation config
 *
 * a field config generator may come up with multiple fields and change the validation config (e.g. chips with textarea)
 */
export declare const generateFieldConfigs: (fields: TFields) => TFieldsConfig<TFieldSchema<undefined>>;
