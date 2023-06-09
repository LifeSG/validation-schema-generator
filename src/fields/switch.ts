import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface ISwitchSchema<V = boolean> extends IFieldSchemaBase<"switch", V> {}

export const switchField: IFieldGenerator<ISwitchSchema> = (id, { validation }) => ({
	[id]: { yupSchema: Yup.boolean(), validation },
});
