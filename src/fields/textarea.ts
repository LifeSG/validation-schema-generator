import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface ITextareaSchema<V = undefined> extends IFieldSchemaBase<"textarea", V> {}

export const textarea: IFieldGenerator<ITextareaSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
