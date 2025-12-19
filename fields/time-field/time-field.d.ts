import { IFieldSchemaBase } from "../../schema-generator";
import { IFieldGenerator } from "../types";
export interface ITimeFieldSchema<V = undefined> extends IFieldSchemaBase<"time-field", V> {
    is24HourFormat?: boolean | undefined;
}
export declare const timeField: IFieldGenerator<ITimeFieldSchema>;
