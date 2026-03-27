import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
export interface IErrorFieldValidationRule {
    error?: boolean | undefined;
    errorMessage?: string | undefined;
    when?: never;
}
export interface IErrorFieldSchema extends Pick<IFieldSchemaBase<"error-field">, "showIf" | "uiType"> {
    validation?: IErrorFieldValidationRule[] | undefined;
    [otherOptions: string]: unknown;
}
export declare const errorField: IFieldGenerator<IErrorFieldSchema>;
