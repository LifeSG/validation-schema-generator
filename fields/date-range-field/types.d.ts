import { IFieldSchemaBase, IValidationRule } from "../../schema-generator";
export interface IDateRangeInputValidationRule extends IValidationRule {
    future?: boolean | undefined;
    past?: boolean | undefined;
    notFuture?: boolean | undefined;
    notPast?: boolean | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    excludedDates?: string[] | undefined;
    numberOfDays?: number | undefined;
}
export interface IDateRangeFieldSchema<V = undefined> extends IFieldSchemaBase<"date-range-field", V, IDateRangeInputValidationRule> {
    dateFormat?: string | undefined;
}
