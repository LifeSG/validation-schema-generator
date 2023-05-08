import { IFieldSchemaBase } from "../../schema-generator";
import { CountryData } from "./data";

export interface IContactNumberValidationRule {
	contactNumber?:
		| {
				internationalNumber: true;
				singaporeNumber?: never;
				fixedCountry?: never;
		  }
		| {
				internationalNumber?: never;
				singaporeNumber: "default" | "house" | "mobile";
				fixedCountry?: never;
		  }
		| {
				internationalNumber?: never;
				singaporeNumber?: never;
				fixedCountry: TCountry;
		  }
		| undefined;
}

export type TCountry = (typeof CountryData)[number][0];

export interface IContactFieldSchema<V = undefined>
	extends IFieldSchemaBase<"contact-field", V, IContactNumberValidationRule> {}
