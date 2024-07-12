import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

interface IRangeSelectOption {
	label: string;
	value: string;
}
export interface IRangeSelectSchema<V = undefined> extends IFieldSchemaBase<"range-select", V> {
	options: {
		from: IRangeSelectOption[];
		to: IRangeSelectOption[];
	};
}

export const rangeSelect: IFieldGenerator<IRangeSelectSchema> = (id, { options, validation }) => ({
	[id]: {
		yupSchema: Yup.object({
			from: Yup.string(),
			to: Yup.string(),
		})
			.default(undefined)
			.test("validate-options", ERROR_MESSAGES.COMMON.INVALID_OPTION, (value) => {
				if (!value) return true;
				if (!options.from.find((fromOption) => fromOption.value === value.from)) return false;
				if (!options.to.find((toOption) => toOption.value === value.to)) return false;
				return true;
			}),
		validation,
	},
});
