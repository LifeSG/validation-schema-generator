import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

interface IOption {
	label: string;
	value: string;
}
export interface ISelectSchema<V = undefined> extends IFieldSchemaBase<"select", V> {
	options: IOption[];
}

export const select: IFieldGenerator<ISelectSchema> = (id, { options, validation }) => ({
	[id]: {
		yupSchema: Yup.string().test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (value) => {
			if (!value) return true;

			return !!options.find((option) => option.value === value);
		}),
		validation,
	},
});
