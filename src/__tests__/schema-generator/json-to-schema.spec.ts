import isEqual from "lodash/isEqual";
import * as Yup from "yup";
import { SchemaDescription } from "yup/lib/schema";
import { TYupSchemaType, addRule, jsonToSchema } from "../../schema-generator";
import { _testExports } from "../../schema-generator/json-to-schema";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2, ERROR_MESSAGE_3, ERROR_MESSAGE_4 } from "../common";

describe("json-to-schema", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	describe("jsonToSchema", () => {
		it("should create Yup schema based on config provided", () => {
			const values = {
				field1: undefined,
				field2: 1,
				field3: "invalid email",
			};
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE },
								{ min: 1, errorMessage: ERROR_MESSAGE_2 },
							],
						},
						nested: {
							uiType: "div",
							children: {
								field2: {
									uiType: "numeric-field",
									validation: [{ min: 2, errorMessage: ERROR_MESSAGE_3 }],
								},
							},
						},
					},
				},
				section2: {
					uiType: "section",
					children: {
						field3: {
							uiType: "email-field",
							validation: [{ email: true, errorMessage: ERROR_MESSAGE_4 }],
						},
					},
				},
			});
			const schemaFields = schema.describe().fields;
			const schemaTypeList = Object.keys(schemaFields).map((key) => schemaFields[key].type);
			expect(schemaTypeList).toEqual(["string", "number", "string"]);

			const error = TestHelper.getError(() => schema.validateSync(values, { abortEarly: false }));
			expect(error.inner).toHaveLength(3);
			expect(error.inner[0].message).toBe(ERROR_MESSAGE);
			expect(error.inner[1].message).toBe(ERROR_MESSAGE_3);
			expect(error.inner[2].message).toBe(ERROR_MESSAGE_4);
		});

		it("should ignore elements and values not specified in schema", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE },
								{ min: 1, errorMessage: ERROR_MESSAGE_2 },
							],
						},
						element: {
							uiType: "alert",
						},
					},
				},
			});

			const schemaFields = schema.describe().fields;
			const schemaTypeList = Object.keys(schemaFields).map((key) => schemaFields[key].type);
			const schemaTestList = Object.keys(schemaFields).map(
				(key) => (schemaFields[key] as SchemaDescription).tests
			);

			expect(schemaTypeList).toEqual(["string"]);
			expect(
				isEqual(schemaTestList, [
					[
						{ name: "required", params: undefined },
						{ name: "min", params: { min: 1 } },
					],
				])
			).toBe(true);

			const error = TestHelper.getError(() =>
				schema.validateSync({ field: undefined, element: "world", something: "else" }, { abortEarly: false })
			);
			expect(error.inner).toHaveLength(1);
			expect(error.inner[0].message).toBe(ERROR_MESSAGE);
		});
	});

	describe("mapSchemaType", () => {
		it.each<TYupSchemaType>(["string", "number", "boolean", "array", "object"])(
			"should initialise Yup %s type",
			(type) => {
				const schema = _testExports.mapSchemaType(type);
				const description = schema.describe();
				expect(description.type).toBe(type);
			}
		);

		it("should initialise Yup mixed type for other types", () => {
			const schema = _testExports.mapSchemaType("something" as TYupSchemaType);
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
			${"number"} | ${"min"}      | ${{ min: 1 }}                | ${1}                                      | ${0}
			${"number"} | ${"max"}      | ${{ max: 1 }}                | ${1}                                      | ${2}
			${"number"} | ${"lessThan"} | ${{ lessThan: 1 }}           | ${0}                                      | ${1}
			${"number"} | ${"moreThan"} | ${{ moreThan: 1 }}           | ${2}                                      | ${1}
			${"number"} | ${"positive"} | ${{ positive: true }}        | ${1}                                      | ${-1}
			${"number"} | ${"negative"} | ${{ negative: true }}        | ${-1}                                     | ${1}
			${"number"} | ${"integer"}  | ${{ integer: true }}         | ${1}                                      | ${1.1}
			${"array"}  | ${"required"} | ${{ required: true }}        | ${["hello"]}                              | ${undefined}
			${"array"}  | ${"length"}   | ${{ length: 1 }}             | ${["hello"]}                              | ${["hello", "world"]}
			${"array"}  | ${"min"}      | ${{ min: 1 }}                | ${["hello"]}                              | ${[]}
			${"array"}  | ${"max"}      | ${{ max: 1 }}                | ${["hello"]}                              | ${["hello", "world"]}
		`("should support $condition condition for Yup $type type", ({ type, config, valid, invalid }) => {
			const schema = _testExports.mapRules(_testExports.mapSchemaType(type), [
				{ ...config, errorMessage: ERROR_MESSAGE },
			]);
			expect(() => schema.validateSync(valid)).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync(invalid, { abortEarly: false })).message).toBe(
				ERROR_MESSAGE
			);
		});

		const generateConditionalSchema = (type: TYupSchemaType, is: any) =>
			Yup.object().shape({
				field1: _testExports.mapRules(_testExports.mapSchemaType(type), [
					{
						when: {
							field2: {
								is,
								then: [{ required: true, errorMessage: ERROR_MESSAGE }],
								otherwise: [{ min: 5, errorMessage: ERROR_MESSAGE_2 }],
								yupSchema: _testExports.mapSchemaType(type),
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
