import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("chips", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ min: 2, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: ["Apple", "Berry"] })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: ["Apple"] })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should throw an error if an empty array is submitted on a required field", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: [] })).message).toBe(ERROR_MESSAGE);
	});

	it("should throw an error if a value not defined in options is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
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

		expect(TestHelper.getError(() => schema.validateSync({ field: ["Apple", "Durian"] })).message).toBe(
			ERROR_MESSAGES.COMMON.INVALID_OPTION
		);
	});

	it("should use default error message if error message is not specified for required rule", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
						validation: [{ required: true }],
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: [] })).message).toBe(
			ERROR_MESSAGES.COMMON.REQUIRED_OPTION
		);
	});

	it("should accept if value includes textarea", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						textarea: {
							label: "More info",
						},
						somethingUnused: "test",
					},
				},
			},
		});

		expect(() =>
			schema.validateSync({ field: ["Apple", "More info"], "field-textarea": "hello" })
		).not.toThrowError();
	});

	it("should support textarea validation config", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						somethingUnused: "test",
						textarea: {
							label: "more info",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE },
								{ min: 10, errorMessage: ERROR_MESSAGE_2 },
							],
						},
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: ["more info"] })).message).toBe(ERROR_MESSAGE);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: ["more info"], "field-textarea": "hello" })).message
		).toBe(ERROR_MESSAGE_2);
	});

	it("should support conditional validation in textarea", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field1: {
						uiType: "chips",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
						],
						textarea: {
							label: "more info",
							validation: [
								{
									when: {
										field2: {
											is: [{ filled: true }],
											then: [{ min: 10, errorMessage: ERROR_MESSAGE }],
										},
									},
								},
							],
						},
					},
					field2: {
						uiType: "text-field",
					},
				},
			},
		});

		expect(() =>
			schema.validateSync(
				{
					field1: ["more info"],
					"field1-textarea": "hello world",
					field2: "lorem",
				},
				{ abortEarly: false }
			)
		).not.toThrow();
		expect(
			TestHelper.getError(() =>
				schema.validateSync(
					{
						field1: ["more info"],
						"field1-textarea": "hello",
						field2: "lorem",
					},
					{ abortEarly: false }
				)
			).message
		).toBe(ERROR_MESSAGE);
	});
});
