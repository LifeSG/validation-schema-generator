import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("histogram-slider", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "histogram-slider",
						somethingUnused: "test",
						bins: [
							{ minValue: 1, count: 10 },
							{ minValue: 2, count: 20 },
							{ minValue: 9, count: 90 },
						],
						interval: 1,
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: { from: 1, to: 10 } })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: { from: undefined, to: 5 } })).message).toBe(
			ERROR_MESSAGE
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: { from: 5, to: undefined } })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it.each`
		validation                | invalid
		${"from is a bin value"}  | ${{ from: 1, to: 50 }}
		${"to is a bin value"}    | ${{ from: 10, to: 45 }}
		${"from is less than to"} | ${{ from: 50, to: 10 }}
		${"from is within range"} | ${{ from: 0, to: 50 }}
		${"to is within range"}   | ${{ from: 10, to: 110 }}
	`("should validate that $validation", ({ invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "histogram-slider",
						somethingUnused: "test",
						bins: [
							{ minValue: 10, count: 1 },
							{ minValue: 20, count: 0 },
							{ minValue: 30, count: 3 },
							{ minValue: 90, count: 3 },
						],
						interval: 10,
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(
			ERROR_MESSAGES.SLIDER.MUST_BE_INCREMENTAL
		);
	});
});
