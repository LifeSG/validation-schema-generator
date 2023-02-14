import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IEmailSchema<V = undefined> extends IFieldSchemaBase<"email", V> {}

export const email: IFieldGenerator<IEmailSchema> = (id, { validation }) => {
	const emailRule = validation?.find((rule) => rule.email);

	let schema = Yup.string();
	// no need to apply if it is defined as it will be applied in the mapRules() function
	if (!emailRule?.email) {
		schema = schema.email(ERROR_MESSAGES.EMAIL.INVALID);
	}

	return {
		[id]: { yupSchema: schema, validation },
	};
};
