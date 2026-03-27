import { IFieldSchemaBase } from "../schema-generator";
import { IFieldGenerator } from "./types";
type TUploadType = "base64" | "multipart";
export interface IESignatureFieldSchema<V = undefined> extends IFieldSchemaBase<"e-signature-field", V> {
    upload?: {
        type: TUploadType;
        [otherOptions: string]: unknown;
    } | undefined;
}
export declare const eSignatureField: IFieldGenerator<IESignatureFieldSchema>;
export {};
