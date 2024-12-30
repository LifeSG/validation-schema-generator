import { IFieldSchemaBase, TComponentSchema } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
    children?: Record<string, TComponentSchema>;
}
export interface ICheckboxSchema<V = undefined> extends IFieldSchemaBase<"checkbox", V> {
    options: IOption[];
}
export declare const checkbox: IFieldGenerator<ICheckboxSchema>;
export {};
