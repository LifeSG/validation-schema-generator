import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("hidden-field", () => {
	it("should be able to generate a string validation schema by default", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "hidden-field",
						somethingUnused: "test",
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ max: 5, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "hello" })).not.toThrow();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello world" })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should be able to generate a number validation schema if valueType is number", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "hidden-field",
						somethingUnused: "test",
						valueType: "number",
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ max: 5, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: 1 })).not.toThrow();
		expect(() => schema.validateSync({ field: "hello" })).toThrow();
		expect(TestHelper.getError(() => schema.validateSync({ field: 6 })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should be able to generate a number validation schema if valueType is boolean", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "hidden-field",
						somethingUnused: "test",
						valueType: "boolean",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: true })).not.toThrow();
		expect(() => schema.validateSync({ field: "hello" })).toThrow();
	});
});
