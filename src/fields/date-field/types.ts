import { IFieldSchemaBase } from "../../schema-generator";

export interface IDateInputValidationRule {
	future?: boolean | undefined;
	past?: boolean | undefined;
	notFuture?: boolean | undefined;
	notPast?: boolean | undefined;
	minDate?: string | undefined;
	maxDate?: string | undefined;
}

export interface IDateFieldSchema<V = undefined> extends IFieldSchemaBase<"date-field", V, IDateInputValidationRule> {
	dateFormat?: string | undefined;
}
