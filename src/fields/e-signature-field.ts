import isEmpty from "lodash/isEmpty";
import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

type TUploadType = "base64" | "multipart";
export interface IESignatureFieldSchema<V = undefined> extends IFieldSchemaBase<"e-signature-field", V> {
	upload?: { type: TUploadType; [otherOptions: string]: unknown } | undefined;
}

export const eSignatureField: IFieldGenerator<IESignatureFieldSchema> = (id, { upload, validation }) => {
	return {
		[id]: {
			yupSchema: Yup.object({
				fileId: Yup.string().required(ERROR_MESSAGES.UPLOAD().INVALID),
				dataURL: Yup.string(),
				fileUrl: Yup.string(),
				uploadResponse: Yup.mixed().nullable(),
			})
				.default(undefined)
				.test("upload-type", ERROR_MESSAGES.UPLOAD().INVALID, (value) => {
					if (!value) return true;
					if (upload?.type === "base64" && !value.dataURL) {
						return false;
					} else if (upload?.type === "multipart" && (!!value.dataURL || !value.fileUrl)) {
						return false;
					} else if (isEmpty(upload) && !value.dataURL) {
						return false;
					}
					return true;
				}),
			validation,
		},
	};
};
