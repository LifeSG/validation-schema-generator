import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("radio", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "radio",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ max: 5, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "Apple" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "Cherry" })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should throw an error if a value not defined in options is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "radio",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: "Durian" })).message).toBe(
			ERROR_MESSAGES.COMMON.INVALID_OPTION
		);
	});

	it("should support nested config in option", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "radio",
						options: [
							{
								label: "Other",
								value: "Other",
								children: {
									other: {
										uiType: "text-field",
										validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
									},
								},
							},
						],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: "Other", other: "extra" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "Other" })).message).toBe(ERROR_MESSAGE);
	});

	it("should support conditional validation for nested config in option", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field1: {
						uiType: "text-field",
					},
					field2: {
						uiType: "radio",
						showIf: [{ field1: [{ filled: true }] }],
						options: [
							{
								label: "Other",
								value: "Other",
								children: {
									other: {
										uiType: "text-field",
										validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
										showIf: [{ field2: [{ equals: "Other" }] }],
									},
								},
							},
						],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field1: undefined, field2: undefined })).not.toThrowError();
		expect(
			TestHelper.getError(() => schema.validateSync({ field1: "show", field2: undefined, other: "extra" }))
				.message
		).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("other"));
		expect(TestHelper.getError(() => schema.validateSync({ field1: "show", field2: "Other" })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it("should support conditional validation for nested radio in option", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field1: {
						uiType: "radio",
						options: [
							{
								label: "Apple",
								value: "Apple",
								children: {
									field2: {
										uiType: "radio",
										showIf: [{ field1: [{ equals: "Apple" }] }],
										validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
										options: [
											{
												label: "Zucchini",
												value: "Zucchini",
											},
										],
									},
								},
							},
						],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field1: undefined, field2: undefined })).not.toThrowError();
		expect(() => schema.validateSync({ field1: "Apple", field2: "Zucchini" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field1: "Apple", field2: undefined })).message).toBe(
			ERROR_MESSAGE
		);
	});
});
