import { IFieldSchemaBase, IValidationRule } from "../../schema-generator";
import { CountryData } from "./data";
export interface IContactNumberValidationRule extends IValidationRule {
    contactNumber?: {
        internationalNumber: boolean | Omit<TCountry, "Singapore">;
        singaporeNumber?: never;
    } | {
        internationalNumber?: never;
        singaporeNumber: "default" | "house" | "mobile";
    } | undefined;
}
export type TCountry = (typeof CountryData)[number][0];
export interface IContactFieldSchema<V = undefined> extends IFieldSchemaBase<"contact-field", V, IContactNumberValidationRule> {
}
