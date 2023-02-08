import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IEmailSchema<V = undefined> extends IFieldSchemaBase<"email", V> {
}
export declare const email: IFieldGenerator<IEmailSchema>;
