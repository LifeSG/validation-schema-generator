import * as Yup from "yup";
import { TFieldSchema } from "../schema-generator";
export interface IFieldConfig<V extends TFieldSchema> {
    yupSchema: Yup.AnySchema;
    validation: V["validation"];
}
export type TFieldsConfig<T extends TFieldSchema> = Record<string, IFieldConfig<T>>;
export interface IFieldGenerator<T extends TFieldSchema> {
    (id: string, field: T): TFieldsConfig<T>;
}
