import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface ITextSchema<V = undefined> extends IFieldSchemaBase<"text", V> {
}
export declare const text: IFieldGenerator<ITextSchema>;
