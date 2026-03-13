import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
interface IRangeSelectOption {
    label: string;
    value: string;
}
export interface IRangeSelectSchema<V = undefined> extends IFieldSchemaBase<"range-select", V> {
    options: {
        from: IRangeSelectOption[];
        to: IRangeSelectOption[];
    };
}
export declare const rangeSelect: IFieldGenerator<IRangeSelectSchema>;
export {};
