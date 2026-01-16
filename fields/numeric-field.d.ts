import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface INumericFieldSchema<V = undefined> extends IFieldSchemaBase<"numeric-field", V> {
}
export declare const numericField: IFieldGenerator<INumericFieldSchema>;
