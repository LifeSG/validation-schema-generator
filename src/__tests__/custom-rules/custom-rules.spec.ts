import "../../custom-rules";
import { jsonToSchema } from "../../schema-generator";
import { TestHelper } from "../../utils";

const ERROR_MESSAGE = "test error message";

describe("custom-rules", () => {
	it.each`
		type        | condition                    | fieldType     | config                              | valid                 | invalid
		${"string"} | ${"uinfin"}                  | ${"text"}     | ${{ uinfin: true }}                 | ${"S1234567D"}        | ${"S1234567A"}
		${"string"} | ${"filled"}                  | ${"text"}     | ${{ filled: true }}                 | ${"hello"}            | ${undefined}
		${"string"} | ${"empty"}                   | ${"text"}     | ${{ empty: true }}                  | ${undefined}          | ${"hello"}
		${"string"} | ${"empty (empty string)"}    | ${"text"}     | ${{ empty: true }}                  | ${""}                 | ${"hello"}
		${"string"} | ${"equals"}                  | ${"text"}     | ${{ equals: "hello" }}              | ${"hello"}            | ${"hi"}
		${"string"} | ${"notEquals"}               | ${"text"}     | ${{ notEquals: "hello" }}           | ${"hi"}               | ${"hello"}
		${"number"} | ${"filled"}                  | ${"numeric"}  | ${{ filled: true }}                 | ${1}                  | ${undefined}
		${"number"} | ${"empty"}                   | ${"numeric"}  | ${{ empty: true }}                  | ${undefined}          | ${1}
		${"number"} | ${"equals"}                  | ${"numeric"}  | ${{ equals: 1 }}                    | ${1}                  | ${2}
		${"number"} | ${"notEquals"}               | ${"numeric"}  | ${{ notEquals: 1 }}                 | ${2}                  | ${1}
		${"array"}  | ${"filled"}                  | ${"checkbox"} | ${{ filled: true }}                 | ${["hello"]}          | ${[]}
		${"array"}  | ${"empty"}                   | ${"checkbox"} | ${{ empty: true }}                  | ${[]}                 | ${["hello"]}
		${"array"}  | ${"equals"}                  | ${"checkbox"} | ${{ equals: ["hello"] }}            | ${["hello"]}          | ${["hi"]}
		${"array"}  | ${"notEquals"}               | ${"checkbox"} | ${{ notEquals: ["hello"] }}         | ${["hi"]}             | ${["hello"]}
		${"array"}  | ${"notEquals (empty array)"} | ${"checkbox"} | ${{ notEquals: [] }}                | ${["hi"]}             | ${[]}
		${"array"}  | ${"includes string"}         | ${"checkbox"} | ${{ includes: "hello" }}            | ${["hello"]}          | ${["hi"]}
		${"array"}  | ${"excludes string"}         | ${"checkbox"} | ${{ excludes: "hello" }}            | ${["hi"]}             | ${["hello"]}
		${"array"}  | ${"includes array"}          | ${"checkbox"} | ${{ includes: ["hello", "world"] }} | ${["hello", "world"]} | ${["hi"]}
		${"array"}  | ${"excludes array"}          | ${"checkbox"} | ${{ excludes: ["hello", "world"] }} | ${["hi"]}             | ${["hello", "hi", "world"]}
	`("should support $condition condition for Yup $type type", ({ fieldType, config, valid, invalid }) => {
		const schema = jsonToSchema({
			field: {
				fieldType,
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
				fieldType: "numeric",
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
					fieldType: "text",
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
					fieldType: "text",
					validation: [{ uinfin: true, errorMessage: ERROR_MESSAGE }],
				},
			});
			expect(TestHelper.getError(() => schema.validateSync({ field: "S1234567A" })).message).toBe(ERROR_MESSAGE);
		});
	});
});
