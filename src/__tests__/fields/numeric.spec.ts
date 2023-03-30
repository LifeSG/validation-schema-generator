import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("numeric", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			field: {
				uiType: "numeric",
				somethingUnused: "test",
				validation: [
					{ required: true, errorMessage: ERROR_MESSAGE },
					{ min: 3, errorMessage: ERROR_MESSAGE_2 },
				],
			},
		});
		expect(() => schema.validateSync({ field: 5 })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: 1 })).message).toBe(ERROR_MESSAGE_2);
	});
});
