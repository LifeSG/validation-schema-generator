import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2, ERROR_MESSAGE_3 } from "../common";

describe("array-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						referenceKey: "array-field",
						somethingUnused: "test",
						fieldSchema: {
							text: {
								uiType: "text-field",
							},
						},
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ min: 2, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: [{ text: "hello" }, { text: "world" }] })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: [{}] })).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: [{ text: "hello" }] })).message).toBe(
			ERROR_MESSAGE_2
		);
	});

	it("should be able to validate each item", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						referenceKey: "array-field",
						somethingUnused: "test",
						fieldSchema: {
							required: {
								uiType: "text-field",
								validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
							},
							optional: {
								uiType: "text-field",
							},
						},
					},
				},
			},
		});

		expect(() =>
			schema.validateSync({ field: [{ required: "hello", optional: "world" }, { required: "hello" }] })
		).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: [{ optional: "world" }] })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it("should be able to support nested array-field schemas", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						referenceKey: "array-field",
						somethingUnused: "test",
						fieldSchema: {
							nested: {
								referenceKey: "array-field",
								fieldSchema: {
									input: {
										uiType: "text-field",
										validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
									},
								},
							},
						},
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: [{ nested: [{ input: "hello" }] }] })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: [{ nested: [{ input: "" }] }] })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it("should validate each array item independently with async validation", async () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					items: {
						referenceKey: "array-field",
						fieldSchema: {
							type: {
								uiType: "select",
								options: [
									{ label: "Type A", value: "A" },
									{ label: "Type B", value: "B" },
									{ label: "Other", value: "other" },
								],
							},
							description: {
								uiType: "text-field",
								label: "Description",
								showIf: [
									{
										type: [{ filled: true }, { equals: "other" }],
									},
								],
								validation: [{ required: true, errorMessage: ERROR_MESSAGE_3 }],
							},
						},
					},
				},
			},
		});

		await expect(
			schema.validate({ items: [{ type: "other", description: "Custom type" }] })
		).resolves.toBeDefined();
		await expect(schema.validate({ items: [{ type: "A" }] })).resolves.toBeDefined();
		await expect(schema.validate({ items: [{ type: "other" }] })).rejects.toThrow(ERROR_MESSAGE_3);
		await expect(
			schema.validate({ items: [{ type: "other", description: "Custom type" }, { type: "A" }] })
		).resolves.toBeDefined();
		await expect(
			schema.validate({ items: [{ type: "other", description: "Custom type" }, { type: "other" }] })
		).rejects.toThrow(ERROR_MESSAGE_3);
		await expect(
			schema.validate({ items: [{ type: "other", description: "Custom type" }, { type: "A" }] })
		).resolves.toBeDefined();
	});
});
