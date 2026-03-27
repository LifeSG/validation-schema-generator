import { IFieldSchemaBase, TComponentSchema } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IOption {
    label: string;
    value: string;
    children?: Record<string, TComponentSchema>;
}
export interface IRadioSchema<V = undefined> extends IFieldSchemaBase<"radio", V> {
    options: IOption[];
}
export declare const radio: IFieldGenerator<IRadioSchema>;
export {};
