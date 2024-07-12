import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("select", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "range-select",
						options: {
							from: [
								{ label: "North", value: "north" },
								{ label: "East", value: "east" },
							],
							to: [
								{ label: "South", value: "south" },
								{ label: "West", value: "west" },
							],
						},
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: { from: "north", to: "south" } })).not.toThrow();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should throw an error if a value not defined in options is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "range-select",
						options: {
							from: [
								{ label: "North", value: "north" },
								{ label: "East", value: "east" },
							],
							to: [
								{ label: "South", value: "south" },
								{ label: "West", value: "west" },
							],
						},
					},
				},
			},
		});
		expect(TestHelper.getError(() => schema.validateSync({ field: { from: "extra", to: "south" } })).message).toBe(
			ERROR_MESSAGES.COMMON.INVALID_OPTION
		);
		expect(TestHelper.getError(() => schema.validateSync({ field: { from: "north", to: "extra" } })).message).toBe(
			ERROR_MESSAGES.COMMON.INVALID_OPTION
		);
	});
});
