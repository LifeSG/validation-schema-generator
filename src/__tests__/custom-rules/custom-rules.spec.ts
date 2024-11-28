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
		type         | condition                 | uiType             | config                                                         | valid           | invalid
		${"string"}  | ${"uinfin"}               | ${"text-field"}    | ${{ uinfin: true }}                                            | ${"S1234567D"}  | ${"S1234567A"}
		${"string"}  | ${"filled"}               | ${"text-field"}    | ${{ filled: true }}                                            | ${"hello"}      | ${undefined}
		${"string"}  | ${"empty"}                | ${"text-field"}    | ${{ empty: true }}                                             | ${undefined}    | ${"hello"}
		${"string"}  | ${"empty (empty string)"} | ${"text-field"}    | ${{ empty: true }}                                             | ${""}           | ${"hello"}
		${"string"}  | ${"equals"}               | ${"text-field"}    | ${{ equals: "hello" }}                                         | ${"hello"}      | ${"hi"}
		${"string"}  | ${"notEquals"}            | ${"text-field"}    | ${{ notEquals: "hello" }}                                      | ${"hi"}         | ${"hello"}
		${"string"}  | ${"equalsField"}          | ${"text-field"}    | ${{ equalsField: "field1" }}                                   | ${"hello"}      | ${"help"}
		${"string"}  | ${"equalsField (empty)"}  | ${"text-field"}    | ${{ equalsField: "field1" }}                                   | ${undefined}    | ${"help"}
		${"number"}  | ${"filled"}               | ${"numeric-field"} | ${{ filled: true }}                                            | ${1}            | ${undefined}
		${"number"}  | ${"empty"}                | ${"numeric-field"} | ${{ empty: true }}                                             | ${undefined}    | ${1}
		${"number"}  | ${"equals"}               | ${"numeric-field"} | ${{ equals: 1 }}                                               | ${1}            | ${2}
		${"number"}  | ${"notEquals"}            | ${"numeric-field"} | ${{ notEquals: 1 }}                                            | ${2}            | ${1}
		${"number"}  | ${"equalsField"}          | ${"numeric-field"} | ${{ equalsField: "field1" }}                                   | ${10}           | ${11}
		${"boolean"} | ${"filled"}               | ${"switch"}        | ${{ filled: true }}                                            | ${false}        | ${undefined}
		${"boolean"} | ${"empty"}                | ${"switch"}        | ${{ empty: true }}                                             | ${undefined}    | ${false}
		${"boolean"} | ${"equals"}               | ${"switch"}        | ${{ equals: true }}                                            | ${true}         | ${false}
		${"boolean"} | ${"notEquals"}            | ${"switch"}        | ${{ notEquals: true }}                                         | ${false}        | ${true}
		${"string"}  | ${"withinDays"}           | ${"date-field"}    | ${{ withinDays: { numberOfDays: 7 } }}                         | ${"2023-01-07"} | ${"2023-01-09"}
		${"string"}  | ${"withinDays"}           | ${"date-field"}    | ${{ withinDays: { numberOfDays: -7 } }}                        | ${"2022-12-28"} | ${"2023-01-02"}
		${"string"}  | ${"withinDays"}           | ${"date-field"}    | ${{ withinDays: { numberOfDays: 5, fromDate: "2023-01-10" } }} | ${"2023-01-12"} | ${"2023-01-09"}
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

	describe("uinfin", () => {
		it("should pass when given a valid uinfin", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [{ uinfin: true }],
						},
					},
				},
			});
			["S1111111D", "T8017681Z", "F4769209K", "G5825195Q", "M1234567K"].forEach((uinfin) =>
				expect(() => schema.validateSync({ field: uinfin })).not.toThrowError()
			);
		});

		it("should fail when given an invalid uinfin", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [{ uinfin: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: "S1234567A" })).message).toBe(ERROR_MESSAGE);
		});
	});
});
