import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IEmailFieldSchema<V = undefined> extends IFieldSchemaBase<"email-field", V> {}

export const emailField: IFieldGenerator<IEmailFieldSchema> = (id, { validation }) => {
	const emailRule = validation?.find((rule) => rule.email);

	let schema = Yup.string();
	// no need to apply if it is defined as it will be applied in the mapRules() function
	if (!emailRule) {
		schema = schema.email(ERROR_MESSAGES.EMAIL.INVALID);
	}

	return {
		[id]: { yupSchema: schema, validation },
	};
};
