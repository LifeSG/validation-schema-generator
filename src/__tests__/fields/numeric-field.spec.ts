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

	describe("decimals with exponent notation", () => {
		const build = (decimals: number) =>
			jsonToSchema({
				section: {
					uiType: "section",
					children: { field: { uiType: "numeric-field", validation: [{ decimals }] } },
				},
			});

		it.each`
			value     | decimals | valid
			${1e-7}   | ${0}     | ${false}
			${1e-7}   | ${2}     | ${false}
			${1.5e-7} | ${2}     | ${false}
			${1e-7}   | ${7}     | ${true}
			${1.5e-7} | ${8}     | ${true}
			${1e21}   | ${0}     | ${true}
			${1.5e21} | ${0}     | ${true}
			${0.5}    | ${0}     | ${false}
			${12.34}  | ${2}     | ${true}
			${12.345} | ${2}     | ${false}
			${5}      | ${0}     | ${true}
			${-0.25}  | ${2}     | ${true}
		`("should return valid=$valid for $value with decimals $decimals", ({ value, decimals, valid }) => {
			const schema = build(decimals);
			if (valid) {
				expect(() => schema.validateSync({ field: value })).not.toThrowError();
			} else {
				expect(() => schema.validateSync({ field: value })).toThrowError();
			}
		});
	});
});
