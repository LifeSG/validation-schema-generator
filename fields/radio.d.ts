import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
}
export interface IRadioSchema<V = undefined> extends IFieldSchemaBase<"radio", V> {
    options: IOption[];
}
export declare const radio: IFieldGenerator<IRadioSchema>;
export {};
