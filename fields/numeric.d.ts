import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface INumericSchema<V = undefined> extends IFieldSchemaBase<"numeric", V> {
}
export declare const numeric: IFieldGenerator<INumericSchema>;
