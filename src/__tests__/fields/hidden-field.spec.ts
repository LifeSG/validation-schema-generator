import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("hidden-field", () => {
	it("should be able to generate a validation schema", () => {
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
		expect(() => schema.validateSync({ field: "hello" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello world" })).message).toBe(ERROR_MESSAGE_2);
	});
});
