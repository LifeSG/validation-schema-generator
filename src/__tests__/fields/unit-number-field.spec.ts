import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("unit-number-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "unit-number-field",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "01-19" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should use default error message if error message is not specified", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "unit-number-field",
						somethingUnused: "test",
					},
				},
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: "01-" })).message).toBe(
			ERROR_MESSAGES.UNIT_NUMBER.INVALID
		);
	});

	it("should use custom error message if custom error message is specified", () => {
		const customError = "Please enter a valid unit number.";
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "unit-number-field",
						somethingUnused: "test",
						validation: [{ unitNumberFormat: true, errorMessage: customError }],
					},
				},
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: "01-" })).message).toBe(customError);
	});
});
