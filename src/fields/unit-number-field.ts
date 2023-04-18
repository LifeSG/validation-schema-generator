import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
import { ERROR_MESSAGES } from "../shared";

export interface IUnitNumberFieldSchema<V = undefined> extends IFieldSchemaBase<"unit-number-field", V> {}

export const unitNumberField: IFieldGenerator<IUnitNumberFieldSchema> = (id, { validation }) => ({
	[id]: {
		yupSchema: Yup.string().matches(/^([a-zA-Z0-9]{1,3}-[a-zA-Z0-9]{1,5})$/, {
			excludeEmptyString: true,
			message: ERROR_MESSAGES.UNIT_NUMBER.INVALID,
		}),
		validation,
	},
});
