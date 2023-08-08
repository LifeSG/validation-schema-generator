import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface ITextFieldSchema<V = undefined> extends IFieldSchemaBase<"text-field", V> {
}
export declare const textField: IFieldGenerator<ITextFieldSchema>;
