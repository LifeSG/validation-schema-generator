import isEqual from "lodash/isEqual";
import * as Yup from "yup";
import { TYupSchemaType, addRule } from "../../schema-generator";
import { YupHelper } from "../../schema-generator/yup-helper";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("YupHelper", () => {
	describe("mapSchemaType", () => {
		it.each<TYupSchemaType>(["string", "number", "boolean", "array", "object"])(
			"should initialise Yup %s type",
			(type) => {
				const schema = YupHelper.mapSchemaType(type);
				const description = schema.describe();
				expect(description.type).toBe(type);
			}
		);

		it("should initialise Yup mixed type for other types", () => {
			const schema = YupHelper.mapSchemaType("something" as TYupSchemaType);
			const description = schema.describe();
			expect(description.type).toBe("mixed");
		});
	});

	describe("mapRules", () => {
		it.each`
			type        | condition     | config                       | valid                                     | invalid
			${"string"} | ${"required"} | ${{ required: true }}        | ${"hello"}                                | ${undefined}
			${"string"} | ${"email"}    | ${{ email: true }}           | ${"john@doe.tld"}                         | ${"hello"}
			${"string"} | ${"url"}      | ${{ url: true }}             | ${"https://www.domain.tld"}               | ${"hello"}
			${"string"} | ${"uuid"}     | ${{ uuid: true }}            | ${"e9949c11-51b6-4c44-9070-623dfb2ca01a"} | ${"hello"}
			${"string"} | ${"matches"}  | ${{ matches: "/^(hello)/" }} | ${"hello world"}                          | ${"hi there"}
			${"string"} | ${"length"}   | ${{ length: 1 }}             | ${"h"}                                    | ${"hi"}
			${"string"} | ${"min"}      | ${{ min: 1 }}                | ${"h"}                                    | ${""}
			${"string"} | ${"max"}      | ${{ max: 1 }}                | ${"h"}                                    | ${"hi"}
			${"number"} | ${"required"} | ${{ required: true }}        | ${1}                                      | ${undefined}
			${"number"} | ${"min"}      | ${{ min: 0 }}                | ${0}                                      | ${-1}
			${"number"} | ${"max"}      | ${{ max: 0 }}                | ${0}                                      | ${1}
			${"number"} | ${"lessThan"} | ${{ lessThan: 0 }}           | ${-1}                                     | ${0}
			${"number"} | ${"lessThan"} | ${{ lessThan: 1 }}           | ${0.9}                                    | ${1.1}
			${"number"} | ${"moreThan"} | ${{ moreThan: 0 }}           | ${1}                                      | ${0}
			${"number"} | ${"moreThan"} | ${{ moreThan: 1 }}           | ${1.1}                                    | ${0.9}
			${"number"} | ${"positive"} | ${{ positive: true }}        | ${1}                                      | ${-1}
			${"number"} | ${"negative"} | ${{ negative: true }}        | ${-1}                                     | ${1}
			${"number"} | ${"integer"}  | ${{ integer: true }}         | ${1}                                      | ${1.1}
			${"array"}  | ${"required"} | ${{ required: true }}        | ${["hello"]}                              | ${undefined}
			${"array"}  | ${"length"}   | ${{ length: 1 }}             | ${["hello"]}                              | ${["hello", "world"]}
			${"array"}  | ${"min"}      | ${{ min: 1 }}                | ${["hello"]}                              | ${[]}
			${"array"}  | ${"max"}      | ${{ max: 1 }}                | ${["hello"]}                              | ${["hello", "world"]}
		`("should support $condition condition for Yup $type type", ({ type, config, valid, invalid }) => {
			const schema = YupHelper.mapRules(YupHelper.mapSchemaType(type), [
				{ ...config, errorMessage: ERROR_MESSAGE },
			]);
			expect(() => schema.validateSync(valid)).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync(invalid, { abortEarly: false })).message).toBe(
				ERROR_MESSAGE
			);
		});

		it("should ignore matches validation for empty string (excludeEmptyString)", () => {
			const schema = YupHelper.mapRules(YupHelper.mapSchemaType("string"), [
				{ matches: "/^hello/", errorMessage: ERROR_MESSAGE },
			]);
			expect(() => schema.validateSync("")).not.toThrowError();
		});

		const generateConditionalSchema = (type: TYupSchemaType, is: any) =>
			Yup.object().shape({
				field1: YupHelper.mapRules(YupHelper.mapSchemaType(type), [
					{
						when: {
							field2: {
								is,
								then: [{ required: true, errorMessage: ERROR_MESSAGE }],
								otherwise: [{ min: 5, errorMessage: ERROR_MESSAGE_2 }],
								yupSchema: YupHelper.mapSchemaType(type),
							},
						},
					},
				]),
			});

		it("should support conditional validation for Yup string type", () => {
			const schema = generateConditionalSchema("string", "hello");

			expect(() => schema.validateSync({ field1: "hi", field2: "hello" })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: "hello" })).message).toBe(
				ERROR_MESSAGE
			);
			expect(TestHelper.getError(() => schema.validateSync({ field1: "hi", field2: "world" })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should support conditional validation for Yup number type", () => {
			const schema = generateConditionalSchema("number", 1);

			expect(() => schema.validateSync({ field1: 5, field2: 1 })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: 1 })).message).toBe(
				ERROR_MESSAGE
			);
			expect(TestHelper.getError(() => schema.validateSync({ field1: 4, field2: 2 })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should support conditional validation with config as condition for Yup string type", () => {
			const schema = generateConditionalSchema("string", [{ filled: true }, { min: 3 }]);

			expect(() => schema.validateSync({ field1: "hi", field2: "hello" })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: "hello" })).message).toBe(
				ERROR_MESSAGE
			);
			expect(TestHelper.getError(() => schema.validateSync({ field1: "hi", field2: "hi" })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should support conditional validation with config as condition for Yup number type", () => {
			const schema = generateConditionalSchema("number", [{ filled: true }, { min: 3 }]);

			expect(() => schema.validateSync({ field1: 1, field2: 3 })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: 3 })).message).toBe(
				ERROR_MESSAGE
			);
			expect(TestHelper.getError(() => schema.validateSync({ field1: 1, field2: 1 })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should support conditional validation with config as condition for Yup array type", () => {
			const schema = generateConditionalSchema("array", [{ filled: true }, { min: 3 }]);

			expect(() => schema.validateSync({ field1: ["a"], field2: ["a", "b", "c"] })).not.toThrowError();
			expect(
				TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: ["a", "b", "c"] })).message
			).toBe(ERROR_MESSAGE);
			expect(TestHelper.getError(() => schema.validateSync({ field1: ["a"], field2: ["a", "b"] })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should support mutiple conditional validations", () => {
			const schema = Yup.object().shape({
				field1: YupHelper.mapRules(Yup.string(), [
					{
						when: {
							field2: {
								is: [{ filled: true }],
								then: [{ required: true, errorMessage: ERROR_MESSAGE }],
								yupSchema: Yup.string(),
							},
							field3: {
								is: [{ filled: true }],
								then: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
								yupSchema: Yup.string(),
							},
						},
					},
				]),
			});

			expect(() => schema.validateSync({ field1: "a", field2: "b", field3: "c" })).not.toThrowError();
			expect(() => schema.validateSync({ field1: "a", field2: "b", field3: undefined })).not.toThrowError();
			expect(() => schema.validateSync({ field1: "a", field2: undefined, field3: "c" })).not.toThrowError();
			expect(
				TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: "b", field3: undefined }))
					.message
			).toBe(ERROR_MESSAGE);
			expect(
				TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: undefined, field3: "c" }))
					.message
			).toBe(ERROR_MESSAGE_2);
		});

		it("should support nested conditional validation", () => {
			const schema = Yup.object().shape({
				field1: YupHelper.mapRules(Yup.string(), [
					{
						when: {
							field2: {
								is: [{ filled: true }],
								then: [
									{
										when: {
											field3: {
												is: [{ filled: true }],
												then: [{ required: true, errorMessage: ERROR_MESSAGE }],
												yupSchema: Yup.string(),
											},
										},
									},
								],
								yupSchema: Yup.string(),
							},
						},
					},
				]),
			});

			expect(() => schema.validateSync({ field1: "a", field2: "b", field3: "c" })).not.toThrowError();
			expect(() => schema.validateSync({ field1: undefined, field2: undefined, field3: "c" })).not.toThrowError();
			expect(() => schema.validateSync({ field1: undefined, field2: "b", field3: undefined })).not.toThrowError();
			expect(
				TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: "b", field3: "c" })).message
			).toBe(ERROR_MESSAGE);
		});

		it("should only apply rules if available on the schema", () => {
			const schema = YupHelper.mapRules(Yup.mixed(), [
				{ filled: true, errorMessage: ERROR_MESSAGE },
				{ matches: "/hello/", errorMessage: ERROR_MESSAGE_2 },
				{ notMatches: "/hello/", errorMessage: ERROR_MESSAGE_2 },
			]);
			expect(TestHelper.getError(() => schema.validateSync(null))?.message).toBe(ERROR_MESSAGE);
		});
	});

	describe("addRule", () => {
		it("should be able to add rule for Yup string type", () => {
			addRule("string", "testString", (value) => value === "hello");
			const schema = (Yup.string() as any).testString(undefined, ERROR_MESSAGE);

			expect(() => schema.validateSync("hello")).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync("hi")).message).toBe(ERROR_MESSAGE);
		});

		it("should be able to add rule for Yup number type", () => {
			addRule("number", "testNumber", (value) => value === 123);
			const schema = (Yup.number() as any).testNumber(undefined, ERROR_MESSAGE);

			expect(() => schema.validateSync(123)).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync(321)).message).toBe(ERROR_MESSAGE);
		});

		it("should be able to add rule for Yup array type", () => {
			addRule("array", "testArray", (value) => isEqual(value, [1, 2, 3]));
			const schema = (Yup.array() as any).testArray(undefined, ERROR_MESSAGE);

			expect(() => schema.validateSync([1, 2, 3])).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync([3, 2, 1])).message).toBe(ERROR_MESSAGE);
		});

		it("should not add a new rule but call console.error if it has been added before", () => {
			jest.spyOn(Yup, "addMethod");
			jest.spyOn(console, "error");
			addRule("string", "myTestCondition", (value) => value === "hello");
			addRule("string", "myTestCondition", (value) => value === "hello");

			expect(Yup.addMethod).toBeCalledTimes(1);
			expect(console.error).toBeCalledTimes(1);
		});
	});
});
