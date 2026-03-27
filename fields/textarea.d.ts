import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface ITextareaSchema<V = undefined> extends IFieldSchemaBase<"textarea", V> {
}
export declare const textarea: IFieldGenerator<ITextareaSchema>;
