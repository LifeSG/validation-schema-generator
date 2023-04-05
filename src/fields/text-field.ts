import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface ITextFieldSchema<V = undefined> extends IFieldSchemaBase<"text-field", V> {}

export const textField: IFieldGenerator<ITextFieldSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
