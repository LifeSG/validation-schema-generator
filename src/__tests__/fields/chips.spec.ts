import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("chips", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "chips",
				somethingUnused: "test",
				validation: [
					{ required: true, errorMessage: ERROR_MESSAGE },
					{ min: 2, errorMessage: ERROR_MESSAGE_2 },
				],
			},
		});

		expect(() => schema.validateSync({ field: ["hello", "world"] })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: ["hello"] })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should throw an error if an empty array is submitted on a required field", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "chips",
				somethingUnused: "test",
				validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: [] })).message).toBe(ERROR_MESSAGE);
	});

	it("should use default error message if error message is not specified for required rule", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "checkbox",
				somethingUnused: "test",
				validation: [{ required: true }],
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: [] })).message).toBe(
			ERROR_MESSAGES.COMMON.REQUIRED_OPTION
		);
	});

	it("should support textarea validation config", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "chips",
				somethingUnused: "test",
				textarea: {
					label: "textarea",
					validation: [
						{ required: true, errorMessage: ERROR_MESSAGE },
						{ min: 10, errorMessage: ERROR_MESSAGE_2 },
					],
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: ["textarea"] })).message).toBe(ERROR_MESSAGE);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: ["textarea"], "chips-textarea": "hello" })).message
		).toBe(ERROR_MESSAGE_2);
	});
});
