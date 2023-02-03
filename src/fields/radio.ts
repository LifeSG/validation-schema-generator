import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

interface IOption {
	label: string;
	value: string;
}
export interface IRadioSchema<V = undefined> extends IFieldSchemaBase<"radio", V> {
	options: IOption[];
}

export const radio: IFieldGenerator<IRadioSchema> = (id, { options, validation }) => ({
	[id]: {
		yupSchema: Yup.string().test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (value) => {
			if (!value) return true;

			return !!options.find((option) => option.value === value);
		}),
		validation,
	},
});
