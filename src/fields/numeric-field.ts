import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface INumericFieldSchema<V = undefined> extends IFieldSchemaBase<"numeric-field", V> {}

export const numericField: IFieldGenerator<INumericFieldSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.number(), validation },
});
