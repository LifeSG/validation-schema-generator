import { FileHelper } from "../../utils";
import { DEFAULT_MAX_BASE64_LENGTH } from "../../shared/constants";

// minimal JPEG header magic-bytes.js needs to identify the file type
const JPG_HEADER_BASE64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]).toString("base64");

describe("file-helper", () => {
	describe("extensionsToSentence", () => {
		describe("setBothJpegAndJpgIfEitherExists", () => {
			it.each`
				extensions                | expected
				${["jpg"]}                | ${".JPG or .JPEG"}
				${["jpeg"]}               | ${".JPEG or .JPG"}
				${["jpg", "jpeg"]}        | ${".JPG or .JPEG"}
				${["jpg", "png"]}         | ${".JPG, .JPEG or .PNG"}
				${["jpeg", "png"]}        | ${".JPEG, .JPG or .PNG"}
				${["png", "jpg"]}         | ${".PNG, .JPG or .JPEG"}
				${["png", "jpeg"]}        | ${".PNG, .JPEG or .JPG"}
				${["png"]}                | ${".PNG"}
				${["pdf", "png"]}         | ${".PDF or .PNG"}
				${["jpg", "jpeg", "png"]} | ${".JPG, .JPEG or .PNG"}
			`("should format $extensions as '$expected'", ({ extensions, expected }) => {
				const result = FileHelper.extensionsToSentence(extensions, { setBothJpegAndJpgIfEitherExists: true });
				expect(result).toBe(expected);
			});

			it("should not duplicate extensions if both jpg and jpeg are already present", () => {
				const result = FileHelper.extensionsToSentence(["jpg", "jpeg"], {
					setBothJpegAndJpgIfEitherExists: true,
				});
				expect(result).toBe(".JPG or .JPEG");
			});

			it("should add jpeg after jpg when only jpg is present", () => {
				const result = FileHelper.extensionsToSentence(["jpg"], { setBothJpegAndJpgIfEitherExists: true });
				expect(result).toBe(".JPG or .JPEG");
			});

			it("should add jpg after jpeg when only jpeg is present", () => {
				const result = FileHelper.extensionsToSentence(["jpeg"], { setBothJpegAndJpgIfEitherExists: true });
				expect(result).toBe(".JPEG or .JPG");
			});

			it("should preserve order and add jpeg after jpg in a list", () => {
				const result = FileHelper.extensionsToSentence(["png", "jpg", "pdf"], {
					setBothJpegAndJpgIfEitherExists: true,
				});
				expect(result).toBe(".PNG, .JPG, .JPEG or .PDF");
			});

			it("should preserve order and add jpg after jpeg in a list", () => {
				const result = FileHelper.extensionsToSentence(["png", "jpeg", "pdf"], {
					setBothJpegAndJpgIfEitherExists: true,
				});
				expect(result).toBe(".PNG, .JPEG, .JPG or .PDF");
			});

			it("should not modify list when neither jpg nor jpeg is present", () => {
				const result = FileHelper.extensionsToSentence(["png", "pdf"], {
					setBothJpegAndJpgIfEitherExists: true,
				});
				expect(result).toBe(".PNG or .PDF");
			});
		});

		describe("without setBothJpegAndJpgIfEitherExists option", () => {
			it.each`
				extensions         | expected
				${["jpg"]}         | ${".JPG"}
				${["jpeg"]}        | ${".JPEG"}
				${["jpg", "jpeg"]} | ${".JPG or .JPEG"}
				${["jpg", "png"]}  | ${".JPG or .PNG"}
				${["png", "pdf"]}  | ${".PNG or .PDF"}
			`("should format $extensions as '$expected'", ({ extensions, expected }) => {
				const result = FileHelper.extensionsToSentence(extensions);
				expect(result).toBe(expected);
			});
		});
	});

	describe("getTypeFromBase64", () => {
		it("should derive file type from the buffer's magic bytes", async () => {
			const result = await FileHelper.getTypeFromBase64(JPG_HEADER_BASE64);
			expect(result.ext).toBe("jpg");
		});

		it("should return an unknown type instead of throwing for malformed base64", async () => {
			const result = await FileHelper.getTypeFromBase64("not-valid-base64!!!");
			expect(result).toEqual({ mime: undefined, ext: undefined });
		});

		it("should return an unknown type instead of throwing for an empty base64 string", async () => {
			const result = await FileHelper.getTypeFromBase64("");
			expect(result).toEqual({ mime: undefined, ext: undefined });
		});

		it("should return an unknown type when base64 length exceeds the default max length", async () => {
			const oversizedBase64 = "a".repeat(DEFAULT_MAX_BASE64_LENGTH + 1);
			const result = await FileHelper.getTypeFromBase64(oversizedBase64);
			expect(result).toEqual({ mime: undefined, ext: undefined });
		});

		it("should return an unknown type when base64 length exceeds the provided maxSizeInKb cap", async () => {
			// cap of ~0 bytes rejects any non-empty payload
			const result = await FileHelper.getTypeFromBase64(JPG_HEADER_BASE64, 0.0001);
			expect(result).toEqual({ mime: undefined, ext: undefined });
		});

		it("should still derive file type when within the provided maxSizeInKb cap", async () => {
			const result = await FileHelper.getTypeFromBase64(JPG_HEADER_BASE64, 1);
			expect(result.ext).toBe("jpg");
		});
	});
});
