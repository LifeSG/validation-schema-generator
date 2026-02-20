import { FileHelper } from "../../utils";

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
});
