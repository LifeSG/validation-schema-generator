import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
type TUploadType = "base64" | "multipart";
interface IFileUploadValidationRule extends IValidationRule {
    /** accepted file types */
    fileType?: string[] | undefined;
    /** max acceptable file size in kb */
    maxSizeInKb?: number | undefined;
}
export interface IFileUploadSchema<V = undefined> extends IFieldSchemaBase<"file-upload", V, IFileUploadValidationRule> {
    uploadOnAddingFile: {
        type: TUploadType;
        [otherOptions: string]: unknown;
    };
}
export declare const fileUpload: IFieldGenerator<IFileUploadSchema>;
export {};
