import type { ICustomFieldSchemaBase, IValidationRule, TComponentSchema } from "../schema-generator/types";
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
export interface IArrayFieldSchema<V = undefined> extends ICustomFieldSchemaBase<"array-field", V, IArrayFieldValidationRule> {
    fieldSchema: Record<string, TComponentSchema>;
}
export declare const arrayField: (id: string, { fieldSchema, validation }: IArrayFieldSchema, generateSchema: TSchemaGenerator) => TFieldsConfig<IArrayFieldSchema>;
export {};
