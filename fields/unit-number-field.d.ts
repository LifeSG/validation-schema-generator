import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IUnitNumberFieldValidationRule extends IValidationRule {
    unitNumberFormat?: boolean | undefined;
}
export interface IUnitNumberFieldSchema<V = undefined> extends IFieldSchemaBase<"unit-number-field", V, IUnitNumberFieldValidationRule> {
}
export declare const unitNumberField: IFieldGenerator<IUnitNumberFieldSchema>;
