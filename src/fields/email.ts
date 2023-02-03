import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IEmailSchema<V = undefined> extends IFieldSchemaBase<"email", V> {}

export const email: IFieldGenerator<IEmailSchema> = (id, { validation }) => {
	const emailRule = validation?.find((rule) => rule.email);

	return {
		[id]: { yupSchema: Yup.string().email(emailRule?.errorMessage || ERROR_MESSAGES.EMAIL.INVALID), validation },
	};
};
