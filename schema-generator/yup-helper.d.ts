import * as Yup from "yup";
import { IRenderRule, IValidationRule, TYupSchemaType } from "./types";
interface ICombinedRule extends IRenderRule, IValidationRule {
}
/**
 * Helper functions to parse JSON schema to Yup schema
 */
export declare namespace YupHelper {
    /**
     * Initialises a Yup schema according to the type provided
     * @param type The schema type
     * @returns yupSchema that corresponds to the validation type
     */
    const mapSchemaType: (type: TYupSchemaType) => Yup.StringSchema<string, import("yup/lib/types").AnyObject, string> | Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number> | Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean> | import("yup/lib/array").OptionalArraySchema<Yup.AnySchema<any, any, any>, import("yup/lib/types").AnyObject, any[]> | import("yup/lib/object").OptionalObjectSchema<import("yup/lib/object").ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").ObjectShape>> | import("yup/lib/mixed").MixedSchema<any, import("yup/lib/types").AnyObject, any>;
    /**
     * Adds Yup validation and constraints based on specified rules
     * @param yupSchema Yup schema that was previously created from specified validation type
     * @param rules An array of validation rules to be mapped against validation type (e.g. a string schema might contain { maxLength: 255 })
     * @returns yupSchema with added constraints and validations
     */
    const mapRules: (yupSchema: Yup.AnySchema, rules: ICombinedRule[]) => Yup.AnySchema;
    /**
     * Declare custom Yup schema rule
     * @param type The schema type
     * @param name Name of the rule
     * @param fn Validation function, it must return a boolean
     */
    const addRule: (type: TYupSchemaType | "mixed", name: string, fn: (value: unknown, arg: unknown, context: Yup.TestContext) => boolean) => void;
}
export {};
