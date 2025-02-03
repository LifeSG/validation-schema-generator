import isNil from "lodash/isNil";
import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IHiddenFieldValidationRule extends IValidationRule {
	equalsSchemaValue?: boolean | undefined;
}

type TStringField = {
	valueType: "string";
	value?: string | undefined;
};

type TNumberField = {
	valueType: "number";
	value?: number | undefined;
};

type TBooleanField = {
	valueType: "boolean";
	value?: boolean | undefined;
};

type TNullField = {
	valueType: "null";
	value?: null | undefined;
};

type TNoValueField = {
	valueType?: never | undefined;
	value?: never | undefined;
};

type TFieldType = TStringField | TNumberField | TBooleanField | TNullField | TNoValueField;

export type THiddenFieldSchema<V = undefined> = IFieldSchemaBase<"hidden-field", V, IHiddenFieldValidationRule> &
	TFieldType;

/** @deprecated use THiddenFieldSchema */
export type IHiddenFieldSchema<V = undefined> = THiddenFieldSchema<V>;

export const hiddenField: IFieldGenerator<THiddenFieldSchema> = (id, { validation, valueType, value: schemaValue }) => {
	const equalsSchemaValueRule = validation?.find((rule) => "equalsSchemaValue" in rule);

	let baseYupSchema: Yup.AnySchema;
	switch (valueType) {
		case "null":
			baseYupSchema = Yup.mixed();
			break;
		case "number":
			baseYupSchema = Yup.number();
			break;
		case "boolean":
			baseYupSchema = Yup.boolean();
			break;
		case "string":
		default:
			baseYupSchema = Yup.string();
	}
	baseYupSchema = baseYupSchema.test(
		"schema-value",
		equalsSchemaValueRule?.errorMessage || ERROR_MESSAGES.GENERIC.INVALID,
		(value) => {
			if (valueType === "null") {
				return value === null;
			}
			return isNil(schemaValue) ? true : value === schemaValue;
		}
	);

	return {
		[id]: { yupSchema: baseYupSchema, validation },
	};
};
