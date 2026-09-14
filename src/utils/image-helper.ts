import { DEFAULT_MAX_BASE64_LENGTH } from "../shared/constants";

interface IImageDimensions {
	width: number;
	height: number;
}

// reference: https://github.com/sindresorhus/is-png/blob/main/index.js
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPng = (buffer: Buffer): boolean =>
	buffer.length >= 8 && PNG_SIGNATURE.every((byte, index) => buffer[index] === byte);

// dimension parsing ported from https://github.com/image-size/image-size/blob/main/lib/types/png.ts
const PNG_FRIED_CHUNK_NAME = "CgBI";
const getPngDimensions = (buffer: Buffer): IImageDimensions | undefined => {
	if (buffer.length < 24) return undefined;
	// bytes 12-16 hold the chunk name right after the signature; compare it to detect a fried PNG
	const isFried = buffer.toString("ascii", 12, 16) === PNG_FRIED_CHUNK_NAME;
	const offset = isFried ? 32 : 16;
	if (buffer.length < offset + 8) return undefined;
	// IHDR chunk stores width then height as two big-endian 4-byte integers
	return { width: buffer.readUInt32BE(offset), height: buffer.readUInt32BE(offset + 4) };
};

const isJpg = (buffer: Buffer): boolean =>
	buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

// reference: https://github.com/sindresorhus/is-jpg/blob/main/index.js
// only baseline (0xC0), baseline optimized (0xC1) and progressive (0xC2) SOF markers carry frame dimensions
// original logic deliberately skips other SOF variants (https://github.com/image-size/image-size/blob/main/lib/types/jpg.ts)
const JPG_SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2]);

// dimension parsing ported from https://github.com/image-size/image-size/blob/main/lib/types/jpg.ts
const getJpgDimensions = (buffer: Buffer): IImageDimensions | undefined => {
	let offset = 2;
	while (offset + 9 <= buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset++;
			continue;
		}
		const marker = buffer[offset + 1];
		if (JPG_SOF_MARKERS.has(marker)) {
			return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
		}
		const segmentLength = buffer.readUInt16BE(offset + 2);
		// guard against zero/undersized segment lengths so the offset always advances
		if (segmentLength < 2) break;
		offset += 2 + segmentLength;
	}
	return undefined;
};

export namespace ImageHelper {
	/**
	 * @param maxSizeInKb optional cap on the decoded file size, derived from the field's maxSizeInKb validation rule; defaults to ~100MB
	 */
	export const getDimensionsFromBase64 = (base64: string, maxSizeInKb?: number): IImageDimensions | undefined => {
		// base64 encoding inflates size by ~4/3, so convert the decoded-byte cap to a base64 character cap
		const maxBase64Length = maxSizeInKb > 0 ? Math.ceil(((maxSizeInKb * 1024) / 3) * 4) : DEFAULT_MAX_BASE64_LENGTH;
		const payload = base64?.split(";base64,").pop();
		if (!payload || payload.length > maxBase64Length) return undefined;
		const buffer = Buffer.from(payload, "base64");
		if (isPng(buffer)) return getPngDimensions(buffer);
		if (isJpg(buffer)) return getJpgDimensions(buffer);
		return undefined;
	};
}
