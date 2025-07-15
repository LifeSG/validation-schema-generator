import { LocalDate } from "@js-joda/core";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("date-range-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-range-field",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: { from: "2023-01-01", to: "2023-02-01" } })).not.toThrowError();
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: undefined, to: undefined } })).message
		).toBe(ERROR_MESSAGE);
	});

	it("should validate date in uuuu-MM-dd format", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-range-field",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: { from: "2023-01-01", to: "2023-02-01" } })).not.toThrowError();
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "2023-13-01", to: "2023-02-01" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "2023-02-31", to: "2023-02-01" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "2023/01/01", to: "2023/01/02" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "2023-1-1", to: "2023-1-12" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "01-01-2023", to: "03-01-2023" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "20230101", to: "20230101" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
	});

	it("should be able to validate date in other formats", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "date-range-field",
						dateFormat: "d MMMM uuuu",
					},
				},
			},
		});

		expect(() =>
			schema.validateSync({ field: { from: "1 January 2022", to: "2 January 2022" } })
		).not.toThrowError();
		expect(
			TestHelper.getError(() => schema.validateSync({ field: { from: "2023-01-01", to: "2023-02-01" } })).message
		).toBe(ERROR_MESSAGES.DATE_RANGE.INVALID);
	});

	describe.each`
		rule               | ruleValue         | valid                                       | invalid                                     | errorMessage
		${"future"}        | ${true}           | ${{ from: "2023-01-02", to: "2023-01-03" }} | ${{ from: "2021-01-01", to: "2022-01-01" }} | ${ERROR_MESSAGES.DATE_RANGE.MUST_BE_FUTURE}
		${"past"}          | ${true}           | ${{ from: "2022-10-31", to: "2022-12-31" }} | ${{ from: "2023-01-01", to: "2024-01-01" }} | ${ERROR_MESSAGES.DATE_RANGE.MUST_BE_PAST}
		${"notFuture"}     | ${true}           | ${{ from: "2022-12-31", to: "2023-01-01" }} | ${{ from: "2023-01-01", to: "2023-01-02" }} | ${ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_FUTURE}
		${"notPast"}       | ${true}           | ${{ from: "2023-01-01", to: "2023-01-02" }} | ${{ from: "2022-12-31", to: "2023-01-01" }} | ${ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_PAST}
		${"minDate"}       | ${"2023-01-02"}   | ${{ from: "2023-01-02", to: "2023-01-08" }} | ${{ from: "2021-01-01", to: "2023-01-01" }} | ${ERROR_MESSAGES.DATE_RANGE.MIN_DATE("02/01/2023")}
		${"maxDate"}       | ${"2023-01-02"}   | ${{ from: "2022-01-02", to: "2023-01-02" }} | ${{ from: "2023-01-03", to: "2024-01-03" }} | ${ERROR_MESSAGES.DATE_RANGE.MAX_DATE("02/01/2023")}
		${"excludedDates"} | ${["2023-01-02"]} | ${{ from: "2023-01-01", to: "2023-01-03" }} | ${{ from: "2023-01-01", to: "2023-01-02" }} | ${ERROR_MESSAGES.DATE_RANGE.DISABLED_DATES}
		${"numberOfDays"}  | ${10}             | ${{ from: "2023-01-01", to: "2023-01-10" }} | ${{ from: "2023-01-01", to: "2023-01-02" }} | ${ERROR_MESSAGES.DATE_RANGE.MUST_HAVE_NUMBER_OF_DAYS(10)}
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
							uiType: "date-range-field",
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

		it("should skip rule if value is empty", () => {
			expect(() => schema.validateSync({ field: {} })).not.toThrowError();
			expect(() => schema.validateSync({ field: { from: undefined, to: undefined } })).not.toThrowError();
			expect(() => schema.validateSync({ field: { from: "", to: "" } })).not.toThrowError();
			expect(() => schema.validateSync({ field: { from: valid.from } })).not.toThrowError();
			expect(() => schema.validateSync({ field: { to: valid.to } })).not.toThrowError();
		});

		it("should use default error message if error message is not specified", () => {
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "date-range-field",
							validation: [{ [rule]: ruleValue }],
						},
					},
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(errorMessage);
		});
	});
});
