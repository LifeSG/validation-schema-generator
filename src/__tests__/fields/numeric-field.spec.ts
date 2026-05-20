import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("numeric-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "numeric-field",
						somethingUnused: "test",
						validation: [
							{ required: true, errorMessage: ERROR_MESSAGE },
							{ min: 3, errorMessage: ERROR_MESSAGE_2 },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: 5 })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: 1 })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should validate decimal places", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "numeric-field",
						validation: [{ decimals: 2, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: 1.23 })).not.toThrowError();
		expect(() => schema.validateSync({ field: 1 })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: 1.234 })).message).toBe(ERROR_MESSAGE);
	});

	it("should use default error message for decimals validation if none is provided", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "numeric-field",
						validation: [{ decimals: 2 }],
					},
				},
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: 1.234 })).message).toBe(
			ERROR_MESSAGES.NUMERIC.INVALID_DECIMALS(2)
		);
	});
});
