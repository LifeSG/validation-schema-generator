import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("error-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					error: {
						uiType: "error-field",
						somethingUnused: "test",
						validation: [{ error: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should cause form to be invalid if shown", async () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					error: {
						uiType: "error-field",
						somethingUnused: "test",
						showIf: [{ field: [{ equals: "error" }] }],
					},
					field: {
						uiType: "text-field",
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: "hello" })).not.toThrow();
		expect(() => schema.validateSync({ field: "error" })).toThrow();
	});
});
