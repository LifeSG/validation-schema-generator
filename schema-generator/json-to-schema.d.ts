import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { TFieldsConfig } from "../fields";
import { TFieldSchema, TFieldValidation, TFields, TYupSchemaType } from "./types";
/**
 * Constructs the entire Yup schema from JSON
 * @param fields JSON representation of the fields
 * @returns Yup schema ready to be used by FrontendEngine
 */
export declare const jsonToSchema: <V = undefined>(fields: TFields<V>) => Yup.ObjectSchema<import("yup/lib/object").Assign<ObjectShape, ObjectShape>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<ObjectShape, ObjectShape>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<ObjectShape, ObjectShape>>>;
/**
 * Declare custom Yup schema rule
 * @param type The schema type
 * @param name Name of the rule
 * @param fn Validation function, it must return a boolean
 */
export declare const addRule: (type: TYupSchemaType | "mixed", name: string, fn: (value: unknown, arg: unknown, context: Yup.TestContext) => boolean) => void;
export declare const _testExports: {
    mapSchemaType: (type: TYupSchemaType) => import("yup/lib/object").OptionalObjectSchema<ObjectShape, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<ObjectShape>> | Yup.StringSchema<string, import("yup/lib/types").AnyObject, string> | Yup.NumberSchema<number, import("yup/lib/types").AnyObject, number> | Yup.BooleanSchema<boolean, import("yup/lib/types").AnyObject, boolean> | import("yup/lib/array").OptionalArraySchema<Yup.AnySchema<any, any, any>, import("yup/lib/types").AnyObject, any[]> | import("yup/lib/mixed").MixedSchema<any, import("yup/lib/types").AnyObject, any>;
    mapRules: (yupSchema: Yup.AnySchema, rules: TFieldValidation) => Yup.AnySchema;
    parseWhenKeys: (fieldConfigs: TFieldsConfig<TFieldSchema<undefined>>) => {
        [x: string]: import("../fields").IFieldConfig<TFieldSchema<undefined>>;
    };
};
