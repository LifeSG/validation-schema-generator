import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IHistogramBin {
    count: number;
    minValue: number;
}
export interface IHistogramSlider<V = undefined> extends IFieldSchemaBase<"histogram-slider", V> {
    bins: IHistogramBin[];
    interval: number;
}
export declare const histogramSlider: IFieldGenerator<IHistogramSlider>;
