import * as Yup from "yup";
import { Assign, ObjectShape, TypeOfShape } from "yup/lib/object";
import { AnyObject } from "yup/lib/types";
import { TSectionsSchema } from "./types";
/**
 * Remove conditionally rendered fields from yup schema if the conditions are not fulfilled
 * This works by mutating the schema fields passed via the Yup context
 * In order to preserve the original Yup schema, the full schema is stored in the Yup metadata at the time of creation
 * @param sections JSON representation of the fields
 * @param formValues Values in the form
 * @param yupContext Yup schema context
 * @returns Always return true
 */
export declare const parseConditionalRenders: (sections: TSectionsSchema, formValues: TypeOfShape<Assign<ObjectShape, ObjectShape>>, yupContext: Yup.TestContext<AnyObject>) => boolean;
