import * as Yup from "yup";
import {
	IArrayFieldSchema,
	ICheckboxSchema,
	IChipsSchema,
	IContactFieldSchema,
	IDateFieldSchema,
	IDateRangeFieldSchema,
	IESignatureFieldSchema,
	IEmailFieldSchema,
	IErrorFieldSchema,
	IFileUploadSchema,
	IHistogramSlider,
	IImageUploadSchema,
	IMaskedFieldSchema,
	IMultiSelectSchema,
	INestedMultiSelectSchema,
	INumericFieldSchema,
	IRadioSchema,
	IRangeSelectSchema,
	ISelectSchema,
	ISliderSchema,
	ISwitchSchema,
	ITextFieldSchema,
	ITextareaSchema,
	ITimeFieldSchema,
	IUnitNumberFieldSchema,
	THiddenFieldSchema,
} from "../fields";

// =============================================================================
// CONDITIONS AND RULES
// =============================================================================
export const SCHEMA_TYPES = ["string", "number", "boolean", "array", "object", "mixed"] as const;
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
	"equalsField",
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
	notMatches?: string | undefined;
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
	uen?: boolean | undefined;
	equalsField?: string | undefined;
	notEqualsField?: string | undefined;
}

export interface IValidationRule extends IRule {
	required?: boolean | undefined;
	when?:
		| {
				[id: string]: {
					is: string | number | boolean | string[] | number[] | boolean[] | IConditionalValidationRule[];
					then: IValidationRule[];
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

export interface IRenderRule extends IRule {
	filled?: boolean | undefined;
	shown?: boolean | undefined;
	withinDays?: IDaysRangeRule | undefined;
}
export type TRenderRules = Record<string, IRenderRule[]>;

// =============================================================================
// WEB FRONTEND ENGINE TYPES
// =============================================================================
/**
 * base representation of a web-frontend-engine field to be extended
 * the shape is intended to be lenient and to allow unknown keys
 */
export interface IFieldSchemaBase<T, V = undefined, U = undefined> {
	uiType: T;
	validation?: (IValidationRule | V | U)[] | undefined;
	referenceKey?: never | undefined;
	showIf?: TRenderRules[] | undefined;
	[otherOptions: string]: unknown;
}

/** to support elements, they don't come with validation schema  */
interface IBaseElementSchema {
	validation?: never | undefined;
	referenceKey?: never | undefined;
	showIf?: TRenderRules[] | undefined;
	[otherOptions: string]: unknown;
}
interface IElementSchema extends IBaseElementSchema {
	uiType:
		| "alert"
		| "text-d1"
		| "text-d2"
		| "text-dbody"
		| "text-h1"
		| "text-h2"
		| "text-h3"
		| "text-h4"
		| "text-h5"
		| "text-h6"
		| "text-body"
		| "text-bodysmall"
		| "text-xsmall"
		| "submit"
		| "reset"
		| "divider";
}

/** covers various elements that can render nested fields within them */
export interface IWrapperSchema<V = undefined> extends IBaseElementSchema {
	uiType:
		| "div"
		| "span"
		| "header"
		| "footer"
		| "p"
		| "h1"
		| "h2"
		| "h3"
		| "h4"
		| "h5"
		| "h6"
		| "p"
		| "accordion"
		| "grid";
	children: Record<string, TComponentSchema<V>>;
}

/** topmost component under sections  */
export interface ISectionSchema<V = undefined> {
	uiType: "section";
	children: Record<string, TComponentSchema<V>>;
	validation?: never | undefined;
	referenceKey?: never | undefined;
	showIf?: never | undefined;
	[otherOptions: string]: unknown;
}

/** to support custom components from other form / frontend engines */
interface ICustomComponentSchema {
	referenceKey: string;
	uiType?: never | undefined;
	[otherOptions: string]: unknown;
}

/** to support custom fields */
export interface ICustomFieldSchemaBase<T, V = undefined, U = undefined> {
	referenceKey: T;
	uiType?: never | undefined;
	validation?: (IValidationRule | V | U)[] | undefined;
	showIf?: TRenderRules[] | undefined;
	[otherOptions: string]: unknown;
}

/** field schemas only */
export type TFieldSchema<V = undefined> =
	| ICheckboxSchema<V>
	| IChipsSchema<V>
	| IContactFieldSchema<V>
	| IDateFieldSchema<V>
	| IDateRangeFieldSchema<V>
	| IEmailFieldSchema<V>
	| IErrorFieldSchema
	| IESignatureFieldSchema<V>
	| IFileUploadSchema<V>
	| THiddenFieldSchema<V>
	| IHistogramSlider<V>
	| IImageUploadSchema<V>
	| IMaskedFieldSchema<V>
	| IMultiSelectSchema<V>
	| INestedMultiSelectSchema<V>
	| INumericFieldSchema<V>
	| IRadioSchema<V>
	| IRangeSelectSchema<V>
	| ISelectSchema<V>
	| ISliderSchema<V>
	| ISwitchSchema<V>
	| ITextareaSchema<V>
	| ITextFieldSchema<V>
	| ITimeFieldSchema<V>
	| IUnitNumberFieldSchema<V>;

/**
 * custom fields schema only
 */
export type TCustomFieldSchema<V = undefined> = IArrayFieldSchema<V>;

/** fields, elements, custom component schemas */
export type TComponentSchema<V = undefined> =
	| TFieldSchema<V>
	| TCustomFieldSchema<V>
	| IWrapperSchema
	| IElementSchema
	| ICustomComponentSchema;

// force (A[] | B[]) to (A|B)[] to fix this type error in Typescript 4: https://github.com/microsoft/TypeScript/issues/44373
export type TFieldValidation = TFieldSchema["validation"][number][];

/**
 * prevents inferrence
 * https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
 */
type NoInfer<T, U> = [T][T extends U ? 0 : never];

export type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

/** a collection of sections from web-frontend-engine */
export type TSectionsSchema<V = undefined> = Record<string, ISectionSchema<NoInfer<V, IValidationRule>>>;

export interface IDaysRangeRule {
	numberOfDays: number;
	fromDate?: string | undefined;
	dateFormat?: string | undefined;
}

export interface IWithinDaysRangeRule extends IDaysRangeRule {
	inclusive?: boolean | undefined;
}
