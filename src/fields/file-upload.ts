import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { FileHelper } from "../utils";
import { IFieldGenerator } from "./types";

type TUploadType = "base64" | "multipart";
interface IFileUploadValidationRule extends IValidationRule {
	/** accepted file types */
	fileType?: string[] | undefined;
	/** max acceptable file size in kb */
	maxSizeInKb?: number | undefined;
}

export interface IFileUploadSchema<V = undefined>
	extends IFieldSchemaBase<"file-upload", V, IFileUploadValidationRule> {
	uploadOnAddingFile: { type: TUploadType; [otherOptions: string]: unknown };
}

export const fileUpload: IFieldGenerator<IFileUploadSchema> = (id, { uploadOnAddingFile, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const fileTypeRule: IFileUploadValidationRule = validation?.find((rule) => "fileType" in rule);
	const maxFileSizeRule: IFileUploadValidationRule = validation?.find((rule) => "maxSizeInKb" in rule);
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
						dataURL: Yup.string(),
						fileId: Yup.string(),
						fileName: Yup.string(),
						fileUrl: Yup.string().url(),
						uploadResponse: Yup.object(),
					})
				)
				.test("is-empty-array", isRequiredRule?.errorMessage || ERROR_MESSAGES.UPLOAD().REQUIRED, (value) => {
					if (!value || !isRequiredRule?.required) return true;
					return value.length > 0;
				})
				.test(
					"max-size-in-kb",
					maxFileSizeRule?.errorMessage ||
						ERROR_MESSAGES.UPLOAD().MAX_FILE_SIZE(maxFileSizeRule?.maxSizeInKb),
					(value) => {
						if (!value || !Array.isArray(value) || !maxFileSizeRule?.maxSizeInKb) return true;
						return value.every((file) => {
							if (uploadOnAddingFile.type === "base64") {
								return (
									FileHelper.getFilesizeFromBase64(file.dataURL) <= maxFileSizeRule.maxSizeInKb * 1024
								);
							}
							// NOTE: filesize check for multipart upload should be done in upload api
							return true;
						});
					}
				)
				.test(
					"max-files",
					maxFilesRule?.errorMessage || ERROR_MESSAGES.UPLOAD().MAX_FILES(maxFilesRule?.maxFiles),
					(value) => {
						if (!value || !Array.isArray(value) || !maxFilesRule?.maxFiles) return true;
						return value.length <= maxFilesRule.maxFiles;
					}
				)
				.test(
					"file-type",
					fileTypeRule?.errorMessage || ERROR_MESSAGES.UPLOAD().FILE_TYPE(fileTypeRule?.fileType || [""]),
					async (value) => {
						if (!value || !Array.isArray(value) || !fileTypeRule?.fileType) return true;
						let isValid = true;
						const fileMimeTypes = fileTypeRule.fileType.map((fileType) =>
							FileHelper.fileExtensionToMimeType(fileType)
						);
						for (const file of value) {
							const base64 = file.dataURL.split(";base64,").pop();
							const buffer = Buffer.from(base64, "base64");
							const mimeType = await FileHelper.getMimeType(buffer);
							if (!fileMimeTypes?.includes(mimeType)) {
								isValid = false;
								break;
							}
						}
						return isValid;
					}
				)
				.test("submitted-values", ERROR_MESSAGES.UPLOAD().INVALID, async (value) => {
					if (!value || !Array.isArray(value)) return true;
					let isValid = true;

					if (uploadOnAddingFile.type === "base64") {
						for (const file of value) {
							if (!file.dataURL) {
								isValid = false;
								break;
							}
						}
					} else if (uploadOnAddingFile.type === "multipart") {
						for (const file of value) {
							if (!file.fileUrl) {
								isValid = false;
								break;
							}
						}
					}
					return isValid;
				}),
			validation,
		},
	};
};
