import { ImageHelper, PNG_SIGNATURE } from "../../utils";

// builds a minimal PNG buffer with width/height at the byte offsets the parser reads
const buildPngBuffer = ({
	width,
	height,
	fried = false,
}: {
	width: number;
	height: number;
	fried?: boolean;
}): Buffer => {
	const buffer = Buffer.alloc(fried ? 40 : 24);
	Buffer.from(PNG_SIGNATURE).copy(buffer, 0);
	if (fried) {
		buffer.write("CgBI", 12, "ascii");
		buffer.writeUInt32BE(width, 32);
		buffer.writeUInt32BE(height, 36);
	} else {
		buffer.writeUInt32BE(width, 16);
		buffer.writeUInt32BE(height, 20);
	}
	return buffer;
};

// builds a minimal JPG buffer: SOI + APP0 (to be skipped) + SOFn segment carrying width/height
const buildJpgBuffer = ({
	width,
	height,
	sofMarker = 0xc0,
}: {
	width: number;
	height: number;
	sofMarker?: number;
}): Buffer => {
	const soi = Buffer.from([0xff, 0xd8]);
	const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0x00)]);
	const sof = Buffer.alloc(9);
	sof.set([0xff, sofMarker], 0);
	sof.writeUInt16BE(11, 2); // segment length
	sof.writeUInt8(0x08, 4); // precision
	sof.writeUInt16BE(height, 5);
	sof.writeUInt16BE(width, 7);
	return Buffer.concat([soi, app0, sof]);
};

const toBase64DataUrl = (mimeType: string, buffer: Buffer): string =>
	`data:${mimeType};base64,${buffer.toString("base64")}`;

describe("image-helper", () => {
	describe("getDimensionsFromBase64", () => {
		describe("png", () => {
			it("should extract width and height from a standard PNG", () => {
				const dataUrl = toBase64DataUrl("image/png", buildPngBuffer({ width: 100, height: 50 }));

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toEqual({ width: 100, height: 50 });
			});

			it("should extract width and height from a fried PNG (CgBI chunk)", () => {
				const dataUrl = toBase64DataUrl("image/png", buildPngBuffer({ width: 100, height: 50, fried: true }));

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toEqual({ width: 100, height: 50 });
			});

			it("should return undefined if the buffer is too short to contain an IHDR chunk", () => {
				const truncated = buildPngBuffer({ width: 100, height: 50 }).subarray(0, 20);
				const dataUrl = toBase64DataUrl("image/png", truncated);

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toBeUndefined();
			});

			it("should return undefined if a fried PNG buffer is too short to reach the shifted IHDR chunk", () => {
				const truncated = buildPngBuffer({ width: 100, height: 50, fried: true }).subarray(0, 24);
				const dataUrl = toBase64DataUrl("image/png", truncated);

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toBeUndefined();
			});
		});

		describe("jpg", () => {
			it("should extract width and height from a baseline JPG (SOF0)", () => {
				const dataUrl = toBase64DataUrl("image/jpeg", buildJpgBuffer({ width: 200, height: 150 }));

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toEqual({ width: 200, height: 150 });
			});

			it("should extract width and height from a progressive JPG (SOF2)", () => {
				const dataUrl = toBase64DataUrl(
					"image/jpeg",
					buildJpgBuffer({ width: 200, height: 150, sofMarker: 0xc2 })
				);

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toEqual({ width: 200, height: 150 });
			});

			it("should return undefined if no supported SOF marker is found", () => {
				const buffer = buildJpgBuffer({ width: 200, height: 150, sofMarker: 0xc4 }); // DHT, not a SOF marker
				const dataUrl = toBase64DataUrl("image/jpeg", buffer);

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toBeUndefined();
			});

			it("should return undefined if a segment reports a zero/undersized length", () => {
				const soi = Buffer.from([0xff, 0xd8]);
				const corruptSegment = Buffer.from([0xff, 0xe0, 0x00, 0x00]); // length < 2
				const dataUrl = toBase64DataUrl("image/jpeg", Buffer.concat([soi, corruptSegment]));

				expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toBeUndefined();
			});
		});

		it("should return undefined for an unrecognized file signature", () => {
			const dataUrl = toBase64DataUrl("application/pdf", Buffer.from("%PDF-1.4"));

			expect(ImageHelper.getDimensionsFromBase64(dataUrl)).toBeUndefined();
		});

		it("should support a raw base64 string without the data URI prefix", () => {
			const base64 = buildPngBuffer({ width: 32, height: 16 }).toString("base64");

			expect(ImageHelper.getDimensionsFromBase64(base64)).toEqual({ width: 32, height: 16 });
		});

		it("should return undefined when the payload exceeds the provided maxSizeInKb cap", () => {
			const dataUrl = toBase64DataUrl("image/png", buildPngBuffer({ width: 100, height: 50 }));

			// cap of ~0 bytes rejects any non-empty payload
			expect(ImageHelper.getDimensionsFromBase64(dataUrl, 0.0001)).toBeUndefined();
		});

		it("should still parse dimensions when within the provided maxSizeInKb cap", () => {
			const dataUrl = toBase64DataUrl("image/png", buildPngBuffer({ width: 100, height: 50 }));

			expect(ImageHelper.getDimensionsFromBase64(dataUrl, 1)).toEqual({ width: 100, height: 50 });
		});
	});
});
