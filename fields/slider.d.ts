import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface ISliderSchema<V = undefined> extends IFieldSchemaBase<"slider", V> {
}
export declare const slider: IFieldGenerator<ISliderSchema>;
