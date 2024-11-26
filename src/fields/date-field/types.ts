import { IFieldSchemaBase, IValidationRule, IWithinDaysRule } from "../../schema-generator";

export interface IDateInputValidationRule extends IValidationRule {
	future?: boolean | undefined;
	past?: boolean | undefined;
	notFuture?: boolean | undefined;
	notPast?: boolean | undefined;
	minDate?: string | undefined;
	maxDate?: string | undefined;
	excludedDates?: string[] | undefined;
	withinDays?: Omit<IWithinDaysRule, "dateFormat"> | undefined;
}

export interface IDateFieldSchema<V = undefined> extends IFieldSchemaBase<"date-field", V, IDateInputValidationRule> {
	dateFormat?: string | undefined;
}
