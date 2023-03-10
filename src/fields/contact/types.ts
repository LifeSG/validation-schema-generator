import { IFieldSchemaBase } from "../../schema-generator";

export interface IContactNumberValidationRule {
	contactNumber?:
		| {
				internationalNumber: true;
				singaporeNumber?: never;
		  }
		| {
				internationalNumber?: never;
				singaporeNumber: "default" | "house" | "mobile";
		  }
		| undefined;
}

export interface IContactSchema<V = undefined> extends IFieldSchemaBase<"contact", V, IContactNumberValidationRule> {}
