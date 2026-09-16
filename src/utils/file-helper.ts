import getFileInfo from "magic-bytes.js";
import { DEFAULT_MAX_BASE64_LENGTH } from "../shared/constants";

export namespace FileHelper {
	/**
	 * estimate filesize from base64 string
	 * https://stackoverflow.com/questions/53228948/how-to-get-image-file-size-from-base-64-string-in-javascript#answer-53229045
	 */
	export const getFilesizeFromBase64 = (base64: string): number => {
		const length = base64.length;
		const padding = base64.substring(length - 2, 2).match(/=/g)?.length || 0;
		return length * 0.75 - padding;
	};

	/**
	 * convert array of file extensions to a proper sentence
	 * convert to uppercase
	 * joins array with comma
	 * add `or` before last extension
	 */
	export const extensionsToSentence = (list: string[], options?: { setBothJpegAndJpgIfEitherExists?: boolean }) => {
		let formattedList = list.map((extension) => `.${extension.toUpperCase()}`);

		if (options?.setBothJpegAndJpgIfEitherExists) {
			formattedList = setBothJpegAndJpgIfEitherExists(formattedList);
		}

		return new Intl.ListFormat("en-GB", { style: "long", type: "disjunction" }).format(new Set(formattedList));
	};

	// ensures both .JPG and .JPEG are included if at least either one is included
	const setBothJpegAndJpgIfEitherExists = (list: string[]) => {
		const newList = [...list];

		const hasJpg = list.includes(".JPG");
		const hasJpeg = list.includes(".JPEG");

		// Return unchanged if both are present or neither is present
		if ((hasJpg && hasJpeg) || (!hasJpg && !hasJpeg)) {
			return newList;
		}

		const { index, toAdd } =
			newList.indexOf(".JPG") > -1
				? { index: newList.indexOf(".JPG"), toAdd: ".JPEG" }
				: { index: newList.indexOf(".JPEG"), toAdd: ".JPG" };

		newList.splice(index + 1, 0, toAdd);

		return newList;
	};

	/**
	 * reliably derive file type by checking magic number of the buffer
	 * @param maxSizeInKb optional cap on the decoded file size, derived from the field's maxSizeInKb validation rule; defaults to ~100MB
	 */
	export const getTypeFromBase64 = async (base64: string, maxSizeInKb?: number) => {
		// base64 encoding inflates size by ~4/3, so convert the decoded-byte cap to a base64 character cap
		const maxBase64Length = maxSizeInKb > 0 ? Math.ceil(((maxSizeInKb * 1024) / 3) * 4) : DEFAULT_MAX_BASE64_LENGTH;
		if (!base64 || base64.length > maxBase64Length) {
			return { mime: undefined, ext: undefined };
		}
		let binaryString: string;
		try {
			binaryString = atob(base64);
		} catch (error) {
			return { mime: undefined, ext: undefined };
		}
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		const [fileInfo] = getFileInfo(bytes);
		return {
			mime: fileInfo?.mime,
			ext: fileInfo?.extension === "jpeg" ? "jpg" : fileInfo?.extension,
		};
	};
}
