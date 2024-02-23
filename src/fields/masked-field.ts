import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface IMaskedFieldSchema<V = undefined> extends IFieldSchemaBase<"masked-field", V> {}

export const maskedField: IFieldGenerator<IMaskedFieldSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
