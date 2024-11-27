import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { IFieldGenerator } from "./types";
import { ERROR_MESSAGES } from "../shared";
import { FileHelper, ImageHelper } from "../utils";

type TImageUploadAcceptedFileType = "jpg" | "gif" | "png" | "heic" | "heif" | "webp";
type TImageUploadOutputFileType = "jpg" | "png";
interface IImageDimensions {
	width: number;
	height: number;
}

interface IImageUploadValidationRule extends IValidationRule {
	// rule is supported but no validation is needed as it only needs to validation the outputType
	fileType?: TImageUploadAcceptedFileType[] | undefined;
	maxSizeInKb?: number | undefined;
}

export interface IImageUploadSchema<V = undefined>
	extends IFieldSchemaBase<"image-upload", V, IImageUploadValidationRule> {
	outputType?: TImageUploadOutputFileType | undefined;
	compress?: boolean | undefined;
	dimensions?: IImageDimensions | undefined;
}

export const imageUpload: IFieldGenerator<IImageUploadSchema> = (
	id,
	{ compress, dimensions, outputType = "jpg", validation }
) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const maxFileSizeRule = validation?.find((rule) => "maxSizeInKb" in rule);

	const lengthRule = validation?.find((rule) => "length" in rule);
	const maxRule = validation?.find((rule) => "max" in rule);
	let maxFilesRule: { maxFiles: number; errorMessage?: string } = undefined;
	if (lengthRule) {
		maxFilesRule = { maxFiles: lengthRule.length, errorMessage: lengthRule.errorMessage };
	} else if (maxRule) {
		maxFilesRule = { maxFiles: maxRule.max, errorMessage: maxRule.errorMessage };
	}

	return {
		[id]: {
			yupSchema: Yup.array()
				.of(
					Yup.object().shape({
						fileName: Yup.string(),
						dataURL: Yup.string(),
					})
				)
				.test(
					"is-empty-array",
					isRequiredRule?.errorMessage || ERROR_MESSAGES.UPLOAD("photo").REQUIRED,
					(value) => {
						if (!value || !isRequiredRule?.required) return true;

						return value.length > 0;
					}
				)
				.test(
					"max-size-in-kb",
					maxFileSizeRule?.errorMessage ||
						ERROR_MESSAGES.UPLOAD("photo").MAX_FILE_SIZE(maxFileSizeRule?.["maxSizeInKb"]),
					(value) => {
						if (!value || !Array.isArray(value) || !maxFileSizeRule?.["maxSizeInKb"]) return true;
						return value.every(
							(file) =>
								FileHelper.getFilesizeFromBase64(file.dataURL) <=
								maxFileSizeRule?.["maxSizeInKb"] * 1024
						);
					}
				)
				.test(
					"max-files",
					maxFilesRule?.errorMessage || ERROR_MESSAGES.UPLOAD("photo").MAX_FILES(maxFilesRule?.maxFiles),
					(value) => {
						if (!value || !Array.isArray(value) || !maxFilesRule?.maxFiles) return true;
						return value.length <= maxFilesRule?.maxFiles;
					}
				)
				.test("file-type", ERROR_MESSAGES.UPLOAD("photo").FILE_TYPE([outputType]), async (value) => {
					if (!value || !Array.isArray(value)) return true;
					let isValid = true;
					for (const file of value) {
						const base64 = file.dataURL.split(";base64,").pop();
						const fileType = await FileHelper.getTypeFromBase64(base64);
						const validFileType = fileType.ext === outputType;
						if (!validFileType) {
							isValid = false;
							break;
						}
					}
					return isValid;
				})
				.test(
					"dimensions",
					ERROR_MESSAGES.UPLOAD("photo").DIMENSIONS(dimensions?.width, dimensions?.height),
					(value) => {
						if (
							!value ||
							!Array.isArray(value) ||
							!compress ||
							!dimensions ||
							!dimensions.width ||
							!dimensions.height
						)
							return true;

						return value.every((file) => {
							const fileDimensions = ImageHelper.getDimensionsFromBase64(file.dataURL);
							return (
								fileDimensions?.width <= dimensions.width && fileDimensions?.height <= dimensions.height
							);
						});
					}
				),
			validation,
		},
	};
};
