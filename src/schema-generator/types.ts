import { ITextSchema } from "../fields";

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
] as const;
export type TYupSchemaType = (typeof SCHEMA_TYPES)[number];
export type TCondition = (typeof CONDITIONS)[number];

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
}

export interface IValidationRule extends IRule {
	required?: boolean | undefined;
	errorMessage?: string | undefined;
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
	validation?: (IValidationRule | V | U)[];
	[otherOptions: string]: unknown;
}

export type TFieldSchema<V = undefined> = ITextSchema<V>;

export type TFieldValidation = TFieldSchema["validation"];

/**
 * prevents inferrence
 * https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
 */
type NoInfer<T, U> = [T][T extends U ? 0 : never];

/** a collection of fields from web-frontend-engine */
export type TFields<V = undefined> = Record<string, TFieldSchema<NoInfer<V, IValidationRule>>>;
