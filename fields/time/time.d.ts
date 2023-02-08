import { IFieldSchemaBase } from "../../schema-generator";
import { IFieldGenerator } from "../types";
export interface ITimeSchema<V = undefined> extends IFieldSchemaBase<"time", V> {
    is24HourFormat?: boolean | undefined;
}
export declare const time: IFieldGenerator<ITimeSchema>;
