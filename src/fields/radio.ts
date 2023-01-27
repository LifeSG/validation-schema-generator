import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface IRadioSchema<V = undefined> extends IFieldSchemaBase<"radio", V> {}

export const radio: IFieldGenerator<IRadioSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.string(), validation },
});
