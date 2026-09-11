interface IImageDimensions {
	width: number;
	height: number;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const isPng = (buffer: Buffer): boolean =>
	buffer.length >= 24 && PNG_SIGNATURE.every((byte, index) => buffer[index] === byte);

// IHDR chunk (width/height) always starts right after the 8-byte signature + 8-byte chunk header
const getPngDimensions = (buffer: Buffer): IImageDimensions => ({
	width: buffer.readUInt32BE(16),
	height: buffer.readUInt32BE(20),
});

const isJpg = (buffer: Buffer): boolean => buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8;

// SOFn markers that carry frame dimensions, excluding DHT (0xC4), JPG ext (0xC8) and DAC (0xCC)
const JPG_SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

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
	export const getDimensionsFromBase64 = (base64: string): IImageDimensions | undefined => {
		const buffer = Buffer.from(base64.split(";base64,").pop(), "base64");
		if (isPng(buffer)) return getPngDimensions(buffer);
		if (isJpg(buffer)) return getJpgDimensions(buffer);
		return undefined;
	};
}
