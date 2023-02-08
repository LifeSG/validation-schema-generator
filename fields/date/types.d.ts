import { IFieldSchemaBase } from "../../schema-generator";
export interface IDateInputValidationRule {
    future?: boolean | undefined;
    past?: boolean | undefined;
    notFuture?: boolean | undefined;
    notPast?: boolean | undefined;
}
export interface IDateSchema<V = undefined> extends IFieldSchemaBase<"date", V, IDateInputValidationRule> {
    dateFormat?: string | undefined;
}
