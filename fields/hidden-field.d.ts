import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IHiddenFieldValidationRule extends IValidationRule {
    equalsSchemaValue?: boolean | undefined;
}
type TStringField = {
    valueType: "string";
    value?: string | undefined;
};
type TNumberField = {
    valueType: "number";
    value?: number | undefined;
};
type TBooleanField = {
    valueType: "boolean";
    value?: boolean | undefined;
};
type TNullField = {
    valueType: "null";
    value?: null | undefined;
};
type TNoValueField = {
    valueType?: never | undefined;
    value?: never | undefined;
};
type TFieldType = TStringField | TNumberField | TBooleanField | TNullField | TNoValueField;
export type THiddenFieldSchema<V = undefined> = IFieldSchemaBase<"hidden-field", V, IHiddenFieldValidationRule> & TFieldType;
/** @deprecated use THiddenFieldSchema */
export type IHiddenFieldSchema<V = undefined> = THiddenFieldSchema<V>;
export declare const hiddenField: IFieldGenerator<THiddenFieldSchema>;
export {};
