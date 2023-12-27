import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("nested-multi-select", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options: [
							{
								label: "Fruit",
								value: "Fruit",
								key: "fruitKey",
								subItems: [
									{ label: "Apple", value: "Apple", key: "appleKey" },
									{ label: "Berry", value: "Berry", key: "berryKey" },
									{ label: "Cherry", value: "Cherry", key: "cherryKey" },
								],
							},
						],
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() => schema.validateSync({ field: { appleKey: "Apple", berryKey: "Berry" } })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should throw an error if an empty object is submitted on a required field", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options: [
							{
								label: "Fruit",
								value: "Fruit",
								key: "fruitKey",
								subItems: [
									{ label: "Apple", value: "Apple", key: "appleKey" },
									{ label: "Berry", value: "Berry", key: "berryKey" },
									{ label: "Cherry", value: "Cherry", key: "cherryKey" },
								],
							},
						],
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: {} })).message).toBe(ERROR_MESSAGE);
	});

	it("should use default error message if error message is not specified for required rule", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options: [
							{
								label: "Fruit",
								value: "Fruit",
								key: "fruitKey",
								subItems: [
									{ label: "Apple", value: "Apple", key: "appleKey" },
									{ label: "Berry", value: "Berry", key: "berryKey" },
									{ label: "Cherry", value: "Cherry", key: "cherryKey" },
								],
							},
						],
						somethingUnused: "test",
						validation: [{ required: true }],
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: {} })).message).toBe(
			ERROR_MESSAGES.COMMON.REQUIRED_OPTION
		);
	});
});
