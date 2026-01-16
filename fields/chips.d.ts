import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IOption {
    label: string;
    value: string;
}
export interface IChipsTextareaSchema<V = undefined> {
    label: string;
    validation?: (IValidationRule | V)[] | undefined;
    [otherOptions: string]: unknown;
}
export interface IChipsSchema<V = undefined> extends IFieldSchemaBase<"chips", V> {
    options: IOption[];
    textarea?: IChipsTextareaSchema<V> | undefined;
}
export declare const chips: IFieldGenerator<IChipsSchema>;
