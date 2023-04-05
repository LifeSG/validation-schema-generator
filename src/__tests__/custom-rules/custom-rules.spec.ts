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
			field: {
				uiType,
				validation: [{ ...config, errorMessage: ERROR_MESSAGE }],
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
		});
		expect(() => schema.validateSync({ field: valid })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({ field: invalid }, { abortEarly: false })).message).toBe(
			ERROR_MESSAGE
		);
	});

	it("should reject 0 in empty condition for Yup number type", () => {
		const schema = jsonToSchema({
			field: {
				uiType: "numeric-field",
				validation: [{ empty: true, errorMessage: ERROR_MESSAGE }],
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
				field: {
					uiType: "text-field",
					validation: [{ uinfin: true }],
				},
			});
			["S1111111D", "T8017681Z", "F4769209K", "G5825195Q", "M1234567K"].forEach((uinfin) =>
				expect(() => schema.validateSync({ field: uinfin })).not.toThrowError()
			);
		});

		it("should fail when given an invalid uinfin", () => {
			const schema = jsonToSchema({
				field: {
					uiType: "text-field",
					validation: [{ uinfin: true, errorMessage: ERROR_MESSAGE }],
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: "S1234567A" })).message).toBe(ERROR_MESSAGE);
		});
	});
});
