import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface ISwitchSchema<V = boolean> extends IFieldSchemaBase<"switch", V> {
}
export declare const switchField: IFieldGenerator<ISwitchSchema>;
