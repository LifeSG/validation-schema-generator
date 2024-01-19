import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
}
export interface ICheckboxSchema<V = undefined> extends IFieldSchemaBase<"checkbox", V> {
    options: IOption[];
}
export declare const checkbox: IFieldGenerator<ICheckboxSchema>;
export {};
