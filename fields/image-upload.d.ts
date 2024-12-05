import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
type TImageUploadAcceptedFileType = "jpg" | "gif" | "png" | "heic" | "heif" | "webp";
type TImageUploadOutputFileType = "jpg" | "png";
interface IImageDimensions {
    width: number;
    height: number;
}
interface IImageUploadValidationRule extends IValidationRule {
    fileType?: TImageUploadAcceptedFileType[] | undefined;
    maxSizeInKb?: number | undefined;
}
export interface IImageUploadSchema<V = undefined> extends IFieldSchemaBase<"image-upload", V, IImageUploadValidationRule> {
    outputType?: TImageUploadOutputFileType | undefined;
    compress?: boolean | undefined;
    dimensions?: IImageDimensions | undefined;
}
export declare const imageUpload: IFieldGenerator<IImageUploadSchema>;
export {};
