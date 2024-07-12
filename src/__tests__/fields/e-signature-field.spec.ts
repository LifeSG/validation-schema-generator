import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("e-signature-field", () => {
	it("should be able to generate a validation schema", async () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "e-signature-field",
						somethingUnused: "test",
						upload: { type: "base64" },
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(
			async () =>
				await schema.validate({
					field: { fileId: "fileId", dataURL: "dataURL" },
				})
		).not.toThrow();
		expect((await TestHelper.getAsyncError(() => schema.validate({}))).message).toBe(ERROR_MESSAGE);
	});

	describe("submitted values", () => {
		it("should reject for base64 uploads if submitted value does not contain dataURL", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "e-signature-field",
							somethingUnused: "test",
							upload: { type: "base64" },
						},
					},
				},
			});
			expect(
				async () => await schema.validate({ field: { fileId: "fileId", dataURL: "dataURL" } })
			).not.toThrow();
			expect(
				(await TestHelper.getAsyncError(() => schema.validate({ field: { fileId: "fileId" } }))).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});

		it("should reject for multipart uploads if submitted value does not contain fileUrl", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "e-signature-field",
							somethingUnused: "test",
							upload: { type: "multipart" },
						},
					},
				},
			});
			expect(
				async () => await schema.validate({ field: { fileId: "fileId", fileUrl: "fileUrl" } })
			).not.toThrow();
			expect(
				(await TestHelper.getAsyncError(() => schema.validate({ field: { fileId: "fileId" } }))).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});

		it("should reject for multipart uploads if submitted value contains dataURL", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "e-signature-field",
							somethingUnused: "test",
							upload: { type: "multipart" },
						},
					},
				},
			});

			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: { fileId: "fileId", fileUrl: "fileUrl", dataURL: "dataURL" },
						})
					)
				).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});

		it("should reject for non-uploads if submitted value does not contain dataURL", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "e-signature-field",
							somethingUnused: "test",
						},
					},
				},
			});
			expect(
				async () => await schema.validate({ field: { fileId: "fileId", dataURL: "dataURL" } })
			).not.toThrow();
			expect(
				(await TestHelper.getAsyncError(() => schema.validate({ field: { fileId: "fileId" } }))).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});
	});
});
