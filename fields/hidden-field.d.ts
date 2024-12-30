import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IHiddenFieldSchema<V = undefined> extends IFieldSchemaBase<"hidden-field", V> {
    valueType?: "string" | "number" | "boolean" | undefined;
}
export declare const hiddenField: IFieldGenerator<IHiddenFieldSchema>;
