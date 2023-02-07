import * as Yup from "yup";
import { IFieldSchemaBase } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { TimeHelper } from "./time-helper";

export interface ITimeSchema<V = undefined> extends IFieldSchemaBase<"time", V> {
	is24HourFormat?: boolean | undefined;
}

export const time: IFieldGenerator<ITimeSchema> = (id, { is24HourFormat, validation }) => {
	return {
		[id]: {
			yupSchema: Yup.string().test("is-time", ERROR_MESSAGES.TIME.INVALID, (value) => {
				if (!value) return true;

				return TimeHelper.validate(value, is24HourFormat);
			}),
			validation,
		},
	};
};
