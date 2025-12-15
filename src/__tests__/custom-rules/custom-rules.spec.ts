import { LocalDate } from "@js-joda/core";
import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";

const ERROR_MESSAGE = "test error message";

describe("custom-rules", () => {
	beforeEach(() => {
		jest.spyOn(LocalDate, "now").mockReturnValue(LocalDate.parse("2023-01-01"));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});
	it.each`
		type         | condition                  | uiType             | config                          | valid           | invalid
		${"string"}  | ${"uinfin"}                | ${"text-field"}    | ${{ uinfin: true }}             | ${"S1234567D"}  | ${"S1234567A"}
		${"string"}  | ${"uinfin (empty string)"} | ${"text-field"}    | ${{ uinfin: true }}             | ${""}           | ${"S1234567A"}
		${"string"}  | ${"uinfin (undefined)"}    | ${"text-field"}    | ${{ uinfin: true }}             | ${undefined}    | ${"S1234567A"}
		${"string"}  | ${"uen"}                   | ${"text-field"}    | ${{ uen: true }}                | ${"T09LL0001B"} | ${"T09LA0001B"}
		${"string"}  | ${"uen (empty string)"}    | ${"text-field"}    | ${{ uen: true }}                | ${""}           | ${"T09LA0001B"}
		${"string"}  | ${"uen (undefined"}        | ${"text-field"}    | ${{ uen: true }}                | ${undefined}    | ${"T09LA0001B"}
		${"string"}  | ${"filled"}                | ${"text-field"}    | ${{ filled: true }}             | ${"hello"}      | ${undefined}
		${"string"}  | ${"empty"}                 | ${"text-field"}    | ${{ empty: true }}              | ${undefined}    | ${"hello"}
		${"string"}  | ${"empty (empty string)"}  | ${"text-field"}    | ${{ empty: true }}              | ${""}           | ${"hello"}
		${"string"}  | ${"equals"}                | ${"text-field"}    | ${{ equals: "hello" }}          | ${"hello"}      | ${"hi"}
		${"string"}  | ${"notEquals"}             | ${"text-field"}    | ${{ notEquals: "hello" }}       | ${"hi"}         | ${"hello"}
		${"string"}  | ${"equalsField"}           | ${"text-field"}    | ${{ equalsField: "field1" }}    | ${"hello"}      | ${"help"}
		${"string"}  | ${"equalsField (empty)"}   | ${"text-field"}    | ${{ equalsField: "field1" }}    | ${undefined}    | ${"help"}
		${"string"}  | ${"notMatches"}            | ${"text-field"}    | ${{ notMatches: "/^(hello)/" }} | ${"hi"}         | ${"hello"}
		${"string"}  | ${"noWhitespaceOnly"}      | ${"text-field"}    | ${{ noWhitespaceOnly: true }}   | ${"  .  "}      | ${"      "}
		${"number"}  | ${"filled"}                | ${"numeric-field"} | ${{ filled: true }}             | ${1}            | ${undefined}
		${"number"}  | ${"empty"}                 | ${"numeric-field"} | ${{ empty: true }}              | ${undefined}    | ${1}
		${"number"}  | ${"equals"}                | ${"numeric-field"} | ${{ equals: 1 }}                | ${1}            | ${2}
		${"number"}  | ${"notEquals"}             | ${"numeric-field"} | ${{ notEquals: 1 }}             | ${2}            | ${1}
		${"number"}  | ${"equalsField"}           | ${"numeric-field"} | ${{ equalsField: "field1" }}    | ${10}           | ${11}
		${"boolean"} | ${"filled"}                | ${"switch"}        | ${{ filled: true }}             | ${false}        | ${undefined}
		${"boolean"} | ${"empty"}                 | ${"switch"}        | ${{ empty: true }}              | ${undefined}    | ${false}
		${"boolean"} | ${"equals"}                | ${"switch"}        | ${{ equals: true }}             | ${true}         | ${false}
		${"boolean"} | ${"notEquals"}             | ${"switch"}        | ${{ notEquals: true }}          | ${false}        | ${true}
	`("should support $condition condition for Yup $type type", ({ uiType, config, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType,
						validation: [{ ...config, errorMessage: ERROR_MESSAGE }],
					},
					field1: {
						uiType,
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: valid, field1: valid })).not.toThrowError();
		const error = TestHelper.getError(() =>
			schema.validateSync({ field: invalid, field1: valid }, { abortEarly: false })
		);
		expect(error.errors).toContain(ERROR_MESSAGE);
	});

	it.each`
		type       | condition                      | config                              | valid                           | invalid
		${"array"} | ${"filled"}                    | ${{ filled: true }}                 | ${["Apple"]}                    | ${[]}
		${"array"} | ${"empty"}                     | ${{ empty: true }}                  | ${[]}                           | ${["Apple"]}
		${"array"} | ${"equals"}                    | ${{ equals: ["Apple"] }}            | ${["Apple"]}                    | ${["Berry"]}
		${"array"} | ${"notEquals"}                 | ${{ notEquals: ["Apple"] }}         | ${["Berry"]}                    | ${["Apple"]}
		${"array"} | ${"notEquals (empty array)"}   | ${{ notEquals: [] }}                | ${["Apple"]}                    | ${[]}
		${"array"} | ${"includes string"}           | ${{ includes: "Apple" }}            | ${["Apple", "Durian"]}          | ${["Berry"]}
		${"array"} | ${"excludes string"}           | ${{ excludes: "Apple" }}            | ${["Berry", "Durian"]}          | ${["Apple"]}
		${"array"} | ${"includes array"}            | ${{ includes: ["Apple", "Berry"] }} | ${["Apple", "Berry", "Durian"]} | ${["Cherry"]}
		${"array"} | ${"excludes array"}            | ${{ excludes: ["Apple", "Berry"] }} | ${["Cherry"]}                   | ${["Apple", "Berry", "Durian"]}
		${"array"} | ${"equalsField"}               | ${{ equalsField: "field1" }}        | ${["Apple", "Berry"]}           | ${["Apple"]}
		${"array"} | ${"equalsField (empty array)"} | ${{ equalsField: "field1" }}        | ${[]}                           | ${["Apple"]}
		${"array"} | ${"equalsField (undefined)"}   | ${{ equalsField: "field1" }}        | ${undefined}                    | ${[]}
	`("should support $condition condition for Yup $type type", ({ config, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "checkbox",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
							{ label: "Durian", value: "Durian" },
						],
						validation: [{ ...config, errorMessage: ERROR_MESSAGE }],
					},
					field1: {
						uiType: "checkbox",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
							{ label: "Durian", value: "Durian" },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: valid, field1: valid })).not.toThrowError();
		expect(
			TestHelper.getError(() => schema.validateSync({ field: invalid, field1: valid }, { abortEarly: false }))
				.message
		).toBe(ERROR_MESSAGE);
	});

	it("should reject 0 in empty condition for Yup number type", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "numeric-field",
						validation: [{ empty: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: undefined })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: 0 }, { abortEarly: false })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it.each`
		type        | condition                   | uiType             | value        | valid      | invalid
		${"string"} | ${"notEqualsField"}         | ${"text-field"}    | ${"hello"}   | ${"bye"}   | ${"hello"}
		${"string"} | ${"notEqualsField (empty)"} | ${"text-field"}    | ${undefined} | ${"hello"} | ${undefined}
		${"number"} | ${"notEqualsField"}         | ${"numeric-field"} | ${0}         | ${1}       | ${0}
	`("should support $condition condition for Yup $type type", ({ uiType, value, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType,
						validation: [{ notEqualsField: "field1", errorMessage: ERROR_MESSAGE }],
					},
					field1: {
						uiType,
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: valid, field1: value })).not.toThrowError();
		const error = TestHelper.getError(() =>
			schema.validateSync({ field: invalid, field1: value }, { abortEarly: false })
		);
		expect(error.errors).toContain(ERROR_MESSAGE);
	});

	it.each`
		type       | condition                         | value                 | valid        | invalid
		${"array"} | ${"notEqualsField"}               | ${["Apple", "Berry"]} | ${["Berry"]} | ${["Berry", "Apple"]}
		${"array"} | ${"notEqualsField (empty array)"} | ${[]}                 | ${["Apple"]} | ${[]}
		${"array"} | ${"notEqualsField (undefined)"}   | ${undefined}          | ${[]}        | ${undefined}
	`("should support $condition condition for Yup $type type", ({ value, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "checkbox",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
							{ label: "Durian", value: "Durian" },
						],
						validation: [{ notEqualsField: "field1", errorMessage: ERROR_MESSAGE }],
					},
					field1: {
						uiType: "checkbox",
						options: [
							{ label: "Apple", value: "Apple" },
							{ label: "Berry", value: "Berry" },
							{ label: "Cherry", value: "Cherry" },
							{ label: "Durian", value: "Durian" },
						],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: valid, field1: value })).not.toThrowError();
		const error = TestHelper.getError(() =>
			schema.validateSync({ field: invalid, field1: value }, { abortEarly: false })
		);
		expect(error.errors).toContain(ERROR_MESSAGE);
	});

	it.each`
		type        | config              | valid                                                                | invalid
		${"uinfin"} | ${{ uinfin: true }} | ${["S1111111D", "T8017681Z", "F4769209K", "G5825195Q", "M1234567K"]} | ${["S1234567A"]}
		${"uen"}    | ${{ uen: true }}    | ${["200012345A", "12345678A", "T09LL0001B"]}                         | ${["1234A567A", "T09L10001B"]}
	`("should validate $type value", ({ config, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "text-field",
						validation: [{ ...config, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		valid.forEach((validValues: string) =>
			expect(() => schema.validateSync({ field: validValues })).not.toThrowError()
		);
		invalid.forEach((invalidValues: string) =>
			expect(() => schema.validateSync({ field: invalidValues })).toThrowError()
		);
	});
});
