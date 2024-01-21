import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("slider", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "slider",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: 1 })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	describe.each`
		condition               | rule                                                             | invalid | valid
		${"min"}                | ${[{ min: 5, errorMessage: ERROR_MESSAGE }]}                     | ${4}    | ${5}
		${"max"}                | ${[{ max: 5, errorMessage: ERROR_MESSAGE }]}                     | ${6}    | ${5}
		${"increment"}          | ${[{ increment: 2, errorMessage: ERROR_MESSAGE }]}               | ${1}    | ${10}
		${"increment from min"} | ${[{ min: 5 }, { increment: 0.5, errorMessage: ERROR_MESSAGE }]} | ${5.1}  | ${7.5}
	`("$condition validation", ({ rule, invalid, valid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "slider",
						somethingUnused: "test",
						validation: rule,
					},
				},
			},
		});

		it("should show error message for invalid value", () => {
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(ERROR_MESSAGE);
		});

		it("should not show error message for valid value", () => {
			expect(() => schema.validateSync({ field: valid })).not.toThrowError();
		});
	});
});
