import * as Yup from "yup";
import { IFieldSchemaBase } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { TimeHelper } from "./time-helper";

export interface ITimeFieldSchema<V = undefined> extends IFieldSchemaBase<"time-field", V> {
	is24HourFormat?: boolean | undefined;
}

export const timeField: IFieldGenerator<ITimeFieldSchema> = (id, { is24HourFormat, validation }) => {
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
