import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("email", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			field: {
				uiType: "email",
				somethingUnused: "test",
				validation: [
					{ required: true, errorMessage: ERROR_MESSAGE },
					{ email: true, errorMessage: ERROR_MESSAGE_2 },
				],
			},
		});
		expect(() => schema.validateSync({ field: "john@doe.com" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello world" })).message).toBe(ERROR_MESSAGE_2);
	});

	it("should use default email error message if error message is not specified", () => {
		const schema = jsonToSchema({
			field: {
				uiType: "email",
				somethingUnused: "test",
				validation: [{ email: true }],
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello world" })).message).toBe(
			ERROR_MESSAGES.EMAIL.INVALID
		);
	});
});
