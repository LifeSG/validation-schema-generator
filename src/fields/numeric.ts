import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface INumericSchema<V = undefined> extends IFieldSchemaBase<"numeric", V> {}

export const numeric: IFieldGenerator<INumericSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.number(), validation },
});
