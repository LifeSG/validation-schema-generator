import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IEmailFieldSchema<V = undefined> extends IFieldSchemaBase<"email-field", V> {
}
export declare const emailField: IFieldGenerator<IEmailFieldSchema>;
