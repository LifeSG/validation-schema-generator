import { applyCustomRules } from "../../custom-rules";
import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";

const ERROR_MESSAGE = "test error message";

describe("custom-rules", () => {
	beforeAll(() => {
		applyCustomRules();
	});

	it.each`
		type        | condition                 | uiType             | config                    | valid          | invalid
		${"string"} | ${"uinfin"}               | ${"text-field"}    | ${{ uinfin: true }}       | ${"S1234567D"} | ${"S1234567A"}
		${"string"} | ${"filled"}               | ${"text-field"}    | ${{ filled: true }}       | ${"hello"}     | ${undefined}
		${"string"} | ${"empty"}                | ${"text-field"}    | ${{ empty: true }}        | ${undefined}   | ${"hello"}
		${"string"} | ${"empty (empty string)"} | ${"text-field"}    | ${{ empty: true }}        | ${""}          | ${"hello"}
		${"string"} | ${"equals"}               | ${"text-field"}    | ${{ equals: "hello" }}    | ${"hello"}     | ${"hi"}
		${"string"} | ${"notEquals"}            | ${"text-field"}    | ${{ notEquals: "hello" }} | ${"hi"}        | ${"hello"}
		${"number"} | ${"filled"}               | ${"numeric-field"} | ${{ filled: true }}       | ${1}           | ${undefined}
		${"number"} | ${"empty"}                | ${"numeric-field"} | ${{ empty: true }}        | ${undefined}   | ${1}
		${"number"} | ${"equals"}               | ${"numeric-field"} | ${{ equals: 1 }}          | ${1}           | ${2}
		${"number"} | ${"notEquals"}            | ${"numeric-field"} | ${{ notEquals: 1 }}       | ${2}           | ${1}
	`("should support $condition condition for Yup $type type", ({ uiType, config, valid, invalid }) => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType,
						validation: [{ ...config, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: valid })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: invalid }, { abortEarly: false })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it.each`
		type       | condition                    | config                              | valid                           | invalid
		${"array"} | ${"filled"}                  | ${{ filled: true }}                 | ${["Apple"]}                    | ${[]}
		${"array"} | ${"empty"}                   | ${{ empty: true }}                  | ${[]}                           | ${["Apple"]}
		${"array"} | ${"equals"}                  | ${{ equals: ["Apple"] }}            | ${["Apple"]}                    | ${["Berry"]}
		${"array"} | ${"notEquals"}               | ${{ notEquals: ["Apple"] }}         | ${["Berry"]}                    | ${["Apple"]}
		${"array"} | ${"notEquals (empty array)"} | ${{ notEquals: [] }}                | ${["Apple"]}                    | ${[]}
		${"array"} | ${"includes string"}         | ${{ includes: "Apple" }}            | ${["Apple", "Durian"]}          | ${["Berry"]}
		${"array"} | ${"excludes string"}         | ${{ excludes: "Apple" }}            | ${["Berry", "Durian"]}          | ${["Apple"]}
		${"array"} | ${"includes array"}          | ${{ includes: ["Apple", "Berry"] }} | ${["Apple", "Berry", "Durian"]} | ${["Cherry"]}
		${"array"} | ${"excludes array"}          | ${{ excludes: ["Apple", "Berry"] }} | ${["Cherry"]}                   | ${["Apple", "Berry", "Durian"]}
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
				},
			},
		});
		expect(() => schema.validateSync({ field: valid })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: invalid }, { abortEarly: false })).message).toBe(
			ERROR_MESSAGE
		);
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

	describe("equalsField", () => {
		it.each`
			type        | uiType             | field1    | field2
			${"string"} | ${"text-field"}    | ${"text"} | ${"text"}
			${"number"} | ${"numeric-field"} | ${10}     | ${10}
		`("should not throw error if both inputs are same $type", ({ uiType, field1, field2 }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType,
							validation: [{ required: true }],
						},
						field2: {
							uiType,
							validation: [{ equalsField: "field1" }],
						},
					},
				},
			});
			expect(() => schema.validateSync({ field1, field2 })).not.toThrowError();
		});

		it.each`
			type        | uiType             | field1    | field2
			${"string"} | ${"text-field"}    | ${"text"} | ${"test"}
			${"number"} | ${"numeric-field"} | ${10}     | ${11}
		`("should throw error if both inputs are not same $type", ({ uiType, field1, field2 }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType,
							validation: [{ required: true }],
						},
						field2: {
							uiType,
							validation: [{ equalsField: "field1", errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field1, field2 })).message).toBe(ERROR_MESSAGE);
		});

		it.each`
			type             | field1                | field2
			${"array"}       | ${["Apple", "Berry"]} | ${["Apple", "Berry"]}
			${"one element"} | ${["Apple"]}          | ${["Apple"]}
		`("should not throw error if both inputs are same $type inputs", ({ field1, field2 }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "checkbox",
							options: [
								{ label: "Apple", value: "Apple" },
								{ label: "Berry", value: "Berry" },
								{ label: "Cherry", value: "Cherry" },
							],
							validation: [{ required: true }],
						},
						field2: {
							uiType: "checkbox",
							options: [
								{ label: "Apple", value: "Apple" },
								{ label: "Berry", value: "Berry" },
								{ label: "Cherry", value: "Cherry" },
							],
							validation: [{ equalsField: "field1" }],
						},
					},
				},
			});
			expect(() => schema.validateSync({ field1, field2 })).not.toThrowError();
		});

		it.each`
			field1                | field2
			${["Apple", "Berry"]} | ${[]}
			${["Apple", "Berry"]} | ${["Apple"]}
			${["Apple", "Berry"]} | ${["Apple", "Cherry"]}
		`("should throw error if both inputs are not same array inputs", ({ field1, field2 }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "checkbox",
							options: [
								{ label: "Apple", value: "Apple" },
								{ label: "Berry", value: "Berry" },
								{ label: "Cherry", value: "Cherry" },
							],
							validation: [{ required: true }],
						},
						field2: {
							uiType: "checkbox",
							options: [
								{ label: "Apple", value: "Apple" },
								{ label: "Berry", value: "Berry" },
								{ label: "Cherry", value: "Cherry" },
							],
							validation: [{ equalsField: "field1", errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field1, field2 })).message).toBe(ERROR_MESSAGE);
		});
	});
});
