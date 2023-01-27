import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface ITextSchema<V = undefined> extends IFieldSchemaBase<"text", V> {}

export const text: IFieldGenerator<ITextSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
