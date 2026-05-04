import * as Yup from "yup";
import type { TCustomFieldSchema, TFieldSchema, TSectionsSchema } from "../schema-generator/types";

export interface IFieldConfig<V extends TFieldSchema | TCustomFieldSchema> {
	yupSchema: Yup.AnySchema;
	validation: V["validation"];
}

export type TFieldsConfig<T extends TFieldSchema | TCustomFieldSchema> = Record<string, IFieldConfig<T>>;

export type TSchemaGenerator = <V = undefined>(sections: TSectionsSchema<V>) => Yup.AnyObjectSchema;

export interface IFieldGenerator<T extends TFieldSchema | TCustomFieldSchema> {
	(id: string, field: T): TFieldsConfig<T>;
}
