import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
}
export interface IMultiSelectSchema<V = undefined> extends IFieldSchemaBase<"multi-select", V> {
    options: IOption[];
}
export declare const multiSelect: IFieldGenerator<IMultiSelectSchema>;
export {};
