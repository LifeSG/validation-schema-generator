import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { IFieldConfig, TFieldsConfig } from "../fields";
import { ISectionSchema, RecursivePartial, TComponentSchema, TFieldSchema, TSectionsSchema } from "./types";
/**
 * Constructs the entire Yup schema from JSON
 * @param sections JSON representation of the fields
 * @returns Yup schema ready to be used by FrontendEngine
 */
export declare const jsonToSchema: <V = undefined>(sections: TSectionsSchema<V>, overrides?: RecursivePartial<Record<string, ISectionSchema | TComponentSchema>> | undefined) => Yup.ObjectSchema<import("yup/lib/object").Assign<ObjectShape, ObjectShape>, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<ObjectShape, ObjectShape>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<ObjectShape, ObjectShape>>>;
export declare const overrideSchema: (schema: TSectionsSchema | Record<string, TComponentSchema>, overrides: RecursivePartial<Record<string, ISectionSchema | TComponentSchema>>) => any;
export declare const _testExports: {
    parseWhenKeys: (fieldConfigs: TFieldsConfig<TFieldSchema<undefined>>) => [Record<string, IFieldConfig<TFieldSchema<undefined>>>, [string, string][]];
};
