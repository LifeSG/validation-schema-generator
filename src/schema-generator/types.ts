import * as Yup from "yup";
import {
	ICheckboxSchema,
	IChipsSchema,
	IContactSchema,
	IDateSchema,
	IEmailSchema,
	IMultiSelectSchema,
	INumericSchema,
	IRadioSchema,
	ISelectSchema,
	ITextSchema,
	ITextareaSchema,
	ITimeSchema,
} from "../fields";

export const SCHEMA_TYPES = ["string", "number", "boolean", "array", "object"] as const;
export const CONDITIONS = [
	"required",
	"length",
	"min",
	"max",
	"matches",
	"email",
	"url",
	"uuid",
	"positive",
	"negative",
	"integer",
	"lessThan",
	"moreThan",
	"when",
	"filled",
	"empty",
	"equals",
	"notEquals",
	"includes",
	"excludes",
	"uinfin",
] as const;
export type TYupSchemaType = (typeof SCHEMA_TYPES)[number];
export type TCondition = (typeof CONDITIONS)[number];

// TODO: apply type-specific rules to individual fields instead to reduce confusion
/** base validation rule to extend from */
interface IRule {
	length?: number | undefined;
	min?: number | undefined;
	max?: number | undefined;
	matches?: string | undefined;
	email?: boolean | undefined;
	url?: boolean | undefined;
	uuid?: boolean | undefined;
	positive?: boolean | undefined;
	negative?: boolean | undefined;
	integer?: boolean | undefined;
	lessThan?: number | undefined;
	moreThan?: number | undefined;
	empty?: boolean | undefined;
	equals?: unknown | undefined;
	notEquals?: unknown | undefined;
	includes?: unknown | undefined;
	excludes?: unknown | undefined;
	uinfin?: boolean | undefined;
}

export interface IValidationRule extends IRule {
	required?: boolean | undefined;
	when?:
		| {
				[id: string]: {
					is: string | number | boolean | string[] | number[] | boolean[] | IConditionalValidationRule[];
					then: Omit<IValidationRule, "when">[];
					otherwise?: Omit<IValidationRule, "when">[] | undefined;
					yupSchema?: Yup.AnySchema | undefined;
				};
		  }
		| undefined;
	errorMessage?: string | undefined;
}

export interface IConditionalValidationRule extends IRule {
	filled?: boolean | undefined;
}

// =============================================================================
// WEB FRONTEND ENGINE TYPES
// =============================================================================
/**
 * base representation of a web-frontend-engine field to be extended
 * the shape is intended to be lenient and to allow unknown keys
 */
export interface IFieldSchemaBase<T, V = undefined, U = undefined> {
	fieldType: T;
	validation?: (IValidationRule | V | U)[] | undefined;
	[otherOptions: string]: unknown;
}

export type TFieldSchema<V = undefined> =
	| ICheckboxSchema<V>
	| IChipsSchema<V>
	| IContactSchema<V>
	| IDateSchema<V>
	| IEmailSchema<V>
	| IMultiSelectSchema<V>
	| INumericSchema<V>
	| IRadioSchema<V>
	| ISelectSchema<V>
	| ITextareaSchema<V>
	| ITextSchema<V>
	| ITimeSchema<V>;

export type TFieldValidation = TFieldSchema["validation"];

/**
 * prevents inferrence
 * https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
 */
type NoInfer<T, U> = [T][T extends U ? 0 : never];

/** a collection of fields from web-frontend-engine */
export type TFields<V = undefined> = Record<string, TFieldSchema<NoInfer<V, IValidationRule>>>;
