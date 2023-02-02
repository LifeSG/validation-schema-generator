import { LocalDate } from "@js-joda/core";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("date", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "date",
				somethingUnused: "test",
				validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
			},
		});

		expect(() => schema.validateSync({ field: "2023-01-01" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should validate date in uuuu-MM-dd format", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "date",
				validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
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
			field: {
				fieldType: "date",
				dateFormat: "d MMMM uuuu",
			},
		});

		expect(() => schema.validateSync({ field: "1 January 2022" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "2023-01-01" })).message).toBe(
			ERROR_MESSAGES.DATE.INVALID
		);
	});

	describe.each`
		rule           | valid           | invalid         | defaultErrorKey
		${"future"}    | ${"2023-01-02"} | ${"2022-01-01"} | ${"MUST_BE_FUTURE"}
		${"past"}      | ${"2022-12-31"} | ${"2023-01-01"} | ${"MUST_BE_PAST"}
		${"notFuture"} | ${"2023-01-01"} | ${"2023-01-02"} | ${"CANNOT_BE_FUTURE"}
		${"notPast"}   | ${"2023-01-01"} | ${"2022-12-31"} | ${"CANNOT_BE_PAST"}
	`("$rule rule", ({ rule, valid, invalid, defaultErrorKey }) => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
			jest.spyOn(LocalDate, "now").mockReturnValue(LocalDate.parse("2023-01-01"));
			schema = jsonToSchema({
				field: {
					fieldType: "date",
					validation: [{ [rule]: true, errorMessage: ERROR_MESSAGE }],
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
				field: {
					fieldType: "date",
					validation: [{ [rule]: true }],
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(
				ERROR_MESSAGES.DATE[defaultErrorKey]
			);
		});
	});
});
