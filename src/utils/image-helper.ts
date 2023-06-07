import sizeOf from "image-size";

export namespace ImageHelper {
	export const getDimensionsFromBase64 = (base64: string) => {
		const image = Buffer.from(base64.split(";base64,").pop(), "base64");
		return sizeOf(image);
	};
}
