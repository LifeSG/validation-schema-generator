import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("time-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "time-field",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "1:23pm" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
		expect(TestHelper.getError(() => schema.validateSync({ field: "hello" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
	});

	it.each`
		value                            | is24HourFormat
		${"5<script>:30"}                | ${true}
		${"9abc:15"}                     | ${true}
		${"0x5:30"}                      | ${true}
		${" 5:30"}                       | ${true}
		${"1<img src=x onerror=a>:30am"} | ${false}
		${"1abc:30am"}                   | ${false}
		${"1:3x"}                        | ${true}
	`("should reject malformed time $value", ({ value, is24HourFormat }) => {
		const schema = jsonToSchema({
			section: { uiType: "section", children: { field: { uiType: "time-field", is24HourFormat } } },
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: value })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
	});

	it("should accept boundary times", () => {
		const schema24 = jsonToSchema({
			section: { uiType: "section", children: { field: { uiType: "time-field", is24HourFormat: true } } },
		});
		const schema12 = jsonToSchema({
			section: { uiType: "section", children: { field: { uiType: "time-field" } } },
		});
		["0:00", "00:00", "23:59"].forEach((field) =>
			expect(() => schema24.validateSync({ field })).not.toThrowError()
		);
		["12:00am", "1:00pm", "12:59PM"].forEach((field) =>
			expect(() => schema12.validateSync({ field })).not.toThrowError()
		);
	});

	it("should be able to validate 12-hour format in h:mma format", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "time-field",
						somethingUnused: "test",
					},
				},
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
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "time-field",
						is24HourFormat: true,
						somethingUnused: "test",
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "13:23" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: "13:23h" })).message).toBe(
			ERROR_MESSAGES.TIME.INVALID
		);
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
