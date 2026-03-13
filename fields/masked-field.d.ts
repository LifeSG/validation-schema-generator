import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IMaskedFieldSchema<V = undefined> extends IFieldSchemaBase<"masked-field", V> {
}
export declare const maskedField: IFieldGenerator<IMaskedFieldSchema>;
