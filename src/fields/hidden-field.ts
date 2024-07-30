import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";

export interface IHiddenFieldSchema<V = undefined> extends IFieldSchemaBase<"hidden-field", V> {
	valueType?: "string" | "number" | "boolean" | undefined;
}

export const hiddenField: IFieldGenerator<IHiddenFieldSchema> = (id, { validation, valueType }) => {
	let baseYupSchema: Yup.AnySchema;
	switch (valueType) {
		case "number":
			baseYupSchema = Yup.number();
			break;
		case "boolean":
			baseYupSchema = Yup.boolean();
			break;
		case "string":
		default:
			baseYupSchema = Yup.string();
	}

	return {
		[id]: { yupSchema: baseYupSchema, validation },
	};
};
