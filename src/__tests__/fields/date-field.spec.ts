import { LocalDate } from "@js-joda/core";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("date-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-field",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: "2023-01-01" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should validate date in uuuu-MM-dd format", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-field",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "2023-01-01" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023-13-01" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023-02-31" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023/01/01" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023-1-1" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "1-1-2023" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "01-01-2023" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "20230101" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
	});

	it("should be able to validate date in other formats", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-field",
						dateFormat: "d MMMM uuuu",
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: "1 January 2022" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023-01-01" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
	});

	describe.each`
		rule               | ruleValue         | valid           | invalid         | errorMessage
		${"future"}        | ${true}           | ${"2023-01-02"} | ${"2022-01-01"} | ${ERROR_MESSAGES.DATE.MUST_BE_FUTURE}
		${"past"}          | ${true}           | ${"2022-12-31"} | ${"2023-01-01"} | ${ERROR_MESSAGES.DATE.MUST_BE_PAST}
		${"notFuture"}     | ${true}           | ${"2023-01-01"} | ${"2023-01-02"} | ${ERROR_MESSAGES.DATE.CANNOT_BE_FUTURE}
		${"notPast"}       | ${true}           | ${"2023-01-01"} | ${"2022-12-31"} | ${ERROR_MESSAGES.DATE.CANNOT_BE_PAST}
		${"minDate"}       | ${"2023-01-02"}   | ${"2023-01-02"} | ${"2023-01-01"} | ${ERROR_MESSAGES.DATE.MIN_DATE("02/01/2023")}
		${"maxDate"}       | ${"2023-01-02"}   | ${"2023-01-02"} | ${"2023-01-03"} | ${ERROR_MESSAGES.DATE.MAX_DATE("02/01/2023")}
		${"excludedDates"} | ${["2023-01-02"]} | ${"2023-01-03"} | ${"2023-01-02"} | ${ERROR_MESSAGES.DATE.DISABLED_DATES}
	`("$rule rule", ({ rule, ruleValue, valid, invalid, errorMessage }) => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
			jest.spyOn(LocalDate, "now").mockReturnValue(LocalDate.parse("2023-01-01"));
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "date-field",
							validation: [{ [rule]: ruleValue, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
		});

		it("should accept valid date", () => {
			expect(() => schema.validateSync({ field: valid })).not.toThrowError();
		});

		it("should reject invalid date", () => {
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(ERROR_MESSAGE);
		});

		it("should use default error message if error message is not specified", () => {
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "date-field",
							validation: [{ [rule]: ruleValue }],
						},
					},
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(errorMessage);
		});
	});
});
