import { TL1OptionProps } from "../../fields";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("nested-multi-select", () => {
	const options: TL1OptionProps[] = [
		{
			label: "Fruit",
			key: "fruitKey",
			subItems: [
				{ label: "Apple", value: "Apple", key: "appleKey" },
				{ label: "Berry", value: "Berry", key: "berryKey" },
				{ label: "Cherry", value: "Cherry", key: "cherryKey" },
			],
		},
	];
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options,
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});

		expect(() =>
			schema.validateSync({ field: { fruitKey: { appleKey: "Apple", berryKey: "Berry" } } })
		).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	it("should throw an error if an empty object is submitted on a required field", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options,
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
						options,
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

	it("should throw an error if a non-existent option is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options,
						somethingUnused: "test",
					},
				},
			},
		});

		expect(TestHelper.getError(() => schema.validateSync({ field: { durianKey: "Durian" } })).message).toBe(
			ERROR_MESSAGES.COMMON.INVALID_OPTION
		);
	});

	it("should throw an error if a non-existent nested option is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options,
						somethingUnused: "test",
					},
				},
			},
		});

		expect(
			TestHelper.getError(() =>
				schema.validateSync({
					field: { fruitKey: { appleKey: "Apple", durianKey: "Durian", berryKey: "Berry" } },
				})
			).message
		).toBe(ERROR_MESSAGES.COMMON.INVALID_OPTION);
	});

	it("should throw an error if an invalid object format is submitted", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "nested-multi-select",
						options,
						somethingUnused: "test",
					},
				},
			},
		});

		expect(
			TestHelper.getError(() =>
				schema.validateSync({
					field: { fruitKey: { appleKey: {} } },
				})
			).message
		).toBe(ERROR_MESSAGES.COMMON.INVALID_OPTION);
	});

	describe("invalid value types", () => {
		const schema = jsonToSchema({
			section: { uiType: "section", children: { field: { uiType: "nested-multi-select", options } } },
		});

		it.each`
			description                      | value
			${"a number leaf"}               | ${{ fruitKey: { appleKey: 12345 } }}
			${"a boolean leaf"}              | ${{ fruitKey: { appleKey: true } }}
			${"a null leaf"}                 | ${{ fruitKey: { appleKey: null } }}
			${"an array leaf"}               | ${{ fruitKey: { appleKey: ["Apple"] } }}
			${"a number on a parent option"} | ${{ fruitKey: 99999 }}
			${"a string on a parent option"} | ${{ fruitKey: "Apple" }}
			${"an object on a leaf option"}  | ${{ fruitKey: { appleKey: { x: "Apple" } } }}
			${"an array on a parent option"} | ${{ fruitKey: ["appleKey"] }}
		`("should reject $description with a ValidationError", ({ value }) => {
			const error = TestHelper.getError(() => schema.validateSync({ field: value }));
			expect(error.name).toBe("ValidationError");
			expect(error.message).toBe(ERROR_MESSAGES.COMMON.INVALID_OPTION);
		});
	});
});
