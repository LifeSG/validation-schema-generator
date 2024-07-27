import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface IHiddenFieldSchema<V = undefined> extends IFieldSchemaBase<"hidden-field", V> {}

export const hiddenField: IFieldGenerator<IHiddenFieldSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
