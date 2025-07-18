import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
}
export interface ISelectSchema<V = undefined> extends IFieldSchemaBase<"select", V> {
    options: IOption[];
}
export declare const select: IFieldGenerator<ISelectSchema>;
export {};
