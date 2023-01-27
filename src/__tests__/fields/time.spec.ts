import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("time", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "time",
				somethingUnused: "test",
				validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
			},
		});
		expect(() => schema.validateSync({ field: "1:23pm" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
	});

	it("should be able to validate 12-hour format in h:mma format", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "time",
				somethingUnused: "test",
			},
		});
		expect(() => schema.validateSync({ field: "1:23pm" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "1:23:45" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "1:23:45pm" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "1.23" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "13:23" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
	});

	it("should be able to validate 24-hour format in H:mm format", () => {
		const schema = jsonToSchema({
			field: {
				fieldType: "time",
				is24HourFormat: true,
				somethingUnused: "test",
			},
		});
		expect(() => schema.validateSync({ field: "13:23" })).not.toThrowError();
		expect(() => schema.validateSync({ field: "13:23h" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "1:23pm" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "1:23:45pm" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "13:23:45" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: "1.23" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
	});
});
