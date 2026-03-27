import { ICustomFieldSchemaBase, IValidationRule, TComponentSchema } from "../schema-generator";
import { IFieldGenerator } from "./types";
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
export declare const arrayField: IFieldGenerator<IArrayFieldSchema>;
export {};
