import { ICustomFieldSchemaBase, IValidationRule, TComponentSchema } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IArrayFieldValidationRule extends IValidationRule {
    /** for customising error message when one section is invalid */
    valid?: boolean | undefined;
}
export interface IArrayFieldSchema<V = undefined> extends ICustomFieldSchemaBase<"array-field", V, IArrayFieldValidationRule> {
    fieldSchema: Record<string, TComponentSchema>;
}
export declare const arrayField: IFieldGenerator<IArrayFieldSchema>;
export {};
