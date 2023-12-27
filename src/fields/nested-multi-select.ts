import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";
interface BaseOptionProps {
	label: string;
	key: string;
}
export interface TL1OptionProps extends BaseOptionProps {
	value: string;
	subItems?: TL2OptionProps[] | undefined;
}
export interface TL2OptionProps extends BaseOptionProps {
	value: string;
	subItems?: TL3OptionProps[] | undefined;
}
export interface TL3OptionProps extends BaseOptionProps {
	value: string;
	subItems?: undefined;
}

export interface INestedMultiSelectSchema<V = undefined> extends IFieldSchemaBase<"nested-multi-select", V> {
	options: TL1OptionProps[];
}

export const nestedMultiSelect: IFieldGenerator<INestedMultiSelectSchema> = (id, { validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.object().test(
				"is-required",
				isRequiredRule?.errorMessage || ERROR_MESSAGES.COMMON.REQUIRED_OPTION,
				(value) => {
					if (!isRequiredRule?.required) return true;
					return !!value && !!Object.keys(value).length;
				}
			),
			validation,
		},
	};
};
