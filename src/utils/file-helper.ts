import getFileInfo from "magic-bytes.js";

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
	export const extensionsToSentence = (list: string[]) => {
		const formattedList = list.map((extension) => `.${extension.toUpperCase()}`);
		return new Intl.ListFormat("en-GB", { style: "long", type: "disjunction" }).format(new Set(formattedList));
	};

	/**
	 * reliably derive file type by checking magic number of the buffer
	 */
	export const getTypeFromBase64 = async (base64: string) => {
		const binaryString = atob(base64);
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
