import * as Yup from "yup";
import { TCustomFieldSchema, TFieldSchema } from "../schema-generator";
export interface IFieldConfig<V extends TFieldSchema | TCustomFieldSchema> {
    yupSchema: Yup.AnySchema;
    validation: V["validation"];
}
export type TFieldsConfig<T extends TFieldSchema | TCustomFieldSchema> = Record<string, IFieldConfig<T>>;
export interface IFieldGenerator<T extends TFieldSchema | TCustomFieldSchema> {
    (id: string, field: T): TFieldsConfig<T>;
}
